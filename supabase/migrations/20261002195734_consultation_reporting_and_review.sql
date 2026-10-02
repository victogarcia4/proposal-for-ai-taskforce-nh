begin;
alter table public.nh_norms add column contribution_versions jsonb not null default '{}';
alter table public.nh_norm_revisions add column contribution_versions jsonb not null default '{}';
commit;
create or replace function public.nh_write(actor uuid, payload jsonb) returns jsonb
language plpgsql security invoker set search_path = public, pg_temp as $$
declare c text := 'north-harris-ai-norms'; a text := payload->>'action'; rid uuid := (payload->>'request_id')::uuid;
 item public.nh_contributions; n public.nh_norms; active_round uuid; result jsonb; is_admin boolean; is_editor boolean; is_facilitator boolean; p public.nh_profiles; next_id uuid;
begin
 -- A per-member transaction lock serializes retries before checking request receipts.
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select r.result into result from nh_requests r where r.user_id=actor and request_id=rid;
 if found then return result; end if;
 if not exists(select 1 from nh_memberships where user_id=actor and consultation_id=c and active) then raise exception 'Membership required'; end if;
 select exists(select 1 from nh_roles where user_id=actor and consultation_id=c and role='Administrator') into is_admin;
 select is_admin or exists(select 1 from nh_roles where user_id=actor and consultation_id=c and role='Committee') into is_editor;
 select is_editor or exists(select 1 from nh_roles where user_id=actor and consultation_id=c and role='Facilitator') into is_facilitator;
 select * into p from nh_profiles where id=actor;
 select id into active_round from nh_rounds where consultation_id=c and open and phase in ('Collect','Comment') order by created_at desc limit 1;
 if a='profile' then
  insert into nh_profiles(id,name,category,unit,discipline,years) values(actor,payload->>'name',payload->>'category',payload->>'unit',payload->>'discipline',payload->>'years')
  on conflict(id) do update set name=excluded.name,category=excluded.category,unit=excluded.unit,discipline=excluded.discipline,years=excluded.years;
 elsif a='proposal' then
  if active_round is null or not exists(select 1 from nh_rounds where id=active_round and phase='Collect') then raise exception 'Contribution round is closed'; end if;
  if not exists(select 1 from nh_questions where id=payload->>'question_id') then raise exception 'Unknown question'; end if;
  if payload->'content'->>'collective'='true' and not is_facilitator then raise exception 'Facilitator role required'; end if;
  if payload->'content'->>'collective'='true' and not exists(select 1 from nh_sessions where id=(payload->'content'->>'session_id')::uuid and consultation_id=c) then raise exception 'Session required'; end if;
  if payload->>'id' is not null then
   select * into item from nh_contributions where id=(payload->>'id')::uuid and consultation_id=c for update;
   if not found or item.author_id<>actor then raise exception 'This contribution belongs to another member'; end if;
   if item.revision<>(payload->>'revision')::integer then raise exception 'Conflict: reload the latest revision before saving'; end if;
   if item.status='Moderated' then raise exception 'A moderated contribution requires committee review before revision'; end if;
   if item.question_id<>payload->>'question_id' then raise exception 'A revision cannot change its original question'; end if;
   update nh_contributions set content=payload->'content', revision=revision+1, status=payload->>'status', updated_at=now(), disposition=null, practice_approved=false where id=item.id returning * into item;
  else
   insert into nh_contributions(consultation_id,round_id,author_id,question_id,status,content) values(c,active_round,actor,payload->>'question_id',payload->>'status',payload->'content') returning * into item;
  end if;
  insert into nh_revisions(contribution_id,revision,content,author_id) values(item.id,item.revision,item.content,actor);
  result=jsonb_build_object('id',item.id,'revision',item.revision);
 elsif a in ('comment','position') then
  if active_round is null then raise exception 'Discussion round is closed'; end if;
  if payload->>'kind'='proposal' then
   select * into item from nh_contributions where id=(payload->>'target_id')::uuid and consultation_id=c and status='Submitted';
   if not found or item.revision<>(payload->>'revision')::integer then raise exception 'Proposal revision is not current'; end if;
  else
   select * into n from nh_norms where id=(payload->>'target_id')::uuid and consultation_id=c and status='Published';
   if not found or n.revision<>(payload->>'revision')::integer or not exists(select 1 from nh_rounds where id=active_round and phase='Comment') then raise exception 'Norm comment round is closed or revision changed'; end if;
  end if;
  if a='comment' then insert into nh_comments(consultation_id,author_id,target_id,revision,body,kind) values(c,actor,(payload->>'target_id')::uuid,(payload->>'revision')::integer,payload->>'body',payload->>'kind');
  else insert into nh_positions(consultation_id,author_id,target_id,revision,body,position,kind) values(c,actor,(payload->>'target_id')::uuid,(payload->>'revision')::integer,payload->>'body',payload->>'position',payload->>'kind') on conflict(author_id,target_id,revision,kind) do update set body=excluded.body,position=excluded.position,updated_at=now(); end if;
 elsif a='pulse' then
  if active_round is null then raise exception 'Pulse round is closed'; end if;
  insert into nh_pulse_receipts(consultation_id,user_id,round_id,stage) values(c,actor,active_round,payload->>'stage');
  insert into nh_pulse(consultation_id,round_id,category,unit,discipline,stage,answers) values(c,active_round,p.category,p.unit,p.discipline,payload->>'stage',payload->'answers');
 elsif a in ('disposition','coding','moderate','practice') then
  if not is_editor then raise exception 'Committee role required'; end if;
  select * into item from nh_contributions where id=(payload->>'id')::uuid and consultation_id=c and status<>'Draft' for update;
  if not found or item.revision<>(payload->>'revision')::integer then raise exception 'Contribution changed; reload'; end if;
  if a='disposition' then
   update nh_contributions set disposition=jsonb_build_object('outcome',payload->>'outcome','reason',payload->>'reason') where id=item.id;
   insert into nh_notifications(consultation_id,user_id,message) values(c,item.author_id,'Your contribution received a disposition: '||(payload->>'outcome')||'. '||(payload->>'reason'));
  elsif a='coding' then
   if exists(select 1 from jsonb_array_elements_text(payload->'linked_ids') x where not exists(select 1 from nh_contributions where id=x::uuid and consultation_id=c and status<>'Draft' and id<>item.id)) then raise exception 'Links must reference other submitted contributions'; end if;
   delete from nh_code_assignments where contribution_id=item.id;
   insert into nh_code_assignments(contribution_id,code_id,coder_id) select item.id, x, actor from jsonb_array_elements_text(payload->'codes') x;
   update nh_contributions set codes=array(select jsonb_array_elements_text(payload->'codes')),linked_ids=array(select value::uuid from jsonb_array_elements_text(payload->'linked_ids')) where id=item.id;
  elsif a='moderate' then update nh_contributions set status='Moderated',practice_approved=false where id=item.id;
  else update nh_contributions set practice_approved=(payload->>'approved')::boolean where id=item.id and content->>'type'='Practice to share'; end if;
 elsif a='synthesis' then
  if not is_editor then raise exception 'Committee role required'; end if;
  insert into nh_syntheses values(c,payload->>'question_id',payload->>'agreement',payload->>'reservations',payload->>'minority',payload->>'gaps',actor,now()) on conflict(consultation_id,question_id) do update set agreement=excluded.agreement,reservations=excluded.reservations,minority=excluded.minority,gaps=excluded.gaps,editor_id=actor,updated_at=now();
 elsif a='norm' then
  if not is_editor then raise exception 'Committee role required'; end if;
  if exists(select 1 from jsonb_array_elements_text(payload->'contribution_ids') x where not exists(select 1 from nh_contributions where id=x::uuid and consultation_id=c and status='Submitted')) then raise exception 'Norm evidence must reference submitted contributions'; end if;
  if exists(select 1 from jsonb_array_elements_text(payload->'source_ids') x where not exists(select 1 from nh_sources where id=x)) then raise exception 'Unknown source'; end if;
  if payload->>'id' is not null then
   select * into n from nh_norms where id=(payload->>'id')::uuid and consultation_id=c for update;
   if not found or n.revision<>(payload->>'revision')::integer then raise exception 'Norm changed; reload'; end if;
   update nh_norms set content=payload->'content',revision=revision+1,status='Working',contribution_ids=array(select value::uuid from jsonb_array_elements_text(payload->'contribution_ids')),source_ids=array(select jsonb_array_elements_text(payload->'source_ids')),updated_at=now() where id=n.id returning * into n;
  else
   insert into nh_norms(consultation_id,content,contribution_ids,source_ids) values(c,payload->'content',array(select value::uuid from jsonb_array_elements_text(payload->'contribution_ids')),array(select jsonb_array_elements_text(payload->'source_ids'))) returning * into n;
  end if;
  update nh_norms set contribution_versions=(select jsonb_object_agg(id::text,jsonb_build_object('revision',revision,'statement',content->>'statement')) from nh_contributions where id=any(n.contribution_ids)) where id=n.id returning * into n;
  insert into nh_norm_revisions(norm_id,revision,content,contribution_ids,source_ids,editor_id,created_at,contribution_versions) values(n.id,n.revision,n.content,n.contribution_ids,n.source_ids,actor,now(),n.contribution_versions);
 elsif a='code' then
  if not is_editor then raise exception 'Committee role required'; end if;
  insert into nh_codes(id,dimension,label) values(payload->>'id',payload->>'dimension',payload->>'label') on conflict(id) do update set label=excluded.label;
 elsif a='draft' then
  if not is_editor then raise exception 'Committee role required'; end if;
  if payload->>'status'='Final' and (not exists(select 1 from nh_consultations where id=c and length(draft->>'response_summary')>0) or exists(select 1 from nh_rounds where consultation_id=c and open)) then raise exception 'Publish the response summary and close the comment round before finalizing'; end if;
  if not exists(select 1 from nh_norms where consultation_id=c) then raise exception 'Create a norm before publishing'; end if;
  if exists(select 1 from nh_norms where consultation_id=c and (cardinality(contribution_ids)=0 or cardinality(source_ids)=0)) then raise exception 'Every norm needs contribution and reference evidence'; end if;
  update nh_consultations set draft=jsonb_build_object('version',(draft->>'version')::integer+1,'status',payload->>'status','response_summary',payload->>'response_summary') where id=c;
  update nh_norms set status=payload->>'status' where consultation_id=c;
  insert into nh_draft_versions select c,(draft->>'version')::integer,draft->>'status',draft->>'response_summary',(select coalesce(jsonb_agg(to_jsonb(nn)),'[]') from nh_norms nn where consultation_id=c),actor,now() from nh_consultations where id=c;
 elsif a='action' then
  if not is_editor then raise exception 'Committee role required'; end if;
  if payload->>'id' is not null then
   update nh_actions set text=payload->>'text',owner=payload->>'owner',due=nullif(payload->>'due','')::date,status=payload->>'status' where id=(payload->>'id')::uuid and consultation_id=c;
  else insert into nh_actions(consultation_id,text,owner,due,status) values(c,payload->>'text',payload->>'owner',nullif(payload->>'due','')::date,payload->>'status'); end if;
 elsif a='session' then
  if not is_facilitator then raise exception 'Facilitator role required'; end if;
  insert into nh_sessions(consultation_id,name,date) values(c,payload->>'name',(payload->>'date')::date);
 elsif a='round' then
  if not is_admin then raise exception 'Administrator role required'; end if;
  update nh_rounds set open=false where consultation_id=c;
  insert into nh_rounds(consultation_id,name,phase,open) values(c,payload->>'name',payload->>'phase',(payload->>'open')::boolean);
 elsif a='roster' then
  if not is_admin then raise exception 'Administrator role required'; end if;
  insert into nh_roster(consultation_id,email,active) values(c,lower(payload->>'email'),true) on conflict(consultation_id,email) do update set active=true;
 elsif a='role' then
  if not is_admin then raise exception 'Administrator role required'; end if;
  if not exists(select 1 from nh_memberships where user_id=(payload->>'user_id')::uuid and consultation_id=c and active) then raise exception 'Active membership required'; end if;
  if payload->>'operation'='Revoke' then
   if (payload->>'user_id')::uuid=actor and payload->>'role'='Administrator' then raise exception 'Administrators cannot revoke their own administrator role'; end if;
   delete from nh_roles where consultation_id=c and user_id=(payload->>'user_id')::uuid and role=payload->>'role';
  else insert into nh_roles values(c,(payload->>'user_id')::uuid,payload->>'role') on conflict do nothing; end if;
 elsif a='membership' then
  if not is_admin then raise exception 'Administrator role required'; end if;
  if (payload->>'user_id')::uuid=actor then raise exception 'Administrators cannot deactivate themselves'; end if;
  update nh_memberships set active=(payload->>'active')::boolean where consultation_id=c and user_id=(payload->>'user_id')::uuid;
 else raise exception 'Unknown command'; end if;
 insert into nh_audit(consultation_id,actor_id,action,target_id,reason) values(c,actor,a,coalesce(payload->>'id',payload->>'target_id'),payload->>'reason');
 result=coalesce(result,'{"ok":true}'::jsonb);
 insert into nh_requests values(actor,rid,result);
 return result;
end $$;
revoke all on function public.nh_write(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.nh_write(uuid,jsonb) to service_role;

begin;
create schema if not exists nh_analytics;
revoke all on schema nh_analytics from public,anon,authenticated;
create role nh_bi_reader nologin;
grant usage on schema nh_analytics to nh_bi_reader,service_role;
-- Curated snapshots contain aggregates only; BI never needs identity tables.
create table nh_analytics.metrics (page text not null, dimension text not null, label text not null, round_id uuid, value integer, suppressed boolean not null, denominator integer, refreshed_at timestamptz not null default now());
alter table nh_analytics.metrics enable row level security;
grant select on nh_analytics.metrics to nh_bi_reader;
grant all on nh_analytics.metrics to service_role;
create policy reporting_reader on nh_analytics.metrics for select to nh_bi_reader using(true);
create function public.nh_refresh_reporting() returns void language plpgsql security invoker set search_path=public,nh_analytics,pg_temp as $$
declare threshold integer; c text := 'north-harris-ai-norms';
begin
 select cc.threshold into threshold from nh_consultations cc where id=c;
 delete from nh_analytics.metrics;
 insert into nh_analytics.metrics(page,dimension,label,round_id,value,suppressed,denominator)
 select 'Participation',dim,label,round_id,case when count(distinct author_id)>=threshold then count(distinct author_id)::integer end,count(distinct author_id)<threshold,(select count(*) from nh_roster where consultation_id=c and active)
 from (select con.author_id,con.round_id,dimension.dim,dimension.label from nh_contributions con join nh_profiles p on p.id=con.author_id
 cross join lateral(values('Employment category',p.category),('Unit',p.unit),('Discipline',p.discipline)) dimension(dim,label)
 where con.consultation_id=c and con.status='Submitted' and coalesce(con.content->>'collective','false')<>'true') data group by dim,label,round_id;
 insert into nh_analytics.metrics(page,dimension,label,round_id,value,suppressed)
 select 'Coverage','Question',question_id,round_id,count(*)::integer,false from nh_contributions where consultation_id=c and status='Submitted' group by question_id,round_id;
 insert into nh_analytics.metrics(page,dimension,label,round_id,value,suppressed)
 select 'Themes & risks','Contribution type',content->>'type',round_id,count(*)::integer,false from nh_contributions where consultation_id=c and status='Submitted' group by content->>'type',round_id;
 insert into nh_analytics.metrics(page,dimension,label,round_id,value,suppressed)
 select 'Themes & risks',code.dimension,code.label,con.round_id,count(distinct con.id)::integer,false from nh_code_assignments a join nh_codes code on code.id=a.code_id join nh_contributions con on con.id=a.contribution_id where con.consultation_id=c and con.status='Submitted' group by code.dimension,code.label,con.round_id;
 insert into nh_analytics.metrics(page,dimension,label,value,suppressed,denominator)
 select 'Positions',p.kind,p.position,count(*)::integer,false,(select count(*) from nh_positions pp left join nh_contributions cc on pp.target_id=cc.id and pp.kind='proposal' left join nh_norms nn on pp.target_id=nn.id and pp.kind='norm' where pp.consultation_id=c and pp.kind=p.kind and pp.revision=coalesce(cc.revision,nn.revision) and coalesce(cc.status,nn.status) in ('Submitted','Published','Final'))
 from nh_positions p left join nh_contributions con on p.target_id=con.id and p.kind='proposal' left join nh_norms n on p.target_id=n.id and p.kind='norm'
 where p.consultation_id=c and p.revision=coalesce(con.revision,n.revision) and coalesce(con.status,n.status) in ('Submitted','Published','Final') group by p.kind,p.position;
 insert into nh_analytics.metrics(page,dimension,label,round_id,value,suppressed)
 select 'Dispositions & actions','Disposition',coalesce(disposition->>'outcome','Awaiting disposition'),round_id,count(*)::integer,false from nh_contributions where consultation_id=c and status='Submitted' group by disposition->>'outcome',round_id;
 insert into nh_analytics.metrics(page,dimension,label,value,suppressed)
 select 'Dispositions & actions','Action status',status,count(*)::integer,false from nh_actions where consultation_id=c group by status;
 insert into nh_analytics.metrics(page,dimension,label,value,suppressed)
 select 'Dispositions & actions','Norms with evidence','Linked to contributions and sources',count(*)::integer,false from nh_norms where consultation_id=c and cardinality(contribution_ids)>0 and cardinality(source_ids)>0;
 -- Complementary suppression: if any answer cell is small, hide all cells
 -- for that stage/item, so subtraction cannot recover a small response.
 insert into nh_analytics.metrics(page,dimension,label,round_id,value,suppressed)
 select 'Pulse',stage||': '||item,label,round_id,case when min(cell_count) over(partition by stage,item,round_id)>=threshold then cell_count end,min(cell_count) over(partition by stage,item,round_id)<threshold
 from (select p.stage,p.round_id,a.key item,a.value label,count(*)::integer cell_count from nh_pulse p cross join lateral jsonb_each_text(p.answers) a where p.consultation_id=c group by p.stage,p.round_id,a.key,a.value) cells;
end $$;
revoke all on function public.nh_refresh_reporting() from public,anon,authenticated;
grant execute on function public.nh_refresh_reporting() to service_role;
commit;

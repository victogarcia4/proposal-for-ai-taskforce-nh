-- Apply to the existing database through an authorized institutional administrator.
-- This preserves stored records; only the BI projection and snapshot change.
begin;
create or replace function public.nh_refresh_reporting() returns void language plpgsql security invoker set search_path=public,nh_analytics,pg_temp as $$
declare threshold integer; c text := 'north-harris-ai-norms';
begin
 select greatest(5,cc.threshold) into threshold from nh_consultations cc where id=c;
 delete from nh_analytics.metrics;
 -- Only broad employment categories. Never export unit, discipline, names,
 -- author identifiers, free text, code definitions, or exact timestamps.
 insert into nh_analytics.metrics(page,dimension,label,round_id,value,suppressed)
 select 'Participation','Employment category',p.category,con.round_id,
 case when count(distinct con.author_id)>=threshold then count(distinct con.author_id)::integer end,
 count(distinct con.author_id)<threshold
 from nh_contributions con join nh_profiles p on p.id=con.author_id
 where con.consultation_id=c and con.status='Submitted' and coalesce(con.content->>'collective','false')<>'true'
 and p.category in ('Full-time faculty','Adjunct faculty','Staff','Administrator','Prefer not to say')
 group by p.category,con.round_id;
 insert into nh_analytics.metrics(page,dimension,label,round_id,value,suppressed)
 select 'Coverage','Question',question_id,round_id,
 case when count(distinct author_id)>=threshold then count(*)::integer end,count(distinct author_id)<threshold
 from nh_contributions where consultation_id=c and status='Submitted' group by question_id,round_id;
 insert into nh_analytics.metrics(page,dimension,label,round_id,value,suppressed)
 select 'Themes & risks','Contribution type',content->>'type',round_id,
 case when count(distinct author_id)>=threshold then count(*)::integer end,count(distinct author_id)<threshold
 from nh_contributions where consultation_id=c and status='Submitted'
 and content->>'type' in ('Recommendation','Concern or objection','Practice to share','Question for OTS or administration','Information gap','Not applicable to my role','I do not have enough information')
 group by content->>'type',round_id;
 insert into nh_analytics.metrics(page,dimension,label,value,suppressed)
 select 'Positions',p.kind,p.position,
 case when count(distinct p.author_id)>=threshold then count(*)::integer end,count(distinct p.author_id)<threshold
 from nh_positions p left join nh_contributions con on p.target_id=con.id and p.kind='proposal'
 left join nh_norms n on p.target_id=n.id and p.kind='norm'
 where p.consultation_id=c and p.revision=coalesce(con.revision,n.revision)
 and coalesce(con.status,n.status) in ('Submitted','Published','Final') group by p.kind,p.position;
 insert into nh_analytics.metrics(page,dimension,label,round_id,value,suppressed)
 select 'Dispositions & actions','Disposition',coalesce(disposition->>'outcome','Awaiting disposition'),round_id,
 case when count(distinct author_id)>=threshold then count(*)::integer end,count(distinct author_id)<threshold
 from nh_contributions where consultation_id=c and status='Submitted'
 and (disposition->>'outcome' is null or disposition->>'outcome' in ('Incorporated','Incorporated with changes','Referred to OTS','Referred to the system policy process','Referred to professional development','Deferred','Not adopted'))
 group by disposition->>'outcome',round_id;
 insert into nh_analytics.metrics(page,dimension,label,round_id,value,suppressed)
 select 'Pulse',stage||': '||item,label,round_id,
 case when min(cell_count) over(partition by stage,item,round_id)>=threshold then cell_count end,
 min(cell_count) over(partition by stage,item,round_id)<threshold
 from (select p.stage,p.round_id,a.key item,a.value label,count(*)::integer cell_count
 from nh_pulse p cross join lateral jsonb_each_text(p.answers) a where p.consultation_id=c
 group by p.stage,p.round_id,a.key,a.value) cells;
 -- Complementary suppression: suppress the entire distribution when any
 -- cell is small. No denominator can disclose a suppressed remainder.
 update nh_analytics.metrics m set value=null,suppressed=true,denominator=null
 where exists(select 1 from nh_analytics.metrics small where small.page=m.page
 and small.dimension=m.dimension and small.round_id is not distinct from m.round_id and small.suppressed);
end $$;
revoke all on function public.nh_refresh_reporting() from public,anon,authenticated;
grant execute on function public.nh_refresh_reporting() to service_role;
select public.nh_refresh_reporting();
commit;

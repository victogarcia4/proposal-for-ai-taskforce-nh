begin;
create schema if not exists nh_analytics;
revoke all on schema nh_analytics from public,anon,authenticated;
create role nh_bi_reader nologin;
grant usage on schema nh_analytics to nh_bi_reader,service_role;
-- Curated snapshots contain aggregates only; BI never needs identity tables.
create table nh_analytics.metrics (metric_id bigint generated always as identity primary key, page text not null, dimension text not null, label text not null, round_id uuid, value integer, suppressed boolean not null, denominator integer, refreshed_at timestamptz not null default now());
alter table nh_analytics.metrics enable row level security;
grant select on nh_analytics.metrics to nh_bi_reader;
grant all on nh_analytics.metrics to service_role;
grant usage, select on sequence nh_analytics.metrics_metric_id_seq to service_role;
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

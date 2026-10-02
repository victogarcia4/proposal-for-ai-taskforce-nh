begin;
-- Explicit deny policies document the service-only API boundary.
do $$ declare t record; begin
 for t in select tablename from pg_tables where schemaname='public' and tablename like 'nh_%' loop
  if not exists(select 1 from pg_policies where schemaname='public' and tablename=t.tablename and policyname='nh_no_direct_client_access') then
   execute format('create policy nh_no_direct_client_access on public.%I for all to anon, authenticated using(false) with check(false)',t.tablename);
  end if;
 end loop;
end $$;
do $$ declare fk record; begin
 for fk in
  select c.conrelid,t.relname,string_agg(quote_ident(a.attname),',' order by k.ordinality) cols,c.conkey
  from pg_constraint c join pg_class t on t.oid=c.conrelid join pg_namespace n on n.oid=t.relnamespace
  cross join lateral unnest(c.conkey) with ordinality k(attnum,ordinality)
  join pg_attribute a on a.attrelid=t.oid and a.attnum=k.attnum
  where c.contype='f' and n.nspname='public' and t.relname like 'nh_%'
  group by c.conrelid,t.relname,c.conkey
 loop
  if not exists(select 1 from pg_index i where i.indrelid=fk.conrelid and i.indisvalid and i.indpred is null and array(select unnest((i.indkey::smallint[])[0:cardinality(fk.conkey)-1]))=fk.conkey) then
   execute format('create index if not exists %I on public.%I (%s)',left('nh_idx_'||fk.relname||'_'||replace(replace(fk.cols,'"',''),',','_'),63),fk.relname,fk.cols);
  end if;
 end loop;
end $$;
commit;

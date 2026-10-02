-- Additive setup for the North Harris development consultation.
-- All exposed tables use RLS. Browser roles have no table privileges.
-- Server functions validate the Supabase user and call nh_write as service_role.
begin;
create table public.nh_consultations (
 id text primary key, name text not null, threshold integer not null default 5 check(threshold >= 5),
 enabled boolean not null default false, draft jsonb not null default '{"version":1,"status":"Working","response_summary":""}'
);
create table public.nh_rounds (id uuid primary key default gen_random_uuid(), consultation_id text not null references public.nh_consultations, name text not null, phase text not null check(phase in ('Collect','Synthesize','Comment','Closed')), open boolean not null default false, created_at timestamptz not null default now());
create table public.nh_profiles (id uuid primary key references auth.users, name text not null, category text not null, unit text not null, discipline text not null, years text not null default 'Prefer not to say');
create table public.nh_roster (id uuid primary key default gen_random_uuid(), consultation_id text not null references public.nh_consultations, email text not null check(email ~* '^[^@[:space:]]+@(lonestar[.]edu|my[.]lonestar[.]edu)$'), active boolean not null default true, unique(consultation_id,email));
create table public.nh_memberships (consultation_id text references public.nh_consultations, user_id uuid references auth.users, active boolean not null default true, primary key(consultation_id,user_id));
create table public.nh_roles (consultation_id text references public.nh_consultations, user_id uuid references auth.users, role text check(role in ('Participant','Facilitator','Committee','Administrator')), primary key(consultation_id,user_id,role));
create table public.nh_sessions (id uuid primary key default gen_random_uuid(), consultation_id text references public.nh_consultations, name text not null, date date not null);
create table public.nh_tables (id text primary key, title text not null, deliverable text not null, probes text not null);
create table public.nh_questions (id text primary key, table_id text not null references public.nh_tables);
create table public.nh_question_versions (question_id text references public.nh_questions, version integer not null, wording text not null, primary key(question_id,version));
create table public.nh_sources (id text primary key, title text not null, url text not null, kind text not null, checked_on date);
create table public.nh_briefings (table_id text primary key references public.nh_tables, institutional text not null, external text not null, source_ids text[] not null, checked_on date);
create table public.nh_contributions (
 id uuid primary key default gen_random_uuid(), consultation_id text not null references public.nh_consultations,
 round_id uuid not null references public.nh_rounds, author_id uuid not null references public.nh_profiles,
 question_id text not null references public.nh_questions, question_version integer not null default 2,
 revision integer not null default 1, status text not null check(status in ('Draft','Submitted','Moderated')),
 content jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 disposition jsonb, codes text[] not null default '{}', linked_ids uuid[] not null default '{}', practice_approved boolean not null default false,
 foreign key(question_id,question_version) references public.nh_question_versions
);
create table public.nh_revisions (contribution_id uuid references public.nh_contributions, revision integer not null, content jsonb not null, author_id uuid not null references public.nh_profiles, created_at timestamptz not null default now(), primary key(contribution_id,revision));
create table public.nh_comments (id uuid primary key default gen_random_uuid(), consultation_id text not null references public.nh_consultations, author_id uuid not null references public.nh_profiles, target_id uuid not null, revision integer not null, body text not null, kind text not null check(kind in ('proposal','norm')), created_at timestamptz not null default now());
create table public.nh_positions (consultation_id text references public.nh_consultations, author_id uuid references public.nh_profiles, target_id uuid not null, revision integer not null, kind text check(kind in ('proposal','norm')), position text check(position in ('Support','Support with changes','Disagree')), body text not null, updated_at timestamptz not null default now(), primary key(author_id,target_id,revision,kind));
create table public.nh_codes (id text primary key, dimension text check(dimension in ('Theme','Risk','Scope','Suggested action')), label text not null);
create table public.nh_code_assignments (contribution_id uuid references public.nh_contributions, code_id text references public.nh_codes, coder_id uuid references public.nh_profiles, assigned_at timestamptz not null default now(), primary key(contribution_id,code_id));
create table public.nh_syntheses (consultation_id text references public.nh_consultations, question_id text references public.nh_questions, agreement text not null, reservations text not null, minority text not null, gaps text not null, editor_id uuid references public.nh_profiles, updated_at timestamptz not null default now(), primary key(consultation_id,question_id));
create table public.nh_norms (id uuid primary key default gen_random_uuid(), consultation_id text references public.nh_consultations, revision integer not null default 1, status text not null default 'Working' check(status in ('Working','Published','Final')), content jsonb not null, contribution_ids uuid[] not null, source_ids text[] not null, updated_at timestamptz not null default now());
create table public.nh_norm_revisions (norm_id uuid references public.nh_norms, revision integer not null, content jsonb not null, contribution_ids uuid[] not null, source_ids text[] not null, editor_id uuid references public.nh_profiles, created_at timestamptz not null default now(), primary key(norm_id,revision));
create table public.nh_draft_versions (consultation_id text references public.nh_consultations, version integer not null, status text not null, response_summary text not null, snapshot jsonb not null, editor_id uuid references public.nh_profiles, created_at timestamptz not null default now(), primary key(consultation_id,version));
create table public.nh_actions (id uuid primary key default gen_random_uuid(), consultation_id text references public.nh_consultations, text text not null, owner text not null, due date, status text not null default 'Open');
create table public.nh_pulse (id uuid primary key default gen_random_uuid(), consultation_id text references public.nh_consultations, round_id uuid references public.nh_rounds, category text not null, unit text not null, discipline text not null, stage text check(stage in ('Baseline','Closing')), answers jsonb not null, created_at timestamptz not null default now());
-- Separate receipt prevents duplicates without connecting named identity to answer rows.
create table public.nh_pulse_receipts (consultation_id text references public.nh_consultations, user_id uuid references auth.users, round_id uuid references public.nh_rounds, stage text not null, primary key(user_id,round_id,stage));
create table public.nh_attachments (id uuid primary key default gen_random_uuid(), consultation_id text references public.nh_consultations, contribution_id uuid references public.nh_contributions, author_id uuid references public.nh_profiles, path text not null unique, name text not null, description text not null, mime text not null, bytes integer check(bytes between 1 and 5242880), created_at timestamptz not null default now());
create table public.nh_notifications (id uuid primary key default gen_random_uuid(), consultation_id text references public.nh_consultations, user_id uuid references auth.users, message text not null, created_at timestamptz not null default now());
create table public.nh_requests (user_id uuid references auth.users, request_id uuid not null, result jsonb not null, primary key(user_id,request_id));
create table public.nh_audit (id bigint generated always as identity primary key, consultation_id text references public.nh_consultations, actor_id uuid references auth.users, action text not null, target_id text, reason text, created_at timestamptz not null default now());

do $$ declare t record; begin for t in select tablename from pg_tables where schemaname='public' and tablename like 'nh_%' loop
 execute format('alter table public.%I enable row level security',t.tablename);
 execute format('revoke all on public.%I from anon, authenticated',t.tablename);
 execute format('grant all on public.%I to service_role',t.tablename);
end loop; end $$;
grant usage, select on sequence public.nh_audit_id_seq to service_role;
create index nh_contributions_consultation on public.nh_contributions(consultation_id,status);
create index nh_contributions_author on public.nh_contributions(author_id);
create index nh_comments_target on public.nh_comments(target_id,revision);
create index nh_memberships_user on public.nh_memberships(user_id);

create function public.nh_write(actor uuid, payload jsonb) returns jsonb
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
  insert into nh_norm_revisions values(n.id,n.revision,n.content,n.contribution_ids,n.source_ids,actor,now());
 elsif a='draft' then
  if not is_editor then raise exception 'Committee role required'; end if;
  if payload->>'status'='Final' and (not exists(select 1 from nh_consultations where id=c and length(draft->>'response_summary')>0) or exists(select 1 from nh_rounds where consultation_id=c and open)) then raise exception 'Publish the response summary and close the comment round before finalizing'; end if;
  if exists(select 1 from nh_norms where consultation_id=c and (cardinality(contribution_ids)=0 or cardinality(source_ids)=0)) then raise exception 'Every norm needs contribution and reference evidence'; end if;
  update nh_consultations set draft=jsonb_build_object('version',(draft->>'version')::integer+1,'status',payload->>'status','response_summary',payload->>'response_summary') where id=c;
  update nh_norms set status=payload->>'status' where consultation_id=c;
  insert into nh_draft_versions select c,(draft->>'version')::integer,draft->>'status',draft->>'response_summary',(select coalesce(jsonb_agg(to_jsonb(nn)),'[]') from nh_norms nn where consultation_id=c),actor,now() from nh_consultations where id=c;
 elsif a='action' then
  if not is_editor then raise exception 'Committee role required'; end if;
  insert into nh_actions(consultation_id,text,owner,due,status) values(c,payload->>'text',payload->>'owner',nullif(payload->>'due','')::date,payload->>'status');
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
  insert into nh_roles values(c,(payload->>'user_id')::uuid,payload->>'role') on conflict do nothing;
 else raise exception 'Unknown command'; end if;
 insert into nh_audit(consultation_id,actor_id,action,target_id,reason) values(c,actor,a,coalesce(payload->>'id',payload->>'target_id'),payload->>'reason');
 result=coalesce(result,'{"ok":true}'::jsonb);
 insert into nh_requests values(actor,rid,result);
 return result;
end $$;
revoke all on function public.nh_write(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.nh_write(uuid,jsonb) to service_role;
insert into public.nh_consultations(id,name) values('north-harris-ai-norms','North Harris AI Use Norms Consultation');
-- Closed by default; an administrator explicitly opens a development round.
insert into public.nh_rounds(consultation_id,name,phase,open) values('north-harris-ai-norms','Development consultation','Collect',false);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('nh-attachments','nh-attachments',false,5242880,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','text/markdown','image/png','image/jpeg']);
commit;
begin;
insert into public.nh_tables values('T1','Teaching, Learning, and Assessment','criteria for AI use in coursework and examples of assignments designed with PRIMER.','writing done outside class; large sections where redesign is costly; in-class and oral alternatives; what your discipline''s employers expect.');
insert into public.nh_questions values('T1Q1','T1');
insert into public.nh_question_versions values('T1Q1',2,'Which learning outcomes must students demonstrate through their own thinking and performance, and where does AI accelerate, replace, or distort the skill being taught?');
insert into public.nh_questions values('T1Q2','T1');
insert into public.nh_question_versions values('T1Q2',2,'Which AI uses should be prohibited, permitted, or required at each stage of an assignment?');
insert into public.nh_questions values('T1Q3','T1');
insert into public.nh_question_versions values('T1Q3',2,'What evidence should demonstrate a student''s learning process when AI is used?');
insert into public.nh_questions values('T1Q4','T1');
insert into public.nh_question_versions values('T1Q4',2,'What discipline-specific activity would develop responsible AI skills for students'' future work?');
insert into public.nh_briefings values('T1','OTS asks faculty to explain AI expectations to students and take responsibility for published AI content.','Faculty experience and discipline shape views about AI. Discuss whether AI accelerates, replaces, or distorts each learning outcome.',array['ots-guidance','collegeboard','ccdaily'],null);
insert into public.nh_tables values('T2','Academic Integrity, Transparency, and Intellectual Property','shared expectations for disclosure, syllabus statements, and review of suspected misuse.','the eight ACC elements; a prohibited, permitted, required model; first-offense conversations; the student''s chance to respond; existing LSC misconduct and grade-appeal procedures; citation format.');
insert into public.nh_questions values('T2Q1','T2');
insert into public.nh_question_versions values('T2Q1',2,'What should students and employees disclose about their use of AI?');
insert into public.nh_questions values('T2Q2','T2');
insert into public.nh_question_versions values('T2Q2',2,'What minimum elements should every North Harris syllabus AI statement contain, and what rule should apply when a syllabus or assignment is silent?');
insert into public.nh_questions values('T2Q3','T2');
insert into public.nh_question_versions values('T2Q3',2,'What evidence and review steps should be required before a finding of AI-related academic misconduct, given that detection tools alone are not reliable evidence?');
insert into public.nh_questions values('T2Q4','T2');
insert into public.nh_question_versions values('T2Q4',2,'What safeguards should apply when AI is used with copyrighted materials, research, or institutional publications?');
insert into public.nh_briefings values('T2','Existing academic misconduct and grade-appeal procedures remain the authority; read the relevant policy section before relying on it.','ACC provides a syllabus model and cautions that detection tools cannot be the sole evidence of dishonesty.',array['policy','ots-guidance','acc'],null);
insert into public.nh_tables values('T3','Data Privacy, Security, and Tools','a proposed data-and-use matrix, a list of questions for OTS, and a request process.','student, employee, financial, and clinical data; AI meeting assistants and note-takers; free tools with click-through terms; students who decline a vendor''s terms; public-records exposure of prompts and outputs.');
insert into public.nh_questions values('T3Q1','T3');
insert into public.nh_question_versions values('T3Q1',2,'Which institutional data may be entered into each category of AI tool?');
insert into public.nh_questions values('T3Q2','T3');
insert into public.nh_question_versions values('T3Q2',2,'What information must a vendor provide before an AI tool is considered for institutional use?');
insert into public.nh_questions values('T3Q3','T3');
insert into public.nh_question_versions values('T3Q3',2,'What process should employees follow to request, pilot, and review an AI tool, including AI features that appear inside software LSC already uses?');
insert into public.nh_questions values('T3Q4','T3');
insert into public.nh_question_versions values('T3Q4',2,'What should happen when an AI tool exposes data or materially changes its features or terms?');
insert into public.nh_briefings values('T3','OTS owns tool approvals and data classifications. Consult the live tool list and contact OTS before procurement; do not enter confidential data into public AI tools.','NIST offers a voluntary Govern, Map, Measure, Manage structure. External guidance does not approve tools for LSC.',array['ots-tools','ots-guidance','nist'],null);
insert into public.nh_tables values('T4','Workplace Use, Student Services, and Human Accountability','prioritized use cases and the decisions that stay with a person.','advising, admissions, financial aid, HR, finance, library, communications, IT, campus operations; grading and hiring; a path to a human; bias checks.');
insert into public.nh_questions values('T4Q1','T4');
insert into public.nh_question_versions values('T4Q1',2,'Which workplace or student-service tasks would benefit from an AI pilot?');
insert into public.nh_questions values('T4Q2','T4');
insert into public.nh_question_versions values('T4Q2',2,'Which decisions must remain under a qualified employee''s authority?');
insert into public.nh_questions values('T4Q3','T4');
insert into public.nh_question_versions values('T4Q3',2,'How should people be informed when they interact with AI or receive an AI-assisted decision?');
insert into public.nh_questions values('T4Q4','T4');
insert into public.nh_question_versions values('T4Q4',2,'What conditions, including workload, training time, and job security, would make an AI pilot acceptable to the employees whose work it affects?');
insert into public.nh_briefings values('T4','Employees remain responsible for AI content they publish; tool requests and data questions go to OTS.','Staff training and workload need explicit attention. WCET found that support for staff can lag faculty support.',array['ots-guidance','wcet'],null);
insert into public.nh_tables values('T5','Equity, Accessibility, and Professional Development','an access and training plan by role, explicitly including adjuncts and staff.','cost and devices; disability and assistive technology; language; tiered training from basics to assessment redesign; hands-on sessions; champions and learning communities; paid time for adjuncts.');
insert into public.nh_questions values('T5Q1','T5');
insert into public.nh_question_versions values('T5Q1',2,'What barriers prevent faculty, adjuncts, or staff from taking part in responsible AI use?');
insert into public.nh_questions values('T5Q2','T5');
insert into public.nh_question_versions values('T5Q2',2,'What equivalent alternatives should be available when an AI tool is inaccessible, unaffordable, or declined?');
insert into public.nh_questions values('T5Q3','T5');
insert into public.nh_question_versions values('T5Q3',2,'What AI competencies should employees demonstrate in their particular roles?');
insert into public.nh_questions values('T5Q4','T5');
insert into public.nh_question_versions values('T5Q4',2,'What training formats, time, and recognition would make participation practical across schedules and employment categories?');
insert into public.nh_briefings values('T5','Existing accommodation procedures and institutional guidance apply; verify the applicable policy sections with institutional reviewers.','Limited time and knowledge are major barriers. Provide alternatives and practical support for adjuncts and staff.',array['policy','ele','aacu'],null);
insert into public.nh_tables values('T6','Governance, Implementation, and Evaluation','who decides what, the review route, and indicators.','a standing group with faculty, adjunct, and staff seats; coordination with the LSC-Online AI Task Force; annual versus shorter review cycles; events that trigger an immediate review.');
insert into public.nh_questions values('T6Q1','T6');
insert into public.nh_question_versions values('T6Q1',2,'Which norms should apply across North Harris, and which decisions should remain with a discipline, a unit, or an individual instructor?');
insert into public.nh_questions values('T6Q2','T6');
insert into public.nh_question_versions values('T6Q2',2,'Which norms can North Harris adopt itself, and which must be referred to OTS or the system policy process?');
insert into public.nh_questions values('T6Q3','T6');
insert into public.nh_question_versions values('T6Q3',2,'What indicators and evidence should show whether a norm or pilot is working?');
insert into public.nh_questions values('T6Q4','T6');
insert into public.nh_question_versions values('T6Q4',2,'How often should the norms be reviewed, and what process should handle exceptions, unresolved disagreements, and requests for change?');
insert into public.nh_briefings values('T6','The Policy Manual controls over inconsistent college guidelines. The committee recommends; it cannot change board policy or approve tools.','Participatory governance benefits from continuing idea-shares, human review, and short review cycles.',array['policy','wcet','ele'],null);
insert into public.nh_sources values('ots-guidance','LSC OTS AI guidelines','https://www.lonestar.edu/OTS-AI-Guidelines','Institutional guidance',null);
insert into public.nh_sources values('ots-tools','LSC tools and data classification','https://www.lonestar.edu/OTS-AI-Tools','Institutional guidance','2026-10-02');
insert into public.nh_sources values('policy','LSC Policy Manual','https://www.lonestar.edu/policy.htm','Institutional policy',null);
insert into public.nh_sources values('acc','Austin Community College syllabus guidance','https://offices.austincc.edu/institutional-effectiveness-and-grant-development/master-syllabi/artificial-intelligence-draft-policies/','External example',null);
insert into public.nh_sources values('collegeboard','College Board faculty AI research, 2025','https://research.collegeboard.org/media/pdf/ai-research-brief-3-vf.pdf','National research',null);
insert into public.nh_sources values('aacu','AAC&U / Elon faculty survey, 2025 (non-scientific)','https://www.aacu.org/newsroom/national-survey-95-of-college-faculty-fear-student-overreliance-on-ai-and-diminished-critical-thinking-among-learners-who-use-generative-ai-tools','National research',null);
insert into public.nh_sources values('wcet','WCET institutional practices, 2025','https://wcet.wiche.edu/wp-content/uploads/sites/11/2025/08/WCET-Supporting-Governance-Operations-and-Instruction-and-Learning-Through-AI-2025.pdf','National research',null);
insert into public.nh_sources values('ele','Every Learner Everywhere faculty development playbook','https://www.everylearnereverywhere.org/blog/10-best-practices-for-generative-ai-faculty-development-insights-from-the-field/','External example',null);
insert into public.nh_sources values('ccdaily','Faculty-led AI decision-making','https://www.ccdaily.com/2025/02/empowering-faculty-to-lead-ai-decision-making/','External example',null);
insert into public.nh_sources values('nist','NIST AI Risk Management Framework playbook','https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook','Voluntary framework',null);
insert into public.nh_codes values('theme-equity','Theme','Equity and access');
insert into public.nh_codes values('theme-learning','Theme','Learning and assessment');
insert into public.nh_codes values('risk-privacy','Risk','Data exposure');
insert into public.nh_codes values('risk-workload','Risk','Workload and job security');
insert into public.nh_codes values('scope-campus','Scope','Campus-wide baseline');
insert into public.nh_codes values('action-ots','Suggested action','Refer to OTS');
insert into public.nh_codes values('action-training','Suggested action','Professional development');
commit;

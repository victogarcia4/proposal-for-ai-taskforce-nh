-- Faculty-only consultation (separate from the original nh_* tables, which are untouched).
-- Additive only: creates nhf_* tables, policies and one helper function.

create table if not exists public.nhf_admins (
  email text primary key check (email = lower(email))
);

create or replace function public.nhf_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.nhf_admins where email = lower(auth.jwt() ->> 'email'));
$$;

-- Employee faculty only: @lonestar.edu, never @my.lonestar.edu student addresses.
create or replace function public.nhf_is_faculty_email()
returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') ~* '^[^@[:space:]]+@lonestar[.]edu$';
$$;

create table if not exists public.nhf_profiles (
  user_id uuid primary key references auth.users on delete cascade,
  category text not null check (category in ('Full-time faculty', 'Adjunct faculty')),
  division text not null check (char_length(division) <= 80),
  years text not null check (years in ('0-3', '4-10', '11-20', '21+', 'Prefer not to say')),
  privacy_version text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.nhf_survey (
  user_id uuid primary key references public.nhf_profiles on delete cascade,
  answers jsonb not null check (pg_column_size(answers) < 20000),
  status text not null default 'Draft' check (status in ('Draft', 'Submitted')),
  updated_at timestamptz not null default now(),
  check (char_length(coalesce(answers ->> 'S11', '')) <= 600)
);

create table if not exists public.nhf_answers (
  user_id uuid not null references public.nhf_profiles on delete cascade,
  question_id text not null check (question_id in (
    'T1Q1','T1Q2','T1Q3','T1Q4','T2Q1','T2Q2','T2Q3','T2Q4',
    'T3Q1','T5Q1','T5Q2','T5Q3','T5Q4','T6Q1')),
  selected text[] not null default '{}' check (cardinality(selected) <= 8),
  other_text text not null default '' check (char_length(other_text) <= 600),
  opinion_type text not null check (opinion_type in
    ('advice','question','concern','claim','practice','gap','not_sure')),
  status text not null default 'Draft' check (status in ('Draft', 'Submitted')),
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id),
  check (cardinality(selected) > 0 or btrim(other_text) <> '')
);

alter table public.nhf_admins enable row level security;
alter table public.nhf_profiles enable row level security;
alter table public.nhf_survey enable row level security;
alter table public.nhf_answers enable row level security;

-- Faculty read and write only their own rows; the administrator reads everything.
create policy nhf_profiles_own on public.nhf_profiles for all to authenticated
  using (user_id = auth.uid() or public.nhf_is_admin())
  with check (user_id = auth.uid() and public.nhf_is_faculty_email());
create policy nhf_survey_own on public.nhf_survey for all to authenticated
  using (user_id = auth.uid() or public.nhf_is_admin())
  with check (user_id = auth.uid() and public.nhf_is_faculty_email());
create policy nhf_answers_own on public.nhf_answers for all to authenticated
  using (user_id = auth.uid() or public.nhf_is_admin())
  with check (user_id = auth.uid() and public.nhf_is_faculty_email());
create policy nhf_admins_self on public.nhf_admins for select to authenticated
  using (email = lower(auth.jwt() ->> 'email'));

revoke all on public.nhf_admins, public.nhf_profiles, public.nhf_survey, public.nhf_answers from anon;
grant select on public.nhf_admins to authenticated;
grant select, insert, update, delete on public.nhf_profiles, public.nhf_survey, public.nhf_answers to authenticated;

insert into public.nhf_admins (email) values ('vhgarcia100@gmail.com') on conflict do nothing;

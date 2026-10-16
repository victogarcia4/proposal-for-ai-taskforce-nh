-- Supabase default privileges give authenticated every table privilege (including TRUNCATE,
-- which bypasses RLS). Keep only what the app uses.
revoke all on public.nhf_admins, public.nhf_profiles, public.nhf_survey, public.nhf_answers from authenticated;
grant select on public.nhf_admins to authenticated;
grant select, insert, update, delete on public.nhf_profiles, public.nhf_survey, public.nhf_answers to authenticated;

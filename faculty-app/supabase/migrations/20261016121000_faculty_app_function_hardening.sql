-- Supabase advisor fixes: fixed search_path and no anonymous execution of the helpers.
-- Signed-in users keep EXECUTE because the RLS policies call these functions.
alter function public.nhf_is_faculty_email() set search_path = public;
revoke execute on function public.nhf_is_admin() from public, anon;
revoke execute on function public.nhf_is_faculty_email() from public, anon;
grant execute on function public.nhf_is_admin(), public.nhf_is_faculty_email() to authenticated;

-- The invitation roster and server-verified Microsoft identity must both be
-- an active Lone Star College account. Profile names are separate from email
-- so peer directories never expose email addresses.
begin;
alter table public.nh_roster
  add constraint nh_roster_institutional_email
  check (email ~* '^[^@[:space:]]+@(lonestar[.]edu|my[.]lonestar[.]edu)$');
commit;

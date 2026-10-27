-- Talaqa · table access for signed-in users
-- Run once after 0001_init.sql: Supabase dashboard → SQL Editor → paste → Run. Safe to run again.
--
-- Postgres checks two things before a signed-in user reads a row: may this role read the
-- table at all (a GRANT), and which rows (the row-level security policies in 0001).
-- Some Supabase projects grant table access to the API roles automatically; others don't.
-- 0001 relied on that default, so sign-in could fail with "permission denied". These grants
-- make it explicit. They allow reading only; RLS still limits every read to the member's
-- own business and branches, and signed-out visitors (anon) still get nothing.

grant usage on schema public to authenticated;

grant select on
  public.businesses,
  public.branches,
  public.members,
  public.services,
  public.customers,
  public.conversations,
  public.messages,
  public.appointments
to authenticated;

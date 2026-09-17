-- ScamAlert.pk #50 - Admin dashboard support
--
-- Adds a single is_admin flag to profiles. All admin-only reads/writes
-- (all reports, all users, moderation actions) go through Next.js API
-- routes that check this flag server-side (via the caller's real auth
-- session) and then use the service-role key to perform the operation.
-- No new RLS policies are needed for this: the service-role key already
-- bypasses RLS, and the flag is only ever read for the caller's own row
-- (already permitted by the existing "profiles_select_self" policy).
--
-- profiles has never had a table-level SELECT grant for authenticated,
-- since every existing read went through a security-definer function
-- (handle_new_user, username_available) that bypasses it. The admin
-- check is the first place that reads profiles directly, so it needs
-- this grant explicitly; RLS still restricts each user to their own row.

begin;

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

grant select on public.profiles to authenticated;

-- service_role is the trusted backend key used exclusively by the
-- /api/admin/* routes (never exposed to the browser) and already
-- bypasses RLS by design; it still needs the base table grants below,
-- which this project's live schema didn't have.
grant select, update, delete on public.reports to service_role;
grant select on public.profiles to service_role;
grant select on public.business_responses to service_role;
grant select on public.report_evidence to service_role;
grant select on public.customer_final_responses to service_role;

-- Grant admin access to this account. To add more admins later, run
-- this same statement again with a different email.
update public.profiles
set is_admin = true
where id = (
  select id from auth.users where lower(email) = lower('ahsanqu6@gmail.com')
);

commit;

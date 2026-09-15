-- ScamAlert.pk #50 - Admin dashboard support
--
-- Adds a single is_admin flag to profiles. All admin-only reads/writes
-- (all reports, all users, moderation actions) go through Next.js API
-- routes that check this flag server-side (via the caller's real auth
-- session) and then use the service-role key to perform the operation.
-- No new RLS policies are needed for this: the service-role key already
-- bypasses RLS, and the flag is only ever read for the caller's own row
-- (already permitted by the existing "profiles_select_self" policy).

begin;

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Grant admin access to this account. To add more admins later, run
-- this same statement again with a different email.
update public.profiles
set is_admin = true
where id = (
  select id from auth.users where lower(email) = lower('ahsanqu6@gmail.com')
);

commit;

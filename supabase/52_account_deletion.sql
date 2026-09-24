-- ScamAlert.pk #52 - Account deletion requests
--
-- Required for Google Play: apps with account creation must offer both
-- an in-app and a public web-based way to request account + data
-- deletion. Requests are reviewed by an admin (via the dashboard)
-- rather than auto-processed, since the request only carries a
-- self-reported email with no verification. Honoring a request deletes
-- the auth.users row, which cascades to profiles, reports, evidence,
-- and responses per the existing foreign keys - the reporter is the
-- complainant here, not the accused business, so full removal of their
-- own data is the correct behavior, not a way to erase someone else's
-- evidence.

begin;

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','completed','rejected')),
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references auth.users(id)
);

alter table public.account_deletion_requests enable row level security;
-- No direct client access: submissions go through request_account_deletion()
-- (security definer) and all reads/updates go through the admin API routes
-- using the service-role key.

create or replace function public.request_account_deletion(p_email text, p_reason text default null)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  if length(trim(p_email)) < 3 or position('@' in p_email) = 0 then
    raise exception 'A valid email is required';
  end if;

  insert into public.account_deletion_requests (user_id, email, reason)
  values (auth.uid(), lower(trim(p_email)), nullif(trim(p_reason), ''));

  return true;
end;
$$;

grant execute on function public.request_account_deletion(text, text) to anon, authenticated;
grant select, update on public.account_deletion_requests to service_role;

commit;

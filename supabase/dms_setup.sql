-- ScamAlert.pk DMS database setup
-- Run this once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  first_name text,
  last_name text,
  phone text,
  dob date,
  province text,
  city text,
  zipcode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  report_number text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_name text not null,
  order_number text not null,
  brand_email text,
  brand_whatsapp text,
  platform text not null,
  handle text not null,
  order_date date,
  amount_paid numeric(12,2) not null check (amount_paid >= 0),
  payment_method text not null,
  description text not null,
  status text not null default 'pending' check (status in ('pending','resolved')),
  created_at timestamptz not null default now(),
  public_at timestamptz not null default (now() + interval '72 hours'),
  resolved_at timestamptz,
  response_token_hash text not null,
  response_token_expires_at timestamptz not null default (now() + interval '14 days'),
  business_responded_at timestamptz,
  email_notification_status text not null default 'not_attempted' check (email_notification_status in ('not_attempted','sent','failed','not_configured','not_provided')),
  whatsapp_notification_status text not null default 'not_configured' check (whatsapp_notification_status in ('not_attempted','sent','failed','not_configured','not_provided')),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_responses (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports(id) on delete cascade,
  response_text text not null,
  response_type text not null default 'response' check (response_type in ('response','refund_issued','tracking_provided','order_not_recognized')),
  tracking_number text,
  refund_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_evidence (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists reports_user_id_idx on public.reports(user_id);
create index if not exists reports_status_public_at_idx on public.reports(status, public_at);
create index if not exists reports_brand_handle_idx on public.reports(lower(brand_name), lower(handle), platform);
create index if not exists evidence_report_id_idx on public.report_evidence(report_id);

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.business_responses enable row level security;
alter table public.report_evidence enable row level security;

-- Profiles: users can read/update only themselves.
drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Reports: owners can read their own reports. Public detail access begins only after the 72h deadline while unresolved.
drop policy if exists "reports_owner_select" on public.reports;
create policy "reports_owner_select" on public.reports for select to authenticated using (auth.uid() = user_id);
drop policy if exists "reports_public_expired_select" on public.reports;
create policy "reports_public_expired_select" on public.reports for select to anon, authenticated using (status = 'pending' and now() >= public_at);
drop policy if exists "reports_owner_update" on public.reports;
create policy "reports_owner_update" on public.reports for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "reports_owner_delete" on public.reports;
create policy "reports_owner_delete" on public.reports for delete to authenticated using (auth.uid() = user_id);

-- Business responses: report owner can read; public can read responses only once report details are public.
drop policy if exists "responses_owner_or_public_select" on public.business_responses;
create policy "responses_owner_or_public_select" on public.business_responses for select to anon, authenticated using (
  exists (
    select 1 from public.reports r
    where r.id = report_id
      and (r.user_id = auth.uid() or (r.status = 'pending' and now() >= r.public_at))
  )
);

-- Evidence metadata follows the same visibility rule.
drop policy if exists "evidence_owner_or_public_select" on public.report_evidence;
create policy "evidence_owner_or_public_select" on public.report_evidence for select to anon, authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.reports r
    where r.id = report_id and r.status = 'pending' and now() >= r.public_at
  )
);
drop policy if exists "evidence_owner_insert" on public.report_evidence;
create policy "evidence_owner_insert" on public.report_evidence for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.reports r where r.id = report_id and r.user_id = auth.uid())
);
drop policy if exists "evidence_owner_delete" on public.report_evidence;
create policy "evidence_owner_delete" on public.report_evidence for delete to authenticated using (user_id = auth.uid());

-- Create/update a profile automatically from Auth metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, first_name, last_name, phone, dob, province, city, zipcode)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'username',''),
    nullif(new.raw_user_meta_data->>'first_name',''),
    nullif(new.raw_user_meta_data->>'last_name',''),
    nullif(new.raw_user_meta_data->>'phone',''),
    nullif(new.raw_user_meta_data->>'dob','')::date,
    nullif(new.raw_user_meta_data->>'province',''),
    nullif(new.raw_user_meta_data->>'city',''),
    nullif(new.raw_user_meta_data->>'zipcode','')
  )
  on conflict (id) do update set
    username = excluded.username,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    dob = excluded.dob,
    province = excluded.province,
    city = excluded.city,
    zipcode = excluded.zipcode,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert or update of raw_user_meta_data on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.username_available(candidate text)
returns boolean
language sql
security definer set search_path = public
as $$
  select length(trim(candidate)) >= 3
     and not exists (select 1 from public.profiles where lower(username) = lower(trim(candidate)));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- Creates a report and returns the one-time raw business response token.
create or replace function public.create_report(
  p_brand_name text,
  p_order_number text,
  p_brand_email text,
  p_brand_whatsapp text,
  p_platform text,
  p_handle text,
  p_order_date date,
  p_amount_paid numeric,
  p_payment_method text,
  p_description text
)
returns table(id uuid, report_number text, response_token text, public_at timestamptz)
language plpgsql
security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rid uuid := gen_random_uuid();
  rnum text;
  raw_token text;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if length(trim(p_brand_name)) < 2 or length(trim(p_order_number)) < 1 or length(trim(p_handle)) < 1 or length(trim(p_description)) < 10 then
    raise exception 'Required report details are missing';
  end if;

  rnum := 'REP-' || upper(substr(replace(rid::text,'-',''),1,8));
  raw_token := encode(gen_random_bytes(32), 'hex');

  insert into public.reports (
    id, report_number, user_id, brand_name, order_number, brand_email, brand_whatsapp,
    platform, handle, order_date, amount_paid, payment_method, description, response_token_hash,
    email_notification_status, whatsapp_notification_status
  ) values (
    rid, rnum, uid, trim(p_brand_name), trim(p_order_number), nullif(trim(p_brand_email),''), nullif(trim(p_brand_whatsapp),''),
    trim(p_platform), trim(p_handle), p_order_date, p_amount_paid, trim(p_payment_method), trim(p_description),
    encode(digest(raw_token, 'sha256'), 'hex'),
    case when nullif(trim(p_brand_email),'') is null then 'not_provided' else 'not_attempted' end,
    case when nullif(trim(p_brand_whatsapp),'') is null then 'not_provided' else 'not_configured' end
  );

  return query select rid, rnum, raw_token, (select r.public_at from public.reports r where r.id = rid);
end;
$$;
grant execute on function public.create_report(text,text,text,text,text,text,date,numeric,text,text) to authenticated;

-- Public pre-72h feed: only seller identity + aggregate active report count.
create or replace function public.public_report_feed()
returns table(feed_key text, brand text, handle text, platform text, report_count bigint, oldest_report_at timestamptz)
language sql
security definer set search_path = public
as $$
  select
    md5(lower(trim(r.brand_name)) || '|' || lower(trim(r.handle)) || '|' || lower(trim(r.platform))) as feed_key,
    min(r.brand_name) as brand,
    min(r.handle) as handle,
    min(r.platform) as platform,
    count(*) as report_count,
    min(r.created_at) as oldest_report_at
  from public.reports r
  where r.status = 'pending'
  group by lower(trim(r.brand_name)), lower(trim(r.handle)), lower(trim(r.platform))
  order by count(*) desc, min(r.created_at) desc;
$$;
grant execute on function public.public_report_feed() to anon, authenticated;

-- Public details only for unresolved reports whose 72-hour window has expired.
create or replace function public.public_expired_reports()
returns table(
  id uuid, report_number text, brand_name text, order_number text, brand_email text, brand_whatsapp text,
  platform text, handle text, order_date date, amount_paid numeric, payment_method text, description text,
  created_at timestamptz, public_at timestamptz, business_response_text text, business_response_type text,
  business_responded_at timestamptz
)
language sql
security definer set search_path = public
as $$
  select r.id, r.report_number, r.brand_name, r.order_number, r.brand_email, r.brand_whatsapp,
         r.platform, r.handle, r.order_date, r.amount_paid, r.payment_method, r.description,
         r.created_at, r.public_at, br.response_text, br.response_type, r.business_responded_at
  from public.reports r
  left join public.business_responses br on br.report_id = r.id
  where r.status = 'pending' and now() >= r.public_at
  order by r.public_at desc;
$$;
grant execute on function public.public_expired_reports() to anon, authenticated;

-- Derived directory from real reports only. A zero score means at least one unresolved report passed 72h.
create or replace function public.public_brand_directory()
returns table(name text, handle text, platform text, score integer, verified boolean, resolved_cases bigint, open_disputes bigint)
language sql
security definer set search_path = public
as $$
  select
    min(r.brand_name) as name,
    min(r.handle) as handle,
    min(r.platform) as platform,
    case
      when count(*) filter (where r.status='pending' and now() >= r.public_at) > 0 then 0
      else greatest(10, 100 - (count(*) filter (where r.status='pending')::int * 10))
    end as score,
    false as verified,
    count(*) filter (where r.status='resolved') as resolved_cases,
    count(*) filter (where r.status='pending') as open_disputes
  from public.reports r
  group by lower(trim(r.brand_name)), lower(trim(r.handle)), lower(trim(r.platform))
  order by score desc, name;
$$;
grant execute on function public.public_brand_directory() to anon, authenticated;

create or replace function public.public_blacklist()
returns table(id text, brand text, handle text, platform text, reason text, date_blacklisted date, trust_score text)
language sql
security definer set search_path = public
as $$
  select r.report_number, r.brand_name, r.handle, r.platform,
         '72h response window expired while complaint remained unresolved'::text,
         r.public_at::date,
         '0 / 100'::text
  from public.reports r
  where r.status='pending' and now() >= r.public_at
  order by r.public_at desc;
$$;
grant execute on function public.public_blacklist() to anon, authenticated;

-- Business can inspect/respond only with the strong token tied to this report.
create or replace function public.get_business_report(p_report_number text, p_token text)
returns table(id uuid, report_number text, brand_name text, order_number text, platform text, handle text, amount_paid numeric, payment_method text, description text, created_at timestamptz, public_at timestamptz, status text, has_response boolean)
language sql
security definer set search_path = public
as $$
  select r.id, r.report_number, r.brand_name, r.order_number, r.platform, r.handle,
         r.amount_paid, r.payment_method, r.description, r.created_at, r.public_at, r.status,
         exists(select 1 from public.business_responses br where br.report_id=r.id)
  from public.reports r
  where r.report_number = p_report_number
    and r.status = 'pending'
    and r.response_token_expires_at > now()
    and r.response_token_hash = encode(digest(p_token, 'sha256'),'hex');
$$;
grant execute on function public.get_business_report(text,text) to anon, authenticated;

create or replace function public.submit_business_response(
  p_report_number text,
  p_token text,
  p_response_text text,
  p_response_type text default 'response',
  p_tracking_number text default null,
  p_refund_reference text default null
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare rid uuid;
begin
  select r.id into rid from public.reports r
  where r.report_number = p_report_number
    and r.status='pending'
    and r.response_token_expires_at > now()
    and r.response_token_hash = encode(digest(p_token,'sha256'),'hex');
  if rid is null then return false; end if;
  if length(trim(p_response_text)) < 5 then raise exception 'Response is too short'; end if;
  insert into public.business_responses(report_id,response_text,response_type,tracking_number,refund_reference)
  values (rid,trim(p_response_text),p_response_type,nullif(trim(p_tracking_number),''),nullif(trim(p_refund_reference),''))
  on conflict (report_id) do update set
    response_text=excluded.response_text,
    response_type=excluded.response_type,
    tracking_number=excluded.tracking_number,
    refund_reference=excluded.refund_reference,
    updated_at=now();
  update public.reports set business_responded_at=now(), updated_at=now() where id=rid;
  return true;
end;
$$;
grant execute on function public.submit_business_response(text,text,text,text,text,text) to anon, authenticated;

-- Storage bucket and policies for private evidence that becomes readable only when report becomes public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-evidence','report-evidence',false,10485760,array['image/png','image/jpeg','image/webp','application/pdf'])
on conflict (id) do update set public=false, file_size_limit=10485760;

drop policy if exists "evidence_storage_insert_owner" on storage.objects;
create policy "evidence_storage_insert_owner" on storage.objects for insert to authenticated with check (
  bucket_id='report-evidence' and (storage.foldername(name))[1]=auth.uid()::text
);
drop policy if exists "evidence_storage_select_owner_or_public" on storage.objects;
create policy "evidence_storage_select_owner_or_public" on storage.objects for select to anon, authenticated using (
  bucket_id='report-evidence' and (
    (storage.foldername(name))[1]=auth.uid()::text
    or exists (
      select 1 from public.reports r
      where r.id::text=(storage.foldername(name))[2]
        and r.status='pending' and now() >= r.public_at
    )
  )
);
drop policy if exists "evidence_storage_delete_owner" on storage.objects;
create policy "evidence_storage_delete_owner" on storage.objects for delete to authenticated using (
  bucket_id='report-evidence' and (storage.foldername(name))[1]=auth.uid()::text
);

create or replace function public.public_expired_evidence()
returns table(report_id uuid, storage_path text, file_name text, mime_type text)
language sql
security definer set search_path = public
as $$
  select e.report_id, e.storage_path, e.file_name, e.mime_type
  from public.report_evidence e
  join public.reports r on r.id=e.report_id
  where r.status='pending' and now() >= r.public_at
  order by e.created_at;
$$;
grant execute on function public.public_expired_evidence() to anon, authenticated;

-- Backfill profiles for users created before this SQL was installed.
insert into public.profiles (id, username, first_name, last_name, phone, dob, province, city, zipcode)
select
  u.id,
  nullif(u.raw_user_meta_data->>'username',''),
  nullif(u.raw_user_meta_data->>'first_name',''),
  nullif(u.raw_user_meta_data->>'last_name',''),
  nullif(u.raw_user_meta_data->>'phone',''),
  nullif(u.raw_user_meta_data->>'dob','')::date,
  nullif(u.raw_user_meta_data->>'province',''),
  nullif(u.raw_user_meta_data->>'city',''),
  nullif(u.raw_user_meta_data->>'zipcode','')
from auth.users u
on conflict (id) do nothing;

-- Tighten direct table access: public report details are exposed only through the safe RPC above.
drop policy if exists "reports_public_expired_select" on public.reports;
revoke insert, update on public.reports from anon, authenticated;
grant update (status, resolved_at, updated_at, email_notification_status, whatsapp_notification_status) on public.reports to authenticated;
-- Deletes are still protected by the owner-only RLS policy.

grant select, delete on public.reports to authenticated;
grant select, insert, delete on public.report_evidence to authenticated;
grant select on public.business_responses to anon, authenticated;

-- ScamAlert.pk #51 - Mandatory reporter declarations
--
-- Records that the reporter affirmed the standard declarations at the
-- moment of submission (genuine experience, accurate info, responsible
-- for content, no false/altered evidence, agrees to Terms/Content
-- Policy) - evidence of what the reporter represented to ScamAlert.pk
-- at submission time. create_report now requires p_declarations_accepted
-- to be true or it refuses to create the report.

begin;

alter table public.reports
  add column if not exists declarations_accepted_at timestamptz;

drop function if exists public.create_report(
  text,text,text,text,text,text,date,numeric,text,text
);

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
  p_description text,
  p_declarations_accepted boolean default false
)
returns table(id uuid, report_number text, response_token text, public_at timestamptz)
language plpgsql
security definer set search_path = public, extensions
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
  if not p_declarations_accepted then
    raise exception 'You must accept the reporting declarations before submitting.';
  end if;

  -- Serialize report creation per user to reduce duplicate submissions
  -- caused by rapid double-clicks or simultaneous requests.
  perform pg_advisory_xact_lock(hashtext(uid::text));

  -- Do not allow the same user to open another active report for
  -- the same business and order number.
  if exists (
    select 1
    from public.reports r
    where r.user_id = uid
      and r.status = 'pending'
      and lower(trim(r.brand_name)) = lower(trim(p_brand_name))
      and lower(trim(r.order_number)) = lower(trim(p_order_number))
  ) then
    raise exception 'You already have an active report for this business and order number.';
  end if;

  -- Basic anti-spam throttle.
  if exists (
    select 1
    from public.reports r
    where r.user_id = uid
      and r.created_at > now() - interval '60 seconds'
  ) then
    raise exception 'Please wait 60 seconds before submitting another report.';
  end if;

  rnum := 'REP-' || upper(substr(replace(rid::text,'-',''),1,8));
  raw_token := encode(gen_random_bytes(32), 'hex');

  insert into public.reports (
    id, report_number, user_id, brand_name, order_number, brand_email, brand_whatsapp,
    platform, handle, order_date, amount_paid, payment_method, description, response_token_hash,
    email_notification_status, whatsapp_notification_status, declarations_accepted_at
  ) values (
    rid, rnum, uid, trim(p_brand_name), trim(p_order_number), nullif(trim(p_brand_email),''), nullif(trim(p_brand_whatsapp),''),
    trim(p_platform), trim(p_handle), p_order_date, p_amount_paid, trim(p_payment_method), trim(p_description),
    encode(digest(raw_token, 'sha256'), 'hex'),
    case when nullif(trim(p_brand_email),'') is null then 'not_provided' else 'not_attempted' end,
    case when nullif(trim(p_brand_whatsapp),'') is null then 'not_provided' else 'not_configured' end,
    now()
  );

  return query select rid, rnum, raw_token, (select r.public_at from public.reports r where r.id = rid);
end;
$$;

revoke execute on function public.create_report(
  text,text,text,text,text,text,date,numeric,text,text,boolean
) from public, anon;

grant execute on function public.create_report(
  text,text,text,text,text,text,date,numeric,text,text,boolean
) to authenticated;

commit;

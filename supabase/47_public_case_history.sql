begin;

drop function if exists public.get_public_report(text);

create function public.get_public_report(p_report_number text)
returns table(
  id uuid,
  report_number text,
  brand_name text,
  order_number text,
  brand_email text,
  brand_whatsapp text,
  platform text,
  handle text,
  order_date date,
  amount_paid numeric,
  payment_method text,
  description text,
  created_at timestamptz,
  public_at timestamptz,
  business_response_text text,
  business_response_type text,
  business_responded_at timestamptz,
  business_tracking_number text,
  business_refund_reference text,
  customer_final_response_text text,
  customer_resolution_choice text,
  customer_final_responded_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    r.id,
    r.report_number,
    r.brand_name,
    r.order_number,
    r.brand_email,
    r.brand_whatsapp,
    r.platform,
    r.handle,
    r.order_date,
    r.amount_paid,
    r.payment_method,
    r.description,
    r.created_at,
    r.public_at,
    br.response_text,
    br.response_type,
    br.created_at,
    br.tracking_number,
    br.refund_reference,
    cfr.response_text,
    cfr.resolution_choice,
    cfr.created_at
  from public.reports r
  left join public.business_responses br
    on br.report_id = r.id
  left join lateral (
    select response_text, resolution_choice, created_at
    from public.customer_final_responses
    where report_id = r.id
    order by created_at desc
    limit 1
  ) cfr on true
  where r.report_number = p_report_number
    and r.status = 'pending'
    and now() >= r.public_at
  limit 1;
$$;

grant execute on function public.get_public_report(text)
to anon, authenticated;

commit;

-- ScamAlert.pk #49 - RLS / database security hardening

-- Remove unnecessary high-risk table privileges from browser roles.
revoke truncate, trigger, references
on all tables in schema public
from anon, authenticated;

-- Lock down unused legacy backup table.
drop policy if exists "Public can view published reports"
on public.reports_legacy_backup;

revoke all
on public.reports_legacy_backup
from anon, authenticated;

-- Remove duplicate customer final-response policies.
drop policy if exists "Customers can read own final responses"
on public.customer_final_responses;

drop policy if exists "Customers can submit own final responses"
on public.customer_final_responses;

-- create_report must only be callable by authenticated users.
revoke execute on function public.create_report(
  text,text,text,text,text,text,date,numeric,text,text
) from public, anon;

grant execute on function public.create_report(
  text,text,text,text,text,text,date,numeric,text,text
) to authenticated;

-- Internal trigger functions must not be callable by browser roles.
revoke execute on function public.handle_new_user()
from public, anon, authenticated;

revoke execute on function public.process_fake_report_ban()
from public, anon, authenticated;

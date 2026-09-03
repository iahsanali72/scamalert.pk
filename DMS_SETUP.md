# ScamAlert.pk DMS Setup

This build replaces the demo report state with a real Supabase-backed dispute management system.

## 1. Run the Supabase SQL

Open **Supabase → SQL Editor → New query**, paste the full contents of:

`supabase/dms_setup.sql`

Run it once.

It creates:
- `profiles`
- `reports`
- `business_responses`
- `report_evidence`
- private `report-evidence` Storage bucket
- Row Level Security policies
- public report-feed / directory / expired-report RPCs
- secure business-response token RPCs
- automatic 72-hour public visibility logic

## 2. Required Vercel environment variables

Keep the existing variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Add:

- `NEXT_PUBLIC_SITE_URL=https://scamalert.pk`

Redeploy after adding/changing environment variables.

## 3. Optional real business email notifications

The DMS works without an email provider. Reports still save and the 72-hour timer still runs, but the dashboard will show the email notice as `not_configured`.

To actually email businesses, create a Resend account/domain and add these Vercel Production variables:

- `RESEND_API_KEY`
- `NOTIFICATION_FROM_EMAIL` (example: `ScamAlert <notices@scamalert.pk>`)

Then redeploy. The notification is intentionally neutral: it says a customer complaint exists and gives the business a secure report-only response link; it does not declare the business fraudulent.

## 4. WhatsApp

The report form stores the business WhatsApp number, but automatic WhatsApp sending is deliberately marked `not_configured` until a WhatsApp Business API provider is connected. The app never pretends a message was delivered.

## 5. DMS behavior

- Every report belongs to the authenticated Supabase user who submitted it.
- The customer's dashboard only loads that customer's reports.
- During the first 72 hours, the public feed exposes only business identity, platform/handle and aggregate report count.
- If a complaint is still unresolved at the 72-hour deadline, its report details and evidence become publicly readable.
- Only the report owner can mark it resolved or delete it.
- Marking a report resolved removes it from unresolved public listings.
- Each report receives a strong random business-response token. The token is stored only as a SHA-256 hash in the database.
- A business can respond to that report through `/respond/REP-...?...` without creating an account.
- The business cannot resolve/delete the complaint or access the customer's account/other reports.
- The customer can see the business response in their dashboard.
- Evidence files are private during the 72-hour window and become readable through short-lived signed links only when the unresolved report becomes public.

## 6. Password reset

Forgot Password now calls Supabase's real password-reset email flow and redirects to `/reset-password` for the user to choose a new password.

## 7. Important production notes

Before a large public launch, add rate limiting / anti-abuse controls (for example Cloudflare/Vercel rate limits or a database-backed limiter) around report creation and business notifications. Also establish moderation/takedown and privacy policies appropriate for publishing allegations and evidence.

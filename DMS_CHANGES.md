# DMS changes in this build

- Removed hard-coded/sample reports, dashboard tickets, brands and blacklist data.
- Reports now persist in Supabase and are owned by the authenticated user.
- Customer dashboard queries only the signed-in user's reports.
- Added Order #, Order Date, Brand Email and Brand WhatsApp fields.
- Added private evidence upload to Supabase Storage.
- Public feed uses real aggregate report counts while complaint details stay hidden during the first 72 hours.
- Unresolved reports automatically become publicly readable after their 72-hour deadline through safe database functions.
- Public evidence uses short-lived signed URLs and is unavailable before the deadline.
- Report owner can mark resolved or delete; other users cannot.
- Resolving a report removes it from unresolved/public DMS listings.
- Each report receives a strong business-response token; only its SHA-256 hash is stored.
- Added `/respond/[reportNumber]` for business responses without creating an account.
- Business response is visible to the customer and, if still unresolved after 72 hours, in public report details.
- Added optional real business email sending through Resend. If not configured, status truthfully remains `not_configured`.
- WhatsApp contact is stored but sending remains `not_configured` until a WhatsApp Business API provider is connected.
- Forgot Password now uses Supabase reset email flow and `/reset-password`.
- Added profiles/username availability backed by Supabase instead of a hard-coded username list.
- Added RLS/storage policies so report ownership and evidence privacy are enforced by Supabase, not only by the UI.

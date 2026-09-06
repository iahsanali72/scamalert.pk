import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { reportId, responseToken } = await request.json();
  if (!reportId || !responseToken) return NextResponse.json({ error: 'Missing report details' }, { status: 400 });

  const { data: report, error } = await supabase
    .from('reports')
    .select('id, report_number, user_id, brand_name, brand_email, brand_whatsapp, order_number, amount_paid, description, public_at')
    .eq('id', reportId)
    .eq('user_id', user.id)
    .single();

  if (error || !report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamalert.pk';
  const responseUrl = `${appUrl}/respond/${encodeURIComponent(report.report_number)}?token=${encodeURIComponent(responseToken)}`;

  if (!report.brand_email) {
    await supabase.from('reports').update({ email_notification_status: 'not_provided' }).eq('id', report.id);
    return NextResponse.json({ email: 'not_provided', whatsapp: report.brand_whatsapp ? 'not_configured' : 'not_provided' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM_EMAIL;
  if (!resendKey || !from) {
    await supabase.from('reports').update({ email_notification_status: 'not_configured' }).eq('id', report.id);
    return NextResponse.json({ email: 'not_configured', whatsapp: report.brand_whatsapp ? 'not_configured' : 'not_provided' });
  }

  const body = {
    from,
    to: [report.brand_email],
    subject: `Report filed on ScamAlert.pk regarding Order #${report.order_number}`,
    html: `
      <div style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">

            <div style="padding:24px 28px;border-bottom:1px solid #e5e7eb;">
              <div style="font-size:22px;font-weight:800;color:#111827;">
                ScamAlert<span style="color:#dc2626;">.pk</span>
              </div>
              <div style="font-size:12px;color:#6b7280;margin-top:4px;">
                Report today, protect others.
              </div>
            </div>

            <div style="padding:28px;">
              <p style="margin:0 0 18px;font-size:15px;line-height:1.6;">
                Hello <strong>${report.brand_name}</strong>,
              </p>

              <p style="margin:0 0 18px;font-size:15px;line-height:1.6;">
                A customer has submitted a report on <strong>ScamAlert.pk</strong>
                regarding <strong>Order #${report.order_number}</strong>
                associated with your business.
              </p>

              <p style="margin:0 0 22px;font-size:15px;line-height:1.6;">
                We are contacting you to give your business an opportunity to review
                the report and provide a response before the
                <strong>72-hour review period</strong> ends.
              </p>

              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:18px;margin-bottom:22px;">
                <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-bottom:12px;">
                  Report details
                </div>

                <div style="font-size:14px;line-height:1.8;">
                  <div><strong>Report ID:</strong> ${report.report_number}</div>
                  <div><strong>Order #:</strong> ${report.order_number}</div>
                  <div><strong>Amount:</strong> PKR ${Number(report.amount_paid ?? 0).toLocaleString('en-PK')}</div>
                  <div><strong>Status:</strong> Awaiting business response</div>
                </div>
              </div>

              <div style="margin-bottom:22px;">
                <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">
                  Customer's report
                </div>

                <div style="background:#ffffff;border-left:4px solid #dc2626;padding:14px 16px;font-size:14px;line-height:1.6;color:#374151;">
                  ${report.description}
                </div>
              </div>

              <div style="text-align:center;margin:28px 0;">
                <a
                  href="${responseUrl}"
                  style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 22px;border-radius:10px;"
                >
                  View Report &amp; Respond
                </a>
              </div>

              <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#6b7280;">
                This is a secure response link unique to this report.
                You do not need to create a ScamAlert.pk account to respond.
              </p>

              <p style="margin:0 0 18px;font-size:14px;line-height:1.6;">
                Your response may include an explanation, refund information,
                delivery or tracking details, and supporting evidence where applicable.
              </p>

              <div style="margin:24px 0 8px;font-size:15px;font-weight:700;color:#111827;">
                What happens after you respond?
              </div>

              <p style="margin:0 0 18px;font-size:14px;line-height:1.6;">
                Your response will be shared with the customer. The customer will then
                be given an opportunity to confirm whether the matter has been resolved satisfactorily.
              </p>

              <p style="margin:0 0 18px;font-size:14px;line-height:1.6;">
                If no response is received before the review period ends,
                the report will continue through ScamAlert.pk's normal report process.
              </p>

              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-top:24px;">
                <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">
                  Important
                </div>

                <div style="font-size:13px;line-height:1.6;color:#4b5563;">
                  A report being submitted does not mean ScamAlert.pk has determined that
                  your business has committed fraud, misconduct, or wrongdoing.
                  This notification is being sent because a customer submitted a report
                  concerning an order associated with your business.
                </div>
              </div>

              <p style="margin:24px 0 0;font-size:14px;line-height:1.6;">
                Regards,<br />
                <strong>ScamAlert.pk</strong>
              </p>
            </div>
          </div>

          <div style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">
            scamalert.pk
          </div>
        </div>
      </div>
    `,
  };

  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const resultText = await result.text();

  console.log(
    'Resend notify-business response:',
    result.status,
    resultText
  );

  const status = result.ok ? 'sent' : 'failed';

  await supabase
    .from('reports')
    .update({ email_notification_status: status })
    .eq('id', report.id);

  return NextResponse.json({
    email: status,
    whatsapp: report.brand_whatsapp ? 'not_configured' : 'not_provided',
  });
}

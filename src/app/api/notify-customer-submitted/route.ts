import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { reportId } = await request.json()

    if (!reportId) {
      return NextResponse.json(
        { error: 'Missing report details' },
        { status: 400 }
      )
    }

    const { data: report, error } = await supabase
      .from('reports')
      .select(`
        id,
        report_number,
        user_id,
        brand_name,
        order_number,
        amount_paid,
        public_at,
        status
      `)
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single()

    if (error || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const resendKey = process.env.RESEND_API_KEY
    const from = process.env.NOTIFICATION_FROM_EMAIL

    if (!resendKey || !from) {
      return NextResponse.json(
        { email: 'not_configured' },
        { status: 500 }
      )
    }

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://scamalert.pk'

    const caseUrl =
      `${appUrl}/case/${encodeURIComponent(report.report_number)}`

    const body = {
      from,
      to: [user.email],
      subject: `Your report has been submitted — ${report.report_number}`,
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
                <h2 style="margin:0 0 14px;font-size:20px;color:#111827;">
                  Your report has been submitted
                </h2>

                <p style="margin:0 0 18px;font-size:15px;line-height:1.6;">
                  Your report regarding <strong>${report.brand_name}</strong>
                  has been successfully submitted to ScamAlert.pk.
                </p>

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:18px;margin-bottom:22px;">
                  <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-bottom:12px;">
                    Report details
                  </div>

                  <div style="font-size:14px;line-height:1.8;">
                    <div><strong>Report ID:</strong> ${report.report_number}</div>
                    <div><strong>Business:</strong> ${report.brand_name}</div>
                    <div><strong>Order #:</strong> ${report.order_number}</div>
                    <div><strong>Amount:</strong> PKR ${Number(report.amount_paid ?? 0).toLocaleString('en-PK')}</div>
                    <div><strong>Status:</strong> Awaiting business response</div>
                  </div>
                </div>

                <p style="margin:0 0 18px;font-size:14px;line-height:1.6;">
                  The business has been given a <strong>72-hour review period</strong>
                  to provide its response.
                </p>

                <p style="margin:0 0 18px;font-size:14px;line-height:1.6;">
                  If the business responds, we will notify you by email and ask you
                  to review their response.
                </p>

                <div style="text-align:center;margin:28px 0;">
                  <a
                    href="${caseUrl}"
                    style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 22px;border-radius:10px;"
                  >
                    View Your Report
                  </a>
                </div>

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-top:22px;">
                  <div style="font-size:13px;line-height:1.6;color:#4b5563;">
                    Keep your <strong>Report ID</strong> for reference. You can also
                    access your report from your ScamAlert.pk dashboard.
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
    }

    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const resultText = await result.text()

    console.log(
      'Resend customer submission response:',
      result.status,
      resultText
    )

    return NextResponse.json({
      email: result.ok ? 'sent' : 'failed',
    })
  } catch (error) {
    console.error('Customer submission notification error:', error)

    return NextResponse.json(
      { error: 'Unable to notify customer' },
      { status: 500 }
    )
  }
}

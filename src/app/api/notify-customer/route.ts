import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const { reportNumber, token } = await request.json()

    if (!reportNumber || !token) {
      return NextResponse.json(
        { error: 'Missing report details' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Validate the secure brand-response token.
    const { data: reportRows, error: tokenError } = await supabase.rpc(
      'get_business_report',
      {
        p_report_number: reportNumber,
        p_token: token,
      }
    )

    if (tokenError || !reportRows?.length) {
      return NextResponse.json(
        { error: 'Invalid or expired response link' },
        { status: 403 }
      )
    }

    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        id,
        report_number,
        user_id,
        brand_name,
        business_responded_at
      `)
      .eq('report_number', reportNumber)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Never email the customer until the brand response is actually saved.
    if (!report.business_responded_at) {
      return NextResponse.json(
        { error: 'Business response has not been submitted' },
        { status: 409 }
      )
    }

    const { data: customerResult, error: customerError } =
      await supabase.auth.admin.getUserById(report.user_id)

    const customerEmail = customerResult?.user?.email

    if (customerError || !customerEmail) {
      return NextResponse.json(
        { error: 'Customer email not available' },
        { status: 404 }
      )
    }

    const resendKey = process.env.RESEND_API_KEY
    const from = process.env.NOTIFICATION_FROM_EMAIL

    if (!resendKey || !from) {
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      )
    }

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://scamalert.pk'

    const caseUrl =
      `${appUrl}/case/${encodeURIComponent(report.report_number)}`

    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [customerEmail],
        subject: `${report.brand_name} responded to your ScamAlert.pk report`,
        html: `
          <p>
            <strong>${report.brand_name}</strong> has responded to your
            complaint <strong>${report.report_number}</strong>.
          </p>

          <p>
            Please review the business response and provide your final
            decision.
          </p>

          <p>
            <a href="${caseUrl}">
              Review business response
            </a>
          </p>

          <p>
            You can mark the complaint as satisfied or not satisfied
            after reviewing the response.
          </p>
        `,
      }),
    })

    if (!result.ok) {
      const details = await result.text()
      console.error('Customer notification email failed:', details)

      return NextResponse.json(
        { email: 'failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      email: 'sent',
    })
  } catch (error) {
    console.error('Customer notification error:', error)

    return NextResponse.json(
      { error: 'Unable to notify customer' },
      { status: 500 }
    )
  }
}

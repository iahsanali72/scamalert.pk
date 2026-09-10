import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendTrackedEmail } from '@/utils/email-delivery'

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

    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        id,
        report_number,
        user_id,
        brand_name,
        business_responded_at,
        response_token_hash,
        response_token_expires_at
      `)
      .eq('report_number', reportNumber)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const suppliedTokenHash = createHash('sha256')
      .update(token)
      .digest('hex')

    if (
      !report.response_token_hash ||
      suppliedTokenHash !== report.response_token_hash
    ) {
      return NextResponse.json(
        { error: 'Invalid response token' },
        { status: 403 }
      )
    }

    if (
      !report.response_token_expires_at ||
      new Date(report.response_token_expires_at).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: 'Response token has expired' },
        { status: 403 }
      )
    }

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

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://scamalert.pk'

    const caseUrl =
      `${appUrl}/case/${encodeURIComponent(report.report_number)}`

    const result = await sendTrackedEmail({
      reportId: report.id,
      reportNumber: report.report_number,
      emailType: 'customer_business_response',
      to: customerEmail,
      subject: `${report.brand_name} responded to your ScamAlert.pk report`,
      html: `
          <p>
            <strong>${report.brand_name}</strong> has responded to your
            report <strong>${report.report_number}</strong>.
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
            After reviewing the response, you can tell us whether you are
            satisfied or not satisfied with the outcome.
          </p>
        `,
    })

    if (!result.ok) {
      return NextResponse.json(
        { email: result.status },
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

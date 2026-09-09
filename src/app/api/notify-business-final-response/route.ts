import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(request: Request) {
  try {
    const { reportId } = await request.json()

    if (!reportId) {
      return NextResponse.json(
        { error: 'Missing report ID' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        id,
        report_number,
        user_id,
        brand_name,
        brand_email,
        order_number,
        status,
        public_at
      `)
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const { data: finalResponse, error: finalError } = await supabase
      .from('customer_final_responses')
      .select(`
        response_text,
        resolution_choice,
        created_at
      `)
      .eq('report_id', report.id)
      .eq('user_id', user.id)
      .single()

    if (finalError || !finalResponse) {
      return NextResponse.json(
        { error: 'Final response not found' },
        { status: 404 }
      )
    }

    if (!report.brand_email) {
      return NextResponse.json({
        email: 'not_provided',
      })
    }

    const resendKey = process.env.RESEND_API_KEY
    const from = process.env.NOTIFICATION_FROM_EMAIL

    if (!resendKey || !from) {
      return NextResponse.json({
        email: 'not_configured',
      })
    }

    const safeBrandName = escapeHtml(report.brand_name || '')
    const safeReportNumber = escapeHtml(report.report_number)
    const safeOrderNumber = escapeHtml(report.order_number || 'Not provided')
    const safeResponseText = escapeHtml(finalResponse.response_text)

    const satisfied =
      finalResponse.resolution_choice === 'resolved'

    if (satisfied && report.status !== 'resolved') {
      return NextResponse.json(
        { error: 'Report resolution has not completed' },
        { status: 409 }
      )
    }

    const decision = satisfied
      ? 'Satisfied'
      : 'Not Satisfied'

    const outcomeText = satisfied
      ? 'The customer has accepted your response and the report has been marked resolved.'
      : 'The customer was not satisfied with your response. The report remains active and will continue through the original review period.'

    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [report.brand_email],
        subject: `Customer decision for report ${report.report_number}: ${decision}`,
        html: `
          <h2>Customer Final Decision</h2>

          <p>
            The customer has submitted their final response regarding
            <strong>${safeBrandName}</strong>.
          </p>

          <p>
            <strong>Report:</strong> ${safeReportNumber}<br />
            <strong>Order:</strong> ${safeOrderNumber}<br />
            <strong>Customer decision:</strong> ${decision}
          </p>

          <p>${outcomeText}</p>

          <p><strong>Customer's final response:</strong></p>

          <p>${safeResponseText}</p>

          <p>
            This notification is provided by ScamAlert.pk as part of the
            report review process.
          </p>
        `,
      }),
    })

    const details = await result.text()

    console.log(
      'Resend final-response business email:',
      result.status,
      details
    )

    return NextResponse.json({
      email: result.ok ? 'sent' : 'failed',
    })
  } catch (error) {
    console.error('Business final-response notification error:', error)

    return NextResponse.json(
      { error: 'Unable to notify business' },
      { status: 500 }
    )
  }
}

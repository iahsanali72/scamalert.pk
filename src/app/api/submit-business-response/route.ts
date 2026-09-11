import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendTrackedEmail } from '@/utils/email-delivery'

export async function POST(request: Request) {
  try {
    const {
      reportNumber,
      token,
      responseText,
      responseType,
      trackingNumber,
      refundReference,
    } = await request.json()

    if (!reportNumber || !token || !responseText) {
      return NextResponse.json(
        { error: 'Missing response details' },
        { status: 400 }
      )
    }

    const normalizedResponseType = responseType || 'response'

    const allowedResponseTypes = [
      'response',
      'refund_issued',
      'tracking_provided',
      'order_not_recognized',
    ]

    if (!allowedResponseTypes.includes(normalizedResponseType)) {
      return NextResponse.json(
        { error: 'Invalid response type' },
        { status: 400 }
      )
    }

    if (responseText.trim().length < 5) {
      return NextResponse.json(
        { error: 'Response must be at least 5 characters long' },
        { status: 400 }
      )
    }

    if (
      normalizedResponseType === 'refund_issued' &&
      !refundReference?.trim()
    ) {
      return NextResponse.json(
        { error: 'Refund reference is required when a refund has been issued' },
        { status: 400 }
      )
    }

    if (
      normalizedResponseType === 'tracking_provided' &&
      !trackingNumber?.trim()
    ) {
      return NextResponse.json(
        { error: 'Tracking number is required when tracking is provided' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Submit the official one-time business response.
    // The database function validates the token and expires it immediately.
    const { data: submitted, error: submitError } = await supabase.rpc(
      'submit_business_response',
      {
        p_report_number: reportNumber,
        p_token: token,
        p_response_text: responseText,
        p_response_type: normalizedResponseType,
        p_tracking_number:
          normalizedResponseType === 'tracking_provided'
            ? trackingNumber.trim()
            : null,
        p_refund_reference:
          normalizedResponseType === 'refund_issued'
            ? refundReference.trim()
            : null,
      }
    )

    if (submitError || !submitted) {
      return NextResponse.json(
        {
          error:
            submitError?.message ||
            'Unable to submit business response',
        },
        { status: 400 }
      )
    }

    // Response is now safely recorded and the token is expired.
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
      return NextResponse.json({
        success: true,
        email: 'failed',
      })
    }

    const { data: customerResult, error: customerError } =
      await supabase.auth.admin.getUserById(report.user_id)

    const customerEmail = customerResult?.user?.email

    if (customerError || !customerEmail) {
      return NextResponse.json({
        success: true,
        email: 'not_available',
      })
    }

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://scamalert.pk'

    const caseUrl =
      `${appUrl}/case/${encodeURIComponent(report.report_number)}`

    const emailResult = await sendTrackedEmail({
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

    return NextResponse.json({
      success: true,
      email: emailResult.status,
    })
  } catch (error) {
    console.error('Business response submission error:', error)

    return NextResponse.json(
      { error: 'Unable to submit business response' },
      { status: 500 }
    )
  }
}

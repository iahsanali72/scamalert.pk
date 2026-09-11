import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendTrackedEmail } from '@/utils/email-delivery'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function sendEmail({
  reportId,
  reportNumber,
  emailType,
  to,
  subject,
  html,
}: {
  reportId: string
  reportNumber: string
  emailType: string
  to: string
  subject: string
  html: string
}) {
  return sendTrackedEmail({
    reportId,
    reportNumber,
    emailType,
    to,
    subject,
    html,
  })
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    const now = new Date()

    const cutoff48h = new Date(
      now.getTime() + 48 * 60 * 60 * 1000
    )

    const { data: reports, error } = await supabase
      .from('reports')
      .select(`
        id,
        report_number,
        brand_name,
        brand_email,
        order_number,
        status,
        public_at,
        deadline_48h_reminder_sent_at,
        deadline_24h_reminder_sent_at,
        deadline_expired_email_sent_at
      `)
      .eq('status', 'pending')
      .lte('public_at', cutoff48h.toISOString())
      .order('public_at', { ascending: true })

    if (error) {
      console.error('Deadline report lookup failed:', error)

      return NextResponse.json(
        { error: 'Unable to load reports' },
        { status: 500 }
      )
    }

    let reminders48hSent = 0
    let reminders24hSent = 0
    let expiredSent = 0
    let skipped = 0
    let failed = 0

    for (const report of reports || []) {
      if (!report.brand_email) {
        skipped++
        continue
      }

      const publicAt = new Date(report.public_at)
      const hoursRemaining =
        (publicAt.getTime() - now.getTime()) / (60 * 60 * 1000)

      const safeBrandName = escapeHtml(report.brand_name || '')
      const safeReportNumber = escapeHtml(report.report_number)
      const safeOrderNumber = escapeHtml(
        report.order_number || 'Not provided'
      )

      // Deadline has expired.
      if (
        hoursRemaining <= 0 &&
        !report.deadline_expired_email_sent_at
      ) {
        const result = await sendEmail({
          reportId: report.id,
          reportNumber: report.report_number,
          emailType: 'business_deadline_expired',
          to: report.brand_email,
          subject: `72-hour review period expired — ${report.report_number}`,
          html: `
            <h2>72-Hour Review Period Expired</h2>

            <p>
              The review period for the report concerning
              <strong>${safeBrandName}</strong> has expired.
            </p>

            <p>
              <strong>Report:</strong> ${safeReportNumber}<br />
              <strong>Order:</strong> ${safeOrderNumber}
            </p>

            <p>
              Because the report remains unresolved after the original
              72-hour review period, its eligible report details may now
              be publicly visible on ScamAlert.pk.
            </p>

            <p>
              This deadline was not extended or reset.
            </p>
          `,
        })

        if (result.ok) {
          const { error: updateError } = await supabase
            .from('reports')
            .update({
              deadline_expired_email_sent_at:
                new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', report.id)
            .is('deadline_expired_email_sent_at', null)

          if (updateError) {
            console.error(
              'Expired email timestamp update failed:',
              updateError
            )
            failed++
          } else {
            expiredSent++
          }
        } else {
          failed++
        }

        continue
      }

      // 24 hours or less remain.
      if (
        hoursRemaining > 0 &&
        hoursRemaining <= 24 &&
        !report.deadline_24h_reminder_sent_at
      ) {
        const result = await sendEmail({
          reportId: report.id,
          reportNumber: report.report_number,
          emailType: 'business_deadline_24h',
          to: report.brand_email,
          subject: `Final reminder: 24 hours or less remain — ${report.report_number}`,
          html: `
            <h2>Final 72-Hour Review Reminder</h2>

            <p>
              24 hours or less remain in the review period for the
              report concerning <strong>${safeBrandName}</strong>.
            </p>

            <p>
              <strong>Report:</strong> ${safeReportNumber}<br />
              <strong>Order:</strong> ${safeOrderNumber}
            </p>

            <p>
              If the report remains unresolved when the original
              72-hour period ends, its eligible report details may
              become publicly visible on ScamAlert.pk.
            </p>

            <p>
              This reminder does not extend or reset the deadline.
            </p>
          `,
        })

        if (result.ok) {
          const { error: updateError } = await supabase
            .from('reports')
            .update({
              deadline_24h_reminder_sent_at:
                new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', report.id)
            .is('deadline_24h_reminder_sent_at', null)

          if (updateError) {
            console.error(
              '24-hour reminder timestamp update failed:',
              updateError
            )
            failed++
          } else {
            reminders24hSent++
          }
        } else {
          failed++
        }

        continue
      }

      // Between 24 and 48 hours remain.
      if (
        hoursRemaining > 24 &&
        hoursRemaining <= 48 &&
        !report.deadline_48h_reminder_sent_at
      ) {
        const result = await sendEmail({
          reportId: report.id,
          reportNumber: report.report_number,
          emailType: 'business_deadline_48h',
          to: report.brand_email,
          subject: `Reminder: 48 hours or less remain — ${report.report_number}`,
          html: `
            <h2>72-Hour Review Reminder</h2>

            <p>
              48 hours or less remain in the review period for the
              report concerning <strong>${safeBrandName}</strong>.
            </p>

            <p>
              <strong>Report:</strong> ${safeReportNumber}<br />
              <strong>Order:</strong> ${safeOrderNumber}
            </p>

            <p>
              The original 72-hour review period is still active.
              If the report remains unresolved at the deadline,
              its eligible report details may become publicly visible
              on ScamAlert.pk.
            </p>

            <p>
              This reminder does not extend or reset the deadline.
            </p>
          `,
        })

        if (result.ok) {
          const { error: updateError } = await supabase
            .from('reports')
            .update({
              deadline_48h_reminder_sent_at:
                new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', report.id)
            .is('deadline_48h_reminder_sent_at', null)

          if (updateError) {
            console.error(
              '48-hour reminder timestamp update failed:',
              updateError
            )
            failed++
          } else {
            reminders48hSent++
          }
        } else {
          failed++
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked: reports?.length || 0,
      reminders48hSent,
      reminders24hSent,
      expiredSent,
      skipped,
      failed,
    })
  } catch (error) {
    console.error('Deadline email job error:', error)

    return NextResponse.json(
      { error: 'Deadline email job failed' },
      { status: 500 }
    )
  }
}

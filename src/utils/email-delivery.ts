import { createAdminClient } from '@/utils/supabase/admin'

type SendTrackedEmailParams = {
  reportId: string
  reportNumber: string
  emailType: string
  to: string
  subject: string
  html: string
}

export async function sendTrackedEmail({
  reportId,
  reportNumber,
  emailType,
  to,
  subject,
  html,
}: SendTrackedEmailParams) {
  const supabase = createAdminClient()

  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.NOTIFICATION_FROM_EMAIL
  const now = new Date().toISOString()

  const { data: existingLog, error: lookupError } = await supabase
    .from('email_delivery_logs')
    .select('id, status, attempt_count, provider_message_id')
    .eq('report_id', reportId)
    .eq('email_type', emailType)
    .eq('recipient_email', to)
    .limit(1)
    .maybeSingle()

  if (lookupError) {
    console.error('Unable to check email delivery log:', lookupError)

    return {
      ok: false,
      status: 'logging_failed',
    }
  }

  if (existingLog?.status === 'sent') {
    return {
      ok: true,
      status: 'already_sent',
      providerMessageId: existingLog.provider_message_id,
    }
  }

  let logId: string | undefined

  if (existingLog) {
    if (existingLog.status === 'pending') {
      return {
        ok: false,
        status: 'in_progress',
      }
    }

    const nextAttempt = (existingLog.attempt_count || 0) + 1

    const { data: claimedLog, error: claimError } = await supabase
      .from('email_delivery_logs')
      .update({
        status: 'pending',
        attempt_count: nextAttempt,
        last_attempted_at: now,
        updated_at: now,
      })
      .eq('id', existingLog.id)
      .in('status', ['failed', 'not_configured'])
      .select('id')
      .maybeSingle()

    if (claimError) {
      console.error('Unable to claim email delivery log:', claimError)

      return {
        ok: false,
        status: 'logging_failed',
      }
    }

    if (!claimedLog) {
      const { data: currentLog } = await supabase
        .from('email_delivery_logs')
        .select('status, provider_message_id')
        .eq('id', existingLog.id)
        .maybeSingle()

      if (currentLog?.status === 'sent') {
        return {
          ok: true,
          status: 'already_sent',
          providerMessageId: currentLog.provider_message_id,
        }
      }

      return {
        ok: false,
        status: 'in_progress',
      }
    }

    logId = claimedLog.id
  } else {
    const { data: newLog, error: insertError } = await supabase
      .from('email_delivery_logs')
      .insert({
        report_id: reportId,
        report_number: reportNumber,
        email_type: emailType,
        recipient_email: to,
        status: 'pending',
        attempt_count: 1,
        first_attempted_at: now,
        last_attempted_at: now,
        updated_at: now,
      })
      .select('id')
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        const { data: competingLog } = await supabase
          .from('email_delivery_logs')
          .select('status, provider_message_id')
          .eq('report_id', reportId)
          .eq('email_type', emailType)
          .eq('recipient_email', to)
          .maybeSingle()

        if (competingLog?.status === 'sent') {
          return {
            ok: true,
            status: 'already_sent',
            providerMessageId: competingLog.provider_message_id,
          }
        }

        return {
          ok: false,
          status: 'in_progress',
        }
      }

      console.error('Unable to create email delivery log:', insertError)

      return {
        ok: false,
        status: 'logging_failed',
      }
    }

    logId = newLog.id
  }

  if (!resendKey || !from) {
    if (logId) {
      await supabase
        .from('email_delivery_logs')
        .update({
          status: 'not_configured',
          last_error: 'Email service is not configured',
          updated_at: new Date().toISOString(),
        })
        .eq('id', logId)
    }

    return {
      ok: false,
      status: 'not_configured',
    }
  }

  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    })

    const responseText = await result.text()

    let providerMessageId: string | null = null

    try {
      const parsed = JSON.parse(responseText)
      providerMessageId = parsed?.id || null
    } catch {
      providerMessageId = null
    }

    if (logId) {
      await supabase
        .from('email_delivery_logs')
        .update({
          status: result.ok ? 'sent' : 'failed',
          provider_message_id: providerMessageId,
          provider_response: responseText,
          last_error: result.ok ? null : responseText,
          sent_at: result.ok ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', logId)
    }

    return {
      ok: result.ok,
      status: result.ok ? 'sent' : 'failed',
      providerMessageId,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown email delivery error'

    if (logId) {
      await supabase
        .from('email_delivery_logs')
        .update({
          status: 'failed',
          last_error: message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', logId)
    }

    console.error(`Tracked email ${emailType} failed:`, error)

    return {
      ok: false,
      status: 'failed',
      error: message,
    }
  }
}

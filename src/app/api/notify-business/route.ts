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
    .select('id, report_number, user_id, brand_name, brand_email, brand_whatsapp, order_number, public_at')
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
    subject: `ScamAlert.pk complaint ${report.report_number} requires your response`,
    html: `<p>A customer has filed complaint <strong>${report.report_number}</strong> regarding order <strong>${report.order_number}</strong> associated with ${report.brand_name}.</p><p>This is a notice of an unresolved customer complaint, not a finding of fraud. You may respond without creating an account.</p><p><a href="${responseUrl}">Respond to this complaint</a></p><p>The complaint's 72-hour review window ends at ${new Date(report.public_at).toLocaleString('en-PK')}.</p>`,
  };

  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const status = result.ok ? 'sent' : 'failed';
  await supabase.from('reports').update({ email_notification_status: status }).eq('id', report.id);
  return NextResponse.json({ email: status, whatsapp: report.brand_whatsapp ? 'not_configured' : 'not_provided' });
}

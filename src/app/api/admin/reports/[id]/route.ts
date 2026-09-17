import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/admin'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { id } = await params
  const supabase = createAdminClient()

  const [reportRes, responseRes, evidenceRes, finalRes] = await Promise.all([
    supabase.from('reports').select('*').eq('id', id).single(),
    supabase.from('business_responses').select('*').eq('report_id', id).maybeSingle(),
    supabase.from('report_evidence').select('*').eq('report_id', id),
    supabase
      .from('customer_final_responses')
      .select('*')
      .eq('report_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (reportRes.error) {
    return NextResponse.json({ error: reportRes.error.message }, { status: 500 })
  }

  const evidence = await Promise.all(
    (evidenceRes.data ?? []).map(async (ev) => {
      const signed = await supabase.storage
        .from('report-evidence')
        .createSignedUrl(ev.storage_path, 3600)
      return { ...ev, url: signed.data?.signedUrl ?? null }
    })
  )

  return NextResponse.json({
    report: reportRes.data,
    businessResponse: responseRes.data ?? null,
    evidence,
    customerFinalResponses: finalRes.data ?? [],
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)
  const status = body?.status

  if (status !== 'pending' && status !== 'resolved') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('reports')
    .update({
      status,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { id } = await params
  const supabase = createAdminClient()

  const { error } = await supabase.from('reports').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

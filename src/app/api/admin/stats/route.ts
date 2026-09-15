import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/admin'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const supabase = createAdminClient()

  const [totalRes, pendingRes, resolvedRes, expiredRes, usersRes] = await Promise.all([
    supabase.from('reports').select('id', { count: 'exact', head: true }),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
    supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lte('public_at', new Date().toISOString()),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])

  return NextResponse.json({
    totalReports: totalRes.count ?? 0,
    pendingReports: pendingRes.count ?? 0,
    resolvedReports: resolvedRes.count ?? 0,
    expiredUnresolvedReports: expiredRes.count ?? 0,
    totalUsers: usersRes.count ?? 0,
  })
}

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

  const [{ data: authUsers, error: authError }, { data: profiles, error: profilesError }, { data: reports, error: reportsError }] =
    await Promise.all([
      supabase.auth.admin.listUsers({ perPage: 1000 }),
      supabase.from('profiles').select('id, username, first_name, last_name, city, created_at'),
      supabase.from('reports').select('user_id'),
    ])

  if (authError || profilesError || reportsError) {
    return NextResponse.json(
      { error: authError?.message || profilesError?.message || reportsError?.message },
      { status: 500 }
    )
  }

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))
  const reportCountByUser = new Map<string, number>()
  for (const r of reports ?? []) {
    reportCountByUser.set(r.user_id, (reportCountByUser.get(r.user_id) ?? 0) + 1)
  }

  const users = (authUsers?.users ?? []).map((u) => {
    const profile = profileById.get(u.id)
    const bannedUntil = u.banned_until ?? null
    return {
      id: u.id,
      email: u.email,
      username: profile?.username ?? null,
      firstName: profile?.first_name ?? null,
      lastName: profile?.last_name ?? null,
      city: profile?.city ?? null,
      createdAt: u.created_at,
      reportCount: reportCountByUser.get(u.id) ?? 0,
      isBanned: bannedUntil ? new Date(bannedUntil) > new Date() : false,
    }
  })

  users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json({ users })
}

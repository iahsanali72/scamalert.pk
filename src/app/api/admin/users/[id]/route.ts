import { NextResponse } from 'next/server'
import { requireAdmin } from '@/utils/admin'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

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
  const action = body?.action

  if (action !== 'ban' && action !== 'unban') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  if (id === admin.id && action === 'ban') {
    return NextResponse.json({ error: "You can't ban your own account" }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.updateUserById(id, {
    ban_duration: action === 'ban' ? '876000h' : 'none',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

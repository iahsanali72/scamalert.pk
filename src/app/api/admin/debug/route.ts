import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ signedIn: false, userError: userError?.message ?? null })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    signedIn: true,
    userId: user.id,
    userEmail: user.email,
    profile,
    profileError: profileError?.message ?? null,
    profileErrorCode: profileError?.code ?? null,
  })
}

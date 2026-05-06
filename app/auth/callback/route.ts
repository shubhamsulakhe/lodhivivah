// app/auth/callback/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.exchangeCodeForSession(code)

    // Check if profile exists
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('id').eq('user_id', user.id).single()

      if (!profile) {
        // New user → onboarding
        return NextResponse.redirect(new URL('/onboard', requestUrl.origin))
      }
    }
  }

  // Existing user → dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
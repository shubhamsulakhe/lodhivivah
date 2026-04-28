import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, token } = body

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify the OTP token
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error || !data.session) {
      console.error('OTP verify error:', error)
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please try again.' },
        { status: 400 }
      )
    }

    const userId = data.user?.id

    // Check if user already has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    return NextResponse.json({
      success:       true,
      is_new_user:   !profile,
      access_token:  data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

  } catch (err: any) {
    console.error('Verify OTP route error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
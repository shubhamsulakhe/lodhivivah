import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 })
    }

    // Get OTP from DB
    const { data, error } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('contact', phone)
      .eq('type', 'sms')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'OTP not found. Please request a new one.' }, { status: 400 })
    }

    // Check expiry
    if (new Date() > new Date(data.expires_at)) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
    }

    // Check OTP match
    if (data.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 })
    }

    // Mark as verified
    await supabaseAdmin
      .from('otp_verifications')
      .update({ verified: true })
      .eq('contact', phone)

    // Check if user with this phone exists
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_id, name')
      .eq('phone', phone)
      .single()

    return NextResponse.json({
      success:        true,
      isExistingUser: !!profile,
      userId:         profile?.user_id || null,
    })

  } catch (error: any) {
    console.error('Verify SMS OTP error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
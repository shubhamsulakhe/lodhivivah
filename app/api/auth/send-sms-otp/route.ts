import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Step 1: Check env vars
    const checks = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      fast2smsKey: !!process.env.FAST2SMS_API_KEY,
    }
    console.log('ENV CHECK:', checks)

    if (!checks.supabaseUrl) return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
    if (!checks.serviceRoleKey) return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    if (!checks.fast2smsKey) return NextResponse.json({ error: 'Missing FAST2SMS_API_KEY' }, { status: 500 })

    // Step 2: Parse request
    const { phone } = await req.json()
    console.log('Phone received:', phone)

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    // Step 3: Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    console.log('OTP generated:', otp)

    // Step 4: Store in Supabase
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: dbError } = await supabaseAdmin
      .from('otp_verifications')
      .upsert({ contact: phone, otp, type: 'sms', verified: false, expires_at },
        { onConflict: 'contact' })

    if (dbError) {
      console.error('DB Error:', dbError)
      return NextResponse.json({ error: 'DB error: ' + dbError.message }, { status: 500 })
    }
    console.log('OTP stored in DB')

    // Step 5: Send SMS
    const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: phone,
        flash: 0,
        message: 'Your Wedly OTP is ##OTP##. Valid for 10 minutes. Do not share. - Team Wedly',
      }),
    })
    const smsData = await smsRes.json()
    console.log('Fast2SMS response:', smsData)

    if (!smsData.return) {
      return NextResponse.json({ error: smsData.message || 'SMS failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('ROUTE ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
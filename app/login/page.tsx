'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  Mail, Phone, Eye, EyeOff, ArrowRight, ArrowLeft,
  Loader2, CheckCircle, RefreshCw, Lock, Sparkles, KeyRound
} from 'lucide-react'
import Logo from '@/components/Logo'
import toast from 'react-hot-toast'

type Step = 'email' | 'otp' | 'mobile' | 'set-password' | 'reset-password'

export default function LoginPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showNewPass, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [showPwdLogin, setShowPwd] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isReset, setIsReset] = useState(false)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  function handleOtpChange(i: number, val: string) {
    if (val.length > 1) val = val.slice(-1)
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = ['', '', '', '', '', '']; digits.split('').forEach((d, i) => { next[i] = d })
    setOtp(next)
    otpRefs.current[Math.min(digits.length, 5)]?.focus()
  }

  function validateMobile(num: string): boolean {
    return /^[6-9]\d{9}$/.test(num)
  }

  async function handleSendOTP(forReset = false) {
    if (!email || !email.includes('@')) { toast.error('Please enter a valid email'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: !forReset }
      })
      if (error) throw error
      toast.success('OTP sent to your email!')
      setStep('otp')
      setOtp(['', '', '', '', '', ''])
      setCountdown(120)
      setIsReset(forReset)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (e: any) {
      toast.error(e.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  async function handleVerifyOTP() {
    const token = otp.join('')
    if (token.length !== 6) { toast.error('Enter complete 6-digit OTP'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email, token, type: 'email',
      })
      if (error) throw error

      if (isReset) {
        setStep('reset-password')
        toast.success('OTP verified! Set your new password.')
        return
      }

      const { data: profile } = await supabase
        .from('profiles').select('id, phone').eq('user_id', data.user?.id).single()

      if (!profile) {
        // New user — collect mobile first
        setIsNewUser(true)
        setStep('mobile')
        toast.success('Email verified! Enter your mobile number.')
      } else {
        // Existing user
        if (profile.phone) {
          toast.success('Welcome back!')
          router.push('/dashboard')
          router.refresh()
        } else {
          // Existing user but no mobile — collect it
          setStep('mobile')
          toast.success('Please add your mobile number.')
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'Invalid OTP. Please try again.')
    } finally { setLoading(false) }
  }

  async function handleMobileSubmit() {
    if (!validateMobile(mobile)) {
      toast.error('Please enter a valid 10-digit Indian mobile number')
      return
    }
    if (isNewUser) {
      setStep('set-password')
    } else {
      // Existing user updating mobile
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('profiles').update({
            phone: mobile, whatsapp: mobile
          }).eq('user_id', user.id)
        }
        toast.success('Mobile number saved!')
        router.push('/dashboard')
        router.refresh()
      } catch (e: any) {
        toast.error('Failed to save mobile number')
      } finally { setLoading(false) }
    }
  }

  async function handleSetPassword() {
    if (!newPass || newPass.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (newPass !== confirmPass) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) throw error
      toast.success('Account created! Complete your profile.')
      router.push(`/register?mobile=${mobile}`)
    } catch (e: any) {
      toast.error(e.message || 'Failed to set password')
    } finally { setLoading(false) }
  }

  async function handleResetPassword() {
    if (!newPass || newPass.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (newPass !== confirmPass) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) throw error
      toast.success('Password reset successful!')
      router.push('/dashboard')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || 'Failed to reset password')
    } finally { setLoading(false) }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { toast.error('Enter email and password'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back!')
      router.push('/dashboard'); router.refresh()
    } catch (e: any) {
      toast.error('Invalid email or password')
    } finally { setLoading(false) }
  }

  const otpFilled = otp.join('').length === 6
  const passStrength = newPass.length === 0 ? 0 : newPass.length < 4 ? 1 : newPass.length < 6 ? 2 : newPass.length < 10 ? 3 : 4
  const passColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-500']
  const passLabels = ['', 'Too weak', 'Weak', 'Good', 'Strong']

  // Step indicator config
  const steps = isNewUser
    ? [
      { id: 'email', label: 'Email' },
      { id: 'otp', label: 'Verify' },
      { id: 'mobile', label: 'Mobile' },
      { id: 'set-password', label: 'Secure' },
    ]
    : [
      { id: 'email', label: 'Email' },
      { id: 'otp', label: 'Verify' },
    ]

  const currentIdx = steps.findIndex(s => s.id === step)

  return (
    <div className="min-h-screen flex">

      {/* Left decorative panel */}
      <div className="hidden lg:flex w-5/12 relative overflow-hidden flex-col items-center justify-center p-16"
        style={{ background: 'linear-gradient(145deg, #431407 0%, #7c2d12 25%, #c2410c 60%, #f97316 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1'%3E%3Cpath d='M30 5 l4 8 l9 1 l-6.5 6.5 l1.5 9 l-8-4.5L22 30l1.5-9L17 15l9-1z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        <div className="relative z-10 text-center">
          <Logo variant="light" size="lg" className="justify-center mb-10" />
          <div className="text-7xl mb-6">💑</div>
          <h2 className="text-white font-black text-3xl leading-tight mb-4">
            Find Your<br />Perfect Match
          </h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-xs">
            Join thousands of Lodhi Samaj members finding their life partners.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {[
              { val: '2000+', lbl: 'Profiles' },
              { val: '500+', lbl: 'Marriages' },
              { val: '10+', lbl: 'States' },
              { val: 'Free', lbl: 'To Join' },
            ].map(({ val, lbl }) => (
              <div key={lbl}
                className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-black text-yellow-300">{val}</div>
                <div className="text-white/70 text-sm">{lbl}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-left">
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}
            </div>
            <p className="text-white/90 text-sm italic leading-relaxed">
              "Found my life partner through this platform. Truly blessed!"
            </p>
            <p className="text-yellow-300 text-sm font-bold mt-2">— Priya & Rahul, Balaghat</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-7/12 flex flex-col items-center justify-center
                      p-6 sm:p-12 bg-cream min-h-screen overflow-y-auto">
        <div className="w-full max-w-md py-8">

          <Link href="/"
            className="inline-flex items-center gap-2 text-stone-400 hover:text-saffron-600
                       text-sm mb-8 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>

          <div className="lg:hidden mb-8 flex justify-center"><Logo size="md" /></div>

          {/* Progress steps */}
          {step !== 'reset-password' && (
            <div className="flex items-center gap-2 mb-8">
              {steps.map(({ id, label }, i) => {
                const isDone = currentIdx > i
                const isActive = step === id
                return (
                  <div key={id} className="flex items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                     text-xs font-bold transition-all duration-300 flex-shrink-0
                      ${isDone ? 'bg-emerald-500 text-white'
                        : isActive ? 'bg-saffron-500 text-white shadow-glow'
                          : 'bg-stone-200 text-stone-400'}`}>
                      {isDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block
                      ${isActive ? 'text-saffron-600' : isDone ? 'text-emerald-600' : 'text-stone-400'}`}>
                      {label}
                    </span>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded-full transition-all duration-500
                        ${isDone ? 'bg-emerald-300' : 'bg-stone-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── STEP: Email ──────────────────────────────────── */}
          {step === 'email' && (
            <div>
              <h1 className="text-3xl font-black text-stone-900 mb-1">Welcome 👋</h1>
              <p className="text-stone-400 mb-8">Login or create a new account</p>

              <div className="mb-5">
                <label className="label">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300
                                   group-focus-within:text-saffron-500 transition-colors"/>
                  <input type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                    placeholder="your@email.com"
                    className="input pl-12" autoFocus autoComplete="email" />
                </div>
                <p className="text-xs text-stone-400 mt-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
                  A 6-digit OTP will be sent to verify your email
                </p>
              </div>

              <button onClick={() => handleSendOTP(false)}
                disabled={loading || !email}
                className="btn btn-primary btn-lg w-full justify-center group mb-6
                           disabled:opacity-40 disabled:cursor-not-allowed">
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><Mail className="w-4 h-4" /> Send OTP
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                }
              </button>

              {/* Divider */}
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center gap-4">
                  <button onClick={() => setShowPwd(p => !p)}
                    className="px-3 bg-cream text-xs text-stone-400 hover:text-saffron-600
                               transition-colors flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    {showPwdLogin ? 'Use OTP' : 'Login with password'}
                  </button>
                  <button
                    onClick={() => { setIsReset(true); handleSendOTP(true) }}
                    className="px-3 bg-cream text-xs text-stone-400 hover:text-saffron-600
                               transition-colors flex items-center gap-1.5">
                    <KeyRound className="w-3 h-3" />
                    Forgot password?
                  </button>
                </div>
              </div>

              {showPwdLogin && (
                <form onSubmit={handlePasswordLogin}
                  className="space-y-4 bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Password Login</p>
                  <div>
                    <label className="label text-xs">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com" className="input text-sm" />
                  </div>
                  <div>
                    <label className="label text-xs">Password</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Your password" className="input pr-11 text-sm" />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2
                                   text-stone-400 hover:text-stone-600 transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="btn btn-outline btn-sm w-full justify-center">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login →'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── STEP: OTP ────────────────────────────────────── */}
          {step === 'otp' && (
            <div>
              <button onClick={() => setStep('email')}
                className="flex items-center gap-2 text-stone-400 hover:text-saffron-600
                           text-sm mb-7 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back
              </button>
              <div className="w-16 h-16 bg-gradient-to-br from-saffron-100 to-saffron-200
                              rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-soft">
                📧
              </div>
              <h2 className="text-3xl font-black text-stone-900 mb-1">Check your email</h2>
              <p className="text-stone-400 mb-1">We sent a 6-digit code to</p>
              <div className="flex items-center gap-2 mb-8">
                <p className="font-bold text-stone-800">{email}</p>
                <button onClick={() => setStep('email')}
                  className="text-xs text-saffron-500 hover:underline">Change</button>
              </div>

              <div className="flex gap-2 justify-center mb-7" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i}
                    ref={el => { otpRefs.current[i] = el }}
                    type="tel" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    style={{ width: '48px', height: '56px' }}
                    className={`text-center text-2xl font-black rounded-2xl border-2
        outline-none transition-all duration-200 flex-shrink-0
        ${digit
                        ? 'border-saffron-500 bg-saffron-50 text-saffron-700 scale-105'
                        : 'border-stone-200 hover:border-stone-300 focus:border-saffron-400 bg-white'
                      }`}
                  />
                ))}
              </div>

              <button onClick={handleVerifyOTP} disabled={loading || !otpFilled}
                className={`btn btn-lg w-full justify-center mb-5 transition-all duration-300
                  ${otpFilled ? 'btn-primary'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed rounded-2xl font-bold py-4'}`}>
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><CheckCircle className="w-5 h-5" /> Verify & Continue</>
                }
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-stone-400 text-sm">
                    Resend in <span className="font-bold text-saffron-600 tabular-nums">{countdown}s</span>
                  </p>
                ) : (
                  <button onClick={() => handleSendOTP(isReset)} disabled={loading}
                    className="text-saffron-600 text-sm font-semibold hover:text-saffron-700
                               flex items-center gap-1.5 mx-auto transition-colors group">
                    <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                    Resend OTP
                  </button>
                )}
                <p className="text-stone-400 text-xs mt-3">Check spam/junk folder if not received</p>
              </div>
            </div>
          )}

          {/* ── STEP: Mobile ─────────────────────────────────── */}
          {step === 'mobile' && (
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200
                              rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-soft">
                📱
              </div>
              <h2 className="text-3xl font-black text-stone-900 mb-1">
                {isNewUser ? 'Your Mobile Number' : 'Add Mobile Number'}
              </h2>
              <p className="text-stone-400 mb-8">
                {isNewUser
                  ? 'This will be your contact number visible to matches'
                  : 'Add your mobile number to complete your profile'}
              </p>

              <div className="mb-6">
                <label className="label">Mobile Number *</label>
                <div className="flex gap-2">
                  <div className="input w-16 flex-shrink-0 flex items-center justify-center
                                  bg-stone-50 font-bold text-stone-600 text-sm border border-stone-200 rounded-xl">
                    +91
                  </div>
                  <div className="relative flex-1 group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300
                                     group-focus-within:text-saffron-500 transition-colors"/>
                    <input type="tel" value={mobile} maxLength={10}
                      onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={e => e.key === 'Enter' && handleMobileSubmit()}
                      placeholder="10-digit mobile number"
                      className="input pl-12 w-full" autoFocus />
                  </div>
                </div>

                {/* Validation indicator */}
                {mobile.length > 0 && (
                  <div className={`flex items-center gap-2 mt-2 text-xs font-medium
                    ${validateMobile(mobile) ? 'text-emerald-600' : 'text-red-500'}`}>
                    {validateMobile(mobile)
                      ? <><CheckCircle className="w-3.5 h-3.5" /> Valid mobile number</>
                      : <><span className="w-3.5 h-3.5 rounded-full border-2 border-red-400 inline-block" />&nbsp;
                        Enter a valid 10-digit number starting with 6-9</>
                    }
                  </div>
                )}

                <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <p className="text-xs text-stone-500 flex items-start gap-2">
                    <span className="text-saffron-500 flex-shrink-0">ℹ️</span>
                    This number will be shown to your matches on Wedly.
                    WhatsApp verification coming soon!
                  </p>
                </div>
              </div>

              <button onClick={handleMobileSubmit}
                disabled={loading || !validateMobile(mobile)}
                className="btn btn-primary btn-lg w-full justify-center
                           disabled:opacity-40 disabled:cursor-not-allowed">
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><ArrowRight className="w-5 h-5" /> Continue</>
                }
              </button>
            </div>
          )}

          {/* ── STEP: Set Password (New User) ─────────────────── */}
          {step === 'set-password' && (
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200
                              rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-soft">
                🎉
              </div>
              <h2 className="text-3xl font-black text-stone-900 mb-1">Almost there!</h2>
              <p className="text-stone-400 mb-8">
                Set a password to secure your Wedly account.
              </p>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="label">Create Password</label>
                  <div className="relative">
                    <input type={showNewPass ? 'text' : 'password'} value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="input pr-11" autoFocus />
                    <button type="button" onClick={() => setShowNew(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2
                                 text-stone-400 hover:text-stone-600 transition-colors">
                      {showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {newPass.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1.5 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500
                              ${passStrength >= i ? passColors[passStrength] : 'bg-stone-200'}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-medium
                        ${passStrength <= 1 ? 'text-red-500' : passStrength <= 2 ? 'text-yellow-600' : passStrength <= 3 ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {passLabels[passStrength]} password
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input type="password" value={confirmPass}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`input ${confirmPass && confirmPass !== newPass ? 'border-red-300' :
                        confirmPass && confirmPass === newPass ? 'border-emerald-400' : ''
                      }`} />
                  {confirmPass && (
                    <p className={`text-xs mt-1 font-medium
                      ${confirmPass === newPass ? 'text-emerald-600' : 'text-red-500'}`}>
                      {confirmPass === newPass ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-stone-50 rounded-2xl p-4 mb-5 border border-stone-100">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Account Summary
                </p>
                <div className="space-y-1.5">
                  <p className="text-sm text-stone-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Email: <span className="font-semibold">{email}</span>
                  </p>
                  <p className="text-sm text-stone-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Mobile: <span className="font-semibold">+91 {mobile}</span>
                  </p>
                </div>
              </div>

              <button onClick={handleSetPassword}
                disabled={loading || !newPass || newPass !== confirmPass || newPass.length < 6}
                className="btn btn-primary btn-lg w-full justify-center
                           disabled:opacity-40 disabled:cursor-not-allowed">
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><CheckCircle className="w-5 h-5" /> Create Account & Continue</>
                }
              </button>
            </div>
          )}

          {/* ── STEP: Reset Password ──────────────────────────── */}
          {step === 'reset-password' && (
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200
                              rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-soft">
                🔑
              </div>
              <h2 className="text-3xl font-black text-stone-900 mb-1">Reset Password</h2>
              <p className="text-stone-400 mb-8">
                Set your new password for <span className="font-semibold text-stone-700">{email}</span>
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input type={showNewPass ? 'text' : 'password'} value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="input pr-11" autoFocus />
                    <button type="button" onClick={() => setShowNew(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2
                                 text-stone-400 hover:text-stone-600 transition-colors">
                      {showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {newPass.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1.5 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all
                            ${passStrength >= i ? passColors[passStrength] : 'bg-stone-200'}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-medium
                        ${passStrength <= 1 ? 'text-red-500' : passStrength <= 2 ? 'text-yellow-600' : passStrength <= 3 ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {passLabels[passStrength]} password
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input type="password" value={confirmPass}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`input ${confirmPass && confirmPass !== newPass ? 'border-red-300' :
                        confirmPass && confirmPass === newPass ? 'border-emerald-400' : ''
                      }`} />
                  {confirmPass && (
                    <p className={`text-xs mt-1 font-medium
                      ${confirmPass === newPass ? 'text-emerald-600' : 'text-red-500'}`}>
                      {confirmPass === newPass ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>

              <button onClick={handleResetPassword}
                disabled={loading || !newPass || newPass !== confirmPass || newPass.length < 6}
                className="btn btn-primary btn-lg w-full justify-center
                           disabled:opacity-40 disabled:cursor-not-allowed">
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><KeyRound className="w-5 h-5" /> Reset Password</>
                }
              </button>
            </div>
          )}

          {/* Terms */}
          <p className="text-center text-xs text-stone-400 mt-8">
            By continuing you agree to our{' '}
            <Link href="/terms" className="text-saffron-600 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-saffron-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

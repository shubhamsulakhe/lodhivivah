'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import {
  Mail, Eye, EyeOff, ArrowRight, ArrowLeft,
  Loader2, CheckCircle, RefreshCw, Lock, KeyRound
} from 'lucide-react'
import toast from 'react-hot-toast'

type Step = 'email' | 'otp' | 'reset-password'

const TESTIMONIALS = [
  { name: 'Priya & Rahul', location: 'Jabalpur, MP', text: '"Found my life partner in 3 weeks on Wedly!"' },
  { name: 'Sunita & Vikram', location: 'Bhopal, MP', text: '"Every profile was genuine and verified. Loved it!"' },
  { name: 'Anita & Manish', location: 'Balaghat, MP', text: '"Chat feature made connecting so natural and safe."' },
]

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPwdLogin, setShowPwd] = useState(false)
  const [password, setPassword] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isReset, setIsReset] = useState(false)
  const [tIdx, setTIdx] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  useEffect(() => {
    const t = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 4000)
    return () => clearInterval(t)
  }, [])

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

  async function handleSendOTP(forReset = false) {
    if (!email || !email.includes('@')) { toast.error('Enter a valid email'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email, options: { shouldCreateUser: true }
      })
      if (error) throw error
      toast.success('OTP sent to your email! 📧')
      setStep('otp'); setOtp(['', '', '', '', '', ''])
      setCountdown(120); setIsReset(forReset)
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
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
      if (error) throw error

      if (isReset) { setStep('reset-password'); return }

      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles').select('id, onboarding_tier, completeness')
        .eq('user_id', data.user?.id).single()

      if (!profile) {
        // NEW USER → go to onboarding
        toast.success('Welcome to Wedly! 🎉 Let\'s set up your profile.')
        router.push('/onboard')
      } else {
        // EXISTING USER → go to dashboard
        toast.success('Welcome back! 🎉')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (e: any) {
      toast.error('Invalid OTP. Please try again.')
    } finally { setLoading(false) }
  }

  async function handleResetPassword() {
    if (!newPass || newPass.length < 6) { toast.error('Minimum 6 characters'); return }
    if (newPass !== confirmPass) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) throw error
      toast.success('Password reset! ✅')
      router.push('/dashboard'); router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally { setLoading(false) }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { toast.error('Enter email and password'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back! 🎉')
      router.push('/dashboard'); router.refresh()
    } catch (e: any) {
      toast.error('Invalid email or password')
    } finally { setLoading(false) }
  }

  // Google OAuth
  async function handleGoogleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) { toast.error(error.message); setLoading(false) }
  }

  const otpFilled = otp.join('').length === 6
  const passStrength = newPass.length === 0 ? 0 : newPass.length < 4 ? 1 : newPass.length < 6 ? 2 : newPass.length < 10 ? 3 : 4
  const passColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-500']
  const passLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-5/12 flex-col items-center justify-center p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#431407 0%,#7c2d12 30%,#c2410c 65%,#f97316 100%)' }}>
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.6) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute bottom-0 right-0 text-[260px] font-black text-white/5 select-none leading-none"
          style={{ fontFamily: 'Georgia,serif' }}>W</div>
        <div className="relative z-10 text-center max-w-xs">
          <Logo variant="light" size="lg" className="justify-center mb-10" />
          <div className="text-5xl mb-5">💑</div>
          <h2 className="text-white font-black text-2xl leading-tight mb-3"
            style={{ fontFamily: 'Georgia,serif' }}>
            Find Your<br />
            <em style={{ fontStyle: 'italic', fontWeight: 300, color: '#fdba74' }}>Forever.</em>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10">
            Verified profiles. Live chat. Voice calls. Free to join.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-10">
            {[{ v: '55+', l: 'Profiles' }, { v: 'Free', l: 'Register' }, { v: 'Live', l: 'Chat' }].map(s => (
              <div key={s.l} className="bg-white/10 rounded-2xl p-3 border border-white/15">
                <div className="text-lg font-black text-yellow-300"
                  style={{ fontFamily: 'Georgia,serif' }}>{s.v}</div>
                <div className="text-white/50 text-[10px]">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 text-left">
            <div className="flex mb-2">{[1, 2, 3, 4, 5].map(i => <span key={i} className="text-yellow-400 text-xs">★</span>)}</div>
            <p className="text-white/80 text-xs italic leading-relaxed mb-2">
              {TESTIMONIALS[tIdx].text}
            </p>
            <p className="text-yellow-300 text-xs font-semibold">
              — {TESTIMONIALS[tIdx].name}, {TESTIMONIALS[tIdx].location}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-7/12 flex flex-col items-center justify-center
                      p-6 sm:p-10 bg-[#fffaf6] min-h-screen overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="md" />
          </div>


          {/* EMAIL STEP */}
          {step === 'email' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#431407] mb-1"
                style={{ fontFamily: 'Georgia,serif' }}>Welcome 👋</h1>
              <p className="text-stone-400 text-sm mb-8">
                New or existing — just enter your email to continue
              </p>

              {/* Google login */}
              <button onClick={handleGoogleLogin} disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border
                           border-stone-300 text-stone-700 font-semibold text-sm py-3.5
                           rounded-2xl hover:bg-stone-50 transition-all mb-4 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs text-stone-400 font-medium">or use email</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              <div className="mb-5">
                <label className="label">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5
                                   text-stone-300 group-focus-within:text-orange-500 transition-colors"/>
                  <input type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                    placeholder="your@email.com"
                    className="input pl-12" autoFocus autoComplete="email" />
                </div>
                <p className="text-xs text-stone-400 mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  6-digit OTP will be sent to your email
                </p>
              </div>

              <button onClick={() => handleSendOTP(false)}
                disabled={loading || !email}
                className="btn btn-primary btn-lg w-full justify-center mb-5 disabled:opacity-40">
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><Mail className="w-4 h-4" /> Send OTP <ArrowRight className="w-4 h-4" /></>}
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center gap-3">
                  <button onClick={() => setShowPwd(p => !p)}
                    className="px-3 bg-[#fffaf6] text-xs text-stone-400 hover:text-orange-600
                               transition-colors flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    {showPwdLogin ? 'Use OTP instead' : 'Login with password'}
                  </button>
                  <button onClick={() => handleSendOTP(true)}
                    className="px-3 bg-[#fffaf6] text-xs text-stone-400 hover:text-orange-600
                               transition-colors flex items-center gap-1.5">
                    <KeyRound className="w-3 h-3" /> Forgot password?
                  </button>
                </div>
              </div>

              {showPwdLogin && (
                <form onSubmit={handlePasswordLogin}
                  className="space-y-3 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Password Login</p>
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
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                        
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="btn btn-primary btn-sm w-full justify-center">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login →'}
                  </button>
                </form>
              )}

              <p className="text-center text-sm text-stone-400 mt-5">
                New to Wedly?{' '}
                <Link href="/onboard" className="text-orange-600 font-semibold hover:underline">
                  Create free profile →
                </Link>
              </p>
            </div>
          )}

          {/* OTP STEP */}
          {step === 'otp' && (
            <div>
              <button onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']) }}
                className="flex items-center gap-2 text-stone-400 hover:text-orange-600
                           text-sm mb-7 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
              </button>
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl mb-5">📧</div>
              <h2 className="text-2xl font-black text-[#431407] mb-1"
                style={{ fontFamily: 'Georgia,serif' }}>Check your email</h2>
              <div className="flex items-center gap-2 mb-8">
                <p className="text-stone-400 text-sm">Code sent to <strong className="text-stone-800">{email}</strong></p>
                <button onClick={() => setStep('email')} className="text-xs text-orange-500 hover:underline">Change</button>
              </div>

              <div className="flex gap-2.5 justify-center mb-7" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el }}
                    type="tel" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className={`w-11 h-12 text-center text-xl font-black rounded-xl border-2
                                outline-none transition-all
                      ${digit
                        ? 'border-orange-500 bg-orange-50 text-orange-700 scale-105'
                        : 'border-stone-200 hover:border-stone-300 focus:border-orange-400 bg-white'}`}
                  />
                ))}
              </div>

              <button onClick={handleVerifyOTP} disabled={loading || !otpFilled}
                className={`btn btn-lg w-full justify-center mb-5
                  ${otpFilled ? 'btn-primary' : 'bg-stone-100 text-stone-400 cursor-not-allowed rounded-2xl font-bold py-4'}`}>
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><CheckCircle className="w-5 h-5" /> Verify & Continue</>}
              </button>

              <div className="text-center">
                {countdown > 0
                  ? <p className="text-stone-400 text-sm">Resend in <span className="font-bold text-orange-600">{countdown}s</span></p>
                  : <button onClick={() => handleSendOTP(isReset)} disabled={loading}
                    className="text-orange-600 text-sm font-semibold hover:text-orange-700 flex items-center gap-1.5 mx-auto">
                    <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                  </button>
                }
                <p className="text-stone-400 text-xs mt-1.5">Check spam folder if not received</p>
              </div>
            </div>
          )}

          {/* RESET PASSWORD */}
          {step === 'reset-password' && (
            <div>
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl mb-5">🔑</div>
              <h2 className="text-2xl font-black text-[#431407] mb-1"
                style={{ fontFamily: 'Georgia,serif' }}>Reset Password</h2>
              <p className="text-stone-400 text-sm mb-8">For <strong>{email}</strong></p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input type={showNew ? 'text' : 'password'} value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      placeholder="Minimum 6 characters" className="input pr-11" autoFocus />
                    <button type="button" onClick={() => setShowNew(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  <label className="label">Confirm Password</label>
                  <input type="password" value={confirmPass}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className={`input ${confirmPass && confirmPass !== newPass ? 'border-red-300' : confirmPass && confirmPass === newPass ? 'border-emerald-400' : ''}`} />
                </div>
              </div>
              <button onClick={handleResetPassword}
                disabled={loading || !newPass || newPass !== confirmPass || newPass.length < 6}
                className="btn btn-primary btn-lg w-full justify-center disabled:opacity-40">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><KeyRound className="w-5 h-5" /> Reset Password</>}
              </button>
            </div>
          )}

          <p className="text-center text-xs text-stone-400 mt-8">
            By continuing you agree to our{' '}
            <Link href="/terms" className="text-orange-600 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
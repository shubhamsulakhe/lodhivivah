'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import Logo from '@/components/Logo'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? 'Email या Password गलत है।' : error.message)
      return
    }
    toast.success('स्वागत है! 🎉')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col items-center justify-center p-16"
        style={{ background: 'linear-gradient(135deg, #431407 0%, #9a3412 40%, #f97316 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M30 0l8.66 15H21.34L30 0z'/%3E%3C/g%3E%3C/svg%3E")`
        }}/>
        <div className="relative z-10 text-center">
          <Logo variant="light" size="lg" className="justify-center mb-10"/>
          <div className="text-6xl mb-6">💑</div>
          <h2 className="text-white font-black text-3xl leading-tight mb-4">
            स्वागत है!<br/>Welcome Back
          </h2>
          <p className="text-white/75 text-lg leading-relaxed text-center max-w-md mx-auto">
            Login करें और अपने जीवनसाथी की तलाश जारी रखें।
          </p>
          {/* Testimonial */}
          <div className="mt-12 glass rounded-2xl p-5 text-left">
            <p className="text-white/90 text-sm italic leading-relaxed">
              "इस platform से मुझे मेरा जीवनसाथी मिला। 
              बहुत-बहुत धन्यवाद LodhiVivah!"
            </p>
            <p className="text-gold-300 text-sm font-bold mt-3">— Priya & Rahul, Balaghat</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-cream">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-saffron-500 text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4"/> Home
          </Link>

          <div className="lg:hidden mb-8">
            <Logo size="md"/>
          </div>

          <h1 className="text-3xl font-black text-stone-900 mb-1">Login करें</h1>
          <p className="text-stone-500 mb-8">अपने account में sign in करें</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" className="input"/>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link href="/forgot-password" className="text-xs text-saffron-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password" className="input pr-11"/>
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPass ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn btn-primary btn-md w-full justify-center mt-2">
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin"/>
                : <><span>Login</span><ArrowRight className="w-4 h-4"/></>
              }
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"/>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-cream text-stone-400 text-xs">or</span>
            </div>
          </div>

          <p className="text-center text-stone-600 text-sm">
            नया account?{' '}
            <Link href="/register" className="text-saffron-600 font-bold hover:underline">
              Register करें — Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

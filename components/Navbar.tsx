'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Menu, X, Bell, User, LogOut, Crown, ChevronDown, Search, LayoutDashboard, Settings } from 'lucide-react'
import Logo from './Logo'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/',         label: 'Home' },
  { href: '/profiles', label: 'Find Match' },
  { href: '/premium',  label: '✦ Premium' },
]

export default function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const [user, setUser]         = useState<any>(null)
  const [profile, setProfile]   = useState<any>(null)
  const [open, setOpen]         = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isHome = pathname === '/'

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchProfile(user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setUser(s?.user ?? null)
      if (s?.user) fetchProfile(s.user.id)
      else setProfile(null)
    })
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', onScroll) }
  }, [])

  async function fetchProfile(uid: string) {
    const { data } = await supabase.from('profiles').select('id,name,photo_url,plan,is_premium').eq('user_id', uid).single()
    setProfile(data)
  }

  async function logout() {
    await supabase.auth.signOut()
    toast.success('Logged out!')
    router.push('/')
    router.refresh()
  }

  const transparent = isHome && !scrolled
  const navBg = transparent ? '' : 'bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-soft'

  return (
    <nav className={cn('fixed inset-x-0 top-0 z-50 transition-all duration-300', navBg)}>
      <div className="container h-18 flex items-center justify-between py-3">

        {/* Logo */}
        <Logo variant={transparent ? 'light' : 'dark'} size="md" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                pathname === href
                  ? transparent ? 'bg-white/20 text-white' : 'bg-saffron-50 text-saffron-600'
                  : transparent ? 'text-white/85 hover:text-white hover:bg-white/15'
                                : 'text-stone-600 hover:text-saffron-600 hover:bg-saffron-50'
              )}>
              {label}
            </Link>
          ))}
        </div>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdown(d => !d)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-200',
                  transparent ? 'text-white hover:bg-white/15' : 'hover:bg-stone-50 border border-stone-200'
                )}
              >
                {profile?.photo_url
                  ? <img src={profile.photo_url} alt="" className="w-8 h-8 rounded-xl object-cover"/>
                  : <div className="w-8 h-8 bg-saffron-100 rounded-xl flex items-center justify-center">
                      <User className="w-4 h-4 text-saffron-600"/>
                    </div>
                }
                <span className={cn('text-sm font-semibold', transparent ? 'text-white' : 'text-stone-700')}>
                  {profile?.name?.split(' ')[0] || 'Profile'}
                </span>
                {profile?.is_premium && <Crown className="w-3.5 h-3.5 text-gold-500 fill-gold-400"/>}
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', dropdown && 'rotate-180',
                  transparent ? 'text-white/70' : 'text-stone-400')}/>
              </button>
              {dropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50"
                     onClick={() => setDropdown(false)}>
                  {[
                    { href: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard' },
                    { href: '/profile/edit', icon: Settings,        label: 'Edit Profile' },
                    { href: '/premium',           icon: Crown,           label: 'Upgrade Plan', gold: true },
                  ].map(({ href, icon: Icon, label, gold }) => (
                    <Link key={href} href={href}
                      className={cn('flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors',
                        gold ? 'text-gold-600' : 'text-stone-700')}>
                      <Icon className="w-4 h-4"/>
                      {label}
                    </Link>
                  ))}
                  <hr className="my-1.5 border-stone-100"/>
                  <button onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4"/> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login"
                className={cn('text-sm font-semibold px-4 py-2 rounded-xl transition-all',
                  transparent ? 'text-white hover:bg-white/15' : 'text-stone-600 hover:bg-stone-50')}>
                Login
              </Link>
              <Link href="/login" className="btn btn-white btn-sm">
                Register Free ✦
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(o => !o)}
          className={cn('md:hidden p-2 rounded-xl', transparent ? 'text-white' : 'text-stone-700')}>
          {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 shadow-xl">
          <div className="container py-4 space-y-1">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={cn('flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                  pathname === href ? 'bg-saffron-50 text-saffron-600' : 'text-stone-700 hover:bg-stone-50')}>
                {label}
              </Link>
            ))}
            <div className="pt-3 border-t border-stone-100">
              {user ? (
                <>
                  <Link href="/profile/edit" onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 rounded-xl">
                    <LayoutDashboard className="w-4 h-4"/> Dashboard
                  </Link>
                  <button onClick={() => { logout(); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl">
                    <LogOut className="w-4 h-4"/> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-3 px-2">
                  <Link href="/login" onClick={() => setOpen(false)}
                    className="flex-1 btn btn-outline btn-sm">Login</Link>
                  <Link href="/register" onClick={() => setOpen(false)}
                    className="flex-1 btn btn-primary btn-sm">Register Free</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

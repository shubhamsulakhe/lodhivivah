'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Logo from './Logo'
import NotificationBell from './NotificationBell'
import { Menu, X, Crown, LogOut, User, Settings, MessageCircle, Heart } from 'lucide-react'

export default function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const [user, setUser]         = useState<any>(null)
  const [profile, setProfile]   = useState<any>(null)
  const [dropdown, setDropdown] = useState(false)
  const [mobileOpen, setMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('profiles').select('name,photo_url,plan,is_premium,id')
          .eq('user_id', user.id).maybeSingle()
          .then(({ data }) => setProfile(data))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', handleScroll) }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setDropdown(false)
    router.push('/')
  }

  function isActive(href: string) {
    return pathname === href
  }

  const NAV_LINKS = [
    { href:'/',          label:'Home'        },
    { href:'/profiles',  label:'Find Match'  },
    { href:'/premium',   label:'Premium ✦'   },
  ]

  if (user) NAV_LINKS.splice(2, 0, { href:'/chat', label:'Messages' })

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-orange-100'
          : 'bg-[#fffaf6]/90 backdrop-blur-md border-b border-orange-100/50'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Logo size="md"/>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${isActive(l.href)
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell/>

                {/* Mobile chat icon */}
                <Link href="/chat"
                  className="md:hidden w-9 h-9 rounded-full flex items-center justify-center
                             hover:bg-stone-100 text-stone-500 transition-colors relative">
                  <MessageCircle className="w-5 h-5"/>
                </Link>

                {/* User dropdown */}
                <div className="relative">
                  <button onClick={() => setDropdown(d => !d)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl
                               hover:bg-stone-100 transition-colors">
                    {profile?.photo_url ? (
                      <img src={profile.photo_url}
                        className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
                        alt=""/>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-200 to-orange-100
                                      flex items-center justify-center text-sm font-bold text-orange-700">
                        {profile?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-stone-800 max-w-[80px] truncate">
                          {profile?.name?.split(' ')[0] || 'Profile'}
                        </span>
                        {profile?.is_premium && (
                          <Crown className="w-3 h-3 text-yellow-500 fill-yellow-400"/>
                        )}
                      </div>
                    </div>
                  </button>

                  {dropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdown(false)}/>
                      <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl border
                                      border-stone-200 shadow-xl z-20 py-1.5 overflow-hidden">
                        <div className="px-4 py-3 border-b border-stone-100">
                          <p className="text-sm font-semibold text-stone-800 truncate">{profile?.name}</p>
                          <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                            {profile?.is_premium
                              ? <><Crown className="w-3 h-3 text-yellow-500 fill-yellow-400"/> {profile?.plan?.toUpperCase()}</>
                              : 'Free Account'}
                          </p>
                        </div>
                        {[
                          { href:'/dashboard',    icon:Heart,    label:'My Dashboard'   },
                          { href:'/profile/edit', icon:Settings, label:'Edit Profile'   },
                          { href:'/chat',         icon:MessageCircle, label:'Messages'  },
                          { href:'/premium',      icon:Crown,    label:'Upgrade Plan'   },
                        ].map(item => (
                          <Link key={item.href} href={item.href}
                            onClick={() => setDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600
                                       hover:bg-stone-50 transition-colors">
                            <item.icon className="w-4 h-4 text-stone-400"/>
                            {item.label}
                          </Link>
                        ))}
                        <div className="h-px bg-stone-100 mx-3 my-1"/>
                        <button onClick={signOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                     text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4"/>
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="hidden sm:block text-sm font-medium text-stone-500
                             hover:text-stone-800 px-4 py-2 transition-colors">
                  Login
                </Link>
                <Link href="/register"
                  className="bg-[#c2410c] hover:bg-[#9a3412] text-white text-sm font-semibold
                             px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5
                             shadow-sm shadow-orange-200">
                  Register Free
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobile(p => !p)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center
                         hover:bg-stone-100 text-stone-500 transition-colors ml-1">
              {mobileOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobile(false)}>
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-stone-200
                          shadow-xl px-4 py-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  onClick={() => setMobile(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${isActive(l.href) ? 'bg-orange-50 text-orange-700' : 'text-stone-600 hover:bg-stone-50'}`}>
                  {l.label}
                </Link>
              ))}
              {!user && (
                <>
                  <div className="h-px bg-stone-100 my-1"/>
                  <Link href="/login" onClick={() => setMobile(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setMobile(false)}
                    className="flex items-center justify-center gap-2 bg-[#c2410c] text-white
                               text-sm font-bold px-4 py-3 rounded-xl mt-1">
                    Register Free →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
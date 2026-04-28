'use client'
import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProfileCard, { ProfileCardSkeleton } from '@/components/ProfileCard'
import { Search, X, SlidersHorizontal, Lock, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import { EDUCATION, STATES } from '@/lib/utils'
import Link from 'next/link'

function ProfilesContent() {
  const [profiles, setProfiles]         = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [myProfile, setMyProfile]       = useState<any>(null)
  const [sentInterests, setSent]        = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters]   = useState(false)
  const [isLoggedIn, setIsLoggedIn]     = useState(false)
  const [isPremium, setIsPremium]       = useState(false)
  const [dailyCount, setDailyCount]     = useState(0)
  const [filters, setFilters]           = useState({
    state: '', education: '', age_min: '', age_max: '',
  })

  const FREE_PROFILE_LIMIT    = 10
  const FREE_INTEREST_LIMIT   = 2
  const GUEST_PROFILE_LIMIT   = 4

  useEffect(() => { initPage() }, [])

  async function initPage() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Not logged in — show 4 random profiles opposite gender mixed
      setIsLoggedIn(false)
      fetchGuestProfiles()
      return
    }

    setIsLoggedIn(true)

    // Get my profile
    const { data: mine } = await supabase
      .from('profiles').select('*')
      .eq('user_id', user.id).single()

    if (mine) {
      setMyProfile(mine)
      setIsPremium(mine.is_premium)

      // Load sent interests
      const { data: ints } = await supabase
        .from('interests').select('receiver_id').eq('sender_id', mine.id)
      if (ints) setSent(new Set(ints.map((i: any) => i.receiver_id)))

      // Get today's interest count
      const today = new Date().toISOString().split('T')[0]
      const { data: limit } = await supabase
        .from('interest_limits')
        .select('count')
        .eq('profile_id', mine.id)
        .eq('date', today)
        .single()
      setDailyCount(limit?.count || 0)

      fetchProfiles(mine)
    }
  }

  async function fetchGuestProfiles() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles').select('id, name, gender, date_of_birth, height_cm, city, state, education, occupation, gotra, photo_url, is_premium, plan')
      .eq('status', 'approved')
      .limit(20)

    // Shuffle and take 4
    const shuffled = (data || []).sort(() => Math.random() - 0.5).slice(0, GUEST_PROFILE_LIMIT)
    setProfiles(shuffled)
    setLoading(false)
  }

  async function fetchProfiles(mine: any) {
    setLoading(true)

    // Opposite gender
    const oppositeGender = mine.gender === 'female' ? 'male' : 'female'

    let q = supabase.from('profiles').select('*')
      .eq('status', 'approved')
      .eq('gender', oppositeGender)
      .neq('id', mine.id)

    // Apply filters
    if (filters.state)     q = q.eq('state', filters.state)
    if (filters.education) q = q.eq('education', filters.education)
    if (filters.age_min) {
      const d = new Date(); d.setFullYear(d.getFullYear() - Number(filters.age_min))
      q = q.lte('date_of_birth', d.toISOString().split('T')[0])
    }
    if (filters.age_max) {
      const d = new Date(); d.setFullYear(d.getFullYear() - Number(filters.age_max))
      q = q.gte('date_of_birth', d.toISOString().split('T')[0])
    }

    const { data, error } = await q.limit(200)
    setLoading(false)
    if (error) { toast.error('Error loading profiles'); return }

    let result = data || []

    if (!mine.is_premium) {
      // Free member: smart random 10
      // Priority: same state first
      const sameState  = result.filter(p => p.state === mine.state)
      const otherState = result.filter(p => p.state !== mine.state)

      // Shuffle both groups
      const shuffledSame  = sameState.sort(() => Math.random() - 0.5)
      const shuffledOther = otherState.sort(() => Math.random() - 0.5)

      // Take up to 6 from same state, rest from other
      const combined = [
        ...shuffledSame.slice(0, 6),
        ...shuffledOther.slice(0, 4),
      ].slice(0, FREE_PROFILE_LIMIT)

      setProfiles(combined)
    } else {
      // Premium: show all, premium profiles first
      result.sort((a, b) => (b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0))
      setProfiles(result)
    }
  }

  async function sendInterest(receiverId: string) {
    if (!myProfile) { toast.error('Login करें'); return }

    // Check same gender
    const receiver = profiles.find(p => p.id === receiverId)
    if (receiver && receiver.gender === myProfile.gender) {
      toast.error('Same gender को interest नहीं भेज सकते')
      return
    }

    // Check daily limit for free members
    if (!isPremium && dailyCount >= FREE_INTEREST_LIMIT) {
      toast.error(`Free members can send only ${FREE_INTEREST_LIMIT} interests per day. Upgrade to Premium!`)
      return
    }

    const { error } = await supabase.from('interests').insert({
      sender_id: myProfile.id, receiver_id: receiverId
    })

    if (error) {
      if (error.code === '23505') toast.error('Interest पहले ही भेज दिया है')
      else toast.error('Error हुआ')
      return
    }

    // Update daily count
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('interest_limits').upsert({
      profile_id: myProfile.id,
      date: today,
      count: dailyCount + 1,
    }, { onConflict: 'profile_id,date' })

    setDailyCount(prev => prev + 1)
    setSent(prev => new Set(Array.from(prev).concat(receiverId)))
    toast.success('Interest भेज दिया! 💝')
  }

  const setF   = (k: string, v: string) => setFilters(p => ({ ...p, [k]: v }))
  const clearF = () => setFilters({ state: '', education: '', age_min: '', age_max: '' })
  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-cream">

        {/* Header */}
        <div className="bg-gradient-to-r from-saffron-800 via-saffron-700 to-saffron-500 py-12">
          <div className="container">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Find Your Match 💑
            </h1>
            <p className="text-white/75 text-lg">
              {loading ? 'Loading...' : `${profiles.length} profiles मिले`}
              {isLoggedIn && !isPremium && (
                <span className="ml-3 bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  Free: {dailyCount}/{FREE_INTEREST_LIMIT} interests today
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="container py-8">

          {/* Guest Banner */}
          {!isLoggedIn && (
            <div className="card p-5 mb-6 bg-gradient-to-r from-saffron-50 to-yellow-50
                            border-2 border-saffron-200 flex flex-col sm:flex-row
                            items-center justify-between gap-4">
              <div>
                <p className="font-black text-stone-900 text-lg">
                  🔒 Showing {GUEST_PROFILE_LIMIT} of 2000+ profiles
                </p>
                <p className="text-stone-500 text-sm mt-1">
                  Register free to see all profiles and send interests
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/login" className="btn btn-outline btn-md">Login</Link>
                <Link href="/register" className="btn btn-primary btn-md">Register Free</Link>
              </div>
            </div>
          )}

          {/* Free member limit banner */}
          {isLoggedIn && !isPremium && (
            <div className="card p-4 mb-6 bg-gradient-to-r from-saffron-50 to-yellow-50
                            border border-saffron-200 flex flex-col sm:flex-row
                            items-center justify-between gap-3">
              <div>
                <p className="font-bold text-stone-800">
                  ⚡ Free Plan — Showing {FREE_PROFILE_LIMIT} random profiles today
                </p>
                <p className="text-stone-500 text-sm">
                  Interests remaining today: {Math.max(0, FREE_INTEREST_LIMIT - dailyCount)}/{FREE_INTEREST_LIMIT} •
                  Upgrade for unlimited access
                </p>
              </div>
              <Link href="/premium" className="btn btn-primary btn-sm whitespace-nowrap">
                <Crown className="w-4 h-4" /> Upgrade
              </Link>
            </div>
          )}

          {/* Filters — only for logged in */}
          {isLoggedIn && (
            <>
              <div className="flex gap-3 mb-5 flex-wrap items-center">
                <button onClick={() => setShowFilters(f => !f)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border transition-all
                    ${showFilters
                      ? 'bg-saffron-50 border-saffron-400 text-saffron-700'
                      : 'bg-white border-stone-200 text-stone-600'}`}>
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters {activeCount > 0 && `(${activeCount})`}
                </button>
                <button onClick={() => { clearF(); fetchProfiles(myProfile) }}
                  className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-white border border-stone-200 text-stone-600 hover:bg-saffron-50">
                  🔀 Shuffle Profiles
                </button>
              </div>

              {showFilters && (
                <div className="card p-5 mb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="label text-xs">State</label>
                      <select className="select text-sm" value={filters.state}
                        onChange={e => setF('state', e.target.value)}>
                        <option value="">All States</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">Education</label>
                      <select className="select text-sm" value={filters.education}
                        onChange={e => setF('education', e.target.value)}>
                        <option value="">Any</option>
                        {EDUCATION.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">Min Age</label>
                      <select className="select text-sm" value={filters.age_min}
                        onChange={e => setF('age_min', e.target.value)}>
                        <option value="">Any</option>
                        {Array.from({ length: 23 }, (_, i) => 18 + i).map(a => (
                          <option key={a} value={a}>{a} yrs</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">Max Age</label>
                      <select className="select text-sm" value={filters.age_max}
                        onChange={e => setF('age_max', e.target.value)}>
                        <option value="">Any</option>
                        {Array.from({ length: 23 }, (_, i) => 18 + i).map(a => (
                          <option key={a} value={a}>{a} yrs</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => fetchProfiles(myProfile)} className="btn btn-primary btn-sm">
                      <Search className="w-4 h-4" /> Apply
                    </button>
                    {activeCount > 0 && (
                      <button onClick={() => { clearF(); fetchProfiles(myProfile) }}
                        className="btn btn-outline btn-sm">
                        <X className="w-4 h-4" /> Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Profiles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <ProfileCardSkeleton key={i} />)}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-stone-700 mb-2">कोई profile नहीं मिली</h3>
              <p className="text-stone-400 mb-6">Filters बदल कर try करें</p>
              <button onClick={() => { clearF(); fetchProfiles(myProfile) }}
                className="btn btn-outline btn-md">Shuffle Again</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {profiles.map((p, index) => (
                  <div key={p.id} className="relative">
                    {/* Blur overlay for guest users after 4 profiles */}
                    {!isLoggedIn && index >= GUEST_PROFILE_LIMIT ? null : (
                      <ProfileCard
                        profile={p}
                        onInterest={isLoggedIn ? sendInterest : undefined}
                        interestSent={sentInterests.has(p.id)}
                        blurred={!isLoggedIn}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Upgrade CTA for free members */}
              {isLoggedIn && !isPremium && (
                <div className="mt-10 card p-8 text-center bg-gradient-to-br from-saffron-50 to-yellow-50 border-2 border-saffron-200">
                  <div className="text-4xl mb-3">👑</div>
                  <h3 className="text-xl font-black text-stone-900 mb-2">
                    2000+ और profiles देखें
                  </h3>
                  <p className="text-stone-500 mb-5">
                    Premium लें और unlimited profiles, interests और contact details पाएं
                  </p>
                  <Link href="/premium" className="btn btn-primary btn-lg">
                    <Crown className="w-5 h-5" /> Upgrade to Premium
                  </Link>
                </div>
              )}

              {/* Login CTA for guests */}
              {!isLoggedIn && (
                <div className="mt-10 card p-8 text-center bg-gradient-to-br from-saffron-50 to-yellow-50 border-2 border-saffron-200">
                  <div className="text-4xl mb-3">🔒</div>
                  <h3 className="text-xl font-black text-stone-900 mb-2">
                    2000+ profiles देखने के लिए Register करें
                  </h3>
                  <p className="text-stone-500 mb-5">
                    Free registration — अभी जुड़ें और अपना जीवनसाथी खोजें
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/login" className="btn btn-outline btn-lg">Login</Link>
                    <Link href="/register" className="btn btn-primary btn-lg">Register Free</Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function ProfilesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin" />
      </div>
    }>
      <ProfilesContent />
    </Suspense>
  )
}

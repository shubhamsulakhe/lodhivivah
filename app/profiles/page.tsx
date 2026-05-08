'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Search, SlidersHorizontal, Heart, Crown, X, Check } from 'lucide-react'
import { getAge } from '@/lib/utils'
import { UpgradeBar } from '@/components/PremiumNudge'
import toast from 'react-hot-toast'

const COMMUNITIES = [
  { value: 'all', label: 'All Communities' },
  { value: 'lodhi_kshatriya', label: 'Lodhi Kshatriya' },
  { value: 'pawar', label: 'Pawar Samaj' },
  { value: 'kirar', label: 'Kirar Samaj' },
  { value: 'kurmi', label: 'Kurmi Samaj' },
  { value: 'teli', label: 'Teli Samaj' },
  { value: 'yadav', label: 'Yadav Samaj' },
  { value: 'gond', label: 'Gond Samaj' },
  { value: 'rajput', label: 'Rajput Samaj' },
  { value: 'brahmin', label: 'Brahmin Samaj' },
]

export default function ProfilesPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [myProfile, setMyProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gender, setGender] = useState<'all' | 'male' | 'female'>('all')
  const [community, setCommunity] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sentInterests, setSentInterests] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    let result = profiles
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.occupation?.toLowerCase().includes(q)
      )
    }
    if (gender !== 'all') result = result.filter(p => p.gender === gender)
    if (community !== 'all') result = result.filter(p => p.community === community)
    setFiltered(result)
  }, [search, gender, community, profiles])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase
      .from('profiles').select('*').eq('user_id', user.id).maybeSingle()
    if (!prof) { router.push('/onboard'); return }
    setMyProfile(prof)

    // ── Plan access — defined HERE before query ──
    const plan = prof?.plan || 'free'
    const isGold = plan === 'gold'
    const isSilver = plan === 'silver' || isGold
    const showAllCommunities = isGold


    // Admin sees all, others see opposite gender by default
    const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID
    if (user.id === adminId) {
      setGender('all')
    } else {
      setGender(prof.gender === 'male' ? 'female' : 'male')
    }

    // ── Build query ──

    let query = supabase
      .from('profiles')
      .select('id,name,photo_url,date_of_birth,city,state,education,occupation,plan,is_premium,gender,community,gotra,about_me,completeness')
      .eq('status', 'approved')
      .neq('user_id', user.id)

    if (adminId) query = (query as any).neq('user_id', adminId)

    // Gold = see all communities | Free/Silver = own community only
    // Admin sees all communities, others restricted by plan
    const isAdmin = user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID
    if (!isAdmin && !showAllCommunities && prof?.community) {
      query = (query as any).eq('community', prof.community)
    }

    // Sort: Gold/Silver first, then by completeness descending
    const { data } = await (query as any)
      .order('is_premium', { ascending: false })
      .order('completeness', { ascending: false })
      .limit(isSilver ? 200 : 20)

    setProfiles(data || [])

    // Load sent interests
    const { data: interests } = await supabase
      .from('interests').select('receiver_id').eq('sender_id', prof.id)
    if (interests) setSentInterests(new Set(interests.map((i: any) => i.receiver_id)))

    console.log('Admin ID:', process.env.NEXT_PUBLIC_ADMIN_USER_ID)

    setLoading(false)
  }

  async function sendInterest(receiverId: string) {
    if (!myProfile || sending) return

    // Check daily limit for free users
    const plan = myProfile?.plan || 'free'
    const isSilver = plan === 'silver' || plan === 'gold'
    if (!isSilver && sentInterests.size >= 2) {
      toast.error('Daily limit reached! Upgrade to Silver for unlimited interests.', { duration: 4000 })
      return
    }

    setSending(receiverId)
    try {
      const { error } = await supabase.from('interests').insert({
        sender_id: myProfile.id, receiver_id: receiverId, status: 'pending'
      })
      if (error) throw error
      setSentInterests(p => new Set(Array.from(p).concat(receiverId)))
      toast.success('Interest sent! 💝')

      // Notify receiver
      try {
        await supabase.from('notifications').insert({
          user_id: receiverId,
          type: 'interest_received',
          title: `💝 ${myProfile.name} ने आपको interest भेजा!`,
          body: `${myProfile.city || ''} से — profile देखें`,
          link: `/profiles/${myProfile.id}`,
          read: false,
        })
      } catch (_) { }


    } catch (e: any) {
      if (e.message?.includes('unique')) toast.error('Interest already sent!')
      else toast.error('Failed to send interest')
    } finally { setSending(null) }
  }

  // ── Computed plan values from loaded myProfile ──
  const plan = myProfile?.plan || 'free'
  const isGold = plan === 'gold'
  const isSilver = plan === 'silver' || isGold
  const isLimited = !isSilver
  const showAllComms = isGold

  const visibleCount = isLimited ? Math.min(filtered.length, 10) : filtered.length
  const visibleProfiles = filtered.slice(0, visibleCount)

  const avatarColors: Record<string, [string, string]> = {
    A: ['#fce7f3', '#9d174d'], B: ['#ede9fe', '#4c1d95'], C: ['#d1fae5', '#065f46'],
    D: ['#fef9c3', '#713f12'], E: ['#dbeafe', '#1e40af'], M: ['#fce7f3', '#9d174d'],
    P: ['#fce7f3', '#9d174d'], R: ['#ede9fe', '#4c1d95'], S: ['#d1fae5', '#065f46'],
    V: ['#fef9c3', '#713f12'],
  }
  function getAvatar(name: string) {
    const k = name?.charAt(0)?.toUpperCase() || 'A'
    return avatarColors[k] || ['#f1f5f9', '#475569']
  }

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <Navbar />
      <div className="pt-20 pb-24 max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="py-8 sm:py-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#431407] mb-1"
                style={{ fontFamily: 'Georgia,serif' }}>Find Your Match</h1>
              <p className="text-stone-400 text-sm">
                {filtered.length} verified profiles
                {!showAllComms && myProfile?.community
                  ? ` from ${myProfile.community.replace(/_/g, ' ')}`
                  : ' across all communities'}
              </p>
            </div>
            {/* Community badge */}
            {!showAllComms && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] bg-orange-50 border border-orange-200 text-orange-700
                                 px-2.5 py-1 rounded-full font-medium">
                  🏘️ {myProfile?.community?.replace(/_/g, ' ') || 'Your Community'}
                </span>
                <Link href="/premium"
                  className="text-[10px] text-stone-400 hover:text-orange-600 transition-colors">
                  Gold → Browse all ↗
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, city, occupation…"
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl
                           text-sm outline-none focus:border-orange-400 focus:bg-white transition-all"/>
            </div>
            <button onClick={() => setShowFilters(p => !p)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium
                          transition-all flex-shrink-0
                ${showFilters ? 'bg-orange-50 border-orange-400 text-orange-700' : 'border-stone-200 text-stone-600 hover:border-orange-300'}`}>
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-2">
                  Looking for
                </label>
                <div className="flex gap-2">
                  {[{ v: 'all', l: 'Everyone' }, { v: 'female', l: 'Bride 👰' }, { v: 'male', l: 'Groom 🤵' }].map(g => (
                    <button key={g.v} onClick={() => setGender(g.v as any)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                        ${gender === g.v ? 'bg-orange-50 border-orange-400 text-orange-700' : 'border-stone-200 text-stone-600 hover:border-orange-300'}`}>
                      {g.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Community filter — only show if Gold */}
              {showAllComms ? (
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-2">
                    Community · समाज
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMUNITIES.map(c => (
                      <button key={c.value} onClick={() => setCommunity(c.value)}
                        className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all
                          ${community === c.value ? 'bg-orange-50 border-orange-400 text-orange-700' : 'border-stone-200 text-stone-600 hover:border-orange-300'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <p className="text-xs text-yellow-700 font-medium flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 text-yellow-600" />
                    <span>
                      Upgrade to <strong>Gold</strong> to browse all 11+ communities across India
                    </span>
                  </p>
                  <Link href="/premium"
                    className="text-[10px] text-yellow-600 font-bold hover:underline mt-1 block ml-5">
                    Get Gold — ₹399/mo →
                  </Link>
                </div>
              )}

              {(search || gender !== 'all' || community !== 'all') && (
                <button onClick={() => { setSearch(''); setGender('all'); setCommunity('all') }}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium">
                  <X className="w-3.5 h-3.5" /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Interest limit warning for free users */}
        {isLimited && sentInterests.size >= 2 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5
                          flex items-center gap-3">
            <Crown className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-800">Daily interest limit reached</p>
              <p className="text-xs text-orange-600">Upgrade to Silver for unlimited interests</p>
            </div>
            <Link href="/premium"
              className="bg-orange-500 text-white text-xs font-bold px-4 py-2
                         rounded-xl hover:bg-orange-600 transition-colors flex-shrink-0">
              Upgrade
            </Link>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
                <div className="h-36 bg-stone-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-100 rounded w-2/3" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold text-stone-700 mb-2">No profiles found</p>
            <p className="text-stone-400 text-sm mb-4">Try changing your filters</p>
            <button onClick={() => { setSearch(''); setGender('all'); setCommunity('all') }}
              className="text-orange-600 text-sm font-semibold hover:underline">Clear filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {visibleProfiles.map((p, idx) => {
                const [avBg, avColor] = getAvatar(p.name)
                const isSent = sentInterests.has(p.id)
                const isBlurred = isLimited && idx >= 6

                return (
                  <div key={p.id}
                    className={`bg-white rounded-2xl border border-orange-100 overflow-hidden
                                hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100
                                transition-all duration-300 hover:-translate-y-1 group`}>
                    <div className="relative">
                      {p.photo_url ? (
                        <img src={p.photo_url}
                          className={`w-full h-36 sm:h-44 object-cover transition-all
                            ${isBlurred ? 'blur-md scale-105' : ''}`}
                          alt={p.name} />
                      ) : (
                        <div className={`w-full h-36 sm:h-44 flex items-center justify-center text-4xl font-black
                          ${isBlurred ? 'blur-md' : ''}`}
                          style={{ background: `linear-gradient(135deg,${avBg},${avBg}CC)`, color: avColor }}>
                          {p.name?.charAt(0)}
                        </div>
                      )}

                      {isBlurred && (
                        <div className="absolute inset-0 backdrop-blur-[2px] bg-white/30
                                        flex flex-col items-center justify-center p-3">
                          <div className="bg-white rounded-2xl p-3 shadow-lg text-center">
                            <Crown className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                            <p className="text-xs font-bold text-stone-800">Upgrade to see</p>
                            <Link href="/premium"
                              className="text-[10px] text-orange-600 font-semibold hover:underline">
                              Go Premium →
                            </Link>
                          </div>
                        </div>
                      )}

                      {p.plan === 'gold' && !isBlurred && (
                        <div className="absolute top-2 right-2 bg-yellow-400 rounded-lg px-2 py-0.5
                                        flex items-center gap-1 shadow-sm">
                          <Crown className="w-3 h-3 text-yellow-900" />
                          <span className="text-[10px] font-bold text-yellow-900">Gold</span>
                        </div>
                      )}

                      <div className="absolute top-2 left-2 w-6 h-6 bg-emerald-500 rounded-full
                                      flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    <div className="p-3 sm:p-4">
                      <Link href={isBlurred ? '/premium' : `/profiles/${p.id}`}>
                        <h3 className={`font-bold text-stone-900 text-sm mb-0.5 truncate
                                        group-hover:text-orange-700 transition-colors
                                        ${isBlurred ? 'blur-sm select-none' : ''}`}>
                          {isBlurred ? 'Hidden Profile' : p.name}
                        </h3>
                      </Link>
                      <p className={`text-stone-400 text-xs mb-2 ${isBlurred ? 'blur-sm' : ''}`}>
                        {p.date_of_birth ? `${getAge(p.date_of_birth)} yrs` : '?'} · {p.city || '?'}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {p.community && !isBlurred && (
                          <span className="text-[9px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full font-medium capitalize">
                            {p.community.replace(/_/g, ' ')}
                          </span>
                        )}
                        {p.occupation && !isBlurred && (
                          <span className="text-[9px] bg-stone-50 text-stone-500 px-1.5 py-0.5 rounded-full">
                            {p.occupation}
                          </span>
                        )}
                      </div>

                      {!isBlurred ? (
                        <button onClick={() => sendInterest(p.id)}
                          disabled={isSent || sending === p.id || (isLimited && sentInterests.size >= 2)}
                          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl
                                      text-xs font-bold transition-all
                            ${isSent
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                              : (isLimited && sentInterests.size >= 2)
                                ? 'bg-stone-50 text-stone-400 border border-stone-200 cursor-not-allowed'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                          {isSent
                            ? <><Check className="w-3.5 h-3.5" /> Sent</>
                            : sending === p.id
                              ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              : (isLimited && sentInterests.size >= 2)
                                ? '🔒 Limit reached'
                                : <><Heart className="w-3.5 h-3.5" /> Send Interest</>}
                        </button>
                      ) : (
                        <Link href="/premium"
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl
                                     text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200
                                     hover:bg-orange-100 transition-colors">
                          <Crown className="w-3.5 h-3.5" /> Unlock Profile
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Premium upsell */}
            {isLimited && filtered.length > 6 && (
              <div className="mt-8 bg-[#7c2d12] rounded-3xl p-6 sm:p-8 text-center">
                <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400 mx-auto mb-3" />
                <h3 className="text-white font-black text-lg mb-2"
                  style={{ fontFamily: 'Georgia,serif' }}>
                  {filtered.length - 6}+ more profiles waiting
                </h3>
                <p className="text-orange-200/60 text-sm mb-2">
                  Upgrade to Silver — unlimited profiles, clear photos, view contacts.
                </p>
                <p className="text-orange-300/50 text-xs mb-5">
                  Gold members browse <strong className="text-orange-300">all 11 communities</strong> across India
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/premium?plan=silver"
                    className="inline-flex items-center justify-center gap-2 bg-white text-[#7c2d12]
                               font-bold px-6 py-3 rounded-2xl transition-colors text-sm hover:bg-orange-50">
                    💎 Silver — ₹199/mo
                  </Link>
                  <Link href="/premium?plan=gold"
                    className="inline-flex items-center justify-center gap-2 bg-orange-500
                               hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-2xl
                               transition-colors text-sm">
                    <Crown className="w-4 h-4" /> Gold — ₹399/mo
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating upgrade bar for free users */}
      {isLimited && !loading && profiles.length > 0 && (
        <UpgradeBar
          message={`${filtered.length - Math.min(filtered.length, 6)} profiles hidden · Upgrade to Silver to see all`}
        />
      )}

      <Footer />
    </div>
  )
}
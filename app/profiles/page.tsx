'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProfileCard, { ProfileCardSkeleton } from '@/components/ProfileCard'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { EDUCATION, STATES } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'

export default function ProfilesPage() {
  const params = useSearchParams()
  const [profiles, setProfiles]       = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [myProfileId, setMyProfileId] = useState<string | null>(null)
  const [sentInterests, setSent]      = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters]         = useState({
    gender:    params.get('gender') || '',
    state:     params.get('state')  || '',
    education: '',
    age_min:   '',
    age_max:   '',
  })

  useEffect(() => { initPage() }, [])

  async function initPage() {
    const { data: { user } } = await supabase.auth.getUser()
    let myId: string | null = null
    if (user) {
      const { data: mine } = await supabase
        .from('profiles').select('id')
        .eq('user_id', user.id).single()
      if (mine) {
        myId = mine.id
        setMyProfileId(mine.id)
        const { data: ints } = await supabase
          .from('interests').select('receiver_id').eq('sender_id', mine.id)
        if (ints) setSent(new Set(ints.map((i: any) => i.receiver_id)))
      }
    }
    fetchProfiles(myId)
  }

  async function fetchProfiles(excludeId?: string | null) {
    setLoading(true)
    let q = supabase.from('profiles').select('*')
      .eq('status', 'approved')
      .order('is_premium', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(60)

    if (filters.gender)    q = q.eq('gender', filters.gender)
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

    const { data, error } = await q
    setLoading(false)
    if (error) { toast.error('Error loading profiles'); return }

    // Remove own profile
    const toExclude = excludeId ?? myProfileId
    setProfiles((data || []).filter(p => p.id !== toExclude))
  }

  async function sendInterest(receiverId: string) {
    if (!myProfileId) { toast.error('Interest भेजने के लिए login करें'); return }
    const { error } = await supabase.from('interests').insert({ sender_id: myProfileId, receiver_id: receiverId })
    if (error) {
      if (error.code === '23505') toast.error('Interest पहले ही भेज दिया है')
      else toast.error('Error हुआ')
      return
    }
    setSent(prev => new Set(Array.from(prev).concat(receiverId)))
toast.success('Interest भेज दिया! 💝')
  }

  const setF = (k: string, v: string) => setFilters(p => ({ ...p, [k]: v }))
  const clearFilters = () => setFilters({ gender: '', state: '', education: '', age_min: '', age_max: '' })
  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-cream">
        {/* Header */}
        <div className="bg-gradient-to-r from-saffron-800 via-saffron-700 to-saffron-500 py-12">
          <div className="container">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Find Your Match 💑</h1>
            <p className="text-white/75 text-lg">{loading ? 'Loading...' : `${profiles.length} profiles मिले`}</p>
          </div>
        </div>

        <div className="container py-8">
          {/* Gender tabs + filter toggle */}
          <div className="flex gap-3 mb-5 flex-wrap items-center">
            {[{ v: '', l: 'All Profiles' }, { v: 'female', l: '♀ Brides' }, { v: 'male', l: '♂ Grooms' }].map(({ v, l }) => (
              <button key={v}
                onClick={() => { setF('gender', v); setTimeout(() => fetchProfiles(), 50) }}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all
                  ${filters.gender === v
                    ? 'bg-saffron-500 text-white shadow-glow'
                    : 'bg-white text-stone-600 hover:bg-saffron-50 border border-stone-200'}`}>
                {l}
              </button>
            ))}
            <button onClick={() => setShowFilters(f => !f)}
              className={`ml-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border transition-all
                ${showFilters ? 'bg-saffron-50 border-saffron-400 text-saffron-700' : 'bg-white border-stone-200 text-stone-600'}`}>
              <SlidersHorizontal className="w-4 h-4" /> Filters {activeCount > 0 && `(${activeCount})`}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="card p-5 mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="label text-xs">State</label>
                  <select className="select text-sm" value={filters.state} onChange={e => setF('state', e.target.value)}>
                    <option value="">All States</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Education</label>
                  <select className="select text-sm" value={filters.education} onChange={e => setF('education', e.target.value)}>
                    <option value="">Any</option>
                    {EDUCATION.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Min Age</label>
                  <select className="select text-sm" value={filters.age_min} onChange={e => setF('age_min', e.target.value)}>
                    <option value="">Any</option>
                    {Array.from({ length: 23 }, (_, i) => 18 + i).map(a => <option key={a} value={a}>{a} yrs</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Max Age</label>
                  <select className="select text-sm" value={filters.age_max} onChange={e => setF('age_max', e.target.value)}>
                    <option value="">Any</option>
                    {Array.from({ length: 23 }, (_, i) => 18 + i).map(a => <option key={a} value={a}>{a} yrs</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => fetchProfiles()} className="btn btn-primary btn-sm">
                  <Search className="w-4 h-4" /> Apply
                </button>
                {activeCount > 0 && (
                  <button onClick={() => { clearFilters(); setTimeout(() => fetchProfiles(), 50) }}
                    className="btn btn-outline btn-sm"><X className="w-4 h-4" /> Clear</button>
                )}
              </div>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <ProfileCardSkeleton key={i} />)}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-stone-700 mb-2">कोई profile नहीं मिली</h3>
              <p className="text-stone-400 mb-6">Filters बदल कर try करें</p>
              <button onClick={() => { clearFilters(); fetchProfiles() }} className="btn btn-outline btn-md">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {profiles.map(p => (
                <ProfileCard key={p.id} profile={p}
                  onInterest={myProfileId ? sendInterest : undefined}
                  interestSent={sentInterests.has(p.id)} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

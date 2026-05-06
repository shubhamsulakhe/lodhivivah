'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import {
  Check, X, Crown, Users, Clock, AlertCircle,
  Search, Filter, Eye, MessageCircle, Phone,
  TrendingUp, RefreshCw, ChevronDown, Send,
  UserCheck, UserX, Gift, Loader2, Bell
} from 'lucide-react'
import toast from 'react-hot-toast'

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID

const COMMUNITIES = [
  { value:'all',             label:'All Communities' },
  { value:'lodhi_kshatriya', label:'Lodhi Kshatriya' },
  { value:'pawar',           label:'Pawar Samaj'      },
  { value:'kirar',           label:'Kirar Samaj'      },
  { value:'kurmi',           label:'Kurmi Samaj'      },
  { value:'teli',            label:'Teli Samaj'       },
  { value:'yadav',           label:'Yadav Samaj'      },
  { value:'gond',            label:'Gond Samaj'       },
  { value:'other',           label:'Other'            },
]

const STATUS_TABS = [
  { id:'pending',    label:'Pending',    color:'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { id:'approved',   label:'Approved',   color:'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id:'incomplete', label:'Incomplete', color:'text-blue-600 bg-blue-50 border-blue-200' },
  { id:'rejected',   label:'Rejected',   color:'text-red-600 bg-red-50 border-red-200' },
  { id:'all',        label:'All',        color:'text-stone-600 bg-stone-50 border-stone-200' },
]

const WA_TEMPLATES = [
  { id:1, label:'Welcome new user', msg:(n:string) => `नमस्ते ${n} जी! 🙏 Wedly पर आपका स्वागत है। आपकी profile review में है। जल्द approve होगी। किसी भी सहायता के लिए संपर्क करें। - Team Wedly` },
  { id:2, label:'Profile approved',  msg:(n:string) => `नमस्ते ${n} जी! 🎉 आपकी Wedly profile approve हो गई है। अब आप profiles browse कर सकते हैं। wedly.co.in पर login करें। - Team Wedly` },
  { id:3, label:'Profile rejected',  msg:(n:string) => `नमस्ते ${n} जी। आपकी profile reject हुई। कृपया clear photo और सही जानकारी के साथ profile update करें। wedly.co.in - Team Wedly` },
  { id:4, label:'Complete profile',  msg:(n:string) => `नमस्ते ${n} जी! आपकी profile incomplete है। पूरी profile भरने से ज्यादा matches मिलेंगे। अभी complete करें: wedly.co.in - Team Wedly` },
  { id:5, label:'Upgrade to Silver', msg:(n:string) => `नमस्ते ${n} जी! 💎 Silver plan (₹199/month) से unlimited contacts और profiles देखें। आज upgrade करें: wedly.co.in/premium - Team Wedly` },
  { id:6, label:'Upgrade to Gold',   msg:(n:string) => `नमस्ते ${n} जी! 👑 Gold plan (₹399/month) से voice calls, all communities, और premium features पाएं। wedly.co.in/premium - Team Wedly` },
]

export default function AdminPage() {
  const router = useRouter()
  const [profiles, setProfiles]       = useState<any[]>([])
  const [filtered, setFiltered]       = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState('pending')
  const [community, setCommunity]     = useState('all')
  const [search, setSearch]           = useState('')
  const [stats, setStats]             = useState<any>({})
  const [acting, setActing]           = useState<string|null>(null)
  const [selectedProfile, setSelected]= useState<any>(null)
  const [showWA, setShowWA]           = useState(false)
  const [planModal, setPlanModal]     = useState<any>(null)
  const [planMonths, setPlanMonths]   = useState(1)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => { checkAdmin() }, [])

  useEffect(() => {
    let result = profiles
    if (activeTab !== 'all') result = result.filter(p => p.status === activeTab)
    if (community !== 'all') result = result.filter(p => p.community === community)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.community?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [profiles, activeTab, community, search])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== ADMIN_ID) {
      router.push('/dashboard')
      return
    }
    loadAll()
  }

  async function loadAll() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', ADMIN_ID)
      .order('created_at', { ascending: false })
    setProfiles(data || [])

    // Stats
    const all = data || []
    setStats({
      total:      all.length,
      pending:    all.filter(p => p.status === 'pending').length,
      approved:   all.filter(p => p.status === 'approved').length,
      incomplete: all.filter(p => p.status === 'incomplete').length,
      rejected:   all.filter(p => p.status === 'rejected').length,
      premium:    all.filter(p => p.is_premium).length,
      male:       all.filter(p => p.gender === 'male').length,
      female:     all.filter(p => p.gender === 'female').length,
      avgScore:   Math.round(all.reduce((a,p) => a + (p.completeness||0), 0) / (all.length||1)),
    })
    setLoading(false)
  }

  async function approveProfile(profile: any) {
    setActing(profile.id)
    await supabase.from('profiles')
      .update({ status: 'approved' })
      .eq('id', profile.id)

    // Notify user
    await supabase.from('notifications').insert({
      user_id: profile.id,
      type:    'profile_approved',
      title:   '🎉 Profile Approved!',
      body:    'Your profile is now live. Start browsing matches!',
      link:    '/profiles',
      read:    false,
    })

    toast.success(`${profile.name} approved ✅`)
    loadAll()
    setActing(null)
    setSelected(null)
  }

  async function rejectProfile(profile: any) {
    if (!rejectReason) { toast.error('Enter rejection reason'); return }
    setActing(profile.id)
    await supabase.from('profiles')
      .update({ status: 'rejected' })
      .eq('id', profile.id)

    await supabase.from('notifications').insert({
      user_id: profile.id,
      type:    'profile_rejected',
      title:   '⚠️ Profile needs update',
      body:    rejectReason || 'Please update your profile with clear photo and complete details.',
      link:    '/profile/edit',
      read:    false,
    })

    toast.success(`${profile.name} rejected`)
    setRejectReason('')
    loadAll()
    setActing(null)
    setSelected(null)
  }

  async function suspendProfile(profile: any) {
    await supabase.from('profiles').update({ status: 'rejected' }).eq('id', profile.id)
    toast.success(`${profile.name} suspended`)
    loadAll()
    setSelected(null)
  }

  async function giveTrial(profile: any) {
    const until = new Date()
    until.setDate(until.getDate() + 7)
    await supabase.from('profiles').update({
      plan: 'silver', is_premium: true,
      premium_until: until.toISOString(),
    }).eq('id', profile.id)

    await supabase.from('notifications').insert({
      user_id: profile.id,
      type:    'plan_upgraded',
      title:   '🎁 Free Silver Trial — 7 days!',
      body:    'Enjoy unlimited interests and contact views for 7 days. Upgrade to continue.',
      link:    '/premium',
      read:    false,
    })
    toast.success(`7-day Silver trial given to ${profile.name} 🎁`)
    loadAll()
    setPlanModal(null)
    setSelected(null)
  }

  async function upgradePlan(profile: any, plan: 'silver'|'gold') {
    const until = new Date()
    until.setMonth(until.getMonth() + planMonths)
    await supabase.from('profiles').update({
      plan, is_premium: true,
      premium_until: until.toISOString(),
    }).eq('id', profile.id)

    await supabase.from('notifications').insert({
      user_id: profile.id,
      type:    'plan_upgraded',
      title:   `✨ Upgraded to ${plan.charAt(0).toUpperCase()+plan.slice(1)}!`,
      body:    `Your ${plan} plan is active for ${planMonths} month${planMonths>1?'s':''}. Enjoy premium features!`,
      link:    '/profiles',
      read:    false,
    })
    toast.success(`${profile.name} upgraded to ${plan} for ${planMonths} month(s) ✅`)
    loadAll()
    setPlanModal(null)
    setSelected(null)
  }

  function getWALink(phone: string, msg: string) {
    const clean = phone?.replace(/\D/g,'')
    const num   = clean?.startsWith('91') ? clean : `91${clean}`
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
  }

  function getScoreColor(score: number) {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50'
    if (score >= 40) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const pendingCount = profiles.filter(p => p.status === 'pending').length

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <Navbar/>
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 pb-16">

        {/* Header */}
        <div className="py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#431407]"
              style={{ fontFamily:'Georgia,serif' }}>
              Admin Panel
            </h1>
            <p className="text-stone-400 text-sm mt-0.5">Wedly · wedly.co.in</p>
          </div>
          <button onClick={loadAll}
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700
                       border border-stone-200 px-4 py-2 rounded-xl hover:bg-white transition-all">
            <RefreshCw className="w-4 h-4"/> Refresh
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 mb-6">
          {[
            { label:'Total',      value:stats.total,      color:'text-stone-700',   bg:'bg-white'        },
            { label:'Pending',    value:stats.pending,    color:'text-yellow-700',  bg:'bg-yellow-50'    },
            { label:'Approved',   value:stats.approved,   color:'text-emerald-700', bg:'bg-emerald-50'   },
            { label:'Incomplete', value:stats.incomplete, color:'text-blue-700',    bg:'bg-blue-50'      },
            { label:'Rejected',   value:stats.rejected,   color:'text-red-700',     bg:'bg-red-50'       },
            { label:'Premium',    value:stats.premium,    color:'text-orange-700',  bg:'bg-orange-50'    },
            { label:'Grooms',     value:stats.male,       color:'text-blue-700',    bg:'bg-blue-50'      },
            { label:'Brides',     value:stats.female,     color:'text-pink-700',    bg:'bg-pink-50'      },
            { label:'Avg Score',  value:`${stats.avgScore}%`, color:'text-purple-700', bg:'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-3 border border-white text-center`}>
              <div className={`text-xl font-black ${s.color}`}
                style={{ fontFamily:'Georgia,serif' }}>{s.value ?? '—'}</div>
              <div className="text-[10px] text-stone-400 font-medium mt-0.5 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-orange-100 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, phone, city…"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl
                           text-sm outline-none focus:border-orange-400 transition-all"/>
            </div>
            <select value={community} onChange={e => setCommunity(e.target.value)}
              className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm bg-stone-50
                         outline-none focus:border-orange-400 text-stone-700">
              {COMMUNITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Status tabs */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {STATUS_TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold
                            transition-all ${activeTab === t.id ? t.color : 'border-stone-200 text-stone-500 bg-white hover:bg-stone-50'}`}>
                {t.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                  ${activeTab===t.id ? 'bg-white/50' : 'bg-stone-100'}`}>
                  {t.id === 'all'        ? stats.total
                  : t.id === 'pending'   ? stats.pending
                  : t.id === 'approved'  ? stats.approved
                  : t.id === 'incomplete'? stats.incomplete
                  : stats.rejected}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pending alert */}
        {pendingCount > 0 && activeTab !== 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4
                          flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('pending')}>
            <Bell className="w-4 h-4 text-yellow-600 flex-shrink-0 animate-bounce"/>
            <p className="text-yellow-700 text-sm font-semibold">
              {pendingCount} profile{pendingCount>1?'s':''} waiting for review
            </p>
            <button className="ml-auto text-xs text-yellow-600 font-bold hover:underline">
              Review now →
            </button>
          </div>
        )}

        {/* Profile list */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3"/>
            <p className="text-stone-400 text-sm">Loading profiles…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-orange-100">
            <p className="text-stone-400">No profiles found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
            <div className="divide-y divide-stone-50">
              {filtered.map(p => (
                <div key={p.id}
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50/50 transition-colors
                              cursor-pointer ${selectedProfile?.id===p.id ? 'bg-orange-50/50' : ''}`}
                  onClick={() => setSelected(selectedProfile?.id===p.id ? null : p)}>

                  {/* Photo */}
                  <div className="relative flex-shrink-0">
                    {p.photo_url ? (
                      <img src={p.photo_url} className="w-11 h-11 rounded-xl object-cover" alt=""/>
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center
                                      justify-center text-base font-bold text-stone-500">
                        {p.name?.charAt(0) || '?'}
                      </div>
                    )}
                    {p.is_premium && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full
                                      flex items-center justify-center">
                        <Crown className="w-2.5 h-2.5 text-yellow-900"/>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-stone-900 text-sm">{p.name || 'No name'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border
                        ${p.status==='approved'  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : p.status==='pending'   ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : p.status==='incomplete'? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {p.status}
                      </span>
                      {p.plan !== 'free' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium
                                         bg-yellow-50 text-yellow-700 border border-yellow-200">
                          {p.plan}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{p.gender==='male' ? '🤵' : '👰'} {p.date_of_birth ? `${new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()}y` : '?'}</span>
                      {p.city && <span>📍 {p.city}</span>}
                      {p.community && <span>🏘️ {p.community.replace('_',' ')}</span>}
                      {p.occupation && <span>💼 {p.occupation}</span>}
                    </div>
                  </div>

                  {/* Score + Quick actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getScoreColor(p.completeness||0)}`}>
                      {p.completeness||0}%
                    </span>
                    {p.status === 'pending' && (
                      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => approveProfile(p)}
                          disabled={acting===p.id}
                          className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white
                                     rounded-xl flex items-center justify-center transition-colors">
                          {acting===p.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin"/>
                            : <Check className="w-3.5 h-3.5"/>}
                        </button>
                        <button onClick={() => setSelected(p)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600
                                     rounded-xl flex items-center justify-center transition-colors">
                          <X className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expanded profile actions */}
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                          bg-black/50 px-4 pb-4 sm:pb-0"
            onClick={() => setSelected(null)}>
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}>

              {/* Profile header */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-stone-100">
                {selectedProfile.photo_url ? (
                  <img src={selectedProfile.photo_url}
                    className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" alt=""/>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center
                                  justify-center text-xl font-bold text-stone-500 flex-shrink-0">
                    {selectedProfile.name?.charAt(0)||'?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-stone-900">{selectedProfile.name}</div>
                  <div className="text-xs text-stone-400">
                    {selectedProfile.community?.replace('_',' ')} · {selectedProfile.city}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg
                      ${getScoreColor(selectedProfile.completeness||0)}`}>
                      {selectedProfile.completeness||0}% complete
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                  <X className="w-3.5 h-3.5"/>
                </button>
              </div>

              {/* Contact */}
              <div className="bg-stone-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-stone-500 mb-1">Contact</p>
                <p className="text-sm font-semibold text-stone-800">
                  {selectedProfile.phone ? `+91 ${selectedProfile.phone}` : 'No phone'}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {selectedProfile.status === 'pending' && (
                  <button onClick={() => approveProfile(selectedProfile)}
                    disabled={acting===selectedProfile.id}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500
                               hover:bg-emerald-600 text-white font-bold text-sm py-3
                               rounded-xl transition-colors disabled:opacity-60">
                    {acting===selectedProfile.id
                      ? <Loader2 className="w-4 h-4 animate-spin"/>
                      : <><UserCheck className="w-4 h-4"/> Approve Profile</>}
                  </button>
                )}

                {selectedProfile.status === 'pending' && (
                  <div className="space-y-2">
                    <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                      placeholder="Rejection reason (required)"
                      className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm
                                 outline-none focus:border-red-400 bg-red-50/50"/>
                    <button onClick={() => rejectProfile(selectedProfile)}
                      className="w-full flex items-center justify-center gap-2 bg-red-100
                                 hover:bg-red-200 text-red-700 font-bold text-sm py-3
                                 rounded-xl transition-colors">
                      <UserX className="w-4 h-4"/> Reject Profile
                    </button>
                  </div>
                )}

                <button onClick={() => setPlanModal(selectedProfile)}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-50
                             hover:bg-yellow-100 text-yellow-700 font-bold text-sm py-3
                             rounded-xl border border-yellow-200 transition-colors">
                  <Crown className="w-4 h-4"/> Manage Plan
                </button>

                {selectedProfile.status !== 'incomplete' && (
                  <button onClick={() => suspendProfile(selectedProfile)}
                    className="w-full flex items-center justify-center gap-2 bg-stone-50
                               hover:bg-stone-100 text-stone-600 font-medium text-sm py-3
                               rounded-xl border border-stone-200 transition-colors">
                    Suspend Account
                  </button>
                )}

                {/* WhatsApp */}
                {selectedProfile.phone && (
                  <div>
                    <p className="text-xs text-stone-400 font-medium mb-2">Send WhatsApp:</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {WA_TEMPLATES.slice(0,4).map(t => (
                        <a key={t.id}
                          href={getWALink(selectedProfile.phone, t.msg(selectedProfile.name||'User'))}
                          target="_blank"
                          className="text-[10px] bg-green-50 border border-green-200 text-green-700
                                     px-2 py-2 rounded-lg text-center hover:bg-green-100
                                     transition-colors font-medium leading-tight">
                          {t.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plan modal */}
        {planModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={() => setPlanModal(null)}>
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-stone-900 mb-1">Manage Plan</h3>
              <p className="text-stone-400 text-sm mb-5">{planModal.name}</p>

              <div className="mb-4">
                <label className="text-xs font-semibold text-stone-500 block mb-2">Duration (months)</label>
                <div className="flex gap-2">
                  {[1,3,6,12].map(m => (
                    <button key={m} onClick={() => setPlanMonths(m)}
                      className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all
                        ${planMonths===m ? 'bg-orange-500 text-white border-orange-500' : 'border-stone-200 text-stone-600'}`}>
                      {m}mo
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <button onClick={() => giveTrial(planModal)}
                  className="w-full flex items-center justify-center gap-2 bg-orange-50
                             hover:bg-orange-100 text-orange-700 font-bold text-sm py-3
                             rounded-xl border border-orange-200">
                  <Gift className="w-4 h-4"/> Give 7-day Free Trial
                </button>
                <button onClick={() => upgradePlan(planModal, 'silver')}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100
                             hover:bg-slate-200 text-slate-700 font-bold text-sm py-3 rounded-xl">
                  💎 Upgrade to Silver ({planMonths}mo)
                </button>
                <button onClick={() => upgradePlan(planModal, 'gold')}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-50
                             hover:bg-yellow-100 text-yellow-700 font-bold text-sm py-3
                             rounded-xl border border-yellow-200">
                  <Crown className="w-4 h-4"/> Upgrade to Gold ({planMonths}mo)
                </button>
                {planModal.is_premium && (
                  <button onClick={async () => {
                    await supabase.from('profiles').update({ plan:'free', is_premium:false, premium_until:null }).eq('id', planModal.id)
                    toast.success('Plan reverted to free')
                    loadAll(); setPlanModal(null)
                  }}
                    className="w-full py-3 text-sm text-red-500 hover:text-red-700 font-medium
                               border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                    Revert to Free
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
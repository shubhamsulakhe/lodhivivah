'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  CheckCircle, XCircle, Eye, Users, Crown, Clock,
  Shield, LogOut, RefreshCw, MessageCircle
} from 'lucide-react'
import { getAge } from '@/lib/utils'
import toast from 'react-hot-toast'
import Logo from '@/components/Logo'
import Link from 'next/link'

const SITE = 'https://www.wedly.co.in'

function msg(lines: string[]): string {
  return lines.join('\n')
}

const templates: Record<string, (name: string, extra?: string) => string> = {

  completeProfile: (name) => msg([
    `🙏 नमस्ते ${name} जी!`,
    ``,
    `*Wedly* पर स्वागत है! 💑`,
    ``,
    `✅ Email verify हो गया।`,
    `अब Profile complete करें — Free है!`,
    ``,
    `👉 ${SITE}/register`,
    ``,
    `— Team Wedly`,
  ]),

  profileUnderReview: (name) => msg([
    `🙏 नमस्ते ${name} जी!`,
    ``,
    `✅ Profile मिल गई!`,
    `⏳ 24 घंटे में *Review* होगी।`,
    ``,
    `Approve होने पर message आएगा। 😊`,
    ``,
    `🌐 ${SITE}`,
    `— Team Wedly`,
  ]),

  profileApproved: (name) => msg([
    `🎉 बधाई हो ${name} जी!`,
    ``,
    `✅ आपकी *Profile APPROVED* हो गई!`,
    `अब सभी को दिखेगी।`,
    ``,
    `👉 Profiles देखें: ${SITE}/profiles`,
    `💑 Interest भेजें!`,
    ``,
    `— Team Wedly`,
  ]),

  newMatch: (name) => msg([
    `💑 नमस्ते ${name} जी!`,
    ``,
    `🎊 *नए रिश्ते* आए हैं Wedly पर!`,
    ``,
    `👉 अभी देखें: ${SITE}/profiles`,
    `⏰ जल्दी करें!`,
    ``,
    `— Team Wedly`,
  ]),

  interestReceived: (name, sender) => msg([
    `💝 नमस्ते ${name} जी!`,
    ``,
    `*${sender || 'किसी'}* ने आपको *Interest* भेजी!`,
    ``,
    `👉 Reply दें: ${SITE}/dashboard`,
    ``,
    `— Team Wedly`,
  ]),

  freeTrial: (name) => msg([
    `🎁 नमस्ते ${name} जी!`,
    ``,
    `*FREE 1 Week Silver Membership!* 👑`,
    ``,
    `✅ Contact Numbers देखें`,
    `✅ Unlimited Interests`,
    `✅ WhatsApp Connect`,
    ``,
    `👉 ${SITE}/login`,
    `⏰ Limited time offer!`,
    ``,
    `— Team Wedly`,
  ]),

  premiumActivated: (name, plan) => msg([
    `👑 बधाई हो ${name} जी!`,
    ``,
    `*${(plan || 'Silver').toUpperCase()} Plan* activate हो गया! 🎉`,
    ``,
    `✅ Contacts देख सकते हैं`,
    `✅ Unlimited interests`,
    ``,
    `👉 ${SITE}/profiles`,
    ``,
    `— Team Wedly`,
  ]),

  incompleteReminder: (name) => msg([
    `🙏 नमस्ते ${name} जी!`,
    ``,
    `⚠️ Profile *अधूरी* है!`,
    ``,
    `✨ पूरी करने पर ज़्यादा matches मिलेंगे।`,
    ``,
    `👉 ${SITE}/profile/edit`,
    ``,
    `— Team Wedly`,
  ]),

  profileRejected: (name) => msg([
    `🙏 नमस्ते ${name} जी!`,
    ``,
    `❌ Profile में कुछ बदलाव करने हैं।`,
    ``,
    `👉 Edit करें: ${SITE}/profile/edit`,
    ``,
    `— Team Wedly`,
  ]),

  weekendOffer: (name) => msg([
    `🎊 Weekend Special ${name} जी!`,
    ``,
    `⚡ Silver — ₹199 (1 महीना)`,
    `👑 Gold — ₹399 (3 महीने)`,
    ``,
    `👉 ${SITE}/premium`,
    ``,
    `— Team Wedly`,
  ]),

  silverOffer: (name) => msg([
    `⚡ नमस्ते ${name} जी!`,
    ``,
    `*Silver Plan — ₹199* (1 महीना)`,
    ``,
    `✅ Contact Numbers`,
    `✅ Unlimited Interests`,
    `✅ WhatsApp Connect`,
    ``,
    `👉 ${SITE}/premium`,
    ``,
    `— Team Wedly`,
  ]),

  goldOffer: (name) => msg([
    `👑 नमस्ते ${name} जी!`,
    ``,
    `*Gold Plan — ₹399* (3 महीने)`,
    ``,
    `✅ Contact Numbers`,
    `✅ Featured Badge`,
    `✅ Top Placement`,
    `✅ Unlimited Interests`,
    ``,
    `👉 ${SITE}/premium`,
    ``,
    `— Team Wedly`,
  ]),
}

const TEMPLATE_LIST = [
  { id: 'completeProfile', emoji: '📝', label: 'Complete Registration' },
  { id: 'profileUnderReview', emoji: '⏳', label: 'Profile Under Review' },
  { id: 'profileApproved', emoji: '✅', label: 'Profile Approved' },
  { id: 'newMatch', emoji: '💑', label: 'New Match Available' },
  { id: 'interestReceived', emoji: '💝', label: 'Interest Received' },
  { id: 'freeTrial', emoji: '🎁', label: 'Free Trial Offer' },
  { id: 'premiumActivated', emoji: '👑', label: 'Premium Activated' },
  { id: 'incompleteReminder', emoji: '⚠️', label: 'Complete Profile Reminder' },
  { id: 'profileRejected', emoji: '❌', label: 'Profile Rejected' },
  { id: 'weekendOffer', emoji: '🎊', label: 'Weekend Special' },
  { id: 'silverOffer', emoji: '⚡', label: 'Silver ₹199' },
  { id: 'goldOffer', emoji: '👑', label: 'Gold ₹399' },
]

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'whatsapp' | 'payments' | 'pending' | 'approved' | 'all'>('pending')
  const [profiles, setProfiles] = useState<any[]>([])
  const [allProfiles, setAllProfiles] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, premium: 0 })
  const [search, setSearch] = useState('')
  const [planModal, setPlanModal] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [waSearch, setWaSearch] = useState('')
  const [waSelected, setWaSelected] = useState<any>(null)
  const [waTemplate, setWaTemplate] = useState('')

  useEffect(() => { checkAdmin() }, [])
  useEffect(() => {
    if (isAdmin) { fetchStats(); fetchPayments(); fetchProfiles(); fetchAllProfiles() }
  }, [tab, isAdmin])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data } = await supabase.from('admin_users').select('id').eq('user_id', user.id).single()
    if (!data) { toast.error('Admin access नहीं है'); router.push('/'); return }
    setIsAdmin(true)
    setLoading(false)
  }

  async function fetchStats() {
    const { data } = await supabase.from('profiles').select('status, is_premium')
    if (!data) return
    setStats({
      total: data.length,
      pending: data.filter(p => p.status === 'pending').length,
      approved: data.filter(p => p.status === 'approved').length,
      premium: data.filter(p => p.is_premium).length,
    })
  }

  async function fetchPayments() {
    const { data } = await supabase.from('payments').select('*')
      .order('created_at', { ascending: false }).limit(50)
    setPayments(data || [])
  }

  async function fetchAllProfiles() {
    const { data } = await supabase.from('profiles').select('*')
      .order('created_at', { ascending: false }).limit(200)
    setAllProfiles(data || [])
  }

  async function fetchProfiles() {
    setRefreshing(true)
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (tab === 'pending') q = q.eq('status', 'pending')
    if (tab === 'approved') q = q.eq('status', 'approved')
    const { data, error } = await q.limit(100)
    setRefreshing(false)
    if (error) { toast.error('Error: ' + error.message); return }
    setProfiles(data || [])
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    const toastId = toast.loading('Updating...')
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id)
    if (error) { toast.error('Error: ' + error.message, { id: toastId }); return }
    toast.success(status === 'approved' ? '✅ Approved!' : '❌ Rejected', { id: toastId })
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    fetchStats()
  }

  async function togglePremium(id: string, current: boolean) {
    if (current) {
      const toastId = toast.loading('Removing...')
      const { error } = await supabase.from('profiles').update({
        is_premium: false, plan: 'free', premium_until: null
      }).eq('id', id)
      if (error) { toast.error('Error', { id: toastId }); return }
      toast.success('Premium removed', { id: toastId })
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_premium: false, plan: 'free' } : p))
      fetchStats()
    } else {
      setPlanModal(id)
    }
  }

  async function activatePlan(profileId: string, plan: string) {
    const toastId = toast.loading('Activating...')
    const months = plan === 'gold' ? 3 : 1
    const premiumUntil = new Date()
    premiumUntil.setMonth(premiumUntil.getMonth() + months)
    const { error } = await supabase.from('profiles').update({
      is_premium: true, plan, premium_until: premiumUntil.toISOString(),
    }).eq('id', profileId)
    if (error) { toast.error('Error: ' + error.message, { id: toastId }); return }
    toast.success(`✅ ${plan.toUpperCase()} activated!`, { id: toastId })
    setPlanModal(null)
    setProfiles(prev => prev.map(p => p.id === profileId
      ? { ...p, is_premium: true, plan, premium_until: premiumUntil.toISOString() } : p))
    fetchStats()
  }

  async function activateTrial(profileId: string) {
    const toastId = toast.loading('Activating trial...')
    const trialUntil = new Date()
    trialUntil.setDate(trialUntil.getDate() + 7)
    const { error } = await supabase.from('profiles').update({
      is_premium: true, plan: 'silver', premium_until: trialUntil.toISOString(),
    }).eq('id', profileId)
    if (error) { toast.error('Error: ' + error.message, { id: toastId }); return }
    toast.success('🎁 1 Week Trial activated!', { id: toastId })
    setProfiles(prev => prev.map(p => p.id === profileId
      ? { ...p, is_premium: true, plan: 'silver' } : p))
    fetchStats()
  }

  async function confirmPayment(paymentId: string, profileId: string, plan: string) {
    const toastId = toast.loading('Activating...')
    const months = plan === 'gold' ? 3 : 1
    const premiumUntil = new Date()
    premiumUntil.setMonth(premiumUntil.getMonth() + months)
    const { error } = await supabase.from('profiles').update({
      is_premium: true, plan, premium_until: premiumUntil.toISOString(),
    }).eq('id', profileId)
    if (error) { toast.error('Error: ' + error.message, { id: toastId }); return }
    await supabase.from('payments').update({ status: 'confirmed' }).eq('id', paymentId)
    toast.success(`✅ ${plan.toUpperCase()} activated!`, { id: toastId })
    fetchPayments(); fetchStats()
  }

  async function rejectPayment(paymentId: string) {
    await supabase.from('payments').update({ status: 'rejected' }).eq('id', paymentId)
    toast.success('Payment rejected')
    fetchPayments()
  }

  function getWALink(phone: string, templateId: string, profile: any): string {
    const fn = templates[templateId]
    if (!fn) return '#'
    const text = fn(profile.name || 'User', profile.plan)
    const number = phone.replace(/\D/g, '')
    const full = number.startsWith('91') ? number : `91${number}`

    // Use api.whatsapp.com instead of wa.me for better emoji support
    return `https://api.whatsapp.com/send?phone=${full}&text=${encodeURIComponent(text)}`
  }

  function getWAMessage(profile: any, templateId: string): string {
    const fn = templates[templateId]
    if (!fn) return ''
    return fn(profile.name || 'User', profile.plan)
  }

  const filtered = profiles.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="w-12 h-12 border-4 border-saffron-600 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-950">

      <nav className="bg-stone-900 border-b border-stone-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo variant="light" size="sm" />
          <span className="bg-saffron-600 text-white text-xs font-bold px-3 py-1 rounded-full">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { fetchStats(); fetchProfiles(); fetchPayments(); fetchAllProfiles() }}
            className="flex items-center gap-1.5 text-stone-400 hover:text-white text-sm transition-colors">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <Link href="/" className="text-stone-400 hover:text-white text-sm">View Site</Link>
          <button onClick={() => { supabase.auth.signOut(); router.push('/') }}
            className="flex items-center gap-1.5 text-stone-400 hover:text-red-400 text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-black text-white mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: Users, color: 'text-blue-400' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Premium', value: stats.premium, icon: Crown, color: 'text-yellow-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="text-stone-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex bg-stone-900 border border-stone-800 rounded-xl p-1 gap-1 flex-wrap">
            {[
              ['whatsapp', '💬 WhatsApp'],
              ['payments', '💳 Payments'],
              ['pending', '⏳ Pending'],
              ['approved', '✅ Approved'],
              ['all', 'All'],
            ].map(([t, l]) => (
              <button key={t} onClick={() => setTab(t as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${tab === t ? 'bg-saffron-600 text-white' : 'text-stone-400 hover:text-white'}`}>
                {l}
              </button>
            ))}
          </div>
          {tab !== 'payments' && tab !== 'whatsapp' && (
            <input type="text" placeholder="Search by name, city or phone..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-stone-900 border border-stone-700 text-white
                         placeholder:text-stone-500 rounded-xl px-4 py-2.5 text-sm
                         focus:outline-none focus:border-saffron-500"/>
          )}
        </div>

        {/* WHATSAPP TAB */}
        {tab === 'whatsapp' && (
          <div className="space-y-5">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
              <h2 className="text-white font-bold text-lg mb-1">💬 Send WhatsApp Message</h2>
              <p className="text-stone-400 text-sm mb-4">Search member → select template → send</p>
              <input type="text" placeholder="Search by name or phone..."
                value={waSearch} onChange={e => setWaSearch(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 text-white
                           placeholder:text-stone-500 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:border-green-500 mb-3"/>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allProfiles
                  .filter(p =>
                    p.name?.toLowerCase().includes(waSearch.toLowerCase()) ||
                    p.phone?.includes(waSearch)
                  )
                  .slice(0, 10)
                  .map(p => (
                    <div key={p.id}
                      onClick={() => { setWaSelected(p); setWaTemplate('') }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all
                        ${waSelected?.id === p.id
                          ? 'bg-green-900/30 border-green-600'
                          : 'bg-stone-800 border-stone-700 hover:border-stone-500'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0
                        ${p.gender === 'female' ? 'bg-pink-900 text-pink-400' : 'bg-blue-900 text-blue-400'}`}>
                        {p.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{p.name}</p>
                        <p className="text-stone-400 text-xs">
                          📞 {p.phone} •{' '}
                          <span className={p.status === 'approved' ? 'text-emerald-400' : p.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}>
                            {p.status}
                          </span>
                          {p.is_premium && <span className="text-yellow-400 ml-1">• {p.plan}</span>}
                        </p>
                      </div>
                      {waSelected?.id === p.id && <span className="text-green-400 text-xs font-bold">✓</span>}
                    </div>
                  ))}
              </div>
            </div>

            {waSelected && (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4 p-3 bg-green-900/20 border border-green-800 rounded-xl">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0
                    ${waSelected.gender === 'female' ? 'bg-pink-900 text-pink-400' : 'bg-blue-900 text-blue-400'}`}>
                    {waSelected.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">{waSelected.name}</p>
                    <p className="text-stone-400 text-xs">📞 +91 {waSelected.phone}</p>
                  </div>
                  <button onClick={() => { setWaSelected(null); setWaTemplate('') }}
                    className="text-stone-500 hover:text-white text-xs px-2.5 py-1.5 bg-stone-800 rounded-lg">
                    Change
                  </button>
                </div>

                <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-3">Choose Template:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {TEMPLATE_LIST.map(t => (
                    <button key={t.id} onClick={() => setWaTemplate(t.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all
                        ${waTemplate === t.id
                          ? 'bg-green-900/30 border-green-600 text-white'
                          : 'bg-stone-800 border-stone-700 text-stone-300 hover:border-stone-500'}`}>
                      <span className="text-base flex-shrink-0">{t.emoji}</span>
                      <span className="text-xs font-medium leading-tight">{t.label}</span>
                    </button>
                  ))}
                </div>

                {waTemplate && (
                  <>
                    <div className="bg-stone-800 rounded-2xl p-4 mb-4 border border-stone-700">
                      <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Preview:</p>
                      <pre className="text-white text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {getWAMessage(waSelected, waTemplate)}
                      </pre>
                    </div>
                    <a href={getWALink(waSelected.phone, waTemplate, waSelected)}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-green-600
                                 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      Send to {waSelected.name} on WhatsApp
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {tab === 'payments' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Payment Requests</h2>
              <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                {payments.filter(p => p.status === 'pending').length} pending
              </span>
            </div>
            {payments.length === 0 ? (
              <div className="text-center py-16 text-stone-500">
                <Crown className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No payment requests yet</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-800">
                {payments.map(pay => (
                  <div key={pay.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <p className="text-white font-bold">{pay.profile_name}</p>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold
                          ${pay.plan === 'gold' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-700'
                            : 'bg-blue-900/40 text-blue-400 border border-blue-700'}`}>
                          {pay.plan === 'gold' ? '👑 Gold ₹399' : '⚡ Silver ₹199'}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold
                          ${pay.status === 'confirmed' ? 'bg-emerald-900/40 text-emerald-400'
                            : pay.status === 'rejected' ? 'bg-red-900/40 text-red-400'
                              : 'bg-yellow-900/40 text-yellow-400'}`}>
                          {pay.status}
                        </span>
                      </div>
                      <div className="flex gap-4 text-stone-400 text-xs">
                        <span>📞 {pay.phone}</span>
                        <span>₹{pay.amount}</span>
                        <span>{new Date(pay.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                    {pay.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => confirmPayment(pay.id, pay.profile_id, pay.plan)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl">
                          ✓ Activate {pay.plan === 'gold' ? 'Gold' : 'Silver'}
                        </button>
                        <button onClick={() => rejectPayment(pay.id)}
                          className="bg-stone-800 text-stone-400 hover:text-red-400 text-sm font-bold px-4 py-2.5 rounded-xl border border-stone-700">
                          Reject
                        </button>
                      </div>
                    )}
                    {pay.status === 'confirmed' && <span className="text-emerald-400 text-sm font-bold">✓ Done</span>}
                    {pay.status === 'rejected' && <span className="text-red-400 text-sm font-bold">✗ Rejected</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILES TABLE */}
        {tab !== 'payments' && tab !== 'whatsapp' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-800 flex items-center justify-between">
              <span className="text-stone-400 text-sm">{filtered.length} profiles</span>
              <button onClick={fetchProfiles}
                className="text-stone-400 hover:text-white text-xs flex items-center gap-1">
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-stone-800">
              {['Name', 'Gender', 'Location', 'Status', 'Plan', 'Actions'].map(h => (
                <span key={h} className="text-stone-500 text-xs font-semibold uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-stone-500">
                <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No profiles found</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-800">
                {filtered.map(p => (
                  <div key={p.id}
                    className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 hover:bg-stone-800/50">
                    <div className="flex items-center gap-3">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0
                          ${p.gender === 'female' ? 'bg-pink-900 text-pink-400' : 'bg-blue-900 text-blue-400'}`}>
                          {p.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold text-sm">{p.name}</p>
                        <p className="text-stone-500 text-xs">{p.date_of_birth ? `${getAge(p.date_of_birth)} yrs` : ''} • {p.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold
                        ${p.gender === 'female' ? 'bg-pink-900 text-pink-300' : 'bg-blue-900 text-blue-300'}`}>
                        {p.gender === 'female' ? '♀ Bride' : '♂ Groom'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <p className="text-stone-400 text-xs">{p.city}, {p.state}</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                        ${p.status === 'approved' ? 'bg-emerald-900 text-emerald-400'
                          : p.status === 'pending' ? 'bg-yellow-900 text-yellow-400'
                            : 'bg-red-900 text-red-400'}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                        ${p.plan === 'gold' ? 'bg-yellow-900/30 text-yellow-400'
                          : p.plan === 'silver' ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-stone-800 text-stone-400'}`}>
                        {p.plan === 'gold' ? '👑 Gold' : p.plan === 'silver' ? '⚡ Silver' : 'Free'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(p.id, 'approved')}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                            <CheckCircle className="w-3 h-3" /> Approve
                          </button>
                          <button onClick={() => updateStatus(p.id, 'rejected')}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </>
                      )}
                      {p.status === 'approved' && (
                        <button onClick={() => updateStatus(p.id, 'rejected')}
                          className="flex items-center gap-1 bg-stone-700 hover:bg-red-900/50 text-stone-300 hover:text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg">
                          Suspend
                        </button>
                      )}
                      <button onClick={() => togglePremium(p.id, p.is_premium)}
                        className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg
                          ${p.is_premium ? 'bg-stone-700 text-stone-300 hover:bg-stone-600' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}>
                        <Crown className="w-3 h-3" />
                        {p.is_premium ? 'Remove' : '+ Premium'}
                      </button>
                      {!p.is_premium && (
                        <button onClick={() => activateTrial(p.id)}
                          className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                          🎁 Trial
                        </button>
                      )}
                      <Link href={`/profiles/${p.id}`}
                        className="flex items-center gap-1 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs font-semibold px-3 py-1.5 rounded-lg">
                        <Eye className="w-3 h-3" /> View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-black text-xl mb-1">Select Plan</h3>
            <p className="text-stone-400 text-sm mb-6">Choose plan to assign</p>
            <div className="space-y-3 mb-6">
              <button onClick={() => activatePlan(planModal, 'silver')}
                className="w-full flex items-center justify-between bg-stone-800 hover:bg-blue-900/40 border border-stone-700 hover:border-blue-500 text-white px-5 py-4 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div className="text-left">
                    <p className="font-bold group-hover:text-blue-300">Silver Plan</p>
                    <p className="text-stone-400 text-xs">1 month</p>
                  </div>
                </div>
                <span className="text-blue-400 font-black text-xl">₹199</span>
              </button>
              <button onClick={() => activatePlan(planModal, 'gold')}
                className="w-full flex items-center justify-between bg-stone-800 hover:bg-yellow-900/40 border border-stone-700 hover:border-yellow-500 text-white px-5 py-4 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👑</span>
                  <div className="text-left">
                    <p className="font-bold group-hover:text-yellow-300">Gold Plan</p>
                    <p className="text-stone-400 text-xs">3 months</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-black text-xl">₹399</span>
              </button>
            </div>
            <button onClick={() => setPlanModal(null)}
              className="w-full text-stone-500 hover:text-stone-300 text-sm py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

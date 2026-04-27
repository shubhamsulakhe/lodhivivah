'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Eye, Users, Crown, Clock, Shield, LogOut } from 'lucide-react'
import { getAge } from '@/lib/utils'
import toast from 'react-hot-toast'
import Logo from '@/components/Logo'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin]     = useState(false)
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<'payments'|'pending'|'approved'|'all'>('payments')
  const [profiles, setProfiles]   = useState<any[]>([])
  const [payments, setPayments]   = useState<any[]>([])
  const [stats, setStats]         = useState({ total:0, pending:0, approved:0, premium:0 })
  const [search, setSearch]       = useState('')
  const [planModal, setPlanModal] = useState<string | null>(null)

  useEffect(() => { checkAdmin() }, [])
  useEffect(() => { if (isAdmin) { fetchStats(); fetchPayments(); fetchProfiles() } }, [tab, isAdmin])

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
      total:    data.length,
      pending:  data.filter(p => p.status === 'pending').length,
      approved: data.filter(p => p.status === 'approved').length,
      premium:  data.filter(p => p.is_premium).length,
    })
  }

  async function fetchPayments() {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setPayments(data || [])
  }

  async function fetchProfiles() {
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (tab === 'pending')  q = q.eq('status', 'pending')
    if (tab === 'approved') q = q.eq('status', 'approved')
    const { data } = await q.limit(100)
    setProfiles(data || [])
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id)
    if (error) { toast.error('Error हुआ'); return }
    toast.success(status === 'approved' ? '✅ Profile Approved!' : '❌ Profile Rejected')
    fetchProfiles()
    fetchStats()
  }

  async function togglePremium(id: string, current: boolean) {
    if (current) {
      await supabase.from('profiles').update({
        is_premium: false, plan: 'free', premium_until: null
      }).eq('id', id)
      toast.success('Premium removed')
      fetchProfiles()
      fetchStats()
    } else {
      setPlanModal(id)
    }
  }

  async function activatePlan(profileId: string, plan: string) {
    const months       = plan === 'gold' ? 12 : 6
    const premiumUntil = new Date()
    premiumUntil.setMonth(premiumUntil.getMonth() + months)

    await supabase.from('profiles').update({
      is_premium:    true,
      plan,
      premium_until: premiumUntil.toISOString(),
    }).eq('id', profileId)

    toast.success(`✅ ${plan.toUpperCase()} activated!`)
    setPlanModal(null)
    fetchProfiles()
    fetchStats()
  }

async function confirmPayment(paymentId: string, profileId: string, plan: string) {
  console.log('confirmPayment called with:', { paymentId, profileId, plan })

  const months       = plan === 'gold' ? 12 : 6
  const premiumUntil = new Date()
  premiumUntil.setMonth(premiumUntil.getMonth() + months)

  const { error: profileError } = await supabase.from('profiles').update({
    is_premium:    true,
    plan,
    premium_until: premiumUntil.toISOString(),
  }).eq('id', profileId)

  console.log('Profile update error:', profileError)

  const { data: paymentData, error: paymentError } = await supabase
    .from('payments')
    .update({ status: 'confirmed' })
    .eq('id', paymentId)
    .select()

  console.log('Payment ID:', paymentId)
  console.log('Payment update data:', paymentData)
  console.log('Payment update error:', paymentError)

  if (profileError || paymentError) {
    toast.error('Error हुआ — check console')
    return
  }

  toast.success(`✅ ${plan.toUpperCase()} activated!`)
setTimeout(() => {
  fetchPayments()
  fetchStats()
}, 800)
}

  async function rejectPayment(paymentId: string) {
    await supabase.from('payments').update({ status: 'rejected' }).eq('id', paymentId)
    toast.success('Payment rejected')
    fetchPayments()
  }

  const filtered = profiles.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-stone-500">Checking admin access...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-950">

      {/* Admin Navbar */}
      <nav className="bg-stone-900 border-b border-stone-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo variant="light" size="sm"/>
          <span className="bg-saffron-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-stone-400 hover:text-white text-sm transition-colors">
            View Site
          </Link>
          <button
            onClick={() => { supabase.auth.signOut(); router.push('/') }}
            className="flex items-center gap-1.5 text-stone-400 hover:text-red-400 text-sm transition-colors">
            <LogOut className="w-4 h-4"/> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-black text-white mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Profiles', value: stats.total,    icon: Users,       color: 'text-blue-400' },
            { label: 'Pending Review', value: stats.pending,  icon: Clock,       color: 'text-yellow-400' },
            { label: 'Approved',       value: stats.approved, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Premium',        value: stats.premium,  icon: Crown,       color: 'text-yellow-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
              <Icon className={`w-5 h-5 ${color} mb-3`}/>
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="text-stone-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex bg-stone-900 border border-stone-800 rounded-xl p-1 gap-1 flex-wrap">
            {[
              ['payments', '💳 Payments'],
              ['pending',  '⏳ Pending'],
              ['approved', '✅ Approved'],
              ['all',      'All'],
            ].map(([t, l]) => (
              <button key={t} onClick={() => setTab(t as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${tab === t ? 'bg-saffron-600 text-white' : 'text-stone-400 hover:text-white'}`}>
                {l}
              </button>
            ))}
          </div>
          {tab !== 'payments' && (
            <input
              type="text"
              placeholder="Search by name, city or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-stone-900 border border-stone-700 text-white
                         placeholder:text-stone-500 rounded-xl px-4 py-2.5 text-sm
                         focus:outline-none focus:border-saffron-500"
            />
          )}
        </div>

        {/* PAYMENTS TAB */}
        {tab === 'payments' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">
                Payment Requests
              </h2>
              <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                {payments.filter(p => p.status === 'pending').length} pending
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-16 text-stone-500">
                <Crown className="w-10 h-10 mx-auto mb-3 opacity-30"/>
                <p>No payment requests yet</p>
                <p className="text-xs mt-1">When users request premium, they will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-800">
                {payments.map(pay => (
                  <div key={pay.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <p className="text-white font-bold text-lg">{pay.profile_name}</p>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold
                          ${pay.plan === 'gold'
                            ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-700'
                            : 'bg-blue-900/40 text-blue-400 border border-blue-700'}`}>
                          {pay.plan === 'gold' ? '👑 Gold Plan' : '⚡ Silver Plan'}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold
                          ${pay.status === 'confirmed' ? 'bg-emerald-900/40 text-emerald-400'
                            : pay.status === 'rejected' ? 'bg-red-900/40 text-red-400'
                            : 'bg-yellow-900/40 text-yellow-400'}`}>
                          {pay.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-stone-400 text-sm">
                        <span>📞 {pay.phone}</span>
                        <span>💰 ₹{pay.amount}</span>
                        <span>📅 {new Date(pay.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    {pay.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => confirmPayment(pay.id, pay.profile_id, pay.plan)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm
                                     font-bold px-4 py-2.5 rounded-xl transition-colors">
                          ✓ Activate {pay.plan === 'gold' ? 'Gold 👑' : 'Silver ⚡'}
                        </button>
                        <button
                          onClick={() => rejectPayment(pay.id)}
                          className="bg-stone-800 hover:bg-red-900/50 text-stone-400
                                     hover:text-red-400 text-sm font-bold px-4 py-2.5
                                     rounded-xl transition-colors border border-stone-700">
                          Reject
                        </button>
                      </div>
                    )}

                    {pay.status === 'confirmed' && (
                      <span className="text-emerald-400 text-sm font-bold">✓ Activated</span>
                    )}
                    {pay.status === 'rejected' && (
                      <span className="text-red-400 text-sm font-bold">✗ Rejected</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILES TABLE */}
        {tab !== 'payments' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-stone-800">
              {['Name & Details','Gender','Location','Status','Plan','Actions'].map(h => (
                <span key={h} className="text-stone-500 text-xs font-semibold uppercase tracking-wider">{h}</span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-stone-500">
                <Shield className="w-10 h-10 mx-auto mb-3 opacity-30"/>
                <p>No profiles found</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-800">
                {filtered.map(p => (
                  <div key={p.id}
                    className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4
                               hover:bg-stone-800/50 transition-colors">

                    {/* Name */}
                    <div className="flex items-center gap-3">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt=""
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"/>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                        font-bold text-sm flex-shrink-0
                          ${p.gender === 'female' ? 'bg-pink-900 text-pink-400' : 'bg-blue-900 text-blue-400'}`}>
                          {p.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold text-sm">{p.name}</p>
                        <p className="text-stone-500 text-xs">
                          {p.date_of_birth ? `${getAge(p.date_of_birth)} yrs` : ''} • {p.phone}
                        </p>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold
                        ${p.gender === 'female' ? 'bg-pink-900 text-pink-300' : 'bg-blue-900 text-blue-300'}`}>
                        {p.gender === 'female' ? '♀ Bride' : '♂ Groom'}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center">
                      <p className="text-stone-400 text-xs">{p.city}, {p.state}</p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                        ${p.status === 'approved' ? 'bg-emerald-900 text-emerald-400'
                          : p.status === 'pending' ? 'bg-yellow-900 text-yellow-400'
                          : 'bg-red-900 text-red-400'}`}>
                        {p.status}
                      </span>
                    </div>

                    {/* Plan */}
                    <div className="flex items-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                        ${p.plan === 'gold' ? 'bg-yellow-900/30 text-yellow-400'
                          : p.plan === 'silver' ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-stone-800 text-stone-400'}`}>
                        {p.plan === 'gold' ? '👑 Gold'
                          : p.plan === 'silver' ? '⚡ Silver'
                          : 'Free'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(p.id, 'approved')}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700
                                       text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                            <CheckCircle className="w-3 h-3"/> Approve
                          </button>
                          <button onClick={() => updateStatus(p.id, 'rejected')}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700
                                       text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                            <XCircle className="w-3 h-3"/> Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => togglePremium(p.id, p.is_premium)}
                        className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5
                                    rounded-lg transition-colors
                          ${p.is_premium
                            ? 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}>
                        <Crown className="w-3 h-3"/>
                        {p.is_premium ? 'Remove' : '+ Premium'}
                      </button>
                      <Link href={`/profiles/${p.id}`}
                        className="flex items-center gap-1 bg-stone-700 hover:bg-stone-600
                                   text-stone-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        <Eye className="w-3 h-3"/> View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Plan Selection Modal */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-black text-xl mb-1">Select Plan</h3>
            <p className="text-stone-400 text-sm mb-6">
              Choose which plan to assign to this member
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => activatePlan(planModal, 'silver')}
                className="w-full flex items-center justify-between bg-stone-800
                           hover:bg-blue-900/40 border border-stone-700 hover:border-blue-500
                           text-white px-5 py-4 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div className="text-left">
                    <p className="font-bold group-hover:text-blue-300 transition-colors">
                      Silver Plan
                    </p>
                    <p className="text-stone-400 text-xs">6 months access</p>
                  </div>
                </div>
                <span className="text-blue-400 font-black text-xl">₹499</span>
              </button>

              <button
                onClick={() => activatePlan(planModal, 'gold')}
                className="w-full flex items-center justify-between bg-stone-800
                           hover:bg-yellow-900/40 border border-stone-700 hover:border-yellow-500
                           text-white px-5 py-4 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👑</span>
                  <div className="text-left">
                    <p className="font-bold group-hover:text-yellow-300 transition-colors">
                      Gold Plan
                    </p>
                    <p className="text-stone-400 text-xs">12 months access</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-black text-xl">₹999</span>
              </button>
            </div>

            <button
              onClick={() => setPlanModal(null)}
              className="w-full text-stone-500 hover:text-stone-300 text-sm transition-colors py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

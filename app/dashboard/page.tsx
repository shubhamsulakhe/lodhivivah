'use client'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Notifications } from '@/lib/notifications'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import OnboardingBanner from '@/components/OnboardingBanner'
import Link from 'next/link'
import {
  Eye, Heart, CheckCircle, Crown, Edit,
  AlertCircle, Users, ArrowRight, Clock,
  MessageCircle, Sparkles, TrendingUp, Check, X
} from 'lucide-react'
import { getAge } from '@/lib/utils'
import toast from 'react-hot-toast'

function DashboardContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [interests, setInterests] = useState<any[]>([])
  const [sent, setSent] = useState<any[]>([])
  const [chats, setChats] = useState<any[]>([])
  const [tab, setTab] = useState<'received' | 'sent'>('received')

  useEffect(() => {
    if (params.get('new')) toast.success('Profile submitted! Under review 🎉', { duration: 5000 })
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    if (!prof) { router.push('/register'); return }
    setProfile(prof)
    setLoading(false)

    const { data: recv } = await supabase.from('interests')
      .select('*, sender:sender_id(id,name,photo_url,education,city,date_of_birth,gender,community,occupation)')
      .eq('receiver_id', prof.id).order('created_at', { ascending: false }).limit(20)
    setInterests(recv || [])

    const { data: sentData } = await supabase.from('interests')
      .select('*, receiver:receiver_id(id,name,photo_url,education,city,date_of_birth,gender,community,occupation)')
      .eq('sender_id', prof.id).order('created_at', { ascending: false }).limit(20)
    setSent(sentData || [])

    const { data: chatData } = await supabase.from('chats')
      .select('id,last_message,last_message_at')
      .or(`user1_id.eq.${prof.id},user2_id.eq.${prof.id}`)
      .order('last_message_at', { ascending: false }).limit(3)
    setChats(chatData || [])
  }

  async function respondToInterest(interestId: string, status: 'accepted' | 'rejected', senderId?: string) {
    const { error } = await supabase.from('interests').update({ status }).eq('id', interestId)
    if (error) { toast.error('Error occurred'); return }
    toast.success(status === 'accepted' ? 'Interest Accepted! 💝' : 'Interest Rejected')

    if (status === 'accepted' && senderId && profile) {
      const { data: existing } = await supabase.from('chats').select('id')
        .or(`and(user1_id.eq.${profile.id},user2_id.eq.${senderId}),and(user1_id.eq.${senderId},user2_id.eq.${profile.id})`)
        .maybeSingle()
      if (!existing) {
        const { data: chatData, error: chatErr } = await supabase.from('chats').insert({
          user1_id: profile.id, user2_id: senderId,
          last_message_at: new Date().toISOString(),
        }).select('id').single()
        
        if (!chatErr) toast.success('💬 Chat unlocked! Go to Messages to say hello.', { duration: 4000 })
        // Notify sender their interest was accepted
        await Notifications.interestAccepted(senderId, profile.name, chatData?.id || '')

      }
    }
    loadData()
  }

  function getCompleteness() {
    if (!profile) return 0
    const fields = ['name', 'date_of_birth', 'education', 'occupation', 'city', 'father_name', 'gotra', 'photo_url', 'about_me']
    return Math.round((fields.filter(f => profile[f] && profile[f] !== '').length / fields.length) * 100)
  }

  function getAvatarStyle(name: string, gender: string) {
    if (gender === 'female') return { background: '#fce7f3', color: '#9d174d' }
    return { background: '#dbeafe', color: '#1e40af' }
  }

  if (loading) return (
    <><Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20 bg-[#fffaf6]">
        <div className="w-10 h-10 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div></>
  )

  const completeness = getCompleteness()
  const pendingReceived = interests.filter(i => i.status === 'pending')
  const acceptedCount = interests.filter(i => i.status === 'accepted').length

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <Navbar />

      {/* Header */}
      <div className="pt-20 bg-[#7c2d12] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {profile.photo_url ? (
                <img src={profile.photo_url}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/30 flex-shrink-0"
                  alt="" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center
                                text-2xl font-black text-white flex-shrink-0"
                  style={{ fontFamily: 'Georgia,serif' }}>
                  {profile.name?.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-white/60 text-xs">Welcome back</p>
                <h1 className="text-white font-black text-xl" style={{ fontFamily: 'Georgia,serif' }}>
                  {profile.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {profile.is_premium ? (
                    <span className="flex items-center gap-1 bg-yellow-400/20 text-yellow-300
                                     text-xs font-bold px-2.5 py-0.5 rounded-full">
                      <Crown className="w-3 h-3 fill-yellow-300" />{profile.plan?.toUpperCase()}
                    </span>
                  ) : (
                    <span className="bg-white/20 text-white/70 text-xs px-2.5 py-0.5 rounded-full">Free</span>
                  )}
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold
                    ${profile.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300'
                      : profile.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'}`}>
                    {profile.status === 'approved' ? '✓ Verified'
                      : profile.status === 'pending' ? '⏳ Under Review'
                        : '✗ Rejected'}
                  </span>
                </div>
              </div>
            </div>
            <Link href="/profile/edit"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white
                         text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-colors">
              <Edit className="w-4 h-4" /> Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Alerts */}
        {profile.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-800 text-sm">Profile Under Review</p>
              <p className="text-stone-500 text-xs mt-0.5">Your profile will be reviewed within 24 hours. You'll be notified once approved.</p>
            </div>
          </div>
        )}
        {profile.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-800 text-sm">Profile Rejected</p>
              <p className="text-stone-500 text-xs mt-0.5 mb-2">Please update your profile with a clear photo and complete information.</p>
              <Link href="/profile/edit" className="text-xs font-bold text-red-600 hover:underline">Edit Profile →</Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Heart, label: 'Received', value: interests.length, color: 'text-pink-600', bg: 'bg-pink-50' },
            { icon: CheckCircle, label: 'Accepted', value: acceptedCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: Users, label: 'Sent', value: sent.length, color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: MessageCircle, label: 'Chats', value: chats.length, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-orange-100 text-center
                                        hover:border-orange-300 transition-colors">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="text-2xl font-black text-stone-900"
                style={{ fontFamily: 'Georgia,serif' }}>{value}</div>
              <div className="text-stone-400 text-xs mt-0.5">{label}</div>
            </div>

          ))}

          <OnboardingBanner profile={profile} completeness={profile.completeness || 0} />

        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left — Interests */}
          <div className="lg:col-span-2 space-y-5">

            {/* Profile completeness */}
            <div className="bg-white rounded-2xl border border-orange-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <h2 className="font-bold text-stone-900 text-sm">Profile Completeness</h2>
                </div>
                <span className="text-orange-600 font-black text-sm">{completeness}%</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-[#c2410c] to-orange-400 rounded-full transition-all duration-700"
                  style={{ width: `${completeness}%` }} />
              </div>
              {completeness < 100 && (
                <div className="flex items-center justify-between">
                  <p className="text-stone-400 text-xs">Complete profile for more visibility</p>
                  <Link href="/profile/edit"
                    className="text-orange-600 text-xs font-bold hover:underline flex items-center gap-1">
                    Complete <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Interests tabs */}
            <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
              <div className="flex border-b border-stone-100">
                {[
                  { id: 'received', label: `Received (${interests.length})`, badge: pendingReceived.length },
                  { id: 'sent', label: `Sent (${sent.length})` },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id as any)}
                    className={`flex-1 py-3.5 text-sm font-semibold transition-all relative
                      ${tab === t.id ? 'text-orange-600 border-b-2 border-orange-500' : 'text-stone-400 hover:text-stone-600'}`}>
                    {t.label}
                    {t.badge && t.badge > 0 && (
                      <span className="ml-2 bg-red-100 text-red-700 text-[10px] font-bold
                                       px-2 py-0.5 rounded-full">{t.badge} new</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-stone-50">
                {(tab === 'received' ? interests : sent).length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-8 h-8 text-stone-200 mx-auto mb-3" />
                    <p className="text-stone-400 text-sm font-medium">
                      {tab === 'received' ? 'No interests received yet' : 'No interests sent yet'}
                    </p>
                    {tab === 'sent' && (
                      <Link href="/profiles"
                        className="text-orange-600 text-xs font-semibold hover:underline mt-2 block">
                        Browse profiles →
                      </Link>
                    )}
                  </div>
                ) : (tab === 'received' ? interests : sent).map((interest) => {
                  const person = tab === 'received' ? interest.sender : interest.receiver
                  const personId = tab === 'received' ? interest.sender_id : interest.receiver_id
                  if (!person) return null
                  const avStyle = getAvatarStyle(person.name, person.gender)

                  return (
                    <div key={interest.id} className="flex items-center gap-3 p-4">
                      {/* Avatar */}
                      <Link href={`/profiles/${personId}`} className="flex-shrink-0">
                        {person.photo_url ? (
                          <img src={person.photo_url}
                            className="w-11 h-11 rounded-xl object-cover" alt="" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center
                                          text-base font-bold" style={avStyle}>
                            {person.name?.charAt(0)}
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <Link href={`/profiles/${personId}`} className="flex-1 min-w-0 group">
                        <p className="font-bold text-stone-900 text-sm truncate group-hover:text-orange-700 transition-colors">
                          {person.name}
                        </p>
                        <p className="text-stone-400 text-xs">
                          {person.date_of_birth ? `${getAge(person.date_of_birth)} yrs` : '?'}
                          {person.city ? ` · ${person.city}` : ''}
                          {person.community ? ` · ${person.community.replace('_', ' ')}` : ''}
                        </p>
                      </Link>

                      {/* Action */}
                      {tab === 'received' ? (
                        interest.status === 'pending' ? (
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => respondToInterest(interest.id, 'accepted', interest.sender_id)}
                              className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white
                                         rounded-xl flex items-center justify-center transition-colors">
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => respondToInterest(interest.id, 'rejected', interest.sender_id)}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600
                                         rounded-xl flex items-center justify-center transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2.5 py-1.5 rounded-xl font-bold
                              ${interest.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                              {interest.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                            </span>
                            {interest.status === 'accepted' && (
                              <Link href="/chat"
                                className="w-7 h-7 bg-orange-100 hover:bg-orange-200 text-orange-600
                                           rounded-lg flex items-center justify-center transition-colors">
                                <MessageCircle className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        )
                      ) : (
                        <span className={`text-xs px-2.5 py-1.5 rounded-xl font-bold flex-shrink-0
                          ${interest.status === 'accepted' ? 'bg-emerald-100 text-emerald-700'
                            : interest.status === 'rejected' ? 'bg-red-100 text-red-600'
                              : 'bg-yellow-100 text-yellow-700'}`}>
                          {interest.status === 'accepted' ? '✓ Accepted'
                            : interest.status === 'rejected' ? '✗ Rejected'
                              : '⏳ Pending'}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-orange-100 p-5">
              <h3 className="font-bold text-stone-900 text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { href: '/profiles', icon: Heart, label: 'Browse Profiles', hindi: 'प्रोफाइल देखें' },
                  { href: '/chat', icon: MessageCircle, label: 'Messages', hindi: 'मैसेज' },
                  { href: '/profile/edit', icon: Edit, label: 'Edit Profile', hindi: 'प्रोफाइल सुधारें' },
                  { href: '/premium', icon: Crown, label: 'Upgrade Plan', hindi: 'अपग्रेड करें' },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-orange-50
                               transition-colors group">
                    <div className="w-8 h-8 bg-orange-50 group-hover:bg-orange-100 rounded-lg
                                    flex items-center justify-center transition-colors flex-shrink-0">
                      <item.icon className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-stone-700">{item.label}</div>
                      <div className="text-[10px] text-stone-400">{item.hindi}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-orange-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent chats */}
            {chats.length > 0 && (
              <div className="bg-white rounded-2xl border border-orange-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-stone-900 text-sm">Recent Chats</h3>
                  <Link href="/chat" className="text-xs text-orange-600 font-semibold hover:underline">View all</Link>
                </div>
                <div className="space-y-3">
                  {chats.slice(0, 3).map(chat => (
                    <Link key={chat.id} href={`/chat/${chat.id}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-stone-500 truncate">{chat.last_message || 'Start chatting…'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade nudge */}
            {!profile.is_premium && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200
                              rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                  <h3 className="font-black text-stone-900 text-sm">Go Premium</h3>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed mb-4">
                  Unlock unlimited interests, view contacts, and voice calls.
                </p>
                <Link href="/premium"
                  className="flex items-center justify-center gap-2 bg-[#c2410c]
                             hover:bg-[#9a3412] text-white text-xs font-bold px-4 py-2.5
                             rounded-xl transition-colors">
                  <Sparkles className="w-3.5 h-3.5" /> Upgrade — ₹199/mo
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf6]">
        <div className="w-10 h-10 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
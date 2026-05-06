'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PremiumNudge from '@/components/PremiumNudge'
import Link from 'next/link'
import {
  Heart, MessageCircle, Phone, Crown, Shield,
  MapPin, Briefcase, GraduationCap, Users, Check,
  ChevronLeft, Flag, Share2, CheckCheck,
  Calendar, Home, Star
} from 'lucide-react'
import { getAge } from '@/lib/utils'
import toast from 'react-hot-toast'

const COMMUNITY_LABELS: Record<string, string> = {
  lodhi_kshatriya: 'Lodhi Kshatriya',
  pawar_kunbi: 'Pawar Kunbi',
  yadav: 'Yadav Samaj',
  kurmi: 'Kurmi Samaj',
  kirar: 'Kirar Samaj',
  teli: 'Teli Samaj',
  gond: 'Gond Samaj',
  rajput: 'Rajput Samaj',
  brahmin: 'Brahmin Samaj',
  kshatriya: 'Kshatriya Samaj',
  other: 'Other Community',
}

export default function ProfileDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const profileId = params?.id as string

  const [profile, setProfile] = useState<any>(null)
  const [myProfile, setMyProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [interest, setInterest] = useState<any>(null)
  const [chatId, setChatId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => { loadAll() }, [profileId])

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: me } = await supabase
      .from('profiles').select('*').eq('user_id', user.id).single()
    if (!me) { router.push('/onboard'); return }
    setMyProfile(me)

    const { data: prof } = await supabase
      .from('profiles').select('*').eq('id', profileId).single()
    if (!prof) { router.push('/profiles'); return }
    setProfile(prof)

    // Block direct access to admin profile
    if (prof.user_id === process.env.NEXT_PUBLIC_ADMIN_USER_ID) {
      router.push('/profiles')
      return
    }
    // Track profile view
    try {
      await supabase.from('profile_views').insert({
        viewer_id: me.id, viewed_id: prof.id
      })
    } catch (_) { }

    // Notify Gold profile owners of view
    if (prof.plan === 'gold') {
      try {
        await supabase.from('notifications').insert({
          user_id: prof.id,
          type: 'profile_viewed',
          title: `👀 ${me.name} ने आपकी profile देखी`,
          body: 'देखें किसने visit किया — Gold feature',
          link: `/profiles/${me.id}`,
          read: false,
        })
      } catch (_) { }
    }

    const { data: existingInterest } = await supabase
      .from('interests').select('*')
      .or(`and(sender_id.eq.${me.id},receiver_id.eq.${prof.id}),and(sender_id.eq.${prof.id},receiver_id.eq.${me.id})`)
      .maybeSingle()
    setInterest(existingInterest)

    const { data: chat } = await supabase
      .from('chats').select('id')
      .or(`and(user1_id.eq.${me.id},user2_id.eq.${prof.id}),and(user1_id.eq.${prof.id},user2_id.eq.${me.id})`)
      .maybeSingle()
    if (chat) setChatId(chat.id)

    const { data: block } = await supabase
      .from('blocks').select('id')
      .or(`and(blocker_id.eq.${me.id},blocked_id.eq.${prof.id}),and(blocker_id.eq.${prof.id},blocked_id.eq.${me.id})`)
      .maybeSingle()
    setIsBlocked(!!block)

    setLoading(false)
  }

  async function sendInterest() {
    if (!myProfile || !profile || sending) return
    setSending(true)
    try {
      const { data, error } = await supabase.from('interests').insert({
        sender_id: myProfile.id, receiver_id: profile.id, status: 'pending'
      }).select().single()
      if (error) throw error
      setInterest(data)
      toast.success('Interest sent! 💝')
      try {
        await supabase.from('notifications').insert({
          user_id: profile.id,
          type: 'interest_received',
          title: `💝 ${myProfile.name} ने आपको interest भेजा!`,
          body: `${myProfile.city || ''} से — profile देखें और reply करें`,
          link: `/profiles/${myProfile.id}`,
          read: false,
        })
      } catch (_) { }
    } catch (e: any) {
      if (e.message?.includes('unique')) toast.error('Interest already sent!')
      else toast.error('Failed to send interest')
    } finally { setSending(false) }
  }

  async function handleReport(reason: string) {
    try {
      await supabase.from('notifications').insert({
        user_id: process.env.NEXT_PUBLIC_ADMIN_USER_ID || '',
        type: 'report',
        title: `🚨 Profile reported: ${profile?.name}`,
        body: reason,
        link: '/admin',
        read: false,
      })
    } catch (_) { }
    toast.success('Report submitted. We will review within 24 hours.')
    setShowReport(false)
  }

  function canViewContact() {
    return myProfile?.is_premium && interest?.status === 'accepted'
  }

  const isMutualMatch = interest?.status === 'accepted'
  const iSentInterest = interest?.sender_id === myProfile?.id
  const theySentInterest = interest?.sender_id === profile?.id

  const avatarColors: Record<string, [string, string]> = {
    A: ['#fce7f3', '#9d174d'], B: ['#ede9fe', '#4c1d95'], C: ['#d1fae5', '#065f46'],
    D: ['#fef9c3', '#713f12'], E: ['#dbeafe', '#1e40af'], M: ['#fce7f3', '#9d174d'],
    P: ['#fce7f3', '#9d174d'], R: ['#ede9fe', '#4c1d95'], S: ['#d1fae5', '#065f46'],
    V: ['#fef9c3', '#713f12'],
  }
  function getAvBg(name: string) {
    const k = name?.charAt(0)?.toUpperCase() || 'A'
    return avatarColors[k] || ['#f1f5f9', '#475569']
  }

  if (loading) return (
    <div className="min-h-screen bg-[#fffaf6] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-stone-400 text-sm">Loading profile…</p>
      </div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-[#fffaf6] flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="font-semibold text-stone-700 mb-4">Profile not found</p>
        <Link href="/profiles" className="text-orange-600 font-semibold hover:underline">
          Browse profiles →
        </Link>
      </div>
    </div>
  )

  const [avBg, avColor] = getAvBg(profile.name)
  const communityLabel = COMMUNITY_LABELS[profile.community] || profile.community?.replace(/_/g, ' ') || 'Community'

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <Navbar />
      <div className="pt-16 sm:pt-20">

        {/* HERO */}
        <div className="relative">
          <div className="h-40 sm:h-56 bg-[#7c2d12] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.08]"
              style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-15 pointer-events-none"
              style={{ background: 'radial-gradient(circle,#f97316 0%,transparent 70%)', transform: 'translate(20%,-20%)' }} />
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
              <button onClick={() => router.back()}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white
                           text-sm font-medium px-3 py-2 rounded-xl border border-white/20
                           hover:bg-white/30 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: profile.name, url: window.location.href })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Link copied!')
                  }
                }}
                className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center
                           justify-center text-white hover:bg-white/30 transition-colors border border-white/20">
                <Share2 className="w-4 h-4" />
              </button>
              <button onClick={() => setShowReport(true)}
                className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center
                           justify-center text-white hover:bg-white/30 transition-colors border border-white/20">
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-20 mb-5 relative z-10">
              <div className="relative flex-shrink-0">
                {profile.photo_url && !imgError ? (
                  <img src={profile.photo_url} onError={() => setImgError(true)}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl object-cover
                               border-4 border-white shadow-xl"
                    alt={profile.name} />
                ) : (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl
                                  border-4 border-white shadow-xl flex items-center justify-center
                                  text-4xl sm:text-5xl font-black"
                    style={{ background: `linear-gradient(135deg,${avBg},${avBg}CC)`, color: avColor }}>
                    {profile.name?.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-emerald-500
                                rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#431407]"
                    style={{ fontFamily: 'Georgia,serif', letterSpacing: '-0.5px' }}>
                    {profile.name}
                  </h1>
                  {profile.plan === 'gold' && (
                    <span className="flex items-center gap-1 bg-yellow-100 border border-yellow-300
                                     text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      <Crown className="w-3 h-3 fill-yellow-600" />Gold
                    </span>
                  )}
                  {profile.plan === 'silver' && (
                    <span className="bg-slate-100 border border-slate-300 text-slate-700
                                     text-xs font-bold px-2.5 py-1 rounded-full">Silver</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-stone-500 text-sm">
                  {profile.date_of_birth && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {getAge(profile.date_of_birth)} years
                    </span>
                  )}
                  {(profile.city || profile.state) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {[profile.city, profile.state].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {communityLabel && (
                    <span className="flex items-center gap-1 bg-orange-50 text-orange-700
                                     border border-orange-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                      🏘️ {communityLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT */}
            <div className="lg:col-span-2 space-y-5">

              {isMutualMatch && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-emerald-800 text-sm">You matched! 🎉</p>
                    <p className="text-emerald-600 text-xs">You both accepted each other's interest</p>
                  </div>
                  {chatId && (
                    <Link href={`/chat/${chatId}`}
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600
                                 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex-shrink-0">
                      <MessageCircle className="w-3.5 h-3.5" /> Chat
                    </Link>
                  )}
                </div>
              )}

              {profile.about_me && (
                <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6">
                  <h2 className="font-bold text-stone-900 text-sm mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500 fill-orange-400" /> About
                    <span className="text-orange-500 text-xs font-normal">· अपने बारे में</span>
                  </h2>
                  <p className="text-stone-500 text-sm leading-relaxed">{profile.about_me}</p>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6">
                <h2 className="font-bold text-stone-900 text-sm mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" /> Personal Details
                  <span className="text-orange-500 text-xs font-normal">· व्यक्तिगत जानकारी</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Calendar, label: 'Age', hindi: 'उम्र', val: profile.date_of_birth ? `${getAge(profile.date_of_birth)} years` : null },
                    { icon: Users, label: 'Gender', hindi: 'लिंग', val: profile.gender === 'male' ? 'Male · पुरुष' : 'Female · महिला' },
                    { icon: Home, label: 'Height', hindi: 'ऊंचाई', val: profile.height_cm ? `${profile.height_cm} cm` : null },
                    { icon: Heart, label: 'Marital', hindi: 'विवाह स्थिति', val: profile.marital_status?.replace(/_/g, ' ') },
                    { icon: Star, label: 'Complexion', hindi: 'रंग', val: profile.complexion },
                    { icon: Users, label: 'Gotra', hindi: 'गोत्र', val: profile.gotra },
                  ].filter(r => r.val).map(row => (
                    <div key={row.label} className="bg-[#fffaf6] rounded-xl p-3 border border-orange-50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <row.icon className="w-3 h-3 text-orange-400" />
                        <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wide">{row.label}</span>
                      </div>
                      <div className="text-sm font-semibold text-stone-800 capitalize">{row.val}</div>
                      <div className="text-[9px] text-orange-400 mt-0.5">{row.hindi}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6">
                <h2 className="font-bold text-stone-900 text-sm mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-orange-500" /> Education & Career
                  <span className="text-orange-500 text-xs font-normal">· शिक्षा और करियर</span>
                </h2>
                <div className="space-y-3">
                  {[
                    { icon: GraduationCap, label: 'Education', hindi: 'शिक्षा', val: profile.education },
                    { icon: Briefcase, label: 'Occupation', hindi: 'व्यवसाय', val: profile.occupation },
                    { icon: Star, label: 'Income', hindi: 'आय', val: profile.annual_income },
                  ].filter(r => r.val).map(row => (
                    <div key={row.label} className="flex items-center gap-3 py-3 border-b border-stone-50 last:border-0">
                      <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <row.icon className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wide">
                          {row.label} · {row.hindi}
                        </div>
                        <div className="text-sm font-semibold text-stone-800 mt-0.5">{row.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-orange-100 p-5 sm:p-6">
                <h2 className="font-bold text-stone-900 text-sm mb-4 flex items-center gap-2">
                  <Home className="w-4 h-4 text-orange-500" /> Family Details
                  <span className="text-orange-500 text-xs font-normal">· परिवार</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Father', hindi: 'पिता', val: profile.father_name },
                    { label: 'Mother', hindi: 'माता', val: profile.mother_name },
                    { label: 'Brothers', hindi: 'भाई', val: profile.brothers != null ? `${profile.brothers}` : null },
                    { label: 'Sisters', hindi: 'बहन', val: profile.sisters != null ? `${profile.sisters}` : null },
                    { label: 'Family Type', hindi: 'परिवार', val: profile.family_type },
                    { label: 'Location', hindi: 'स्थान', val: [profile.city, profile.state].filter(Boolean).join(', ') || null },
                  ].filter(r => r.val).map(row => (
                    <div key={row.label} className="bg-[#fffaf6] rounded-xl p-3 border border-orange-50">
                      <div className="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">{row.label}</div>
                      <div className="text-sm font-semibold text-stone-800 capitalize">{row.val}</div>
                      <div className="text-[9px] text-orange-400 mt-0.5">{row.hindi}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#7c2d12] via-[#c2410c] to-[#f97316]" />
                <div className="p-5">
                  <div className="text-center mb-5 pb-5 border-b border-stone-100">
                    <div className="font-black text-stone-900 text-base" style={{ fontFamily: 'Georgia,serif' }}>
                      {profile.name?.split(' ')[0]}
                    </div>
                    <div className="text-stone-400 text-xs mt-1">
                      {profile.date_of_birth ? `${getAge(profile.date_of_birth)} yrs` : ''}
                      {profile.city ? ` · ${profile.city}` : ''}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700
                                       border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                        <Check className="w-2.5 h-2.5" /> Verified
                      </span>
                      {communityLabel && (
                        <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200
                                         px-2 py-0.5 rounded-full font-semibold">
                          {communityLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {!isBlocked ? (
                      <>
                        {/* Send Interest */}
                        {!interest ? (
                          <button onClick={sendInterest} disabled={sending}
                            className="w-full flex items-center justify-center gap-2 bg-[#c2410c]
                                       hover:bg-[#9a3412] text-white font-bold text-sm py-3.5
                                       rounded-2xl transition-all shadow-md shadow-orange-200
                                       disabled:opacity-60 hover:-translate-y-0.5">
                            {sending
                              ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              : <><Heart className="w-4 h-4" /> Send Interest</>}
                          </button>
                        ) : isMutualMatch ? (
                          <div className="w-full flex items-center justify-center gap-2
                                          bg-emerald-50 border border-emerald-200 text-emerald-700
                                          font-bold text-sm py-3 rounded-2xl cursor-default">
                            <CheckCheck className="w-4 h-4" /> Matched! 🎉
                          </div>
                        ) : iSentInterest ? (
                          <div className="w-full flex items-center justify-center gap-2
                                          bg-orange-50 border border-orange-200 text-orange-700
                                          font-bold text-sm py-3 rounded-2xl cursor-default">
                            <Heart className="w-4 h-4 fill-orange-400" /> Interest Sent
                          </div>
                        ) : theySentInterest ? (
                          <div className="flex gap-2">
                            <Link href="/dashboard"
                              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500
                                         hover:bg-emerald-600 text-white font-bold text-xs py-3
                                         rounded-xl transition-colors">
                              <Check className="w-3.5 h-3.5" /> Accept in Dashboard
                            </Link>
                          </div>
                        ) : null}

                        {/* Chat */}
                        {chatId && (
                          <Link href={`/chat/${chatId}`}
                            className="w-full flex items-center justify-center gap-2 bg-[#fffaf6]
                                       border border-orange-200 text-orange-700 font-bold text-sm
                                       py-3.5 rounded-2xl transition-all hover:bg-orange-50 hover:-translate-y-0.5">
                            <MessageCircle className="w-4 h-4" /> Open Chat
                          </Link>
                        )}

                        {/* Contact — mutual match required */}
                        {isMutualMatch && (
                          <div className={`rounded-2xl border overflow-hidden
                            ${canViewContact() ? 'border-orange-200' : 'border-stone-200'}`}>
                            {canViewContact() ? (
                              showContact ? (
                                <div className="p-4 bg-orange-50">
                                  <p className="text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wide">
                                    Contact Number
                                  </p>
                                  <p className="text-lg font-black text-[#431407]">
                                    +91 {profile.phone}
                                  </p>
                                  <a href={`tel:+91${profile.phone}`}
                                    className="mt-3 flex items-center justify-center gap-2 bg-[#c2410c]
                                               text-white text-xs font-bold px-4 py-2.5 rounded-xl w-full
                                               hover:bg-[#9a3412] transition-colors">
                                    <Phone className="w-3.5 h-3.5" /> Call Now
                                  </a>
                                </div>
                              ) : (
                                <button onClick={() => setShowContact(true)}
                                  className="w-full flex items-center justify-center gap-2 p-3.5
                                             text-orange-700 font-bold text-sm hover:bg-orange-50 transition-colors">
                                  <Phone className="w-4 h-4" /> View Contact
                                </button>
                              )
                            ) : (
                              <PremiumNudge type="contact" compact />
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-stone-50 rounded-2xl p-4 text-center border border-stone-200">
                        <p className="text-stone-400 text-sm">This profile is blocked</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-orange-700 mb-1">Safety First</p>
                    <p className="text-[11px] text-orange-600/80 leading-relaxed">
                      Always meet in public places. Involve your family. Never send money to someone you haven't met.
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={() => setShowReport(true)}
                className="w-full flex items-center justify-center gap-2 text-stone-400
                           hover:text-red-500 text-xs font-medium transition-colors py-2">
                <Flag className="w-3.5 h-3.5" /> Report this profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                        bg-black/50 px-4 pb-4 sm:pb-0"
          onClick={() => setShowReport(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-stone-900 text-base mb-1">Report Profile</h3>
            <p className="text-stone-400 text-xs mb-5">
              Select a reason. Our team reviews within 24 hours.
            </p>
            <div className="space-y-2 mb-5">
              {[
                'Fake profile / fake photo',
                'Inappropriate content',
                'Spam or scam',
                'Harassment',
                'Underage profile',
                'Other',
              ].map(reason => (
                <button key={reason} onClick={() => handleReport(reason)}
                  className="w-full text-left text-sm px-4 py-3 rounded-xl border border-stone-200
                             hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all">
                  {reason}
                </button>
              ))}
            </div>
            <button onClick={() => setShowReport(false)}
              className="w-full py-3 bg-stone-100 text-stone-600 font-semibold rounded-2xl text-sm
                         hover:bg-stone-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
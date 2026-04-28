'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  MapPin, GraduationCap, Briefcase, Heart, MessageCircle,
  Crown, CheckCircle, Lock, ArrowLeft, User, Calendar, Ruler
} from 'lucide-react'
import { getAge, cmToFeet } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProfileDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [myProfile, setMyProfile] = useState<any>(null)
  const [interestSent, setSent] = useState(false)
  const [interestStatus, setStatus] = useState<string | null>(null)
  const [interestId, setInterestId] = useState<string | null>(null)
  const [canSeeContact, setCanSee] = useState(false)
  const [freeViewUsed, setFreeView] = useState(false)
  const [showUnmatch, setShowUnmatch] = useState(false)
  const [dailyCount, setDailyCount] = useState(0)

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    // Load viewed profile
    const { data: prof } = await supabase
      .from('profiles').select('*').eq('id', id).single()
    setProfile(prof)
    setLoading(false)

    // Load current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: mine } = await supabase
      .from('profiles').select('*').eq('user_id', user.id).single()
    if (!mine) return
    setMyProfile(mine)

    // Check if admin
    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // Redirect if same gender — but NOT for admins
    if (prof && mine.gender === prof.gender && !adminCheck) {
      toast.error('Same gender profile नहीं देख सकते')
      router.push('/profiles')
      return
    }

    // Get today's interest count
    const today = new Date().toISOString().split('T')[0]
    const { data: limit } = await supabase
      .from('interest_limits')
      .select('count')
      .eq('profile_id', mine.id)
      .eq('date', today)
      .single()
    setDailyCount(limit?.count || 0)

    // Check interest status
    const { data: int } = await supabase
      .from('interests')
      .select('id, status')
      .eq('sender_id', mine.id)
      .eq('receiver_id', id as string)
      .single()

    if (int) {
      setSent(true)
      setStatus(int.status)
      setInterestId(int.id)
    }

    // Check reverse interest (they sent to me)
    const { data: reverseInt } = await supabase
      .from('interests')
      .select('id, status')
      .eq('sender_id', id as string)
      .eq('receiver_id', mine.id)
      .single()

    // Can see contact if:
    // 1. Premium member
    // 2. OR free member with mutual acceptance + hasn't used free view
    if (mine.is_premium) {
      setCanSee(true)
    } else {
      // Check if mutual match
      const myAccepted = int?.status === 'accepted'
      const theyAccepted = reverseInt?.status === 'accepted'
      const isMutualMatch = myAccepted || theyAccepted

      if (isMutualMatch) {
        // Check if free view already used
        const { data: viewed } = await supabase
          .from('contact_views')
          .select('id')
          .eq('viewer_id', mine.id)
          .eq('viewed_id', id as string)
          .single()

        if (!viewed) {
          setCanSee(true)  // First free view
          setFreeView(false)
        } else {
          setCanSee(false) // Already used free view
          setFreeView(true)
        }
      }
    }
  }

  async function sendInterest() {
    if (!myProfile) { toast.error('Login करें'); router.push('/login'); return }

    // Check daily limit
    if (!myProfile.is_premium && dailyCount >= 2) {
      toast.error('आज की 2 interests हो गई। कल try करें या Premium लें!')
      return
    }

    const { error } = await supabase.from('interests').insert({
      sender_id: myProfile.id, receiver_id: id
    })
    if (error) { toast.error('Error हुआ'); return }

    // Update daily count
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('interest_limits').upsert({
      profile_id: myProfile.id,
      date: today,
      count: dailyCount + 1,
    }, { onConflict: 'profile_id,date' })

    setSent(true)
    setStatus('pending')
    toast.success('Interest भेज दिया! 💝')
  }

  async function withdrawInterest() {
    if (!interestId) return
    const { error } = await supabase.from('interests').delete().eq('id', interestId)
    if (error) { toast.error('Error हुआ'); return }
    setSent(false)
    setStatus(null)
    setInterestId(null)
    setShowUnmatch(false)
    toast.success('Interest withdraw हो गई')
  }

  async function handleViewContact() {
    if (!myProfile) return

    // Record free view
    if (!myProfile.is_premium) {
      await supabase.from('contact_views').insert({
        viewer_id: myProfile.id,
        viewed_id: id,
      })
      setFreeView(true)
    }
  }

  function getWALink() {
    const num = `91${profile.whatsapp || profile.phone}`
    const msg = `नमस्ते! मैंने LodhiVivah पर आपकी profile देखी। मैं ${myProfile?.name} हूँ।`
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
  }

  if (loading) return (
    <><Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin mx-auto" />
      </div></>
  )

  if (!profile) return (
    <><Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-stone-700 mb-4">Profile नहीं मिली</h2>
          <Link href="/profiles" className="btn btn-primary btn-md">Back to Profiles</Link>
        </div>
      </div></>
  )

  const age = getAge(profile.date_of_birth)
  const isFemale = profile.gender === 'female'

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-cream">
        <div className="container py-8">
          <Link href="/profiles"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-saffron-600 text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Profiles
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT — Photo + Actions */}
            <div className="lg:col-span-1">
              <div className="card overflow-hidden mb-5">
                <div className="relative h-80">
                  {profile.photo_url ? (
                    <img src={profile.photo_url} alt={profile.name}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-8xl
                      ${isFemale
                        ? 'bg-gradient-to-br from-pink-100 to-rose-200'
                        : 'bg-gradient-to-br from-blue-100 to-indigo-200'}`}>
                      {profile.name?.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h1 className="text-white font-bold text-2xl">{profile.name}</h1>
                    <p className="text-white/80 text-sm mt-1">
                      {age} years • {cmToFeet(profile.height_cm || 160)}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {/* Show "Verified" badge only if profile is approved, and show */}
                      {profile.status === 'approved' ? (
                        <span className="badge-verified flex items-center gap-1 text-xs">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      ) : profile.status === 'pending' ? (
                        <span className="badge-pending flex items-center gap-1 text-xs">
                          ⏳ Pending
                        </span>
                      ) : profile.status === 'rejected' ? (
                        <span className="badge flex items-center gap-1 text-xs bg-red-100 text-red-600">
                          ✗ Rejected
                        </span>
                      ) : null}
                      <span className={`badge text-xs ${isFemale ? 'badge-female' : 'badge-male'}`}>
                        {isFemale ? '♀ Bride' : '♂ Groom'}
                      </span>
                      {profile.is_premium && (
                        <span className="badge-gold flex items-center gap-1 text-xs">
                          <Crown className="w-3 h-3 fill-yellow-500" /> {profile.plan?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="p-5 grid grid-cols-2 gap-4">
                  {[
                    { icon: Calendar, label: 'Age', value: `${age} years` },
                    { icon: Ruler, label: 'Height', value: cmToFeet(profile.height_cm || 160) },
                    { icon: GraduationCap, label: 'Education', value: profile.education || 'N/A' },
                    { icon: Briefcase, label: 'Occupation', value: profile.occupation || 'N/A' },
                    { icon: MapPin, label: 'Location', value: `${profile.city}, ${profile.state}` },
                    { icon: User, label: 'Gotra', value: profile.gotra || 'N/A' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-stone-400 font-medium mb-0.5 flex items-center gap-1">
                        <Icon className="w-3 h-3 text-saffron-400" />{label}
                      </p>
                      <p className="text-sm font-semibold text-stone-800 truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Interest button */}
                {!interestSent ? (
                  <button onClick={sendInterest} className="btn btn-primary btn-md w-full justify-center">
                    <Heart className="w-4 h-4" /> Interest भेजें
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className={`w-full py-3 rounded-2xl text-sm font-bold text-center
                      ${interestStatus === 'accepted' ? 'bg-green-100 text-green-700'
                        : interestStatus === 'rejected' ? 'bg-red-100 text-red-600'
                          : 'bg-pink-50 text-pink-600'}`}>
                      {interestStatus === 'accepted' ? '✅ Interest Accepted!'
                        : interestStatus === 'rejected' ? '❌ Interest Rejected'
                          : '💝 Interest Sent — Pending'}
                    </div>
                    {/* Withdraw button */}
                    {interestStatus !== 'rejected' && (
                      <button onClick={() => setShowUnmatch(true)}
                        className="w-full py-2.5 rounded-2xl text-sm font-semibold text-center
                                   bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600
                                   transition-colors border border-stone-200">
                        Withdraw Interest
                      </button>
                    )}
                  </div>
                )}

                {/* WhatsApp button */}
                {canSeeContact ? (
                  <a href={getWALink()} target="_blank" rel="noopener noreferrer"
                    onClick={handleViewContact}
                    className="btn btn-outline btn-md w-full justify-center">
                    <MessageCircle className="w-4 h-4" /> WhatsApp करें
                  </a>
                ) : freeViewUsed ? (
                  <div className="space-y-2">
                    <div className="w-full py-3 rounded-2xl text-sm font-bold text-center
                                    bg-stone-50 text-stone-500 border border-stone-200">
                      🔒 Free contact view used
                    </div>
                    <Link href="/premium"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                                 bg-yellow-50 border-2 border-yellow-300 text-yellow-700 font-bold
                                 text-sm hover:bg-yellow-100 transition-colors">
                      <Crown className="w-4 h-4" /> Upgrade for unlimited contacts
                    </Link>
                  </div>
                ) : (
                  <Link href="/premium"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                               bg-yellow-50 border-2 border-yellow-300 text-yellow-700 font-bold
                               text-sm hover:bg-yellow-100 transition-colors">
                    <Lock className="w-4 h-4" /> Contact देखने के लिए Upgrade करें
                  </Link>
                )}
              </div>
            </div>

            {/* RIGHT — Full Details */}
            <div className="lg:col-span-2 space-y-5">
              {profile.about_me && (
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-stone-900 mb-3">
                    About {profile.name.split(' ')[0]}
                  </h2>
                  <p className="text-stone-600 leading-relaxed italic">"{profile.about_me}"</p>
                </div>
              )}

              <div className="card p-6">
                <h2 className="text-lg font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
                  Personal Details
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {[
                    { label: 'Date of Birth', value: profile.date_of_birth },
                    { label: 'Height', value: cmToFeet(profile.height_cm || 160) },
                    { label: 'Complexion', value: profile.complexion },
                    { label: 'Marital Status', value: profile.marital_status?.replace('_', ' ') },
                    { label: 'Manglik', value: profile.manglik ? 'Yes' : 'No' },
                    { label: 'Annual Income', value: profile.annual_income || 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-stone-400 mb-1">{label}</p>
                      <p className="text-sm font-semibold text-stone-800 capitalize">{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
                  Education & Career
                </h2>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: 'Education', value: profile.education },
                    { label: 'Details', value: profile.education_detail },
                    { label: 'Occupation', value: profile.occupation },
                    { label: 'Work Details', value: profile.occupation_detail },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-stone-400 mb-1">{label}</p>
                      <p className="text-sm font-semibold text-stone-800">{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
                  Family Details
                </h2>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: "Father's Name", value: profile.father_name },
                    { label: "Father's Occupation", value: profile.father_occupation },
                    { label: "Mother's Name", value: profile.mother_name },
                    { label: 'Gotra', value: profile.gotra },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-stone-400 mb-1">{label}</p>
                      <p className="text-sm font-semibold text-stone-800">{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact section */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
                  Contact Details
                </h2>
                {canSeeContact ? (
                  <div className="grid grid-cols-2 gap-5">
                    {[
                      { label: 'Mobile', value: `+91 ${profile.phone}` },
                      { label: 'WhatsApp', value: `+91 ${profile.whatsapp || profile.phone}` },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-stone-400 mb-1">{label}</p>
                        <p className="text-sm font-bold text-saffron-700">{value}</p>
                      </div>
                    ))}
                    {!myProfile?.is_premium && (
                      <div className="col-span-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <p className="text-yellow-700 text-xs font-medium">
                          ⚠️ यह आपका 1 free contact view है।
                          Premium लें for unlimited contacts.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center">
                    <Lock className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-600 font-semibold mb-1">Contact Details locked</p>
                    <p className="text-stone-400 text-sm mb-4">
                      {freeViewUsed
                        ? 'Free view use हो गई। Premium लें unlimited contacts के लिए।'
                        : 'Interest accept होने पर 1 free view मिलेगी। या Premium लें।'
                      }
                    </p>
                    <Link href="/premium" className="btn btn-primary btn-sm">
                      <Crown className="w-4 h-4" /> Upgrade — ₹499
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Unmatch Confirmation Modal */}
      {showUnmatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-black text-stone-900 text-lg mb-2">Interest Withdraw करें?</h3>
            <p className="text-stone-500 text-sm mb-6">
              क्या आप सच में इस profile से interest withdraw करना चाहते हैं?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowUnmatch(false)}
                className="flex-1 btn btn-outline btn-md">
                Cancel
              </button>
              <button onClick={withdrawInterest}
                className="flex-1 btn btn-danger btn-md bg-red-500 hover:bg-red-600
                           text-white rounded-2xl font-bold py-3">
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

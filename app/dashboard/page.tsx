'use client'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  Eye, Heart, CheckCircle, Crown, Edit,
  AlertCircle, Users, ArrowRight, Clock
} from 'lucide-react'
import { getAge } from '@/lib/utils'
import toast from 'react-hot-toast'

function DashboardContent() {
  const router  = useRouter()
  const params  = useSearchParams()
  const [profile, setProfile]     = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [interests, setInterests] = useState<any[]>([])
  const [sent, setSent]           = useState<any[]>([])

  useEffect(() => {
    if (params.get('new')) toast.success('Profile submit हो गई! Review में है 🎉')
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
      .select('*, sender:sender_id(name, photo_url, education, city, date_of_birth, gender)')
      .eq('receiver_id', prof.id).order('created_at', { ascending: false }).limit(20)
    setInterests(recv || [])
    const { data: sentData } = await supabase.from('interests')
      .select('*, receiver:receiver_id(name, photo_url, education, city, date_of_birth, gender)')
      .eq('sender_id', prof.id).order('created_at', { ascending: false }).limit(20)
    setSent(sentData || [])
  }

  async function respondToInterest(interestId: string, status: 'accepted' | 'rejected') {
    const { error } = await supabase.from('interests').update({ status }).eq('id', interestId)
    if (error) { toast.error('Error हुआ'); return }
    toast.success(status === 'accepted' ? 'Interest Accept! 💝' : 'Rejected')
    loadData()
  }

  function getCompleteness(): number {
    if (!profile) return 0
    const fields = ['name','date_of_birth','education','occupation','city','father_name','gotra','photo_url','about_me']
    const filled = fields.filter(f => profile[f] && profile[f] !== '').length
    return Math.round((filled / fields.length) * 100)
  }

  if (loading) return (
    <><Navbar /><div className="min-h-screen flex items-center justify-center pt-20">
      <div className="w-10 h-10 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin" />
    </div></>
  )

  const completeness    = getCompleteness()
  const pendingReceived = interests.filter(i => i.status === 'pending')

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-cream">
        <div className="bg-gradient-to-r from-saffron-800 via-saffron-700 to-saffron-500 py-10">
          <div className="container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black text-white">
                  {profile.name?.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-white/70 text-sm">नमस्ते 🙏</p>
                <h1 className="text-white font-black text-2xl">{profile.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {profile.is_premium ? (
                    <span className="flex items-center gap-1 bg-yellow-400/20 text-yellow-300 text-xs font-bold px-3 py-1 rounded-full">
                      <Crown className="w-3 h-3 fill-yellow-300" />{profile.plan?.toUpperCase()} Member
                    </span>
                  ) : (
                    <span className="bg-white/20 text-white/80 text-xs px-3 py-1 rounded-full">Free Member</span>
                  )}
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold
                    ${profile.status === 'approved' ? 'bg-emerald-500/20 text-emerald-200'
                      : profile.status === 'pending' ? 'bg-yellow-500/20 text-yellow-200'
                      : 'bg-red-500/20 text-red-200'}`}>
                    {profile.status === 'approved' ? '✓ Verified' : profile.status === 'pending' ? '⏳ Review में' : '✗ Rejected'}
                  </span>
                </div>
              </div>
            </div>
            <Link href="/profile/edit" className="btn btn-white btn-sm">
              <Edit className="w-4 h-4" /> Edit Profile
            </Link>
          </div>
        </div>

        <div className="container py-8 space-y-6">
          {profile.status === 'pending' && (
            <div className="card p-4 border-l-4 border-yellow-400 flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-800">Profile Review में है</p>
                <p className="text-stone-500 text-sm">आपकी profile 24 घंटे में review होगी।</p>
              </div>
            </div>
          )}
          {profile.status === 'rejected' && (
            <div className="card p-4 border-l-4 border-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-800">Profile Rejected हुई</p>
                <p className="text-stone-500 text-sm mb-2">Profile edit करके दोबारा submit करें।</p>
                <Link href="/profile/edit" className="btn btn-outline btn-sm">Edit Profile</Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Heart,       label: 'Interests Received', value: interests.length,                                      color: 'bg-pink-50 text-pink-600' },
              { icon: CheckCircle, label: 'Accepted',           value: interests.filter(i => i.status === 'accepted').length,  color: 'bg-emerald-50 text-emerald-600' },
              { icon: Users,       label: 'Sent Interests',     value: sent.length,                                           color: 'bg-purple-50 text-purple-600' },
              { icon: Eye,         label: 'Pending',            value: pendingReceived.length,                                color: 'bg-orange-50 text-orange-600' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card p-5 text-center">
                <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-stone-900">{value}</div>
                <div className="text-stone-400 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-stone-900">Profile Completeness</h2>
              <span className="text-saffron-600 font-black text-lg">{completeness}%</span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-saffron-600 to-saffron-400 rounded-full transition-all duration-1000"
                style={{ width: `${completeness}%` }} />
            </div>
            {completeness < 100 && (
              <div className="flex items-center justify-between">
                <p className="text-stone-400 text-sm">Profile पूरी करें — ज्यादा responses मिलेंगे</p>
                <Link href="/profile/edit" className="text-saffron-600 text-sm font-bold hover:underline flex items-center gap-1">
                  Complete करें <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {!profile.is_premium && (
            <div className="card p-6 bg-gradient-to-r from-saffron-50 to-yellow-50 border-2 border-saffron-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                    <h2 className="font-black text-stone-900">Premium में Upgrade करें</h2>
                  </div>
                  <p className="text-stone-600 text-sm">Contact details देखें, unlimited interests भेजें</p>
                </div>
                <Link href="/premium" className="btn btn-primary btn-md whitespace-nowrap">
                  <Crown className="w-4 h-4" /> Upgrade — ₹499
                </Link>
              </div>
            </div>
          )}

          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" /> Received Interests ({interests.length})
              </h2>
              {pendingReceived.length > 0 && (
                <span className="badge bg-red-100 text-red-700 text-xs">{pendingReceived.length} pending</span>
              )}
            </div>
            {interests.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">अभी कोई interest नहीं आई</p>
                <p className="text-sm mt-1">Profile approve होने के बाद interests आने लगेंगी</p>
              </div>
            ) : (
              <div className="space-y-3">
                {interests.map((interest) => (
                  <div key={interest.id} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
                    {interest.sender?.photo_url ? (
                      <img src={interest.sender.photo_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0
                        ${interest.sender?.gender === 'female' ? 'bg-pink-100 text-pink-400' : 'bg-blue-100 text-blue-400'}`}>
                        {interest.sender?.name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900">{interest.sender?.name}</p>
                      <p className="text-stone-500 text-xs truncate">
                        {interest.sender?.date_of_birth ? getAge(interest.sender.date_of_birth) : '?'} yrs • {interest.sender?.education} • {interest.sender?.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {interest.status === 'pending' ? (
                        <>
                          <button onClick={() => respondToInterest(interest.id, 'accepted')}
                            className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors">
                            Accept
                          </button>
                          <button onClick={() => respondToInterest(interest.id, 'rejected')}
                            className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-xl font-bold hover:bg-red-200 transition-colors">
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className={`text-xs px-3 py-1.5 rounded-xl font-bold
                          ${interest.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {interest.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {sent.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-5 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-saffron-500" /> Sent Interests ({sent.length})
              </h2>
              <div className="space-y-3">
                {sent.map((interest) => (
                  <div key={interest.id} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
                    {interest.receiver?.photo_url ? (
                      <img src={interest.receiver.photo_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0
                        ${interest.receiver?.gender === 'female' ? 'bg-pink-100 text-pink-400' : 'bg-blue-100 text-blue-400'}`}>
                        {interest.receiver?.name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900">{interest.receiver?.name}</p>
                      <p className="text-stone-500 text-xs truncate">
                        {interest.receiver?.date_of_birth ? getAge(interest.receiver.date_of_birth) : '?'} yrs • {interest.receiver?.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-3 py-1.5 rounded-xl font-bold
                        ${interest.status === 'accepted' ? 'bg-emerald-100 text-emerald-700'
                          : interest.status === 'rejected' ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-700'}`}>
                        {interest.status === 'accepted' ? '✓ Accepted' : interest.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                      </span>
                      <Link href={`/profiles/${interest.receiver_id}`}
                        className="text-xs bg-saffron-50 text-saffron-700 px-3 py-1.5 rounded-xl font-bold hover:bg-saffron-100">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

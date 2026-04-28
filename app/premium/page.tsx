'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  CheckCircle, Crown, Zap, Gift, Phone,
  MessageCircle, Copy, X, Star
} from 'lucide-react'
import toast from 'react-hot-toast'

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, period: 'हमेशा के लिए',
    icon: '🆓', popular: false, primary: false,
    features: [
      { text: 'Profile create करें', ok: true },
      { text: 'सभी profiles browse करें', ok: true },
      { text: '5 interests/month', ok: true },
      { text: 'Basic search filters', ok: true },
      { text: 'Contact numbers देखें', ok: false },
      { text: 'WhatsApp connect', ok: false },
      { text: 'Unlimited interests', ok: false },
      { text: 'Featured profile badge', ok: false },
    ],
  },
  {
    id: 'silver', name: 'Silver', price: 499, period: '6 महीने',
    icon: '⚡', popular: true, primary: true,
    features: [
      { text: 'Profile create करें', ok: true },
      { text: 'सभी profiles browse करें', ok: true },
      { text: 'Unlimited interests', ok: true },
      { text: 'Advanced search filters', ok: true },
      { text: 'Contact numbers देखें', ok: true },
      { text: 'WhatsApp connect', ok: true },
      { text: 'Priority listing', ok: true },
      { text: 'Featured profile badge', ok: false },
    ],
  },
  {
    id: 'gold', name: 'Gold', price: 999, period: '12 महीने',
    icon: '👑', popular: false, primary: false,
    features: [
      { text: 'Profile create करें', ok: true },
      { text: 'सभी profiles browse करें', ok: true },
      { text: 'Unlimited interests', ok: true },
      { text: 'Advanced search filters', ok: true },
      { text: 'Contact numbers देखें', ok: true },
      { text: 'WhatsApp connect', ok: true },
      { text: 'Featured profile badge', ok: true },
      { text: 'Top placement in search', ok: true },
    ],
  },
]

const UPI_ID = 'shubhamsulakhe111-3@oksbi'      // ← change to your real UPI id
const WHATSAPP = '918770607574'      // ← your number

export default function PremiumPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedPlan, setSelected] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('profiles').select('id, name, phone, plan, is_premium')
          .eq('user_id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })
  }, [])

  // When user clicks "Get Plan" button silver/gold
  async function handlePlanClick(plan: any) {
    if (plan.id === 'free') return
    if (!user) {
      toast.error('Please login first to upgrade')
      window.location.href = '/login'
      return
    }
    setSelected(plan)

    // Save payment request to database
    if (profile) {
      const { error } = await supabase.from('payments').insert({
        profile_id: profile.id,
        profile_name: profile.name,
        phone: profile.phone,
        plan: plan.id,
        amount: plan.price,
        status: 'pending',
      })
      console.log('Payment insert error:', error)
    } else {
      console.log('Profile is null — cannot save payment')
    }

    setShowModal(true)
  }

  function copyUPI() {
    navigator.clipboard.writeText(UPI_ID)
    toast.success('UPI ID copied!')
  }

  function getWAMessage(plan: any) {
    return `नमस्ते! मुझे LodhiVivah पर ${plan?.name} Membership (₹${plan?.price}) लेनी है।\nMy Name: ${profile?.name || ''}\nPhone: ${profile?.phone || ''}\nकृपया payment details बताएं।`
  }

  // For mobile users, this will open WhatsApp with a pre-filled message
  function getUPILink(amount: number, planName: string) {
    const upiId = 'shubhamsulakhe111-3@oksbi' // ← replace with your real UPI ID
    const note = `LodhiVivah ${planName} - ${profile?.name || ''}`
    return `upi://pay?pa=${upiId}&pn=LodhiVivah&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-cream">

        {/* Header */}
        <div className="bg-gradient-to-r from-saffron-800 to-saffron-500 py-16 text-center">
          <div className="container">
            <Crown className="w-12 h-12 text-yellow-300 fill-yellow-300 mx-auto mb-4" />
            <h1 className="text-4xl font-black text-white mb-3">Premium Plans</h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Contact details देखें, unlimited interests भेजें, जीवनसाथी खोजें
            </p>
            {profile?.is_premium && (
              <div className="mt-5 inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-300/40 text-yellow-200 px-5 py-2.5 rounded-full font-semibold">
                <Crown className="w-4 h-4 fill-yellow-300" />
                आप पहले से {profile.plan?.toUpperCase()} Member हैं 🎉
              </div>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map(plan => (
              <div key={plan.id}
                className={`card p-8 flex flex-col relative border-2 transition-all duration-300
                  ${plan.popular
                    ? 'border-saffron-400 shadow-glow scale-105'
                    : plan.id === 'gold'
                      ? 'border-yellow-300'
                      : 'border-stone-200'}`}>

                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-saffron-500 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg">
                      ✦ सबसे लोकप्रिय
                    </span>
                  </div>
                )}

                <div className="text-4xl mb-4">{plan.icon}</div>
                <h2 className="text-2xl font-black text-stone-900">{plan.name}</h2>
                <div className="mt-3 mb-1">
                  <span className={`text-5xl font-black
                    ${plan.id === 'gold' ? 'text-yellow-500' : plan.id === 'silver' ? 'text-saffron-600' : 'text-stone-400'}`}>
                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                  </span>
                </div>
                <p className="text-stone-400 text-sm mb-7">{plan.period}</p>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map(f => (
                    <li key={f.text}
                      className={`flex items-center gap-2.5 text-sm ${f.ok ? 'text-stone-700' : 'text-stone-300'}`}>
                      {f.ok
                        ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        : <div className="w-4 h-4 border-2 border-stone-200 rounded-full flex-shrink-0" />
                      }
                      {f.text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.id === 'free' ? (
                  <Link href={user ? '/profiles' : '/login'}
                    className="btn btn-outline btn-md w-full justify-center">
                    {user ? 'Browse Profiles' : 'Login / Register'}
                  </Link>
                ) : profile?.plan === plan.id ? (
                  <div className="w-full py-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-200
                                  text-emerald-700 font-bold text-sm text-center">
                    ✓ Current Plan
                  </div>
                ) : (
                  <button onClick={() => handlePlanClick(plan)}
                    className={`btn btn-md w-full justify-center
                      ${plan.primary ? 'btn-primary' : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-2xl'}`}>
                    Get {plan.name} →
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Benefits section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-stone-900 text-center mb-10">Premium के फायदे</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Phone, color: 'bg-green-100 text-green-600', title: 'Contact Details', desc: 'Phone और WhatsApp number directly देखें' },
                { icon: Zap, color: 'bg-blue-100 text-blue-600', title: 'Unlimited Interests', desc: 'जितने चाहें उतने profiles को interest भेजें' },
                { icon: Star, color: 'bg-yellow-100 text-yellow-600', title: 'Featured Profile', desc: 'आपकी profile search में सबसे ऊपर दिखेगी' },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="card p-5 text-center">
                  <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-stone-900 mb-1">{title}</h3>
                  <p className="text-stone-500 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 max-w-2xl mx-auto card p-6 bg-saffron-50 border border-saffron-100 text-center">
            <div className="text-3xl mb-3">💑</div>
            <p className="text-stone-600 italic mb-3">
              "Premium लेने के बाद 2 हफ्ते में contact मिली और अब हमारी शादी पक्की हो गई!"
            </p>
            <p className="text-saffron-600 font-bold text-sm">— Kavita & Rahul, Balaghat</p>
          </div>
        </div>
      </main>

      {showModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="bg-gradient-to-r from-saffron-700 to-saffron-500 p-5 flex items-center justify-between sticky top-0">
              <div>
                <p className="text-white/75 text-xs">Upgrading to</p>
                <h3 className="text-white font-black text-xl">{selectedPlan.icon} {selectedPlan.name} — ₹{selectedPlan.price}</h3>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Step 1 */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                  Step 1 — Pay via UPI
                </p>
                <a href={getUPILink(selectedPlan.price, selectedPlan.name)}
                  className="flex items-center justify-center gap-2 w-full bg-saffron-500 text-white font-bold py-3 rounded-xl mb-3 text-sm">
                  📱 Pay ₹{selectedPlan.price} via UPI App
                </a>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-xs font-bold text-stone-400">OR</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>
                <div className="flex items-center justify-between bg-white border border-stone-200 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-[10px] text-stone-400">UPI ID</p>
                    <p className="font-bold text-stone-900 text-sm">{UPI_ID}</p>
                  </div>
                  <button onClick={copyUPI}
                    className="bg-saffron-50 text-saffron-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Copy className="w-3 h-3" />Copy
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                  Step 2 — Send Screenshot
                </p>
                <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(getWAMessage(selectedPlan))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 text-white font-bold py-3 rounded-xl text-sm">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Payment Screenshot
                </a>
              </div>

              <p className="text-center text-xs text-stone-400">
                📌 Activated within 24 hours of payment confirmation
              </p>

              <button onClick={() => setShowModal(false)}
                className="w-full text-stone-400 text-sm py-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

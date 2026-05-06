'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Check, Crown, Phone, MessageCircle, Eye, Heart, Star, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    hindi: 'मुफ्त',
    price: 0,
    period: 'forever',
    color: 'bg-white',
    border: 'border-stone-200',
    cta: 'Current Plan',
    features: [
      { icon: Heart, text: 'Create your profile', hindi: 'प्रोफाइल बनाएं' },
      { icon: Eye, text: 'Browse all profiles', hindi: 'सभी प्रोफाइल देखें' },
      { icon: Star, text: '2 interests per day', hindi: '2 interest रोज' },
      { icon: MessageCircle, text: 'Basic chat on mutual match', hindi: 'Mutual match पर chat' },
    ],
    locked: ['View contact numbers', 'Unlimited interests', 'Voice calls', 'See who viewed you'],
  },
  {
    id: 'silver',
    name: 'Silver',
    hindi: 'सिल्वर',
    price: 199,
    period: '/month',
    color: 'bg-white',
    border: 'border-orange-300',
    highlight: true,
    badge: 'Most Popular · सबसे लोकप्रिय',
    cta: 'Upgrade to Silver',
    features: [
      { icon: Check, text: 'Everything in Free', hindi: 'Free सब कुछ' },
      { icon: Heart, text: 'Browse own community (unlimited)', hindi: 'अपना समाज unlimited' },
      { icon: Phone, text: 'View contact numbers', hindi: 'Contact number देखें' },
      { icon: Eye, text: 'See photos clearly', hindi: 'Photos साफ देखें' },
      { icon: Star, text: 'Unlimited interests', hindi: 'Unlimited interest' },
    ],
    locked: ['Voice & video calls', 'See who viewed your profile'],
  },
  {
    id: 'gold',
    name: 'Gold',
    hindi: 'गोल्ड',
    price: 399,
    period: '/month',
    color: 'bg-[#431407]',
    border: 'border-[#431407]',
    dark: true,
    badge: 'Best Value · सर्वश्रेष्ठ',
    cta: 'Upgrade to Gold',
    features: [
      { icon: Zap, text: 'Browse ALL communities 🌍', hindi: 'सभी समाज देखें' },
      { icon: Check, text: 'Everything in Silver', hindi: 'Silver सब कुछ' },
      { icon: Phone, text: 'Voice & video calls', hindi: 'Voice call करें' },
      { icon: Eye, text: 'See who viewed your profile', hindi: 'Profile viewers देखें' },
      { icon: Crown, text: 'Gold badge ✦', hindi: 'Gold badge ✦' },
    ],
    locked: [],
  },
]

export default function PremiumPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(planId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setLoading(planId)
    toast.success(`💝 Upgrading to ${planId}! Our team will contact you on WhatsApp to complete payment.`, { duration: 5000 })
    // Open WhatsApp
    window.open(`https://wa.me/918770607574?text=Hi! I want to upgrade to ${planId} plan on Wedly. My email: ${user.email}`, '_blank')
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <Navbar />
      <div className="pt-20 pb-16 px-4 sm:px-8">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto py-12">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200
                          px-4 py-2 rounded-full mb-5">
            <Crown className="w-4 h-4 text-orange-600 fill-orange-400" />
            <span className="text-xs font-semibold text-orange-700">Premium Plans</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#431407] leading-tight mb-3"
            style={{ fontFamily: 'Georgia,serif', letterSpacing: '-1.5px' }}>
            अपनी journey को<br />
            <em className="text-orange-600" style={{ fontStyle: 'italic', fontWeight: 300 }}>upgrade करें।</em>
          </h1>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            Start free, upgrade when you're ready. No hidden charges. Cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {PLANS.map(plan => (
            <div key={plan.id}
              className={`${plan.color} ${plan.dark ? '' : 'border'} ${plan.border}
                          rounded-3xl overflow-hidden transition-all duration-300
                          hover:shadow-xl hover:-translate-y-1
                          ${plan.highlight ? 'ring-2 ring-orange-400 shadow-lg shadow-orange-100' : ''}`}>
              {plan.badge && (
                <div className={`text-center py-2 text-[11px] font-bold tracking-wide
                  ${plan.dark ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-500 text-white'}`}>
                  {plan.badge}
                </div>
              )}

              <div className={`p-6 ${!plan.badge ? 'pt-7' : ''}`}>
                <div className={`text-[11px] font-semibold uppercase tracking-widest mb-1
                  ${plan.dark ? 'text-orange-400' : 'text-orange-500'}`}>
                  {plan.name} · {plan.hindi}
                </div>
                <div className="flex items-end gap-1 mb-5">
                  <span className={`text-4xl font-black ${plan.dark ? 'text-white' : 'text-[#431407]'}`}
                    style={{ fontFamily: 'Georgia,serif' }}>
                    {plan.price === 0 ? '₹0' : `₹${plan.price}`}
                  </span>
                  <span className={`text-sm pb-1 ${plan.dark ? 'text-white/40' : 'text-stone-400'}`}>
                    {plan.period}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                        ${plan.dark ? 'bg-orange-500/20' : 'bg-emerald-50'}`}>
                        <Check className={`w-3 h-3 ${plan.dark ? 'text-orange-300' : 'text-emerald-500'}`} />
                      </div>
                      <div>
                        <span className={`text-sm ${plan.dark ? 'text-white/80' : 'text-stone-700'}`}>{f.text}</span>
                        <span className={`text-[10px] ml-1.5 ${plan.dark ? 'text-white/30' : 'text-stone-400'}`}>{f.hindi}</span>
                      </div>
                    </div>
                  ))}
                  {plan.locked?.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 opacity-35">
                      <div className="w-5 h-5 rounded-full border border-stone-200 flex-shrink-0" />
                      <span className="text-sm text-stone-500 line-through">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => plan.price > 0 ? handleUpgrade(plan.id) : router.push('/register')}
                  disabled={loading === plan.id}
                  className={`w-full py-3 rounded-2xl text-sm font-bold transition-all
                    ${plan.dark
                      ? 'bg-orange-500 hover:bg-orange-400 text-white'
                      : plan.highlight
                        ? 'bg-[#c2410c] hover:bg-[#9a3412] text-white shadow-lg shadow-orange-200'
                        : 'bg-[#fffaf6] border border-orange-200 text-orange-700 hover:bg-orange-50'}
                    disabled:opacity-60`}>
                  {loading === plan.id ? 'Processing…' : plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ strip */}
        <div className="max-w-2xl mx-auto mt-14">
          <h2 className="text-xl font-black text-[#431407] text-center mb-6"
            style={{ fontFamily: 'Georgia,serif' }}>
            Common Questions · सामान्य प्रश्न
          </h2>
          <div className="space-y-3">
            {[
              { q: 'How do I pay? · पेमेंट कैसे करें?', a: 'After clicking upgrade, our team will contact you on WhatsApp to complete the payment via UPI, PhonePe, or bank transfer. Safe and simple.' },
              { q: 'Can I cancel anytime?', a: 'Yes, you can cancel at any time. No questions asked. Your premium access continues till the end of the billing period.' },
              { q: 'Is my data safe? · डेटा सुरक्षित है?', a: '100%. Every profile is manually verified. Your contact details are only shared with people you choose to connect with.' },
              { q: 'What if I don\'t find a match?', a: 'Wedly is growing every day with new verified profiles. Premium members get priority visibility — your profile reaches more potential matches.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-orange-100">
                <p className="font-semibold text-stone-800 text-sm mb-2">{item.q}</p>
                <p className="text-stone-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Heart, MessageCircle, Phone, Shield, Star,
  ChevronRight, Check, Users, Sparkles, ArrowRight, Crown
} from 'lucide-react'

const COMMUNITIES = [
  { name: 'Lodhi Kshatriya', hindi: 'लोधी क्षत्रिय',  count: '50+',  active: true  },
  { name: 'Yadav Samaj',     hindi: 'यादव समाज',      count: 'जल्द', active: false },
  { name: 'Kurmi Samaj',     hindi: 'कुर्मी समाज',    count: 'जल्द', active: false },
  { name: 'Kirar Samaj',     hindi: 'किरार समाज',     count: 'जल्द', active: false },
  { name: 'Teli Samaj',      hindi: 'तेली समाज',      count: 'जल्द', active: false },
  { name: 'Rajput Samaj',    hindi: 'राजपूत समाज',    count: 'जल्द', active: false },
  { name: 'Brahmin Samaj',   hindi: 'ब्राह्मण समाज',  count: 'जल्द', active: false },
  { name: 'Kshatriya Samaj', hindi: 'क्षत्रिय समाज',  count: 'जल्द', active: false },
]

const STEPS = [
  { icon:'📝', step:'01', title:'Register Free',      hindi:'मुफ्त रजिस्टर करें', desc:'Create profile in 5 minutes. Pick your community. Our team verifies within 24 hours.' },
  { icon:'🔍', step:'02', title:'Browse & Connect',   hindi:'देखें और जुड़ें',      desc:'Browse verified profiles from your community. Send interest. Chat opens on acceptance.' },
  { icon:'💑', step:'03', title:'Find Your Forever',  hindi:'जीवनसाथी खोजें',     desc:'Chat privately, voice call, share contacts. Everything at your pace, your comfort.' },
]

const FEATURES = [
  { icon:Shield,        title:'Human Verified',   hindi:'100% सत्यापित',  desc:'Every profile manually reviewed. Zero fake profiles.',            bg:'bg-emerald-50', ic:'text-emerald-600' },
  { icon:MessageCircle, title:'Free Live Chat',    hindi:'मुफ्त लाइव चैट', desc:'Chat opens instantly when interest accepted. No extra payment.',  bg:'bg-orange-50',  ic:'text-orange-600'  },
  { icon:Phone,         title:'Voice Calls',       hindi:'वॉइस कॉल',       desc:'Call your match directly. Gold plan feature.',                    bg:'bg-blue-50',    ic:'text-blue-600'    },
  { icon:Users,         title:'All Communities',   hindi:'सभी समाज',        desc:'20+ communities — one trusted platform for all of India.',       bg:'bg-purple-50',  ic:'text-purple-600'  },
  { icon:Star,          title:'Free Forever',      hindi:'हमेशा मुफ्त',    desc:'Register, browse, send interest — completely free.',              bg:'bg-yellow-50',  ic:'text-yellow-600'  },
  { icon:Heart,         title:'Gotra Matching',    hindi:'गोत्र मिलान',    desc:'Built-in gotra filters respect your traditions.',                 bg:'bg-pink-50',    ic:'text-pink-600'    },
]

const DEMO_PROFILES = [
  { initial:'P', name:'Priya S.',  age:24, city:'Bhopal',   occ:'Teacher',  color:'from-pink-100 to-pink-50',     tc:'text-pink-700'    },
  { initial:'R', name:'Rahul L.',  age:27, city:'Jabalpur', occ:'Engineer', color:'from-blue-100 to-blue-50',     tc:'text-blue-700'    },
  { initial:'A', name:'Anita K.',  age:23, city:'Rewa',     occ:'Doctor',   color:'from-violet-100 to-violet-50', tc:'text-violet-700'  },
  { initial:'V', name:'Vikram Y.', age:29, city:'Indore',   occ:'Business', color:'from-amber-100 to-amber-50',   tc:'text-amber-700'   },
  { initial:'S', name:'Sunita P.', age:25, city:'Nagpur',   occ:'Nurse',    color:'from-rose-100 to-rose-50',     tc:'text-rose-700'    },
  { initial:'M', name:'Manish T.', age:28, city:'Satna',    occ:'Govt Job', color:'from-teal-100 to-teal-50',     tc:'text-teal-700'    },
]

export default function HomePage() {
  const [count, setCount]             = useState(50)
  const [activeCom, setActiveCom]     = useState(0)
  const [chatOpen, setChatOpen]       = useState(false)
  const [chatMsg, setChatMsg]         = useState('')
  const [chatHistory, setChatHistory] = useState([
    { from:'bot', text:'नमस्ते! 🙏 मैं Wedly Assistant हूँ। Register करने में, plans जानने में या किसी भी सवाल में मदद कर सकता हूँ।' }
  ])
  const chatEndRef = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    supabase.from('profiles')
      .select('id', { count:'exact', head:true })
      .eq('status','approved')
      .then(({ count:c }) => { if (c && c > 0) setCount(c) })
  }, [])

  const botReplies: Record<string,string> = {
    register:  'रजिस्ट्रेशन बिल्कुल मुफ्त है! ऊपर "मुफ्त रजिस्टर करें" पर click करें। 5 मिनट में profile बनाएं। 24 घंटे में हमारी team verify करेगी। 😊',
    plan:      'Free: profile देखें + interest भेजें। Silver ₹199/month: unlimited contacts। Gold ₹399/month: voice calls + premium features। सब free से शुरू होता है! ✨',
    free:      'हाँ! Register, browse, interest — सब मुफ्त। Contact details के लिए Silver लें। Fake profile नहीं, सब verified है। 🆓',
    community: 'अभी Lodhi Kshatriya available है। जल्द Yadav, Kurmi, Kirar, Teli, Rajput, Brahmin भी आएंगे। आपकी community add करवाने के लिए contact करें! 🏘️',
    safe:      'हर profile हमारी team manually verify करती है। Ladies का number तब तक hide रहता है जब तक वो share न करें। 100% safe! 🔒',
  }

  function sendChat() {
    const text = chatMsg.trim()
    if (!text) return
    setChatHistory(p => [...p, { from:'user', text }])
    setChatMsg('')
    const lower = text.toLowerCase()
    let reply = 'आपका सवाल हमें मिल गया! अधिक जानकारी के लिए wedly.co.in पर जाएं। 🙏'
    if (lower.includes('register') || lower.includes('रजिस्टर')) reply = botReplies.register
    else if (lower.includes('plan') || lower.includes('price') || lower.includes('cost') || lower.includes('₹')) reply = botReplies.plan
    else if (lower.includes('free') || lower.includes('मुफ्त')) reply = botReplies.free
    else if (lower.includes('community') || lower.includes('samaj') || lower.includes('समाज') || lower.includes('caste')) reply = botReplies.community
    else if (lower.includes('safe') || lower.includes('fake') || lower.includes('secure') || lower.includes('verified')) reply = botReplies.safe
    setTimeout(() => setChatHistory(p => [...p, { from:'bot', text: reply }]), 700)
  }

  return (
    <div className="min-h-screen bg-[#fffaf6] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-[100svh] flex flex-col justify-center pt-20 pb-12 px-4 sm:px-8 overflow-hidden">
        {/* BG layers */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-[480px] sm:h-[480px] rounded-full opacity-25"
            style={{ background:'radial-gradient(circle,#f97316 0%,transparent 70%)', transform:'translate(35%,-35%)' }}/>
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-80 sm:h-80 rounded-full opacity-20"
            style={{ background:'radial-gradient(circle,#ea580c 0%,transparent 70%)', transform:'translate(-35%,35%)' }}/>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage:'radial-gradient(circle,rgba(194,65,12,0.3) 1px,transparent 1px)', backgroundSize:'30px 30px' }}/>
          {/* Ghost text — visible on all screens */}
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                           text-[22vw] sm:text-[18vw] font-black text-orange-100
                           select-none whitespace-nowrap leading-none pointer-events-none
                           opacity-70 z-0"
            aria-hidden="true"
            style={{ fontFamily:'Georgia,serif', letterSpacing:'-4px' }}>
            Wedly
          </span>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">

            {/* Left text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200
                              px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"/>
                <span className="text-xs font-semibold text-orange-700 tracking-wide">
                  {count}+ Verified Profiles Live
                </span>
              </div>

              <h1 className="text-[40px] sm:text-[58px] lg:text-[70px] font-black leading-[0.93]
                             text-[#431407] mb-3 tracking-tight"
                style={{ fontFamily:'Georgia,serif' }}>
                अपना<br/>
                <em className="text-orange-600 not-italic" style={{ fontStyle:'italic', fontWeight:300 }}>
                  जीवनसाथी
                </em><br/>
                खोजें।
              </h1>
              <p className="text-base text-orange-700/70 mb-1"
                style={{ fontFamily:'Georgia,serif', fontStyle:'italic' }}>
                Find Your Forever.
              </p>

              <p className="text-sm sm:text-base text-stone-500 leading-relaxed
                            max-w-sm mx-auto lg:mx-0 mb-8 mt-4">
                India's most trusted community matrimony platform. Verified profiles, live chat, voice calls —
                <strong className="text-orange-700"> completely free</strong> to join.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center
                              justify-center lg:justify-start gap-3 mb-10">
                <Link href="/onboard"
                  className="flex items-center justify-center gap-2 bg-[#c2410c]
                             hover:bg-[#9a3412] text-white font-bold text-base
                             px-8 py-4 rounded-2xl transition-all shadow-lg
                             shadow-orange-200 hover:-translate-y-0.5 active:translate-y-0">
                  मुफ्त रजिस्टर करें
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/profiles"
                  className="flex items-center justify-center gap-2 bg-white
                             border border-orange-200 text-orange-700 font-semibold
                             text-base px-8 py-4 rounded-2xl transition-all
                             hover:bg-orange-50 hover:-translate-y-0.5">
                  Profiles देखें
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-5 sm:gap-8">
                {[
                  { v:`${count}+`, l:'Profiles' },
                  { v:'03+',       l:'States'   },
                  { v:'₹0',        l:'Register' },
                  { v:'Live',      l:'Chat'     },
                ].map(s => (
                  <div key={s.l} className="text-center">
                    <div className="text-xl sm:text-2xl font-black text-[#7c2d12]"
                      style={{ fontFamily:'Georgia,serif' }}>{s.v}</div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — blurred profile grid */}
            <div className="w-full max-w-[340px] lg:max-w-[420px] flex-shrink-0">
              <div className="relative">
                <div className="grid grid-cols-3 gap-2.5">
                  {DEMO_PROFILES.map((p, i) => (
                    <div key={i}
                      className={`bg-gradient-to-b ${p.color} rounded-2xl overflow-hidden
                                  border border-white/80 shadow-md
                                  hover:scale-105 hover:shadow-xl transition-all duration-300`}>
                      <div className="relative h-[72px] flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-full bg-white/60 flex items-center
                                        justify-center text-xl font-black ${p.tc}`}>{p.initial}</div>
                        <div className="absolute inset-0 backdrop-blur-[6px] bg-white/25
                                        flex items-center justify-center">
                          <div className="bg-white/80 rounded-full p-1">
                            <Shield className="w-3 h-3 text-orange-600"/>
                          </div>
                        </div>
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500
                                        rounded-full flex items-center justify-center shadow-sm">
                          <Check className="w-2.5 h-2.5 text-white"/>
                        </div>
                      </div>
                      <div className="px-2 py-2 bg-white/60">
                        <div className="text-[11px] font-bold text-stone-800 truncate">{p.name}</div>
                        <div className="text-[9px] text-stone-500">{p.age}y · {p.city}</div>
                        <span className="text-[9px] bg-orange-100 text-orange-700
                                         px-1.5 py-0.5 rounded-full font-medium inline-block mt-1">
                          {p.occ}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* CTA overlay */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t
                                from-[#fffaf6] via-[#fffaf6]/80 to-transparent
                                flex items-end justify-center pb-3 rounded-b-2xl">
                  <Link href="/onboard"
                    className="bg-[#c2410c] text-white text-xs font-bold px-5 py-2.5
                               rounded-xl shadow-lg hover:bg-[#9a3412] transition-colors
                               flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5"/>
                    Login to see full profiles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY SECTION ── */}
      <section className="py-14 sm:py-20 bg-[#7c2d12] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize:'22px 22px' }}/>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background:'radial-gradient(circle,#f97316 0%,transparent 70%)', transform:'translate(30%,-30%)' }}/>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10">
            <p className="text-orange-300 text-[11px] font-semibold tracking-[3px] uppercase mb-3">
              हर समाज के लिए · For Every Community
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3"
              style={{ fontFamily:'Georgia,serif', letterSpacing:'-1px' }}>
              आपका समाज,<br/>
              <em className="text-orange-300" style={{ fontStyle:'italic', fontWeight:300 }}>आपका मंच।</em>
            </h2>
            <p className="text-orange-200/60 text-sm sm:text-base max-w-md mx-auto font-light">
              One verified platform for all. Browse your community first.
            </p>
          </div>

          {/* Pills — scrollable on mobile */}
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-10">
            {COMMUNITIES.map((c, i) => (
              <button key={i} onClick={() => setActiveCom(i)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border
                            text-[13px] font-medium transition-all duration-200
                            ${activeCom === i
                              ? 'bg-orange-500 border-orange-400 text-white shadow-lg'
                              : 'bg-white/8 border-white/15 text-white/80 hover:bg-white/15'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0
                  ${c.active ? 'bg-emerald-400' : 'bg-white/25'}
                  ${activeCom === i && c.active ? 'animate-pulse' : ''}`}/>
                <span>
                  <span className="block text-[10px] opacity-60 leading-none mb-0.5">{c.hindi}</span>
                  <span>{c.name}</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                  ${activeCom === i ? 'bg-white/25 text-white' : 'bg-white/10 text-white/50'}`}>
                  {c.count}
                </span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 bg-white/8 border border-white/10
                          rounded-2xl overflow-hidden">
            {[
              { v:`${count}+`, l:'Verified Profiles', h:'सत्यापित प्रोफाइल' },
              { v:'03+',       l:'States Covered',    h:'राज्यों में'        },
              { v:'₹0',        l:'To Register',       h:'रजिस्ट्रेशन मुफ्त' },
              { v:'24h',       l:'Profile Review',    h:'प्रोफाइल जाँच'     },
            ].map((s,i) => (
              <div key={i} className="py-5 px-4 text-center border-b sm:border-b-0
                                      border-r border-white/8 last:border-0
                                      [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r">
                <div className="text-3xl font-black text-white"
                  style={{ fontFamily:'Georgia,serif' }}>{s.v}</div>
                <div className="text-orange-200/60 text-[10px] font-medium uppercase tracking-wide mt-0.5">{s.l}</div>
                <div className="text-orange-300/40 text-[9px] mt-0.5">{s.h}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-orange-500 text-[11px] font-semibold tracking-[3px] uppercase mb-3">
              Simple Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#431407] leading-tight"
              style={{ fontFamily:'Georgia,serif', letterSpacing:'-1px' }}>
              तीन आसान कदम।<br/>
              <em className="text-orange-600" style={{ fontStyle:'italic', fontWeight:300 }}>Three simple steps.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <div key={i}
                className="relative bg-[#fffaf6] rounded-3xl p-6 sm:p-8 border border-orange-100
                           hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100
                           transition-all duration-300 overflow-hidden">
                <span className="absolute top-4 right-5 text-7xl font-black text-orange-100 select-none"
                  aria-hidden="true" style={{ fontFamily:'Georgia,serif' }}>{s.step}</span>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-lg font-bold text-[#431407] mb-0.5">{s.title}</h3>
                <p className="text-xs text-orange-500 font-medium mb-3">{s.hindi}</p>
                <p className="text-sm text-stone-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFILE PREVIEW ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 bg-[#fffaf6]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-orange-500 text-[11px] font-semibold tracking-[3px] uppercase mb-3">
              Real Profiles · असली प्रोफाइल
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#431407] leading-tight"
              style={{ fontFamily:'Georgia,serif', letterSpacing:'-1px' }}>
              Verified matches<br/>
              <em className="text-orange-600" style={{ fontStyle:'italic', fontWeight:300 }}>waiting for you.</em>
            </h2>
            <p className="text-stone-400 text-sm max-w-xs mx-auto mt-3">
              Register free to see full profiles, photos and contact details.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {DEMO_PROFILES.map((p, i) => (
              <div key={i}
                className={`bg-gradient-to-b ${p.color} rounded-2xl overflow-hidden
                            border border-white shadow-sm hover:shadow-md
                            hover:-translate-y-1 transition-all duration-300`}>
                <div className="relative h-20 flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-full bg-white/80 flex items-center
                                  justify-center text-2xl font-black ${p.tc}`}>{p.initial}</div>
                  <div className="absolute inset-0 backdrop-blur-[8px] bg-white/30
                                  flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-1.5 shadow-sm">
                      <Shield className="w-3.5 h-3.5 text-orange-600"/>
                    </div>
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500
                                  rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white"/>
                  </div>
                </div>
                <div className="p-2 bg-white/70">
                  <div className="text-[11px] font-bold text-stone-800 truncate">{p.name}</div>
                  <div className="text-[9px] text-stone-400">{p.age}y · {p.city}</div>
                  <span className="text-[9px] bg-orange-100 text-orange-700
                                   px-1.5 py-0.5 rounded-full inline-block mt-1 font-medium">
                    {p.occ}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/onboard"
              className="inline-flex items-center gap-2 bg-[#c2410c] text-white font-bold
                         text-sm px-8 py-3.5 rounded-2xl hover:bg-[#9a3412] transition-colors
                         shadow-lg shadow-orange-200">
              <Sparkles className="w-4 h-4"/> सभी प्रोफाइल देखें — Register Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-orange-500 text-[11px] font-semibold tracking-[3px] uppercase mb-3">
              Everything You Need
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#431407] leading-tight"
              style={{ fontFamily:'Georgia,serif', letterSpacing:'-1px' }}>
              Built for India.<br/>
              <em className="text-orange-600" style={{ fontStyle:'italic', fontWeight:300 }}>Built for you.</em>
            </h2>
          </div>

          {/* Big chat feature card */}
          <div className="bg-[#7c2d12] rounded-3xl p-6 sm:p-10 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.4) 1px,transparent 1px)', backgroundSize:'20px 20px' }}/>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-orange-500/20 border
                                border-orange-500/30 px-3 py-1.5 rounded-full mb-4">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
                  <span className="text-orange-300 text-xs font-semibold tracking-wide">
                    LIVE · अभी उपलब्ध
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight"
                  style={{ fontFamily:'Georgia,serif' }}>
                  Direct Chat &<br/>Voice Calls
                </h3>
                <p className="text-xs text-orange-300 font-medium mb-3">
                  सीधी बात — बिना नंबर share किए
                </p>
                <p className="text-orange-200/60 text-sm leading-relaxed max-w-xs">
                  Chat privately after interest accepted. Voice call on Gold plan. No middleman, no broker.
                </p>
              </div>
              {/* Mini chat preview */}
              <div className="w-full sm:w-60 flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 overflow-hidden">
                  <div className="bg-white/10 px-3 py-2.5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-orange-300 flex items-center
                                    justify-center text-orange-900 font-bold text-xs">P</div>
                    <div>
                      <div className="text-white text-xs font-semibold">Priya</div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"/>
                        <span className="text-emerald-400 text-[10px]">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 space-y-2.5">
                    <div className="bg-white/15 rounded-xl rounded-tl-sm px-3 py-2">
                      <p className="text-white text-[11px]">Namaste! Profile bahut accha laga 🙏</p>
                    </div>
                    <div className="bg-orange-500 rounded-xl rounded-tr-sm px-3 py-2 ml-4">
                      <p className="text-white text-[11px]">Namaste ji! Main Jabalpur se hoon 😊</p>
                    </div>
                    <div className="bg-white/15 rounded-xl rounded-tl-sm px-3 py-2">
                      <p className="text-white text-[11px]">Call pe milte hain? 💑</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {FEATURES.map((f, i) => (
              <div key={i}
                className="bg-[#fffaf6] rounded-2xl p-4 sm:p-5 border border-orange-100
                           hover:border-orange-300 hover:shadow-md hover:shadow-orange-50
                           transition-all duration-300">
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <f.icon className={`w-5 h-5 ${f.ic}`}/>
                </div>
                <h4 className="text-sm font-bold text-[#431407] mb-0.5">{f.title}</h4>
                <p className="text-[10px] text-orange-500 font-medium mb-2">{f.hindi}</p>
                <p className="text-xs text-stone-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS STRIP ── */}
      <section className="py-14 sm:py-16 px-4 sm:px-8 bg-[#fffaf6] border-y border-orange-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#431407]"
              style={{ fontFamily:'Georgia,serif' }}>
              शुरुआत मुफ्त — <em style={{ fontStyle:'italic', fontWeight:300 }}>Always.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name:'Free',   hindi:'मुफ्त',  price:'₹0',   period:'forever',  features:['Profile create','Browse all profiles','2 interests/day','Basic chat'], highlight:false },
              { name:'Silver', hindi:'सिल्वर', price:'₹199', period:'/month',   features:['Everything in Free','Unlimited interests','View contacts','Priority listing'], highlight:true  },
              { name:'Gold',   hindi:'गोल्ड',  price:'₹399', period:'/month',   features:['Everything in Silver','Voice calls 📞','See profile viewers','Gold badge ✦'], highlight:false },
            ].map(plan => (
              <div key={plan.name}
                className={`rounded-2xl p-5 border transition-all
                  ${plan.highlight
                    ? 'bg-[#7c2d12] border-[#7c2d12] text-white'
                    : 'bg-white border-orange-100'}`}>
                {plan.highlight && (
                  <div className="text-orange-300 text-[10px] font-bold uppercase tracking-widest mb-3">
                    ✦ Most Popular
                  </div>
                )}
                <div className={`text-xs font-semibold mb-1 ${plan.highlight ? 'text-orange-300' : 'text-orange-500'}`}>
                  {plan.name} · {plan.hindi}
                </div>
                <div className={`font-black mb-4 ${plan.highlight ? 'text-white' : 'text-[#431407]'}`}
                  style={{ fontFamily:'Georgia,serif' }}>
                  <span className="text-3xl">{plan.price}</span>
                  <span className={`text-sm font-normal ml-1 ${plan.highlight ? 'text-orange-200/60' : 'text-stone-400'}`}>
                    {plan.period}
                  </span>
                </div>
                <div className="space-y-2 mb-5">
                  {plan.features.map(f => (
                    <div key={f} className={`flex items-center gap-2 text-xs
                      ${plan.highlight ? 'text-orange-100' : 'text-stone-500'}`}>
                      <Check className={`w-3.5 h-3.5 flex-shrink-0
                        ${plan.highlight ? 'text-emerald-400' : 'text-emerald-500'}`}/>
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/premium"
                  className={`block text-center text-sm font-bold py-2.5 rounded-xl transition-all
                    ${plan.highlight
                      ? 'bg-orange-500 text-white hover:bg-orange-400'
                      : plan.price === '₹0'
                        ? 'bg-[#fffaf6] border border-orange-200 text-orange-700 hover:bg-orange-50'
                        : 'bg-[#7c2d12] text-white hover:bg-[#9a3412]'}`}>
                  {plan.price === '₹0' ? 'Get Started Free' : `Upgrade to ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="py-10 px-4 sm:px-8 bg-white border-b border-orange-100">
        <div className="max-w-4xl mx-auto grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-0 sm:divide-x divide-orange-100">
          {[
            { icon:'✅', v:'100%',  l:'Human Reviewed', h:'मानव सत्यापित' },
            { icon:'💬', v:'Live',  l:'Real-time Chat', h:'लाइव चैट'       },
            { icon:'🆓', v:'₹0',   l:'Free to Join',   h:'मुफ्त रजिस्टर'  },
            { icon:'🏘️', v:'20+',  l:'Communities',    h:'समाज'            },
            { icon:'📞', v:'24/7', l:'AI Support',      h:'सहायता'          },
          ].map((t, i) => (
            <div key={i} className="text-center px-3 py-2">
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="text-lg font-black text-[#7c2d12]"
                style={{ fontFamily:'Georgia,serif' }}>{t.v}</div>
              <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wide">{t.l}</div>
              <div className="text-[9px] text-orange-400">{t.h}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-[#431407] text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage:'radial-gradient(circle,rgba(249,115,22,0.5) 1px,transparent 1px)', backgroundSize:'28px 28px' }}/>
        <div className="absolute inset-0"
          style={{ background:'radial-gradient(ellipse 80% 60% at 50% 50%,rgba(234,88,12,0.15) 0%,transparent 70%)' }}/>
        <div className="relative z-10 max-w-xl mx-auto">
          <span className="text-orange-300/60 text-[11px] font-semibold tracking-[3px] uppercase block mb-4">
            आज ही शुरू करें · Start Today
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4"
            style={{ fontFamily:'Georgia,serif', letterSpacing:'-2px' }}>
            आपका forever<br/>
            <em className="text-orange-300" style={{ fontStyle:'italic', fontWeight:300 }}>यहाँ से शुरू होता है।</em>
          </h2>
          <p className="text-orange-200/40 text-sm font-light mb-8 max-w-xs mx-auto leading-relaxed">
            Join verified families across India. 2 minutes to register. Free forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/onboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2
                         bg-white text-[#7c2d12] font-bold text-base px-10 py-4
                         rounded-2xl hover:bg-orange-50 transition-all
                         hover:-translate-y-0.5 shadow-xl">
              मुफ्त प्रोफाइल बनाएं →
            </Link>
            <Link href="/profiles"
              className="text-orange-300/60 hover:text-orange-300 text-sm font-medium transition-colors py-4">
              Browse profiles ↗
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── CHATBOT ── */}
      <div className="fixed bottom-5 right-4 sm:right-6 z-50">
        {chatOpen && (
          <div className="absolute bottom-16 right-0 w-[290px] sm:w-[320px] bg-white rounded-3xl
                          shadow-2xl border border-orange-100 overflow-hidden">
            <div className="bg-[#7c2d12] px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-base">🤖</div>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold">Wedly Assistant</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>
                  <span className="text-orange-200/60 text-[10px]">हमेशा उपलब्ध · Always online</span>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)}
                className="text-white/50 hover:text-white text-lg">✕</button>
            </div>

            <div className="h-48 overflow-y-auto p-3.5 space-y-2.5 bg-[#fffaf6]">
              {chatHistory.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] px-3 py-2 rounded-2xl text-xs leading-relaxed
                    ${m.from === 'bot'
                      ? 'bg-white border border-orange-100 text-stone-700 rounded-tl-sm'
                      : 'bg-orange-600 text-white rounded-tr-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-orange-100 bg-white">
              {['Register कैसे?','Plans?','Free है?','Samaj?'].map(q => (
                <button key={q}
                  onClick={() => { setChatMsg(q); setTimeout(sendChat, 50) }}
                  className="text-[10px] bg-orange-50 border border-orange-200 text-orange-700
                             px-2 py-1 rounded-full hover:bg-orange-100 transition-colors font-medium">
                  {q}
                </button>
              ))}
            </div>

            <div className="px-3 pb-3 flex gap-2 bg-white">
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="अपना सवाल लिखें…"
                className="flex-1 bg-stone-100 border border-stone-200 rounded-xl
                           px-3 py-2 text-xs text-stone-700 outline-none
                           focus:border-orange-300 focus:bg-white transition-all"/>
              <button onClick={sendChat}
                className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center
                           hover:bg-orange-700 transition-colors flex-shrink-0">
                <ArrowRight className="w-3.5 h-3.5 text-white"/>
              </button>
            </div>
          </div>
        )}

        <button onClick={() => setChatOpen(p => !p)}
          className="w-14 h-14 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded-full
                     shadow-xl shadow-orange-300/30 flex items-center justify-center
                     transition-all duration-200 hover:scale-110 active:scale-95 relative">
          <MessageCircle className="w-6 h-6"/>
          {!chatOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full
                             flex items-center justify-center text-[8px] font-bold text-white
                             border border-white">!</span>
          )}
        </button>
      </div>
    </div>
  )
}
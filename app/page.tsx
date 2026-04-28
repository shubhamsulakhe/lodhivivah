import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Heart, Shield, Search, Users, Crown, Star, CheckCircle,
  ArrowRight, Sparkles, Lock, HeartHandshake, Zap, Phone,
} from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ════════════════════════════════════════════
          HERO – Full viewport with animated bg
      ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #431407 0%, #7c2d12 20%, #c2410c 45%, #ea580c 65%, #f97316 80%, #fbbf24 100%)',
        }}/>

        {/* Decorative SVG pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M30 0l8.66 15H21.34L30 0zm0 60l-8.66-15h17.32L30 60zM0 30l15-8.66V38.66L0 30zm60 0l-15 8.66V21.34L60 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}/>

        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full animate-pulse2"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)' }}/>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full animate-float"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }}/>

        {/* Mandala ring top-right decoration */}
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] opacity-5 animate-spin-slow">
          <svg viewBox="0 0 200 200" fill="white">
            <circle cx="100" cy="100" r="98" fill="none" stroke="white" strokeWidth="1"/>
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5"/>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => (
              <line key={deg}
                x1={100 + 60*Math.cos(deg*Math.PI/180)}
                y1={100 + 60*Math.sin(deg*Math.PI/180)}
                x2={100 + 98*Math.cos(deg*Math.PI/180)}
                y2={100 + 98*Math.sin(deg*Math.PI/180)}
                stroke="white" strokeWidth="0.5"/>
            ))}
          </svg>
        </div>

        <div className="relative container pt-28 pb-16">
          <div className="max-w-4xl mx-auto text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-8 animate-fade-up-1">
              <Sparkles className="w-4 h-4 text-gold-300"/>
              <span className="text-white/90 text-sm font-medium">
                अपनों के साथ, सही जीवनसाथी की तलाश।
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.25] mb-6 animate-fade-up-2">
              अपना <span className="relative inline-block">
                <span className="text-gold-300">जीवनसाथी</span>
                <svg className="absolute -bottom-0 left-0 w-full" viewBox="0 0 200 10" preserveAspectRatio="none">
                  <path d="M0 5 Q50 0 100 5 Q150 10 200 5" stroke="#fbbf24" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
              <br/>
              <span className="inline-block mt-4 text-white/95">खोजें — आज ही</span>
            </h1>

            <p className="text-white/80 text-xl sm:text-2xl font-light leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-up-3">
              लोधी समाज का सबसे बड़ा और भरोसेमंद डिजिटल विवाह मंच।
              पुरानी पत्रिका का आधुनिक रूप।
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-fade-up-4">
              <Link href="/register"
                className="btn btn-white btn-xl group">
                <Heart className="w-5 h-5 text-saffron-500 fill-saffron-400 group-hover:scale-110 transition-transform"/>
                Register Free — अभी जुड़ें
                <ArrowRight className="w-5 h-5 text-saffron-500 group-hover:translate-x-1 transition-transform"/>
              </Link>
              <Link href="/profiles"
                className="btn btn-xl glass text-white border border-white/30 hover:bg-white/20">
                <Search className="w-5 h-5"/>
                Profiles Browse करें
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fade-up-4">
              {[
                { val: '2000+', lbl: 'Profiles' },
                { val: '500+',  lbl: 'Marriages' },
                { val: '20+',   lbl: 'Years' },
                { val: '50+',   lbl: 'Cities' },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="glass rounded-2xl px-4 py-4 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-gold-300">{val}</div>
                  <div className="text-white/70 text-sm font-medium">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full h-16 sm:h-20">
            <path d="M0 80L48 66.7C96 53 192 27 288 20C384 13 480 27 576 36.7C672 47 768 53 864 50C960 47 1056 33 1152 26.7C1248 20 1344 20 1392 20H1440V80H0Z" fill="#fffbf5"/>
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          QUICK SEARCH BAR
      ════════════════════════════════════════════ */}
      <section className="py-10 pattern-bg">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="card p-6 shadow-xl">
              <p className="text-center text-stone-600 font-semibold mb-5 text-lg">
                🔍 Quick Search — अभी खोजें
              </p>
              <form className="grid grid-cols-1 sm:grid-cols-4 gap-3" action="/profiles" method="get">
                <select name="gender" className="select sm:col-span-1">
                  <option value="">Looking for</option>
                  <option value="female">♀ Bride (वधू)</option>
                  <option value="male">♂ Groom (वर)</option>
                </select>
                <select name="age" className="select">
                  <option value="">Age Range</option>
                  <option value="18-25">18–25 years</option>
                  <option value="25-30">25–30 years</option>
                  <option value="30-35">30–35 years</option>
                  <option value="35+">35+ years</option>
                </select>
                <select name="state" className="select">
                  <option value="">State</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Other">Other</option>
                </select>
                <button type="submit" className="btn btn-primary btn-md justify-center">
                  <Search className="w-4 h-4"/> Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════ */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <p className="section-tag">Simple Process</p>
            <h2 className="section-title">कैसे काम करता है?</h2>
            <p className="section-sub">बस 4 आसान steps में पाएं अपना जीवनसाथी</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line desktop */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-saffron-200 via-saffron-400 to-saffron-200 z-0"/>

            {[
              { step:'01', emoji:'📝', title:'Register Free',  desc:'Profile बनाएं, photo upload करें। बिल्कुल मुफ्त।', color:'from-orange-400 to-orange-600' },
              { step:'02', emoji:'✅', title:'Get Approved',   desc:'Admin 24 hrs में verify करेगा। SMS notification मिलेगी।', color:'from-blue-400 to-blue-600' },
              { step:'03', emoji:'🔍', title:'Browse & Match', desc:'Filters से profiles देखें। Interest भेजें।', color:'from-purple-400 to-purple-600' },
              { step:'04', emoji:'💑', title:'Connect!',       desc:'Match होने पर contact share होगी। परिवार मिलेंगे।', color:'from-pink-400 to-rose-600' },
            ].map(({ step, emoji, title, desc, color }) => (
              <div key={step} className="relative z-10 flex flex-col items-center text-center group">
                <div className={cn(
                  `w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`,
                  'text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4'
                )}>
                  {emoji}
                </div>
                <span className="text-xs font-bold text-saffron-400 tracking-widest mb-1">STEP {step}</span>
                <h3 className="font-bold text-stone-900 text-lg mb-2">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/register" className="btn btn-primary btn-lg">
              <Heart className="w-5 h-5"/> अभी शुरू करें — Register Free
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES SECTION
      ════════════════════════════════════════════ */}
      <section className="section pattern-bg">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left text */}
            <div>
              <p className="section-tag">Why LodhiVivah?</p>
              <h2 className="section-title">क्यों चुनें हमारा Platform?</h2>
              <p className="section-sub text-base">20 वर्षों की परंपरा, अब Digital</p>
              <div className="mt-8 space-y-5">
                {[
                  { icon: Shield,        color: 'bg-blue-100 text-blue-600',   title: 'Verified Profiles Only', desc: 'हर profile manually verify होती है। Fake profiles के लिए कोई जगह नहीं।' },
                  { icon: Lock,          color: 'bg-purple-100 text-purple-600', title: 'Privacy Protected', desc: 'Contact details सिर्फ Premium members को दिखती हैं। आपकी privacy secure है।' },
                  { icon: HeartHandshake,color: 'bg-rose-100 text-rose-600',   title: '500+ Successful Matches', desc: 'हमारे platform से अब तक 500 से ज्यादा शादियाँ हो चुकी हैं।' },
                  { icon: Zap,           color: 'bg-amber-100 text-amber-600', title: 'Instant WhatsApp Connect', desc: 'Match होने पर directly WhatsApp पर connect करें।' },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5"/>
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900">{title}</h4>
                      <p className="text-stone-500 text-sm mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - decorative card stack */}
            <div className="relative h-[500px] hidden lg:block">
              {/* Background card */}
              <div className="absolute top-8 right-8 w-72 h-96 card bg-saffron-50 rotate-3"/>
              {/* Main card */}
              <div className="absolute top-0 right-0 w-72 h-96 card overflow-hidden -rotate-1 shadow-xl">
                <div className="h-52 bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-7xl">
                  👩
                </div>
                <div className="p-4">
                  <p className="font-bold text-stone-900 text-lg">Priya Sharma</p>
                  <p className="text-stone-500 text-sm">24 yrs • B.Sc. • Balaghat, MP</p>
                  <div className="flex gap-2 mt-3">
                    <span className="badge-verified"><CheckCircle className="w-3 h-3"/> Verified</span>
                    <span className="text-xs bg-saffron-50 text-saffron-700 px-2 py-1 rounded-full font-medium">गोत्र: Kashyap</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1 bg-saffron-500 text-white text-xs font-bold py-2 rounded-xl text-center">Interest भेजें ♥</div>
                    <div className="flex-1 bg-saffron-50 text-saffron-700 text-xs font-bold py-2 rounded-xl text-center">Profile देखें</div>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 left-8 card px-5 py-4 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600"/>
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-sm">Match हो गया! 🎉</p>
                    <p className="text-stone-400 text-xs">Contact share हो गई</p>
                  </div>
                </div>
              </div>
              {/* Stars */}
              <div className="absolute top-1/2 -left-4 card px-4 py-3 shadow-xl animate-pulse2">
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400"/>)}
                </div>
                <p className="text-stone-600 text-xs mt-1 font-medium">500+ खुश जोड़ियाँ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PRICING
      ════════════════════════════════════════════ */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <p className="section-tag">Membership Plans</p>
            <h2 className="section-title">सही Plan चुनें</h2>
            <p className="section-sub">Free से शुरू करें — जब चाहें Upgrade करें</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: 'Free', price: '₹0', period: 'हमेशा के लिए', popular: false,
                icon: '🆓', color: 'border-stone-200',
                features: ['Profile create करें','सभी profiles browse करें','5 interests/month','Basic search filters'],
                cta: 'Start Free', href: '/premium', primary: false,
              },
              {
                name: 'Silver', price: '₹499', period: '6 महीने', popular: true,
                icon: '⚡', color: 'border-saffron-400',
                features: ['सब Free में +','Contact numbers देखें','Unlimited interests','Advanced filters','WhatsApp connect','Priority listing'],
                cta: 'Get Silver', href: '/premium', primary: true,
              },
              {
                name: 'Gold', price: '₹999', period: '12 महीने', popular: false,
                icon: '👑', color: 'border-gold-400',
                features: ['सब Silver में +','Featured profile badge','Top search placement','Digital booklet PDF','1 year membership','Dedicated support'],
                cta: 'Get Gold', href: '/premium', primary: false,
              },
            ].map(({ name, price, period, popular, icon, color, features, cta, href, primary }) => (
              <div key={name} className={cn(
                'card p-7 relative flex flex-col border-2',
                color,
                popular && 'scale-105 shadow-glow',
              )}>
                {popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-saffron-600 to-saffron-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      ✦ सबसे लोकप्रिय
                    </span>
                  </div>
                )}
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-black text-stone-900 text-2xl">{name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-4xl font-black text-saffron-600">{price}</span>
                </div>
                <p className="text-stone-400 text-sm mb-6">{period}</p>
                <ul className="space-y-3 flex-1 mb-7">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={href}
                  className={cn('btn btn-md w-full justify-center', primary ? 'btn-primary' : 'btn-outline')}>
                  {cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════ */}
      <section className="section pattern-bg">
        <div className="container">
          <div className="text-center mb-12">
            <p className="section-tag">Success Stories</p>
            <h2 className="section-title">खुशहाल जोड़ियाँ 💑</h2>
            <p className="section-sub">हमारे platform से हुई सफल शादियाँ</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { names:'Rahul & Priya', loc:'Balaghat, MP', year:'2023', text:'इस platform की वजह से हमारी मुलाकात हुई। परिवार बहुत खुश हैं। बहुत-बहुत धन्यवाद!', emoji:'💑' },
              { names:'Suresh & Kavita', loc:'Jabalpur, MP', year:'2023', text:'Profile देखकर पहली नजर में पसंद आ गई। 6 महीने में शादी हो गई। बेहतरीन platform है।', emoji:'🥂' },
              { names:'Deepak & Sunita', loc:'Nagpur, MH', year:'2022', text:'हम दोनों अलग-अलग शहरों में थे। इस website ने मिलाया। अब जीवन सुखमय है।', emoji:'❤️' },
            ].map(({ names, loc, year, text, emoji }) => (
              <div key={names} className="card p-6">
                <div className="text-3xl mb-4">{emoji}</div>
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400"/>)}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed italic mb-5">"{text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <div className="w-10 h-10 bg-saffron-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-saffron-500 fill-saffron-200"/>
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{names}</p>
                    <p className="text-stone-400 text-xs">{loc} • {year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #431407 0%, #7c2d12 25%, #c2410c 55%, #f97316 80%, #fbbf24 100%)',
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M30 0l8.66 15H21.34L30 0z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}/>
        <div className="container relative text-center">
          <div className="text-6xl mb-5 animate-float">💍</div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            आज ही Registration करें!
          </h2>
          <p className="text-white/80 text-xl mb-10 max-w-xl mx-auto">
            अभी जुड़ें और अपना जीवनसाथी खोजें। Registration पूरी तरह मुफ्त है।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn btn-white btn-xl group">
              <Heart className="w-5 h-5 text-saffron-500 fill-saffron-400"/>
              Register Now — Free
              <ArrowRight className="w-5 h-5 text-saffron-500 group-hover:translate-x-1 transition-transform"/>
            </Link>
            <a href="https://wa.me/918770607574" target="_blank" rel="noopener noreferrer"
               className="btn btn-xl glass text-white border border-white/30 hover:bg-white/20">
              <Phone className="w-5 h-5"/> WhatsApp करें
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

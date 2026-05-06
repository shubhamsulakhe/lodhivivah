import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <Navbar/>
      <div className="pt-20">

        {/* Hero */}
        <div className="bg-[#7c2d12] py-16 sm:py-24 px-4 sm:px-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.4) 1px,transparent 1px)', backgroundSize:'22px 22px' }}/>
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-orange-300/70 text-[11px] font-semibold tracking-[3px] uppercase mb-4">Our Story</p>
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight"
              style={{ fontFamily:'Georgia,serif', letterSpacing:'-1.5px' }}>
              एक मंच।<br/>
              <em className="text-orange-300" style={{ fontStyle:'italic', fontWeight:300 }}>सबके लिए।</em>
            </h1>
            <p className="text-orange-200/60 text-sm sm:text-base leading-relaxed">
              Wedly was built with one mission — to give every Indian community a safe, verified, and modern matrimony platform that they can trust.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-14">
            <div>
              <h2 className="text-2xl font-black text-[#431407] mb-4"
                style={{ fontFamily:'Georgia,serif' }}>Our Mission</h2>
              <p className="text-stone-500 text-sm leading-relaxed">
                Traditional matrimony relied on brokers, WhatsApp groups, and word-of-mouth — slow, inefficient, and often unsafe. Wedly changes that. We give families a trusted digital platform with verified profiles, direct chat, and community-first matching. No middlemen. No fake profiles.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#431407] mb-4"
                style={{ fontFamily:'Georgia,serif' }}>हमारा उद्देश्य</h2>
              <p className="text-stone-500 text-sm leading-relaxed">
                भारत के हर समाज के लिए एक सुरक्षित, सत्यापित और आधुनिक विवाह मंच बनाना — जहाँ परिवार को भरोसा हो, बातचीत सीधी हो, और जीवनसाथी मिलना आसान हो।
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
            {[
              { icon:'🔒', title:'Trust',     hindi:'भरोसा',   desc:'Every profile verified by our team.' },
              { icon:'🆓', title:'Free',      hindi:'मुफ्त',   desc:'Free forever to register and browse.' },
              { icon:'🏘️', title:'Community', hindi:'समाज',    desc:'Built for your community, your values.' },
              { icon:'💬', title:'Direct',    hindi:'सीधा',    desc:'Chat and connect without middlemen.' },
            ].map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-5 border border-orange-100 text-center">
                <div className="text-3xl mb-3">{v.icon}</div>
                <div className="font-bold text-stone-800 text-sm">{v.title}</div>
                <div className="text-orange-500 text-[10px] font-medium mb-2">{v.hindi}</div>
                <div className="text-stone-400 text-xs leading-relaxed">{v.desc}</div>
              </div>
            ))}
          </div>

          {/* Communities */}
          <div className="bg-[#7c2d12] rounded-3xl p-6 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3"
              style={{ fontFamily:'Georgia,serif' }}>
              Growing for every community
            </h2>
            <p className="text-orange-200/60 text-sm mb-6 max-w-md mx-auto">
              Currently serving Lodhi Kshatriya. Expanding to 20+ communities across India.
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400
                         text-white font-bold px-8 py-3.5 rounded-2xl transition-colors text-sm">
              Join Wedly Free →
            </Link>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
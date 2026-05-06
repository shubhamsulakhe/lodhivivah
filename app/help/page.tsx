import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

const FAQS = [
  { q:'How do I register on Wedly?', a:'Click "Register Free" on the homepage. Fill your basic details — name, community, mobile number. Our team reviews your profile within 24 hours and then you can start browsing matches.' },
  { q:'Is Wedly completely free?', a:'Registration, browsing profiles, and sending 2 interests per day is completely free. Silver (₹199/month) unlocks unlimited interests and contact details. Gold (₹399/month) adds voice calls and premium visibility.' },
  { q:'How are profiles verified?', a:'Every profile is manually reviewed by our team before it goes live. We check that photos are real, details are genuine, and the profile represents a real person. Fake profiles are rejected immediately.' },
  { q:'How does the chat work?', a:'When you send an interest and the other person accepts it, a chat is automatically created. You can then message each other directly — no phone number needed until you both agree to share.' },
  { q:'What is the Gold plan voice call feature?', a:'Gold plan members can make voice calls directly through the Wedly platform without sharing personal phone numbers. Both users need to be on Gold plan to use this feature.' },
  { q:'How do I change or update my profile?', a:'Go to Dashboard → Edit Profile. You can update your details, change your photo, and update your preferences anytime.' },
  { q:'How do I report a fake profile?', a:'Open the profile → click the three dots menu → Report. Our team will review and take action within 24 hours. You can also email us at support@wedly.co.in.' },
  { q:'My profile is still pending. Why?', a:'Profile review takes up to 24 hours. If it has been longer than 24 hours, please contact us on WhatsApp or email at support@wedly.co.in with your registered email.' },
  { q:'How do I delete my account?', a:'Go to Dashboard → Edit Profile → scroll to bottom → Delete Account. Or email support@wedly.co.in with your registered email to request deletion.' },
  { q:'प्रोफाइल reject क्यों हुई?', a:'Profile reject होने के कारण: unclear photo, incomplete details, या age below 18. Edit profile करें और सही जानकारी डालें। फिर हमारी team review करेगी।' },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <Navbar/>
      <div className="pt-20 pb-16 px-4 sm:px-8">

        <div className="max-w-2xl mx-auto py-12">
          <div className="text-center mb-10">
            <p className="text-orange-500 text-[11px] font-semibold tracking-[3px] uppercase mb-3">Help Center</p>
            <h1 className="text-3xl sm:text-4xl font-black text-[#431407]"
              style={{ fontFamily:'Georgia,serif', letterSpacing:'-1px' }}>
              How can we help?<br/>
              <em className="text-orange-600" style={{ fontStyle:'italic', fontWeight:300 }}>कैसे मदद करें?</em>
            </h1>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            {[
              { href:'/register', emoji:'📝', title:'Register',  hindi:'रजिस्टर' },
              { href:'/premium',  emoji:'👑', title:'Plans',     hindi:'प्लान'   },
              { href:'/contact',  emoji:'💬', title:'Contact',   hindi:'सम्पर्क' },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="bg-white rounded-2xl p-4 border border-orange-100 text-center
                           hover:border-orange-300 hover:shadow-md transition-all">
                <div className="text-2xl mb-2">{l.emoji}</div>
                <div className="font-semibold text-stone-800 text-sm">{l.title}</div>
                <div className="text-orange-500 text-[10px]">{l.hindi}</div>
              </Link>
            ))}
          </div>

          {/* FAQs */}
          <div className="space-y-3 mb-10">
            {FAQS.map((faq, i) => (
              <details key={i}
                className="bg-white rounded-2xl border border-orange-100 overflow-hidden
                           hover:border-orange-200 transition-colors group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer
                                    text-sm font-semibold text-stone-800 list-none">
                  {faq.q}
                  <span className="text-orange-400 text-lg flex-shrink-0 ml-3 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-stone-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="bg-[#7c2d12] rounded-3xl p-6 sm:p-8 text-center">
            <div className="text-3xl mb-3">💬</div>
            <h2 className="text-xl font-black text-white mb-2"
              style={{ fontFamily:'Georgia,serif' }}>Still need help?</h2>
            <p className="text-orange-200/60 text-sm mb-5">
              Our team is available Mon–Sat, 10am–6pm. Reply within 2 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:support@wedly.co.in"
                className="flex items-center justify-center gap-2 bg-white text-[#7c2d12]
                           font-bold text-sm px-6 py-3 rounded-2xl hover:bg-orange-50 transition-colors">
                📧 Email Support
              </a>
              <a href="https://wa.me/918770607574" target="_blank"
                className="flex items-center justify-center gap-2 bg-orange-500
                           hover:bg-orange-400 text-white font-bold text-sm px-6 py-3
                           rounded-2xl transition-colors">
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <Navbar/>
      <div className="pt-20 pb-16 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto py-12">
          <div className="text-center mb-10">
            <p className="text-orange-500 text-[11px] font-semibold tracking-[3px] uppercase mb-3">Legal</p>
            <h1 className="text-3xl font-black text-[#431407]"
              style={{ fontFamily:'Georgia,serif', letterSpacing:'-1px' }}>Privacy Policy</h1>
            <p className="text-stone-400 text-sm mt-2">Last updated: January 2026</p>
          </div>
          <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 space-y-6">
            {[
              { title:'Information We Collect', content:'We collect information you provide during registration including name, date of birth, community, mobile number, education, occupation and location. We also collect usage data to improve our services.' },
              { title:'How We Use Your Information', content:'Your information is used to create and display your matrimony profile to other registered members, facilitate connections between compatible matches, send notifications about interests and messages, and improve our platform.' },
              { title:'Profile Visibility', content:'Your profile is visible to registered and verified members on Wedly. Your mobile number is only shared when both parties agree. Photos are visible to logged-in members only.' },
              { title:'Data Security', content:'All data is stored securely using Supabase (enterprise-grade database). We use industry-standard encryption. Passwords are never stored in plain text.' },
              { title:'Your Rights', content:'You can edit or delete your profile at any time from Dashboard → Edit Profile. To permanently delete all your data, email support@wedly.co.in. We will process requests within 7 business days.' },
              { title:'Contact', content:'For privacy concerns, email us at support@wedly.co.in. We take all privacy matters seriously and respond within 48 hours.' },
            ].map(s => (
              <div key={s.title}>
                <h2 className="font-bold text-stone-800 text-base mb-2">{s.title}</h2>
                <p className="text-stone-500 text-sm leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
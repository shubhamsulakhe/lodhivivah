import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <Navbar/>
      <div className="pt-20 pb-16 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto py-12">
          <div className="text-center mb-10">
            <p className="text-orange-500 text-[11px] font-semibold tracking-[3px] uppercase mb-3">Legal</p>
            <h1 className="text-3xl font-black text-[#431407]"
              style={{ fontFamily:'Georgia,serif', letterSpacing:'-1px' }}>Terms of Use</h1>
            <p className="text-stone-400 text-sm mt-2">Last updated: January 2025</p>
          </div>
          <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 space-y-6">
            {[
              { title:'Eligibility', content:'You must be 18 years or older to register on Wedly. By creating an account you confirm you are of legal age and the information provided is accurate.' },
              { title:'Genuine Profiles Only', content:'All information in your profile must be truthful and accurate. Fake profiles, misleading information or impersonating others will result in immediate account suspension without refund.' },
              { title:'Respectful Conduct', content:'All users are expected to communicate respectfully. Harassment, abuse, obscene content or any form of inappropriate behavior will result in permanent ban. We have a zero-tolerance policy.' },
              { title:'Premium Plans', content:'Premium subscriptions are billed monthly. Cancellation stops future billing but does not provide refunds for the current period. Plans can be upgraded or changed at any time.' },
              { title:'Platform Usage', content:'Wedly is a matrimony platform only. Using the platform for commercial solicitation, spam, or any purpose other than finding a life partner is strictly prohibited.' },
              { title:'Limitation of Liability', content:'Wedly facilitates connections between users but is not responsible for the outcome of those connections. We strongly encourage users to meet in safe, public places and involve family members.' },
              { title:'Contact', content:'For any terms-related questions, contact us at support@wedly.co.in.' },
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
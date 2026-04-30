import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <>
      <Navbar/>
      <main className="pt-20 min-h-screen bg-cream">
        <div className="bg-gradient-to-r from-saffron-800 to-saffron-600 py-14">
          <div className="container text-center">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Terms of Service</h1>
            <p className="text-white/70">Last updated: April 2026</p>
          </div>
        </div>

        <div className="container py-12">
          <div className="max-w-3xl mx-auto card p-8 space-y-8">

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-stone-600 leading-relaxed">
                By creating an account on Wedly, you agree to these Terms of Service.
                If you do not agree, please do not use our platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">2. Eligibility</h2>
              <ul className="text-stone-600 space-y-2">
                <li>• You must be at least 18 years of age</li>
                <li>• You must be legally eligible to marry</li>
                <li>• You must provide accurate and truthful information</li>
                <li>• One account per person only</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">3. Profile Guidelines</h2>
              <ul className="text-stone-600 space-y-2">
                <li>• All information must be genuine and accurate</li>
                <li>• Photos must be recent and clearly show your face</li>
                <li>• Do not impersonate others or use fake information</li>
                <li>• Profiles with false information will be removed immediately</li>
                <li>• We reserve the right to approve or reject any profile</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">4. Prohibited Activities</h2>
              <ul className="text-stone-600 space-y-2">
                <li>• Creating fake or misleading profiles</li>
                <li>• Harassing or spamming other members</li>
                <li>• Sharing contact details obtained from the platform for commercial purposes</li>
                <li>• Using the platform for anything other than matrimony purposes</li>
                <li>• Attempting to hack or disrupt our services</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">5. Premium Plans</h2>
              <ul className="text-stone-600 space-y-2">
                <li>• Silver Plan: ₹199 for 1 month</li>
                <li>• Gold Plan: ₹399 for 3 months</li>
                <li>• Payments are non-refundable once activated</li>
                <li>• Plans are activated manually within 24 hours of payment confirmation</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">6. Account Termination</h2>
              <p className="text-stone-600 leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these terms,
                contain false information, or engage in inappropriate behavior without prior notice.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">7. Disclaimer</h2>
              <p className="text-stone-600 leading-relaxed">
                Wedly is a platform to connect potential matches. We do not guarantee
                successful marriages or relationships. Users are responsible for conducting
                their own due diligence before meeting anyone in person.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">8. Contact</h2>
              <div className="p-4 bg-saffron-50 rounded-xl">
                <p className="font-semibold text-stone-800">📧 support@wedly.co.in</p>
                <p className="text-stone-500 text-sm">🌐 www.wedly.co.in</p>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer/>
    </>
  )
}

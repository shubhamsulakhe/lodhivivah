import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Navbar/>
      <main className="pt-20 min-h-screen bg-cream">
        <div className="bg-gradient-to-r from-saffron-800 to-saffron-600 py-14">
          <div className="container text-center">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Privacy Policy</h1>
            <p className="text-white/70">Last updated: April 2026</p>
          </div>
        </div>

        <div className="container py-12">
          <div className="max-w-3xl mx-auto card p-8 space-y-8">

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">1. Information We Collect</h2>
              <p className="text-stone-600 leading-relaxed">
                We collect information you provide when creating a profile including your name,
                date of birth, email address, phone number, photos, family details, education,
                and occupation. We also collect usage data to improve our services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">2. How We Use Your Information</h2>
              <ul className="text-stone-600 space-y-2 leading-relaxed">
                <li>• To display your profile to potential matches within the platform</li>
                <li>• To send you notifications about interests and matches</li>
                <li>• To verify your identity and prevent fake profiles</li>
                <li>• To improve our platform and user experience</li>
                <li>• To send important updates about your account</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">3. Information Sharing</h2>
              <p className="text-stone-600 leading-relaxed mb-3">
                Your contact details (phone number, WhatsApp) are only visible to:
              </p>
              <ul className="text-stone-600 space-y-2">
                <li>• <strong>Premium members</strong> — can view contact details of all approved profiles</li>
                <li>• <strong>Free members</strong> — get 1 free contact view on mutual match</li>
                <li>• We <strong>never sell</strong> your data to third parties</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">4. Profile Approval</h2>
              <p className="text-stone-600 leading-relaxed">
                All profiles are manually reviewed by our admin team before being made visible.
                We reserve the right to reject profiles that violate our community guidelines
                or contain false information.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">5. Data Security</h2>
              <p className="text-stone-600 leading-relaxed">
                We use industry-standard security measures including encrypted connections (HTTPS),
                secure database storage via Supabase, and access controls to protect your data.
                Your password is encrypted and never stored in plain text.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">6. Your Rights</h2>
              <ul className="text-stone-600 space-y-2">
                <li>• Request deletion of your account and data</li>
                <li>• Update or correct your profile information anytime</li>
                <li>• Opt out of marketing communications</li>
                <li>• Request a copy of your data</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">7. Cookies</h2>
              <p className="text-stone-600 leading-relaxed">
                We use essential cookies to keep you logged in and improve your experience.
                We do not use advertising or tracking cookies.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-3">8. Contact Us</h2>
              <p className="text-stone-600 leading-relaxed">
                For any privacy concerns, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-saffron-50 rounded-xl">
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

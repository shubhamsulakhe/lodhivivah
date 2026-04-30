import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

const FAQS = [
  {
    q: 'How do I create a profile on Wedly?',
    a: 'Click "Register Free" → verify your email with OTP → set password → fill in your profile details. Your profile will be reviewed by our team within 24 hours.'
  },
  {
    q: 'Is Wedly free to use?',
    a: 'Yes! Basic features are completely free — you can browse profiles and send up to 2 interests per day. Premium plans (₹199/month or ₹399/3 months) unlock unlimited interests and contact details.'
  },
  {
    q: 'How long does profile approval take?',
    a: 'Our team reviews profiles within 24 hours. You will receive a WhatsApp notification once your profile is approved.'
  },
  {
    q: 'How do I send an Interest?',
    a: 'Browse profiles → click "Interest" button on any profile. Free members can send 2 interests per day. Premium members have unlimited interests.'
  },
  {
    q: 'How can I view contact details?',
    a: 'Contact details are available to Premium members. Free members get 1 free contact view when both parties accept each other\'s interest.'
  },
  {
    q: 'How do I upgrade to Premium?',
    a: 'Go to Premium page → select Silver or Gold plan → pay via UPI → send payment screenshot on WhatsApp → your account will be activated within 24 hours.'
  },
  {
    q: 'Can I edit my profile after submission?',
    a: 'Yes! Go to Dashboard → Edit Profile. You can update any information anytime.'
  },
  {
    q: 'What if I selected wrong gender (Bride/Groom)?',
    a: 'Go to Dashboard → Edit Profile → scroll to "Your Identity" section → change your gender selection → save changes.'
  },
  {
    q: 'Why is my profile not visible to others?',
    a: 'Your profile is only visible after admin approval. It typically takes 24 hours. Check your dashboard for current status.'
  },
  {
    q: 'How do I delete my account?',
    a: 'Contact us at support@wedly.co.in or WhatsApp us at +91 87706 07574 with your registered email and we will delete your account within 48 hours.'
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. We use industry-standard encryption and your contact details are only shown to verified premium members or on mutual match. We never sell your data.'
  },
  {
    q: 'Which communities does Wedly serve?',
    a: 'Currently we serve Lodhi Kshatriya Samaj across MP, CG, MH, UP and Rajasthan. We are expanding to more communities soon!'
  },
]

export default function HelpPage() {
  return (
    <>
      <Navbar/>
      <main className="pt-20 min-h-screen bg-cream">
        <div className="bg-gradient-to-r from-saffron-800 to-saffron-600 py-14">
          <div className="container text-center">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Help & FAQ</h1>
            <p className="text-white/70 text-lg">Frequently Asked Questions</p>
          </div>
        </div>

        <div className="container py-12">
          <div className="max-w-3xl mx-auto">

            <div className="space-y-4 mb-10">
              {FAQS.map((faq, i) => (
                <div key={i} className="card p-6">
                  <h3 className="font-bold text-stone-900 mb-2 flex items-start gap-2">
                    <span className="text-saffron-500 font-black flex-shrink-0">Q.</span>
                    {faq.q}
                  </h3>
                  <p className="text-stone-600 leading-relaxed pl-5">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            {/* Still need help */}
            <div className="card p-8 text-center bg-gradient-to-br from-saffron-50 to-yellow-50 border-2 border-saffron-200">
              <div className="text-4xl mb-3">🙋</div>
              <h3 className="text-xl font-black text-stone-900 mb-2">Still need help?</h3>
              <p className="text-stone-500 mb-5">
                Our support team is here to help you Mon-Sat 10AM to 6PM
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a href="https://wa.me/918770607574"
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary btn-md">
                  💬 WhatsApp Us
                </a>
                <a href="mailto:support@wedly.co.in"
                  className="btn btn-outline btn-md">
                  📧 Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  )
}

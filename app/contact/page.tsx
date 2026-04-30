import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mail, Phone, MessageCircle, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <>
      <Navbar/>
      <main className="pt-20 min-h-screen bg-cream">
        <div className="bg-gradient-to-r from-saffron-800 to-saffron-600 py-14">
          <div className="container text-center">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Contact Us</h1>
            <p className="text-white/70 text-lg">हम आपकी सहायता करने के लिए यहाँ हैं</p>
          </div>
        </div>

        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">

              {[
                {
                  icon: MessageCircle,
                  color: 'bg-green-50 text-green-600',
                  title: 'WhatsApp',
                  desc: 'Fastest response — chat with us',
                  value: '+91 87706 07574',
                  href: 'https://wa.me/918770607574?text=Hello Wedly Team!',
                  btn: 'Chat on WhatsApp',
                  btnColor: 'bg-green-500 hover:bg-green-600 text-white',
                },
                {
                  icon: Mail,
                  color: 'bg-blue-50 text-blue-600',
                  title: 'Email',
                  desc: 'For detailed queries',
                  value: 'support@wedly.co.in',
                  href: 'mailto:support@wedly.co.in',
                  btn: 'Send Email',
                  btnColor: 'bg-saffron-500 hover:bg-saffron-600 text-white',
                },
                {
                  icon: Phone,
                  color: 'bg-purple-50 text-purple-600',
                  title: 'Phone Call',
                  desc: 'Mon-Sat 10AM to 6PM',
                  value: '+91 87706 07574',
                  href: 'tel:+918770607574',
                  btn: 'Call Now',
                  btnColor: 'bg-purple-500 hover:bg-purple-600 text-white',
                },
                {
                  icon: MapPin,
                  color: 'bg-red-50 text-red-600',
                  title: 'Location',
                  desc: 'Balaghat, Madhya Pradesh',
                  value: 'India — Serving Nationwide',
                  href: '#',
                  btn: '',
                  btnColor: '',
                },
              ].map(({ icon: Icon, color, title, desc, value, href, btn, btnColor }) => (
                <div key={title} className="card p-6">
                  <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6"/>
                  </div>
                  <h3 className="font-bold text-stone-900 mb-1">{title}</h3>
                  <p className="text-stone-400 text-sm mb-2">{desc}</p>
                  <p className="font-semibold text-stone-700 mb-4">{value}</p>
                  {btn && (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className={`inline-block px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${btnColor}`}>
                      {btn}
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Hours */}
            <div className="card p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-saffron-600"/>
                <h3 className="font-bold text-stone-900">Support Hours</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-stone-500">Monday — Saturday</p>
                  <p className="font-semibold text-stone-800">10:00 AM — 6:00 PM</p>
                </div>
                <div>
                  <p className="text-stone-500">Sunday</p>
                  <p className="font-semibold text-stone-800">Closed</p>
                </div>
              </div>
            </div>

            {/* FAQ prompt */}
            <div className="card p-6 bg-saffron-50 border border-saffron-200 text-center">
              <p className="text-stone-700 font-semibold mb-2">
                Looking for quick answers?
              </p>
              <p className="text-stone-500 text-sm mb-4">
                Check our Help & FAQ section for common questions.
              </p>
              <a href="/help"
                className="inline-block px-6 py-2.5 bg-saffron-500 hover:bg-saffron-600
                           text-white font-bold rounded-xl text-sm transition-colors">
                View Help & FAQ →
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  )
}

import Link from 'next/link'
import Logo from './Logo'
import { Phone, Mail, MapPin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Logo variant="light" className="mb-4"/>
            <p className="text-stone-400 text-sm leading-relaxed mt-4">
              लोधी समाज का प्रमुख विवाह पोर्टल।<br/>
              At Janwa, Post Laweri, Teh. Kirnapur, Balaghat (M.P.) द्वारा संचालित।
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { label: 'WhatsApp', href: 'https://wa.me/919424741980', color: 'bg-green-600', icon: '💬' },
                { label: 'Call',     href: 'tel:+919424741980',          color: 'bg-saffron-600', icon: '📞' },
              ].map(({ label, href, color, icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                   className={`${color} text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity`}>
                  {icon} {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                ['/profiles',           'Browse Profiles'],
                ['/profiles?gender=female', 'Brides (वधू)'],
                ['/profiles?gender=male',   'Grooms (वर)'],
                ['/register',           'Register Free'],
                ['/premium',            'Premium Plans'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-stone-400 hover:text-saffron-400 text-sm transition-colors">
                    → {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Information</h4>
            <ul className="space-y-2.5">
              {[
                ['/about',   'About Us'],
                ['/contact', 'Contact'],
                ['/help',    'Help & FAQ'],
                ['/privacy', 'Privacy Policy'],
                ['/terms',   'Terms of Service'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-stone-400 hover:text-saffron-400 text-sm transition-colors">
                    → {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-stone-400">
                <MapPin className="w-4 h-4 text-saffron-500 flex-shrink-0 mt-0.5"/>
                At Janwa, Post Laweri, Teh. Kirnapur, Balaghat, MP
              </li>
              <li>
                <a href="tel:+918956575219" className="flex gap-3 text-sm text-stone-400 hover:text-saffron-400 transition-colors">
                  <Phone className="w-4 h-4 text-saffron-500 flex-shrink-0"/>
                  +91 8956575219
                </a>
              </li>
              <li>
                <a href="mailto:shubham.sulakhe107@gmail.com" className="flex gap-3 text-sm text-stone-400 hover:text-saffron-400 transition-colors">
                  <Mail className="w-4 h-4 text-saffron-500 flex-shrink-0"/>
                  shubham.sulakhe107@gmail.com
                </a>
              </li>
            </ul>
            <div className="mt-5 p-3 bg-stone-900 rounded-xl text-xs text-stone-500">
              Reg. No: 04/21/01/09323/08
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-stone-800">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-stone-500 text-xs">© 2026 LodhiVivah. All rights reserved.</p>
          <p className="text-stone-600 text-xs flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500"/> for Lodhi Samaj
          </p>
        </div>
      </div>
    </footer>
  )
}

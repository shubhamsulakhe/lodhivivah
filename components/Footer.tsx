import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-[#1a0800] text-white">
      {/* Main footer */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo variant="light" size="md" showTagline className="mb-4"/>
            <p className="text-white/40 text-sm leading-relaxed mb-4 max-w-xs">
              India's most trusted community matrimony platform. Verified profiles, live chat, voice calls — free to join.
            </p>
            <p className="text-orange-400/60 text-xs">
              भारत का सबसे भरोसेमंद<br/>समाज विवाह मंच।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-4">Platform</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { href:'/profiles',  label:'Browse Profiles',  hindi:'प्रोफाइल देखें' },
                { href:'/register',  label:'Register Free',    hindi:'मुफ्त रजिस्टर'  },
                { href:'/login',     label:'Login',            hindi:'लॉगिन'           },
                { href:'/premium',   label:'Premium Plans',    hindi:'प्रीमियम प्लान' },
                { href:'/chat',      label:'Messages',         hindi:'मैसेज'           },
                { href:'/dashboard', label:'Dashboard',        hindi:'डैशबोर्ड'        },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-2 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">{l.label}</span>
                  <span className="text-[10px] text-white/20 group-hover:text-orange-400/50 transition-colors">{l.hindi}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Communities */}
          <div>
            <h4 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-4">Communities</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { name:'Lodhi Kshatriya', hindi:'लोधी क्षत्रिय', active:true  },
                { name:'Yadav Samaj',     hindi:'यादव समाज',     active:true },
                { name:'Kurmi Samaj',     hindi:'कुर्मी समाज',   active:true },
                { name:'Kirar Samaj',     hindi:'किरार समाज',    active:true },
                { name:'Rajput Samaj',    hindi:'राजपूत समाज',   active:true },
                { name:'+ More coming',  hindi:'और जल्द',        active:false },
              ].map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.active ? 'bg-emerald-400' : 'bg-white/20'}`}/>
                  <span className={`text-sm ${c.active ? 'text-white/70' : 'text-white/35'}`}>{c.name}</span>
                  {c.active && <span className="text-[9px] text-emerald-400/70 font-medium">Live</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-4">Company</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { href:'/about',   label:'About Wedly'    },
                { href:'/contact', label:'Contact Us'     },
                { href:'/help',    label:'Help Center'    },
                { href:'/privacy', label:'Privacy Policy' },
                { href:'/terms',   label:'Terms of Use'   },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="text-white/40 hover:text-white text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-white/8">
              <p className="text-white/30 text-xs mb-2">Support</p>
              <a href="mailto:support@wedly.co.in"
                className="text-orange-400/60 hover:text-orange-400 text-xs transition-colors block">
                support@wedly.co.in
              </a>
              <a href="https://wedly.co.in" target="_blank"
                className="text-orange-400/60 hover:text-orange-400 text-xs transition-colors block mt-1">
                wedly.co.in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/6">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row
                        items-center justify-between gap-3">
          <p className="text-white/25 text-xs text-center sm:text-left">
            © 2026 Wedly. Made with ❤️ for Indian communities · भारतीय समाज के लिए
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-white/25 hover:text-white/50 text-xs transition-colors">Privacy</Link>
            <Link href="/terms"   className="text-white/25 hover:text-white/50 text-xs transition-colors">Terms</Link>
            <Link href="/contact" className="text-white/25 hover:text-white/50 text-xs transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
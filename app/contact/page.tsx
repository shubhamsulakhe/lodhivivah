'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', message:'' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all fields'); return }
    setLoading(true)
    // Open mailto
    window.location.href = `mailto:support@wedly.co.in?subject=Query from ${form.name}&body=${form.message}%0A%0AFrom: ${form.email}`
    toast.success('Opening email client…')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <Navbar/>
      <div className="pt-20 pb-16 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto py-12">

          <div className="text-center mb-10">
            <p className="text-orange-500 text-[11px] font-semibold tracking-[3px] uppercase mb-3">Get in Touch</p>
            <h1 className="text-3xl sm:text-4xl font-black text-[#431407]"
              style={{ fontFamily:'Georgia,serif', letterSpacing:'-1px' }}>
              हम यहाँ हैं।<br/>
              <em className="text-orange-600" style={{ fontStyle:'italic', fontWeight:300 }}>We're here to help.</em>
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon:Mail,           title:'Email',     val:'support@wedly.co.in', href:'mailto:support@wedly.co.in', bg:'bg-orange-50', ic:'text-orange-600' },
              { icon:MessageCircle,  title:'WhatsApp',  val:'Chat with us',        href:'https://wa.me/918770607574',  bg:'bg-green-50',  ic:'text-green-600'  },
              { icon:Phone,          title:'Support',   val:'Mon–Sat 10am–6pm',    href:'#',                          bg:'bg-blue-50',   ic:'text-blue-600'   },
            ].map(c => (
              <a key={c.title} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined}
                className="bg-white rounded-2xl p-5 border border-orange-100 text-center
                           hover:border-orange-300 hover:shadow-md transition-all">
                <div className={`w-11 h-11 ${c.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <c.icon className={`w-5 h-5 ${c.ic}`}/>
                </div>
                <div className="font-semibold text-stone-800 text-sm mb-1">{c.title}</div>
                <div className="text-stone-400 text-xs">{c.val}</div>
              </a>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-stone-800 mb-5">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-500 block mb-1.5">Your Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name:e.target.value }))}
                    placeholder="Rahul Lodhi"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm
                               outline-none focus:border-orange-400 transition-colors bg-[#fffaf6]"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 block mb-1.5">Email</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email:e.target.value }))}
                    placeholder="you@email.com"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm
                               outline-none focus:border-orange-400 transition-colors bg-[#fffaf6]"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 block mb-1.5">Message</label>
                <textarea value={form.message}
                  onChange={e => setForm(p => ({ ...p, message:e.target.value }))}
                  rows={4} placeholder="How can we help you?"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm
                             outline-none focus:border-orange-400 transition-colors resize-none bg-[#fffaf6]"/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold
                           py-3.5 rounded-2xl transition-colors disabled:opacity-60 text-sm">
                {loading ? 'Sending…' : 'Send Message →'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
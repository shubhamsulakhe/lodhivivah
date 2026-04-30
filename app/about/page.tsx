import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Heart, Users, Shield, Globe, Star, Target } from 'lucide-react'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-cream">

        {/* Hero */}
        <div className="bg-gradient-to-br from-saffron-800 via-saffron-700 to-saffron-500 py-20">
          <div className="container text-center">
            <div className="text-5xl mb-4">💑</div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
              About Wedly
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
              A community-driven matrimony platform built with love —
              connecting hearts within communities across India.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="container py-16">
          <div className="max-w-3xl mx-auto">

            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-black text-stone-900 mb-4">Our Story</h2>
              <p className="text-stone-600 leading-relaxed mb-4">
                There are millions of people across India who deeply value their roots,
                their culture, and their community. They celebrate their traditions,
                take pride in their heritage, and when it comes to finding a life partner —
                they want someone who truly understands and shares that same world.
              </p>
              <p className="text-stone-600 leading-relaxed mb-4">
                For them, finding a partner within their own community is not a limitation —
                it's a <strong>beautiful choice</strong>. A choice to build a family grounded
                in shared values, shared festivals, shared language, and a shared way of life.
              </p>
              <p className="text-stone-600 leading-relaxed mb-4">
                <strong>Wedly</strong> was built for these people. We started with
                <strong> Lodhi Kshatriya Samaj</strong> — one of India's most proud and
                vibrant communities — with a mission to give every member a trusted,
                modern platform to find their ideal match within their own community.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Today, Wedly is growing into a platform for <strong>all communities</strong> —
                because every community deserves a space where their culture is celebrated,
                their values are respected, and love finds its perfect home.
              </p>
            </div>

            {/* Vision */}
            <div className="card p-8 mb-8 bg-gradient-to-br from-saffron-50 to-yellow-50 border-2 border-saffron-100">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-saffron-600" />
                <h2 className="text-2xl font-black text-stone-900">Our Vision</h2>
              </div>
              <p className="text-stone-700 leading-relaxed text-lg italic">
                "To become India's most trusted community-driven matrimony platform —
                where every community can connect, celebrate their culture, and find
                life partners who share their values."
              </p>
            </div>

            {/* Values */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[
                {
                  icon: Shield,
                  color: 'bg-blue-50 text-blue-600',
                  title: 'Trust & Safety',
                  desc: 'Every profile is manually verified by our team before going live.'
                },
                {
                  icon: Heart,
                  color: 'bg-pink-50 text-pink-600',
                  title: 'Community First',
                  desc: 'Built for communities, by communities. We celebrate your culture.'
                },
                {
                  icon: Globe,
                  color: 'bg-emerald-50 text-emerald-600',
                  title: 'Expanding Together',
                  desc: 'Starting with Lodhi Samaj, growing to serve all communities.'
                },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="card p-6 text-center">
                  <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-stone-900 mb-2">{title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Currently serving */}
            <div className="card p-8 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <Users className="w-6 h-6 text-saffron-600" />
                <h2 className="text-2xl font-black text-stone-900">Currently Serving</h2>
              </div>
              <div className="flex items-center gap-4 p-4 bg-saffron-50 rounded-2xl border border-saffron-100 mb-4">
                <div className="w-12 h-12 bg-saffron-500 rounded-xl flex items-center justify-center text-white font-black text-lg">
                  L
                </div>
                <div>
                  <p className="font-bold text-stone-900">Lodhi Kshatriya Samaj</p>
                  <p className="text-stone-500 text-sm">
                    Madhya Pradesh, Chhattisgarh, Maharashtra, Uttar Pradesh & more
                  </p>
                </div>
                <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                  Active ✓
                </span>
              </div>
              <p className="text-stone-400 text-sm">
                More communities coming soon — Kurmi, Patel, Rajput, and many more.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { val: '2000+', label: 'Profiles' },
                { val: '500+', label: 'Marriages' },
                { val: '10+', label: 'States' },
                { val: '100%', label: 'Free to Join' },
              ].map(({ val, label }) => (
                <div key={label} className="card p-5 text-center">
                  <div className="text-2xl font-black text-saffron-600">{val}</div>
                  <div className="text-stone-400 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="card p-8 text-center bg-gradient-to-br from-saffron-800 to-saffron-600">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="text-2xl font-black text-white mb-2">Join Wedly Today</h3>
              <p className="text-white/75 mb-5">
                Be part of India's fastest growing community matrimony platform.
              </p>
              <Link href="/login" className="btn btn-white btn-lg">
                Register Free — Start Now
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

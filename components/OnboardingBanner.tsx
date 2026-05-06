// components/OnboardingBanner.tsx
// Shows inside dashboard for incomplete profiles

'use client'
import Link from 'next/link'
import { ArrowRight, Camera, MapPin, User, Briefcase, Check } from 'lucide-react'

interface OnboardingBannerProps {
  profile: any
  completeness: number
}

const MISSING_STEPS = [
  { key: 'photo_url',   icon: Camera,    label: 'Add photo',        hindi: 'फोटो डालें',        href: '/profile/edit?tab=photo',    points: 12 },
  { key: 'occupation',  icon: Briefcase, label: 'Add occupation',   hindi: 'व्यवसाय डालें',      href: '/profile/edit?tab=career',   points: 8  },
  { key: 'city',        icon: MapPin,    label: 'Add your city',    hindi: 'शहर डालें',           href: '/profile/edit?tab=location', points: 8  },
  { key: 'about_me',    icon: User,      label: 'Write about you',  hindi: 'अपने बारे में लिखें', href: '/profile/edit?tab=about',    points: 8  },
]

export default function OnboardingBanner({ profile, completeness }: OnboardingBannerProps) {
  if (completeness >= 80) return null

  const missing = MISSING_STEPS.filter(s => !profile[s.key] || (s.key === 'about_me' && profile[s.key]?.length < 50))

  if (missing.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-[#7c2d12] to-[#c2410c] rounded-2xl p-5 sm:p-6 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize:'20px 20px' }}/>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-bold text-sm">Complete your profile</p>
            <p className="text-orange-200/70 text-xs">प्रोफाइल पूरी करें — get {missing.length * 8}% more visibility</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">{completeness}%</div>
            <div className="text-[10px] text-orange-200/60">Complete</div>
          </div>
        </div>

        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-white rounded-full transition-all"
            style={{ width:`${completeness}%` }}/>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {missing.slice(0, 4).map(step => (
            <Link key={step.key} href={step.href}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25
                         border border-white/20 rounded-xl px-3 py-2.5 transition-all group">
              <step.icon className="w-3.5 h-3.5 text-orange-200 flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">{step.label}</div>
                <div className="text-orange-200/60 text-[9px]">+{step.points}%</div>
              </div>
              <ArrowRight className="w-3 h-3 text-white/50 group-hover:text-white transition-colors flex-shrink-0"/>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
// components/PremiumNudge.tsx
// Smart contextual nudges to push users toward premium
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Crown, X, Lock, Phone, Users, Eye, ArrowRight } from 'lucide-react'

interface PremiumNudgeProps {
  type: 'contact' | 'community' | 'interest_limit' | 'photo' | 'voice_call' | 'profile_viewers'
  userName?: string
  onDismiss?: () => void
  compact?: boolean
}

const NUDGES = {
  contact: {
    icon:    '📞',
    title:   'View Contact Number',
    hindi:   'नंबर देखें',
    desc:    'Upgrade to Silver to view contact details of your matches.',
    cta:     'Get Silver — ₹199/mo',
    plan:    'silver',
    color:   'from-slate-50 to-slate-100 border-slate-300',
    btnColor:'bg-slate-700 hover:bg-slate-800',
  },
  community: {
    icon:    '🌍',
    title:   'Browse All Communities',
    hindi:   'सभी समाज देखें',
    desc:    'Gold members can browse profiles from all 11+ communities across India.',
    cta:     'Get Gold — ₹399/mo',
    plan:    'gold',
    color:   'from-yellow-50 to-amber-50 border-yellow-300',
    btnColor:'bg-yellow-600 hover:bg-yellow-700',
  },
  interest_limit: {
    icon:    '💝',
    title:   'Daily Limit Reached',
    hindi:   'आज की limit खत्म',
    desc:    'You\'ve sent 2 interests today. Upgrade to Silver for unlimited interests.',
    cta:     'Unlimited Interests — ₹199/mo',
    plan:    'silver',
    color:   'from-pink-50 to-rose-50 border-pink-300',
    btnColor:'bg-pink-600 hover:bg-pink-700',
  },
  photo: {
    icon:    '📸',
    title:   'See Full Photos',
    hindi:   'पूरी फोटो देखें',
    desc:    'Silver members see clear profile photos. Upgrade to connect better.',
    cta:     'See Photos — ₹199/mo',
    plan:    'silver',
    color:   'from-orange-50 to-amber-50 border-orange-300',
    btnColor:'bg-orange-600 hover:bg-orange-700',
  },
  voice_call: {
    icon:    '📞',
    title:   'Voice Call Feature',
    hindi:   'Voice Call करें',
    desc:    'Gold members can make direct voice calls to their matches without sharing number.',
    cta:     'Enable Calls — ₹399/mo',
    plan:    'gold',
    color:   'from-blue-50 to-indigo-50 border-blue-300',
    btnColor:'bg-blue-600 hover:bg-blue-700',
  },
  profile_viewers: {
    icon:    '👀',
    title:   'See Who Viewed You',
    hindi:   'किसने देखा जानें',
    desc:    'Gold members can see exactly who viewed their profile. Don\'t miss potential matches!',
    cta:     'See Viewers — ₹399/mo',
    plan:    'gold',
    color:   'from-purple-50 to-violet-50 border-purple-300',
    btnColor:'bg-purple-600 hover:bg-purple-700',
  },
}

export default function PremiumNudge({ type, userName, onDismiss, compact = false }: PremiumNudgeProps) {
  const [dismissed, setDismissed] = useState(false)
  const nudge = NUDGES[type]
  if (!nudge || dismissed) return null

  function dismiss() {
    setDismissed(true)
    onDismiss?.()
  }

  if (compact) return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border bg-gradient-to-r ${nudge.color}`}>
      <span className="text-xl flex-shrink-0">{nudge.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-stone-800">{nudge.title}</p>
        <p className="text-[10px] text-stone-500">{nudge.hindi}</p>
      </div>
      <Link href={`/premium`}
        className={`${nudge.btnColor} text-white text-[10px] font-bold px-3 py-1.5
                   rounded-lg transition-colors flex-shrink-0`}>
        Upgrade
      </Link>
    </div>
  )

  return (
    <div className={`relative rounded-2xl border-2 p-5 bg-gradient-to-br ${nudge.color}`}>
      {onDismiss && (
        <button onClick={dismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/80
                     flex items-center justify-center text-stone-400 hover:text-stone-600">
          <X className="w-3.5 h-3.5"/>
        </button>
      )}
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{nudge.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-stone-900 text-sm">{nudge.title}</h3>
            <span className="text-[9px] bg-white/70 text-stone-600 px-1.5 py-0.5 rounded-full font-medium border border-white">
              {nudge.plan.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium mb-1">{nudge.hindi}</p>
          <p className="text-xs text-stone-500 leading-relaxed mb-3">{nudge.desc}</p>
          <Link href="/premium"
            className={`inline-flex items-center gap-2 ${nudge.btnColor} text-white
                       text-xs font-bold px-4 py-2.5 rounded-xl transition-colors`}>
            <Crown className="w-3.5 h-3.5"/> {nudge.cta}
          </Link>
        </div>
      </div>
    </div>
  )
}

// Floating upgrade bar — shown in browse page for free users
export function UpgradeBar({ plan = 'silver', message }: { plan?: string; message: string }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-[#fffaf6] to-transparent pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <div className="bg-[#7c2d12] rounded-2xl p-4 flex items-center gap-3 shadow-xl">
          <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400 flex-shrink-0"/>
          <p className="flex-1 text-white text-sm font-medium">{message}</p>
          <Link href="/premium"
            className="bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold
                       px-4 py-2 rounded-xl transition-colors flex-shrink-0 flex items-center gap-1">
            Upgrade <ArrowRight className="w-3 h-3"/>
          </Link>
          <button onClick={() => setDismissed(true)}
            className="text-white/50 hover:text-white flex-shrink-0">
            <X className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  )
}
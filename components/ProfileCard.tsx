'use client'
import Link from 'next/link'
import { MapPin, GraduationCap, Briefcase, Crown, CheckCircle, Heart, Eye, Lock } from 'lucide-react'
import { cn, getAge, cmToFeet } from '@/lib/utils'

export default function ProfileCard({
  profile, onInterest, interestSent = false, blurred = false
}: {
  profile: any
  onInterest?: (id: string) => void
  interestSent?: boolean
  blurred?: boolean
}) {
  const age      = getAge(profile.date_of_birth)
  const isFemale = profile.gender === 'female'

  return (
    <div className={cn('profile-card group relative', profile.is_premium && 'profile-card-gold')}>

      {/* Blur overlay for guests */}
      {blurred && (
        <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/30 rounded-3xl
                        flex flex-col items-center justify-center gap-3">
          <Lock className="w-8 h-8 text-saffron-500" />
          <p className="text-stone-700 font-bold text-sm text-center px-4">
            Login to view profile
          </p>
          <Link href="/register"
            className="btn btn-primary btn-sm">
            Register Free
          </Link>
        </div>
      )}

      {/* Photo */}
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        {profile.photo_url ? (
          <img
            src={profile.photo_url}
            alt={profile.name}
            className={cn(
              'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500',
              blurred && 'blur-md'
            )}
          />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center text-6xl font-black',
            isFemale
              ? 'bg-gradient-to-br from-pink-100 via-rose-100 to-red-100 text-rose-300'
              : 'bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 text-blue-300',
            blurred && 'blur-md'
          )}>
            {profile.name?.charAt(0)}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* Top badges */}
        {!blurred && (
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {profile.is_premium && (
              <span className="badge-gold flex items-center gap-1 shadow-sm">
                <Crown className="w-3 h-3 fill-yellow-500" /> {profile.plan?.toUpperCase()}
              </span>
            )}
            <span className="badge-verified flex items-center gap-1 shadow-sm">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          </div>
        )}

        {/* Gender badge */}
        {!blurred && (
          <div className="absolute top-3 right-3">
            <span className={cn('badge shadow-sm', isFemale ? 'badge-female' : 'badge-male')}>
              {isFemale ? '♀ Bride' : '♂ Groom'}
            </span>
          </div>
        )}

        {/* Name at bottom */}
        <div className="absolute bottom-0 inset-x-0 p-4">
          <p className={cn('text-white font-bold text-lg leading-tight', blurred && 'blur-sm')}>
            {profile.name}
          </p>
          <p className={cn('text-white/80 text-sm', blurred && 'blur-sm')}>
            {age} yrs • {cmToFeet(profile.height_cm || 160)}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className={cn('p-4 space-y-2', blurred && 'blur-sm pointer-events-none')}>
        <div className="flex items-center gap-2 text-stone-500 text-sm">
          <GraduationCap className="w-4 h-4 text-saffron-400 flex-shrink-0" />
          <span className="truncate">{profile.education || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-500 text-sm">
          <Briefcase className="w-4 h-4 text-saffron-400 flex-shrink-0" />
          <span className="truncate">{profile.occupation || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-500 text-sm">
          <MapPin className="w-4 h-4 text-saffron-400 flex-shrink-0" />
          <span className="truncate">{profile.city}, {profile.state}</span>
        </div>
        {profile.gotra && (
          <div className="pt-2 border-t border-stone-100">
            <span className="text-xs text-saffron-700 bg-saffron-50 border border-saffron-100
                             px-2.5 py-1 rounded-full font-medium">
              गोत्र: {profile.gotra}
            </span>
          </div>
        )}

        {/* Actions */}
        {!blurred && (
          <div className="flex gap-2 pt-1">
            <Link href={`/profiles/${profile.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-saffron-50
                         hover:bg-saffron-100 text-saffron-700 py-2.5 rounded-xl
                         text-sm font-bold transition-colors">
              <Eye className="w-3.5 h-3.5" /> View
            </Link>
            {onInterest && (
              <button
                onClick={() => onInterest(profile.id)}
                disabled={interestSent}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all',
                  interestSent
                    ? 'bg-pink-50 text-pink-500 cursor-default'
                    : 'bg-gradient-to-r from-maroon-700 to-maroon-600 text-white hover:opacity-90 active:scale-95'
                )}>
                <Heart className={cn('w-3.5 h-3.5', interestSent && 'fill-pink-400')} />
                {interestSent ? 'Sent!' : 'Interest'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ProfileCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-56 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton rounded-full w-3/4" />
        <div className="h-4 skeleton rounded-full w-1/2" />
        <div className="h-4 skeleton rounded-full w-2/3" />
        <div className="flex gap-2 pt-1">
          <div className="h-10 skeleton rounded-xl flex-1" />
          <div className="h-10 skeleton rounded-xl flex-1" />
        </div>
      </div>
    </div>
  )
}

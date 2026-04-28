import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ variant = 'dark', size = 'md', className }: LogoProps) {
  const sizes = {
    sm: { icon: 32, title: 'text-base', sub: 'text-[10px]' },
    md: { icon: 40, title: 'text-lg',   sub: 'text-[11px]' },
    lg: { icon: 52, title: 'text-2xl',  sub: 'text-sm' },
  }
  const s = sizes[size] || sizes['md']

  return (
    <Link href="/" className={cn('flex items-center gap-3 group', className)}>
      {/* Icon */}
      <div className="relative flex-shrink-0" style={{ width: s.icon, height: s.icon }}>
        {/* Spinning gradient ring */}
        <svg
          width={s.icon} height={s.icon} viewBox="0 0 52 52"
          className="absolute inset-0 animate-spin-slow"
        >
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#f97316"/>
              <stop offset="33%"  stopColor="#fbbf24"/>
              <stop offset="66%"  stopColor="#f43f5e"/>
              <stop offset="100%" stopColor="#f97316"/>
            </linearGradient>
          </defs>
          <circle cx="26" cy="26" r="24" fill="none" stroke="url(#ring-grad)" strokeWidth="2.5"
            strokeDasharray="60 90" strokeLinecap="round"/>
        </svg>
        {/* White circle */}
        <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center shadow-inner"
             style={{ background: 'linear-gradient(135deg, #fff8f1 0%, #ffffff 100%)' }}>
          {/* Heart + Om symbol */}
          <svg width={s.icon * 0.52} height={s.icon * 0.52} viewBox="0 0 28 28" fill="none">
            {/* Heart shape */}
            <path
              d="M14 23.5S3 16.5 3 9.5A5.5 5.5 0 0 1 14 7.13 5.5 5.5 0 0 1 25 9.5C25 16.5 14 23.5 14 23.5z"
              fill="url(#heart-grad)"
            />
            {/* ॐ symbol overlay */}
            <text x="14" y="17" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold"
              style={{ fontFamily: 'serif' }}>ॐ</text>
            <defs>
              <linearGradient id="heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ea580c"/>
                <stop offset="100%" stopColor="#9f1239"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Text */}
      <div>
        <div className={cn(
          'font-black leading-tight tracking-tight',
          s.title,
          variant === 'light' ? 'text-white' : 'text-stone-900'
        )}>
          <span className="gradient-text">Lodhi</span>
          <span className={variant === 'light' ? 'text-white' : 'text-stone-800'}>Vivah</span>
        </div>
        <div className={cn(
          'font-medium leading-tight',
          s.sub,
          variant === 'light' ? 'text-orange-100' : 'text-stone-400'
        )}>
          लोधी समाज विवाह
        </div>
      </div>
    </Link>
  )
}

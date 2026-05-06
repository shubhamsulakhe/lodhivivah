import Link from 'next/link'

interface LogoProps {
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showTagline?: boolean
}

export default function Logo({ variant = 'dark', size = 'md', className = '', showTagline = false }: LogoProps) {
  const sizes = { sm: { icon: 28, text: 16, tag: 9 }, md: { icon: 36, text: 20, tag: 10 }, lg: { icon: 46, text: 26, tag: 12 } }
  const s = sizes[size]
  const textColor = variant === 'light' ? 'text-white' : 'text-[#7c2d12]'
  const subColor  = variant === 'light' ? 'text-orange-200' : 'text-orange-600'

  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <defs>
          <linearGradient id="wedly-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#7c2d12"/>
            <stop offset="50%"  stopColor="#c2410c"/>
            <stop offset="100%" stopColor="#f97316"/>
          </linearGradient>
        </defs>
        <rect width="140" height="140" rx="32" fill="url(#wedly-grad)"/>
        <path d="M50 28C50 23 46 18 41 22C36 18 32 23 32 28C32 34 41 41 41 41C41 41 50 34 50 28Z" fill="white" opacity="0.95"/>
        <path d="M68 28C68 23 64 18 59 22C54 18 50 23 50 28C50 34 59 41 59 41C59 41 68 34 68 28Z" fill="white" opacity="0.72"/>
        <path d="M18 46L38 98L54 68L70 98L90 46" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div>
        <span className={`font-black ${textColor} leading-none block`}
          style={{ fontFamily:'Georgia,serif', fontSize: s.text, letterSpacing: '-0.5px' }}>
          Wedly
        </span>
        {showTagline && (
          <span className={`${subColor} block leading-none`} style={{ fontSize: s.tag }}>
            Find Your Forever
          </span>
        )}
      </div>
    </Link>
  )
}
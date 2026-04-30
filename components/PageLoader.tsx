'use client'
import { useEffect, useState } from 'react'

export default function PageLoader() {
  const [visible, setVisible] = useState(true)
  const [hiding, setHiding]   = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHiding(true)
      setTimeout(() => setVisible(false), 600)
    }, 1400)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      zIndex:         9999,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'linear-gradient(145deg, #1c0a00 0%, #3a1200 50%, #1c0a00 100%)',
      opacity:        hiding ? 0 : 1,
      transition:     'opacity 0.6s ease',
      pointerEvents:  hiding ? 'none' : 'all',
    }}>
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,72,12,0.15) 0%, transparent 70%)',
        animation: 'wedly-pulse-bg 2s ease-in-out infinite',
      }}/>

      {[
        { left: '15%', top: '20%', delay: '0s' },
        { left: '80%', top: '30%', delay: '0.5s' },
        { left: '10%', top: '70%', delay: '1s' },
        { left: '85%', top: '65%', delay: '1.5s' },
        { left: '50%', top: '15%', delay: '2s' },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.left, top: p.top,
          width: '4px', height: '4px', borderRadius: '50%',
          background: 'rgba(249,115,22,0.5)',
          animation: `wedly-float 4s ease-in-out ${p.delay} infinite`,
        }}/>
      ))}

      <div style={{ position: 'relative', width: '120px', height: '80px', marginBottom: '28px' }}>
        <div style={{
          position: 'absolute', width: '84px', height: '84px',
          left: '-7px', top: '-2px', borderRadius: '50%',
          border: '1.5px solid rgba(249,115,22,0.2)',
          animation: 'wedly-spin-rev 3s linear infinite',
        }}/>
        <div style={{
          position: 'absolute', width: '84px', height: '84px',
          left: '43px', top: '-2px', borderRadius: '50%',
          border: '1.5px solid rgba(249,115,22,0.2)',
          animation: 'wedly-spin 3s linear infinite',
        }}/>
        <div style={{
          position: 'absolute', left: 0, top: '5px',
          width: '70px', height: '70px', borderRadius: '50%',
          border: '5px solid transparent',
          borderTopColor: '#c2410c', borderRightColor: '#c2410c',
          animation: 'wedly-spin 1.4s linear infinite',
        }}/>
        <div style={{
          position: 'absolute', left: '50px', top: '5px',
          width: '70px', height: '70px', borderRadius: '50%',
          border: '5px solid transparent',
          borderBottomColor: '#f97316', borderLeftColor: '#f97316',
          animation: 'wedly-spin-rev 1.4s linear infinite',
        }}/>
        <svg style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '20px', height: '18px',
          animation: 'wedly-heartbeat 1.4s ease-in-out infinite',
        }} viewBox="0 0 18 16" fill="none">
          <path d="M9 14.5 C9 14.5 1 9 1 4.5 C1 2.5 2.5 1 4.5 1 C6 1 7.5 2 9 3.5 C10.5 2 12 1 13.5 1 C15.5 1 17 2.5 17 4.5 C17 9 9 14.5 9 14.5Z" fill="#f97316"/>
        </svg>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '12px' }}>
        <span style={{
          fontFamily: 'Georgia, serif', fontSize: '52px', fontWeight: 700,
          background: 'linear-gradient(135deg, #f97316, #fdba74)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', letterSpacing: '-1px',
        }}>Wed</span>
        <span style={{
          fontFamily: 'Georgia, serif', fontSize: '52px', fontWeight: 400,
          color: 'rgba(253,186,116,0.7)', letterSpacing: '-1px',
        }}>ly</span>
      </div>

      <div style={{
        width: '160px', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)',
        marginBottom: '14px',
        animation: 'wedly-shimmer 2s ease-in-out infinite',
      }}/>

      <div style={{
        fontFamily: 'Arial, sans-serif', fontSize: '11px',
        color: 'rgba(249,115,22,0.7)', letterSpacing: '3px',
        textTransform: 'uppercase', marginBottom: '32px',
      }}>Finding your forever</div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#f97316',
            animation: `wedly-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes wedly-spin { to { transform: rotate(360deg); } }
        @keyframes wedly-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes wedly-heartbeat {
          0%, 100% { transform: translate(-50%,-50%) scale(1); }
          50% { transform: translate(-50%,-50%) scale(1.4); }
        }
        @keyframes wedly-pulse-bg {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes wedly-shimmer {
          0% { transform: scaleX(0.3); opacity: 0.5; }
          50% { transform: scaleX(1); opacity: 1; }
          100% { transform: scaleX(0.3); opacity: 0.5; }
        }
        @keyframes wedly-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes wedly-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-16px) scale(1.5); opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}
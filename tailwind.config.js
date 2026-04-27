/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50:  '#fff8f1',
          100: '#ffecd8',
          200: '#ffd5ab',
          300: '#ffb872',
          400: '#ff8f37',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        maroon: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        cream: '#FFFBF5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulse2: {
          '0%,100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-up-1': 'fade-up 0.6s 0.1s ease-out both',
        'fade-up-2': 'fade-up 0.6s 0.25s ease-out both',
        'fade-up-3': 'fade-up 0.6s 0.4s ease-out both',
        'fade-up-4': 'fade-up 0.6s 0.55s ease-out both',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
        pulse2: 'pulse2 2.5s ease-in-out infinite',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #7c2d12 0%, #c2410c 30%, #ea580c 60%, #f97316 85%, #fbbf24 100%)',
        'card-gradient': 'linear-gradient(135deg, #fff8f1 0%, #ffecd8 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(0,0,0,0.07)',
        card: '0 2px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 40px rgba(234,88,12,0.15)',
        glow: '0 0 32px rgba(249,115,22,0.25)',
        'glow-gold': '0 0 32px rgba(251,191,36,0.3)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

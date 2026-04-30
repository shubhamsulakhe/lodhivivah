import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: { default: 'Wedly — लोधी समाज विवाह', template: '%s | Wedly' },
  description: 'Lodhi Samaj का विश्वसनीय विवाह पोर्टल।',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title:       'Wedly — लोधी समाज विवाह',
    description: 'Find your perfect match on Wedly',
    url:         'https://www.wedly.co.in',
    siteName:    'Wedly',
    images: [{
      url:    'https://www.wedly.co.in/android-chrome-512x512.png',
      width:  512,
      height: 512,
    }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>

        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#1c1917',
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
              padding: '14px 20px',
              fontWeight: '500',
              fontSize: '14px',
              border: '1px solid #fde8d8',
            },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
            error: { iconTheme: { primary: '#e11d48', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}

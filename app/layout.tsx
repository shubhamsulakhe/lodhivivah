import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: { default: 'LodhiVivah – लोधी समाज विवाह', template: '%s | LodhiVivah' },
  description: 'लोधी समाज का प्रमुख विवाह पोर्टल। Balaghat MP – Managed by Shubham Sulakhe.',
  keywords: ['Lodhi Samaj Vivah', 'LodhiVivah', 'Lodhi matrimony', 'लोधी विवाह', 'Balaghat'],
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

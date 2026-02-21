import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'A7x TecNologia - OS.',
  description: 'Sistema Operacional Inteligente para gestão de lavanderias industriais',
  manifest: '/manifest.json',
  themeColor: '#07070a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'A7x OS',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`}>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}

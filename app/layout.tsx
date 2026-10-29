import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://bongostores.netlify.app'),
  title: {
    default: 'Bongo Stores — Good shoes. Good energy.',
    template: '%s | Bongo Stores',
  },
  description: 'Thoughtfully sourced sneakers, slides and jerseys delivered across Accra every Saturday.',
  applicationName: 'Bongo Stores',
  keywords: ['Bongo Stores', 'sneakers Ghana', 'slides Ghana', 'jerseys Ghana', 'Accra delivery'],
  authors: [{ name: 'Bongo Stores' }],
  creator: 'Bongo Stores',
  publisher: 'Bongo Stores',
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: '/',
    siteName: 'Bongo Stores',
    title: 'Bongo Stores — Good shoes. Good energy.',
    description: 'Thoughtfully sourced sneakers, slides and jerseys delivered across Accra every Saturday.',
  },
  twitter: {
    card: 'summary',
    title: 'Bongo Stores — Good shoes. Good energy.',
    description: 'Thoughtfully sourced sneakers, slides and jerseys delivered across Accra every Saturday.',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fbfaf7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}


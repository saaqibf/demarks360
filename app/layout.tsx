import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { CookieConsent } from '@/components/public/cookie-consent'
import './globals.css'

const BASE_URL = 'https://demarks360.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Demarks 360: Calgary 360 Video Booth Rental',
    template: '%s | Demarks 360',
  },
  description:
    '360 slow-motion video booth rental in Calgary, AB. Same-day gallery delivery, unlimited takes, firecrackers available. Birthdays, weddings, corporate events and more. Book online.',
  keywords: [
    '360 photo booth Calgary',
    '360 video booth rental Calgary',
    'photo booth rental Calgary',
    '360 booth wedding Calgary',
    'Calgary event photo booth',
    'slow motion video booth Calgary',
  ],
  authors: [{ name: 'Demarks 360' }],
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: BASE_URL,
    siteName: 'Demarks 360',
    title: 'Demarks 360: Calgary 360 Video Booth Rental',
    description: '360 slow-motion video booth rental in Calgary. Same-day gallery, unlimited takes, firecrackers available. Birthdays, weddings, corporate events.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Demarks 360: Calgary 360 Video Booth Rental',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Demarks 360: Calgary 360 Video Booth',
    description: '360 video booth rental in Calgary. Same-day gallery. Book online.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <div className="grain" aria-hidden="true" />
          {children}
          <CookieConsent />
        </body>
      </html>
    </ClerkProvider>
  )
}

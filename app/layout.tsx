import { Great_Vibes } from 'next/font/google'
import './globals.css'

import type { Metadata } from 'next'

// Script face for the overlay preview's ribbon lettering only; Bodoni Moda and
// Figtree stay the site faces (loaded in globals.css)
const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-script',
})

const BASE_URL = 'https://demarks360.ca'

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

// Clerk (admin auth) is intentionally NOT provided here — only the admin
// surfaces need it. Wrapping the root made every public marketing page load
// clerk.browser.js (and error out when the prod Clerk domain isn't set), so
// ClerkProvider now lives in the (admin), admin-login, sign-in, sign-up and
// account layouts instead.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={greatVibes.variable}>
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}

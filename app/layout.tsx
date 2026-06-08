import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Demarks 360 — Calgary 360 Video Booth',
  description: '360 video booth rental serving Calgary and surrounding areas.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <div className="grain" aria-hidden="true" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

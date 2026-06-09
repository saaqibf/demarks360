export const revalidate = 300 // re-generate at most every 5 minutes

import type { Metadata } from 'next'
import { SiteNav } from '@/components/public/site-nav'

export const metadata: Metadata = {
  title: 'Demarks 360 — Calgary 360 Video Booth Rental',
  description: '360 slow-motion video booth rental in Calgary. Same-day gallery delivery, unlimited takes, firecrackers available. From $225. Book online.',
  alternates: { canonical: 'https://demarks360.com' },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Demarks 360',
  description: '360 slow-motion video booth rental for events in Calgary and surrounding areas.',
  url: 'https://demarks360.com',
  telephone: '',
  email: '',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Calgary',
    addressRegion: 'AB',
    addressCountry: 'CA',
  },
  areaServed: ['Calgary', 'Airdrie', 'Cochrane', 'Chestermere', 'Okotoks', 'Rocky View County'],
  priceRange: '$$',
  openingHours: 'Mo-Su 09:00-22:00',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
  sameAs: ['https://instagram.com/demarks360'],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does a 360 video booth rental cost in Calgary?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '$150 per hour with a 1.5-hour minimum. The minimum booking is $225. Add firecrackers (handheld sparkler cannons) for $75 flat.',
      },
    },
    {
      '@type': 'Question',
      name: 'How far in advance do I need to book?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'At least 7 days notice is required to ensure everything is prepared for your event.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where does Demarks 360 serve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Calgary, Airdrie, Cochrane, Chestermere, Okotoks, and Rocky View County. A $50 travel fee applies outside Calgary city limits.',
      },
    },
    {
      '@type': 'Question',
      name: 'When do I get my 360 videos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You receive a shareable gallery link the same day as your event. No login required.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does payment work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A 30% deposit is charged when booking to hold your date. The remaining 70% is automatically charged 7 days before your event.',
      },
    },
  ],
}
import { Hero } from '@/components/public/hero'
import { IntroAnimation } from '@/components/public/intro-animation'
import { TrustStrip } from '@/components/public/trust-strip'
import { EventTypes } from '@/components/public/event-types'
import { HowItWorks } from '@/components/public/how-it-works'
import { BenefitBlocks } from '@/components/public/benefit-blocks'
import { GalleryShowcase } from '@/components/public/gallery-showcase'
import { DateChecker } from '@/components/public/date-checker'
import { MidCta } from '@/components/public/mid-cta'
import { Pricing } from '@/components/public/pricing'
import { PackageRecommender } from '@/components/public/package-recommender'
import { Testimonials } from '@/components/public/testimonials'
import { Faq } from '@/components/public/faq'
import { EmailCapture } from '@/components/public/email-capture'
import { CtaBand } from '@/components/public/cta-band'
import { SiteFooter } from '@/components/public/site-footer'
import { CookieConsent } from '@/components/public/cookie-consent'

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <IntroAnimation />
      <SiteNav />
      <main>
        <Hero />
        <TrustStrip />
        <EventTypes />
        <HowItWorks />
        <DateChecker />
        <BenefitBlocks />
        <GalleryShowcase />
        <MidCta />
        <Pricing />
        <PackageRecommender />
        <Testimonials />
        <Faq />
        <EmailCapture />
        <CtaBand />
      </main>
      <SiteFooter />
      <CookieConsent />
    </>
  )
}

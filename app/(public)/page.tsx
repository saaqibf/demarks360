import { SiteNav } from '@/components/public/site-nav'
import { Hero } from '@/components/public/hero'
import { TrustStrip } from '@/components/public/trust-strip'
import { EventTypes } from '@/components/public/event-types'
import { HowItWorks } from '@/components/public/how-it-works'
import { BenefitBlocks } from '@/components/public/benefit-blocks'
import { GalleryShowcase } from '@/components/public/gallery-showcase'
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
      <SiteNav />
      <main>
        <Hero />
        <TrustStrip />
        <EventTypes />
        <HowItWorks />
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

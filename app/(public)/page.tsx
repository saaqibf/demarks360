import { SiteNav } from '@/components/public/site-nav'
import { PromoBar } from '@/components/public/promo-bar'
import { Hero } from '@/components/public/hero'
import { TrustStrip } from '@/components/public/trust-strip'
import { EventTypes } from '@/components/public/event-types'
import { HowItWorks } from '@/components/public/how-it-works'
import { GalleryShowcase } from '@/components/public/gallery-showcase'
import { Pricing } from '@/components/public/pricing'
import { Testimonials } from '@/components/public/testimonials'
import { Faq } from '@/components/public/faq'
import { CtaBand } from '@/components/public/cta-band'
import { SiteFooter } from '@/components/public/site-footer'
import { CookieConsent } from '@/components/public/cookie-consent'

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <PromoBar />
      <main>
        <Hero />
        <TrustStrip />
        <EventTypes />
        <HowItWorks />
        <GalleryShowcase />
        <Pricing />
        <Testimonials />
        <Faq />
        <CtaBand />
      </main>
      <SiteFooter />
      <CookieConsent />
    </>
  )
}

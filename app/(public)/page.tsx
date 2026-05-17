import { PromoBar } from '@/components/public/promo-bar'
import { SiteNav } from '@/components/public/site-nav'
import { Hero } from '@/components/public/hero'
import { Pricing } from '@/components/public/pricing'
import { HowItWorks } from '@/components/public/how-it-works'
import { GalleryShowcase } from '@/components/public/gallery-showcase'
import { Testimonials } from '@/components/public/testimonials'
import { Faq } from '@/components/public/faq'
import { CtaBand } from '@/components/public/cta-band'
import { SiteFooter } from '@/components/public/site-footer'
import { CookieConsent } from '@/components/public/cookie-consent'

export default function HomePage() {
  return (
    <>
      <PromoBar />
      <SiteNav />
      <main>
        <Hero />
        <Pricing />
        <HowItWorks />
        <GalleryShowcase />
        <Testimonials />
        <Faq />
        <CtaBand />
      </main>
      <SiteFooter />
      <CookieConsent />
    </>
  )
}

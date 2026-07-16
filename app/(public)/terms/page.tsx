import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteNav } from '@/components/public/site-nav'
import { SiteFooter } from '@/components/public/site-footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing Demarks 360 video booth rental bookings in Calgary and surrounding areas.',
  alternates: { canonical: 'https://demarks360.ca/terms' },
}

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--color-sand)', minHeight: '100vh' }}>
      <SiteNav />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '8rem 3rem 6rem', fontFamily: 'var(--font-body)' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-amber)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '3rem' }}>
          ← Back to Home
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 400, color: 'var(--color-text)', marginBottom: '0.5rem', lineHeight: 1 }}>Terms of Service</h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '3rem' }}>Last updated: May 16, 2026</p>

        {[
          { title: '1. Service', body: 'Demarks 360 provides 360 video booth rental services in Calgary, Airdrie, Cochrane, Chestermere, Okotoks, and Rocky View County, Alberta, Canada. By booking our services, you agree to these terms.' },
          { title: '2. Pricing', body: 'Packages start at $300 CAD for 2 hours (Essential), $450 for 3 hours (Celebration), and from $600 for 4+ hours (All-night). Travel within Calgary is included. Events outside Calgary city limits may incur a small travel fee shown upfront at booking. All prices are in Canadian dollars.' },
          { title: '3. Booking & Payment', body: 'Booking requests are reviewed within 24 hours. Once approved, a 50% deposit is required to confirm your booking, paid through a secure payment link. The deposit is non-refundable once paid. The remaining 50% balance is due on the day of your event. If you opt in to auto-pay when paying your deposit, your saved card is charged the balance on event day; otherwise we email you a payment link that morning.' },
          { title: '4. Cancellation Policy', body: 'Your deposit is non-refundable once paid. If you cancel before the 7-day mark, only the deposit is forfeited and no balance is charged. If you cancel within 7 days of the event, the full amount (deposit + balance) applies. Free rescheduling is available if requested 7+ days before your event, subject to availability.' },
          { title: '5. Service Area', body: 'We only accept bookings within our approved service area. Your event address must be in Calgary, Airdrie, Cochrane, Chestermere, Okotoks, or Rocky View County. Bookings outside this area will be cancelled and deposits refunded.' },
          { title: '6. Lead Time', body: 'We require a minimum of 5 days advance notice for all bookings.' },
          { title: '7. Our Cancellation', body: 'If Demarks 360 must cancel your booking (equipment failure, emergency), we will issue a full refund of all amounts paid, including the deposit. We will notify you as soon as possible.' },
          { title: '8. Liability', body: 'Demarks 360 is not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability is limited to the amount paid for the affected booking.' },
          { title: '9. Governing Law', body: 'These terms are governed by the laws of the Province of Alberta and the federal laws of Canada applicable therein.' },
          { title: '10. Contact', body: 'For questions about these terms, email hello@demarks360.ca.' },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>{title}</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-muted)', lineHeight: 1.8, fontWeight: 300 }}>{body}</p>
          </div>
        ))}
      </main>
      <SiteFooter />
    </div>
  )
}

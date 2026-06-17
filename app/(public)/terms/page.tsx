import Link from 'next/link'
import { SiteNav } from '@/components/public/site-nav'
import { SiteFooter } from '@/components/public/site-footer'

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
          { title: '2. Pricing', body: 'Our rate is $150 CAD per hour with a 1.5-hour minimum. A $50 travel fee applies for events outside Calgary city limits. Add-ons (e.g., Firecrackers at $75) are charged as flat fees. All prices are in Canadian dollars.' },
          { title: '3. Booking & Payment', body: 'A 30% non-refundable deposit is required to confirm your booking. By providing your payment card, you authorize Demarks 360 to automatically charge the remaining 70% balance 7 days before your event. Your saved card will be deleted 7 days after your event.' },
          { title: '4. Cancellation Policy', body: 'Your deposit is non-refundable in all cases. If you cancel before the 7-day mark, only the deposit is forfeited and no balance is charged. If you cancel within 7 days of the event, the full amount (deposit + balance) applies. Free rescheduling is available if requested 7+ days before your event, subject to availability.' },
          { title: '5. Service Area', body: 'We only accept bookings within our approved service area. Your event address must be in Calgary, Airdrie, Cochrane, Chestermere, Okotoks, or Rocky View County. Bookings outside this area will be cancelled and deposits refunded.' },
          { title: '6. Lead Time', body: 'We require a minimum of 7 days advance notice for all bookings. Same-week bookings cannot be accommodated.' },
          { title: '7. Our Cancellation', body: 'If Demarks 360 must cancel your booking (equipment failure, emergency), we will issue a full refund of all amounts paid, including the deposit. We will notify you as soon as possible.' },
          { title: '8. Liability', body: 'Demarks 360 is not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability is limited to the amount paid for the affected booking.' },
          { title: '9. Governing Law', body: 'These terms are governed by the laws of the Province of Alberta and the federal laws of Canada applicable therein.' },
          { title: '10. Contact', body: 'For questions about these terms, email bookings@demarks360.ca.' },
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

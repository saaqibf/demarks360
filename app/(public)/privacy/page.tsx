import Link from 'next/link'
import { SiteNav } from '@/components/public/site-nav'
import { SiteFooter } from '@/components/public/site-footer'

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--color-sand)', minHeight: '100vh' }}>
      <SiteNav />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '8rem 3rem 6rem', fontFamily: 'var(--font-body)' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-amber)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '3rem' }}>
          ← Back to Home
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 400, color: 'var(--color-text)', marginBottom: '0.5rem', lineHeight: 1 }}>Privacy Policy</h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '3rem' }}>Last updated: May 16, 2026</p>

        {[
          { title: '1. Who We Are', body: 'Demarks 360 is a 360 video booth rental service operating in Calgary, Alberta, Canada. We are committed to protecting your personal information in accordance with the Personal Information Protection and Electronic Documents Act (PIPEDA).' },
          { title: '2. What We Collect', body: 'We collect: name, email address, phone number, event address (city and postal code), event type, and payment information. Payment card details are processed and stored by Stripe — we never store your card number directly.' },
          { title: '3. How We Use It', body: 'Your information is used to: process your booking, charge your deposit and balance payment, send booking confirmations and event reminders via email and SMS, deliver your gallery link after the event, and respond to your inquiries.' },
          { title: '4. SMS Communications', body: 'By providing your phone number, you consent to receive SMS messages from Demarks 360 related to your booking (confirmations, reminders, gallery notifications). Standard message and data rates may apply. You can opt out at any time by replying STOP.' },
          { title: '5. Data Retention', body: 'Your booking data is retained for 3 years for accounting and tax purposes. Your saved payment method is automatically deleted from Stripe 7 days after your event. You may request deletion of your personal data at any time.' },
          { title: '6. Third Parties', body: 'We share your data only with services required to operate the platform: Stripe (payments), Clerk (authentication), Resend (email), Twilio (SMS), Mux (video hosting), and Vercel (hosting). We do not sell your data.' },
          { title: '7. Your Rights', body: 'Under PIPEDA, you have the right to access the personal information we hold about you, correct inaccuracies, and request deletion. To exercise these rights, email us at hello@demarks360.com.' },
          { title: '8. Cookies', body: 'We use cookies to keep you signed in and make the site work. We do not use tracking or advertising cookies. By continuing to use the site, you consent to our use of cookies.' },
          { title: '9. Contact', body: 'For privacy questions or requests, email hello@demarks360.com. We will respond within 30 days.' },
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

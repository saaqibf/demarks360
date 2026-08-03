import Link from 'next/link'
import { getBookingById } from '@/lib/db/queries/bookings'
import { SiteNav } from '@/components/public/site-nav'
import { SiteFooter } from '@/components/public/site-footer'
import { ClearWizardStorage } from './clear-wizard-storage'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  // Normalize a 24:00 end time (midnight) so it reads "12:00 AM", not "12:00 PM".
  const hh = h % 24
  const period = hh >= 12 ? 'PM' : 'AM'
  const hour = hh % 12 === 0 ? 12 : hh % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

const STATUS_COPY: Record<string, { eyebrow: string; title: string; body: string }> = {
  requested: {
    eyebrow: 'Request Received',
    title: 'Request received',
    body: 'Thanks for your request. We review every request within 24 hours and reply with a tailored quote for your event. No payment has been taken.',
  },
  approved: {
    eyebrow: 'Quote Ready',
    title: 'Your quote is on its way',
    body: 'We reviewed your request. Check your email for your quote and a link to hold your date with a deposit whenever you are ready.',
  },
  confirmed: {
    eyebrow: 'Date Held',
    title: 'You’re booked',
    body: 'Your deposit is in and your date is locked. Check your inbox for your event details.',
  },
  declined: {
    eyebrow: 'Request Declined',
    title: 'We could not take this one',
    body: 'We were not able to take this date and time. No charge was made. You are welcome to request another date.',
  },
  expired: {
    eyebrow: 'Request Expired',
    title: 'This request expired',
    body: 'The window to hold this date closed, so it was released. You are welcome to submit a new request.',
  },
  cancelled: {
    eyebrow: 'Cancelled',
    title: 'This booking was cancelled',
    body: 'This booking is no longer active. Want to rebook? Request a quote for a new date.',
  },
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { id } = await searchParams
  const booking = id ? await getBookingById(id) : null

  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-ink)' }}>
        <SiteNav />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 400, color: 'var(--color-text-light)', marginBottom: '1rem' }}>Booking not found</h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(245,240,234,0.5)', lineHeight: 1.75, fontWeight: 300, marginBottom: '2rem' }}>
              Your link may have expired. Check your email for your booking details.
            </p>
            <Link href="/" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-charcoal)', background: 'var(--color-amber-light)', borderRadius: '999px', padding: '0.85rem 1.5rem', textDecoration: 'none', display: 'inline-block' }}>Back to Home</Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  const eventDate = new Date(booking.eventDate + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const copy = STATUS_COPY[booking.status] ?? STATUS_COPY.requested
  const isRequest = booking.status === 'requested'

  const detailRows = [
    { label: 'Reference', value: booking.id.slice(0, 12).toUpperCase() },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ink)' }}>
      <ClearWizardStorage />
      <SiteNav />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '6rem 3rem 4rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--color-charcoal)', fontSize: '1.25rem' }}>✓</span>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.4)', marginBottom: '0.5rem' }}>
            {copy.eyebrow}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 400, lineHeight: 0.95, color: 'var(--color-text-light)' }}>
            {copy.title}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'rgba(245,240,234,0.5)', lineHeight: 1.75, fontWeight: 300, marginTop: '1rem' }}>
            {copy.body}
          </p>
        </div>

        <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'var(--color-surface)', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.35)', marginBottom: '0.5rem' }}>Event Details</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-text-light)' }}>{eventDate}</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'rgba(245,240,234,0.6)', marginTop: '0.25rem' }}>
              {formatTime(booking.startTime)} → {formatTime(booking.endTime)}
              {' · '}{booking.eventType}
            </p>
            {/* City only — never the street address. This page is reachable with just a
                bookingId (no ownership check), so it must not expose the customer's PII. */}
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'rgba(245,240,234,0.4)', marginTop: '0.15rem' }}>
              {booking.locationCity}
            </p>
          </div>

          {detailRows.map(({ label, value }) => (
            <div key={label} style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'rgba(245,240,234,0.4)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--color-text-light)', fontWeight: 600 }}>{value}</span>
            </div>
          ))}

          {isRequest && (
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(245,240,234,0.35)', lineHeight: 1.6 }}>
                No payment has been taken. We will reply with your tailored quote by email.
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-charcoal)', background: 'var(--color-amber-light)', borderRadius: '999px',
              padding: '0.85rem 1.5rem', textDecoration: 'none', display: 'inline-block',
            }}
          >
            Back to Home
          </Link>
          <Link
            href="/book/manage"
            style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-text-light)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px',
              padding: '0.85rem 1.5rem', textDecoration: 'none', display: 'inline-block',
            }}
          >
            Manage My Booking
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

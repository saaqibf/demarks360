import Link from 'next/link'
import { getBookingById } from '@/lib/db/queries/bookings'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function googleCalendarUrl(booking: {
  eventDate: string
  startTime: string
  endTime: string
  eventType: string
  locationAddress: string
  locationCity: string
}): string {
  const dateStr = booking.eventDate.replace(/-/g, '')
  const startStr = `${dateStr}T${booking.startTime.replace(':', '')}00`
  const endStr = `${dateStr}T${booking.endTime.replace(':', '')}00`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Demarks 360 — ${booking.eventType}`,
    dates: `${startStr}/${endStr}`,
    location: `${booking.locationAddress}, ${booking.locationCity}, Alberta`,
    details: 'Your Demarks 360 360-degree video booth is confirmed for this event.',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { id } = await searchParams
  const booking = id ? await getBookingById(id) : null

  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F4', paddingTop: '66px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#0F0F0F', marginBottom: '1rem' }}>Booking Not Found</h1>
          <Link href="/" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: '#8B5CF6', textDecoration: 'underline' }}>Return to Home</Link>
        </div>
      </div>
    )
  }

  const eventDate = new Date(booking.eventDate + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const balanceDate = booking.balanceChargeDate
    ? new Date(booking.balanceChargeDate + 'T00:00:00').toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', paddingTop: '66px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 3rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#EC4899,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: '#fff', fontSize: '1.25rem' }}>✓</span>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', marginBottom: '0.5rem' }}>
            Booking Confirmed
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F' }}>
            You&apos;re Booked!
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#3A3A3A', lineHeight: 1.75, fontWeight: 300, marginTop: '1rem' }}>
            A confirmation email has been sent. Check your inbox for the receipt and event details.
          </p>
        </div>

        <div style={{ border: '1px solid rgba(15,15,15,0.10)', background: '#fff', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginBottom: '0.5rem' }}>Event Details</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.04em', color: '#0F0F0F' }}>{eventDate}</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: '#3A3A3A', marginTop: '0.25rem' }}>
              {formatTime(booking.startTime)} → {formatTime(booking.endTime)}
              {' · '}{booking.eventType}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: '#888880', marginTop: '0.15rem' }}>
              {booking.locationAddress}, {booking.locationCity}
            </p>
          </div>

          {[
            { label: 'Deposit Paid', value: `$${Number(booking.depositAmount).toFixed(2)}` },
            { label: 'Balance Due', value: `$${Number(booking.balanceAmount).toFixed(2)}` },
            { label: 'Balance Charge Date', value: balanceDate ?? '—' },
            { label: 'Booking Reference', value: booking.id.slice(0, 12).toUpperCase() },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(15,15,15,0.06)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: '#888880' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#0F0F0F', fontWeight: 600 }}>{value}</span>
            </div>
          ))}

          <div style={{ padding: '1rem 1.5rem', background: 'rgba(15,15,15,0.02)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#888880', lineHeight: 1.6 }}>
              Your card is saved for the balance charge on {balanceDate}. It will be automatically deleted 7 days after your event.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href={googleCalendarUrl(booking)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#fff', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
              padding: '0.85rem 1.5rem', textDecoration: 'none', display: 'inline-block',
            }}
          >
            Add to Google Calendar
          </a>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#0F0F0F', border: '1px solid rgba(15,15,15,0.2)',
              padding: '0.85rem 1.5rem', textDecoration: 'none', display: 'inline-block',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBookingWithCustomer } from '@/lib/db/queries/bookings'
import { BookingActions } from './booking-actions'
import { DriveImport } from './drive-import'
import { DeviceUpload } from './device-upload'

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:   { bg: 'rgba(251,191,36,0.12)',   color: '#FBB724' },
  confirmed: { bg: 'rgba(52,211,153,0.10)',   color: '#34D399' },
  cancelled: { bg: 'rgba(192,41,58,0.12)',    color: '#C0293A' },
  completed: { bg: 'rgba(255,255,255,0.05)',  color: 'rgba(245,240,234,0.4)' },
}

function fmt(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params
  const row = await getBookingWithCustomer(id)
  if (!row) notFound()

  const { booking: b, customer: c } = row
  const s = STATUS_STYLES[b.status] ?? STATUS_STYLES.pending
  const balanceDate = b.balanceChargeDate
    ? new Date(b.balanceChargeDate + 'T00:00:00').toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div style={{ padding: '2.5rem', maxWidth: '900px' }}>
      {/* Back */}
      <Link
        href="/admin/dashboard"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.4)', textDecoration: 'none', marginBottom: '1.5rem' }}
      >
        ← All Bookings
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.35)', marginBottom: '0.4rem' }}>
            Booking · {b.id.slice(0, 12).toUpperCase()}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, letterSpacing: '0.01em', textTransform: 'uppercase', color: 'var(--color-text)', lineHeight: 1, marginBottom: '0.5rem' }}>
            {c?.name ?? 'Unknown Customer'}
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'rgba(245,240,234,0.5)' }}>{fmtDate(b.eventDate)}</p>
        </div>
        <span style={{ display: 'inline-block', padding: '0.35rem 0.85rem', borderRadius: '4px', background: s.bg, fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.color }}>
          {b.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1px' }}>
        {/* Event info */}
        <div style={{ background: 'var(--color-surface)', padding: '1.5rem' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', marginBottom: '1rem' }}>Event</p>
          {[
            { label: 'Date', value: fmtDate(b.eventDate) },
            { label: 'Time', value: `${fmt(b.startTime)} → ${fmt(b.endTime)}` },
            { label: 'Type', value: b.eventType },
            { label: 'Address', value: `${b.locationAddress}, ${b.locationCity}` },
            { label: 'Add-ons', value: (b.addOns as string[]).join(', ') || 'None' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(245,240,234,0.35)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text)', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Customer + payment info */}
        <div style={{ background: 'var(--color-surface)', padding: '1.5rem' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', marginBottom: '1rem' }}>Customer & Payment</p>
          {[
            { label: 'Name', value: c?.name ?? '—' },
            { label: 'Email', value: c?.email ?? '—' },
            { label: 'Phone', value: c?.phone ?? '—' },
            { label: 'Deposit Paid', value: `$${Number(b.depositAmount ?? 0).toFixed(2)}` },
            { label: 'Balance Due', value: `$${Number(b.balanceAmount ?? 0).toFixed(2)}` },
            { label: 'Balance Date', value: balanceDate ?? '—' },
            { label: 'Gallery Token', value: b.galleryToken ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(245,240,234,0.35)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text)', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', marginTop: '1px' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', marginBottom: '1rem' }}>
          Update Status
        </p>
        <BookingActions bookingId={b.id} currentStatus={b.status} currentNotes={b.notes ?? ''} />
      </div>

      {/* Video upload */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.06)', marginTop: '1px' }}>
        <div style={{ background: 'var(--color-surface)', padding: '1.5rem' }}>
          <DeviceUpload bookingId={b.id} />
        </div>
        <div style={{ background: 'var(--color-surface)', padding: '1.5rem' }}>
          <DriveImport bookingId={b.id} />
        </div>
      </div>

      {/* Gallery link */}
      {b.galleryToken && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', marginTop: '1px' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', marginBottom: '0.75rem' }}>
            Client Gallery Link
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(245,240,234,0.45)', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
            {process.env.NEXT_PUBLIC_APP_URL ?? 'https://demarks360.vercel.app'}/gallery/{b.galleryToken}
          </p>
          <Link
            href={`/gallery/${b.galleryToken}`}
            target="_blank"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-crimson)', textDecoration: 'none' }}
          >
            Preview Gallery →
          </Link>
        </div>
      )}
    </div>
  )
}

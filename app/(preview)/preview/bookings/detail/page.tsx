import Link from 'next/link'
import { statusLabel } from '@/lib/admin-status'

const PREVIEW_BOOKING = {
  id: 'bk_001aabbcc',
  status: 'confirmed',
  eventDate: '2026-06-14',
  startTime: '18:00',
  endTime: '21:00',
  eventType: 'Birthday Party',
  locationAddress: '123 Elbow Drive SW',
  locationCity: 'Calgary',
  addOns: ['firecrackers'],
  depositAmount: 135,
  balanceAmount: 315,
  balanceChargeDate: '2026-06-07',
  galleryToken: 'gal_sample_token_xyz',
  customer: {
    name: 'Aisha Mohammed',
    email: 'aisha.m@gmail.com',
    phone: '+1 (403) 555-0182',
  },
}

function fmt(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function fmtDate(d: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', opts ?? {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function PreviewBookingDetail() {
  const b = PREVIEW_BOOKING
  const balanceDate = fmtDate(b.balanceChargeDate, { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="adm-page" style={{ maxWidth: '900px' }}>
      <Link href="/preview/dashboard" className="adm-link" style={{ marginBottom: '1.5rem' }}>
        ← All Bookings
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p className="adm-eyebrow" style={{ color: 'var(--color-muted-light)', marginBottom: '0.4rem' }}>
            Booking · {b.id.slice(0, 12).toUpperCase()}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--color-text-light)', lineHeight: 1, marginBottom: '0.5rem' }}>
            {b.customer.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-muted-light)' }}>{fmtDate(b.eventDate)}</p>
        </div>
        <span className={`adm-pill adm-pill--${b.status}`}>
          {statusLabel(b.status)}
        </span>
      </div>

      <div className="admin-2col" style={{ marginBottom: '1rem' }}>
        {/* Event info */}
        <div className="adm-card">
          <p className="adm-card-label">Event</p>
          {[
            { label: 'Date', value: fmtDate(b.eventDate) },
            { label: 'Time', value: `${fmt(b.startTime)} → ${fmt(b.endTime)}` },
            { label: 'Type', value: b.eventType },
            { label: 'Address', value: `${b.locationAddress}, ${b.locationCity}` },
            { label: 'Add-ons', value: b.addOns.join(', ') },
          ].map(({ label, value }) => (
            <div key={label} className="adm-row">
              <span className="adm-row-label">{label}</span>
              <span className="adm-row-value">{value}</span>
            </div>
          ))}
        </div>

        {/* Customer + payment */}
        <div className="adm-card">
          <p className="adm-card-label">Customer &amp; Payment</p>
          {[
            { label: 'Name', value: b.customer.name },
            { label: 'Email', value: b.customer.email },
            { label: 'Phone', value: b.customer.phone },
            { label: 'Deposit Paid', value: `$${b.depositAmount.toFixed(2)}` },
            { label: 'Balance Due', value: `$${b.balanceAmount.toFixed(2)}` },
            { label: 'Balance Date', value: balanceDate },
            { label: 'Gallery Token', value: b.galleryToken },
          ].map(({ label, value }) => (
            <div key={label} className="adm-row">
              <span className="adm-row-label">{label}</span>
              <span className="adm-row-value" style={{ wordBreak: 'break-all' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Update Status */}
      <div className="adm-card" style={{ marginTop: '1rem' }}>
        <p className="adm-card-label">Update Status</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <button className="btn-primary btn--sm">Mark Completed</button>
          <button className="btn-back">Set Confirmed</button>
          <button className="btn-danger btn--sm">Cancel Booking</button>
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label className="adm-card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Internal Notes</label>
          <textarea
            placeholder="Add notes about this booking..."
            rows={3}
            className="adm-input"
          />
        </div>
        <button className="btn-primary btn--sm">
          Save Changes
        </button>
      </div>

      {/* After the event — for the videographer */}
      <div className="adm-card" style={{ marginTop: '1rem' }}>
        <p className="adm-card-label" style={{ marginBottom: '0.4rem' }}>After the event</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-muted-light)', marginBottom: '1.5rem' }}>
          For the videographer. Upload the finished video and share the gallery link.
        </p>

        <div className="admin-2col">
          <div>
            <p className="adm-card-label">Upload from Device</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-muted-light)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Select a video from your phone&apos;s camera roll to upload directly.
            </p>
            <button className="btn-back">
              Choose File
            </button>
          </div>
          <div>
            <p className="adm-card-label">Import from Google Drive</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-muted-light)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Paste a Google Drive share link and the video will be imported to the gallery.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input placeholder="https://drive.google.com/..." className="adm-input" style={{ flex: 1 }} />
              <button className="btn-primary btn--sm" style={{ whiteSpace: 'nowrap' }}>
                Import
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-dark)' }}>
          <p className="adm-card-label" style={{ marginBottom: '0.75rem' }}>Client Gallery Link</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-muted-light)', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
            https://demarks360.ca/gallery/{b.galleryToken}
          </p>
          <span className="adm-link">
            Preview Gallery →
          </span>
        </div>
      </div>
    </div>
  )
}

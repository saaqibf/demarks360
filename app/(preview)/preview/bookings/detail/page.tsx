import Link from 'next/link'

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  confirmed: { bg: 'rgba(52,168,83,0.1)', color: '#2d8a50', border: 'rgba(52,168,83,0.3)' },
  pending:   { bg: 'rgba(168,117,48,0.1)', color: 'var(--color-amber)', border: 'rgba(168,117,48,0.3)' },
  cancelled: { bg: 'rgba(192,41,58,0.08)', color: 'var(--color-crimson)', border: 'rgba(192,41,58,0.25)' },
  completed: { bg: 'rgba(26,23,20,0.05)', color: 'var(--color-muted)', border: 'rgba(26,23,20,0.15)' },
}

const MOCK = {
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

const inputStyle: React.CSSProperties = {
  background: 'var(--color-sand)',
  border: '1px solid var(--color-border-light)',
  color: 'var(--color-charcoal)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  padding: '0.65rem 0.75rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase',
  color: 'var(--color-muted)', display: 'block', marginBottom: '0.35rem',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700,
  letterSpacing: '0.16em', textTransform: 'uppercase',
  color: 'var(--color-muted)', marginBottom: '1rem',
}

export default function PreviewBookingDetail() {
  const b = MOCK
  const s = STATUS_STYLES[b.status]
  const balanceDate = fmtDate(b.balanceChargeDate, { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ padding: '2.5rem', maxWidth: '900px' }}>
      <Link
        href="/preview/dashboard"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', textDecoration: 'none', marginBottom: '1.5rem' }}
      >
        ← All Bookings
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>
            Booking · {b.id.slice(0, 12).toUpperCase()}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, letterSpacing: '-0.01em', color: 'var(--color-charcoal)', lineHeight: 1, marginBottom: '0.5rem' }}>
            {b.customer.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--color-muted)' }}>{fmtDate(b.eventDate)}</p>
        </div>
        <span style={{ display: 'inline-block', padding: '0.35rem 0.85rem', borderRadius: '4px', background: s.bg, border: `1px solid ${s.border}`, fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.color }}>
          {b.status}
        </span>
      </div>

      <div className="admin-2col" style={{ marginBottom: '1px' }}>
        {/* Event info */}
        <div style={{ background: 'var(--color-sand-2)', padding: '1.5rem', border: '1px solid var(--color-border-light)' }}>
          <p style={sectionLabel}>Event</p>
          {[
            { label: 'Date', value: fmtDate(b.eventDate) },
            { label: 'Time', value: `${fmt(b.startTime)} → ${fmt(b.endTime)}` },
            { label: 'Type', value: b.eventType },
            { label: 'Address', value: `${b.locationAddress}, ${b.locationCity}` },
            { label: 'Add-ons', value: b.addOns.join(', ') },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid var(--color-border-light)' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--color-muted)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-charcoal)', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Customer + payment */}
        <div style={{ background: 'var(--color-sand-2)', padding: '1.5rem', border: '1px solid var(--color-border-light)' }}>
          <p style={sectionLabel}>Customer & Payment</p>
          {[
            { label: 'Name', value: b.customer.name },
            { label: 'Email', value: b.customer.email },
            { label: 'Phone', value: b.customer.phone },
            { label: 'Deposit Paid', value: `$${b.depositAmount.toFixed(2)}` },
            { label: 'Balance Due', value: `$${b.balanceAmount.toFixed(2)}` },
            { label: 'Balance Date', value: balanceDate },
            { label: 'Gallery Token', value: b.galleryToken },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid var(--color-border-light)' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--color-muted)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-charcoal)', textAlign: 'right', maxWidth: '55%', wordBreak: 'break-all' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Update Status */}
      <div style={{ background: 'var(--color-sand-2)', border: '1px solid var(--color-border-light)', padding: '1.5rem', marginTop: '1px' }}>
        <p style={sectionLabel}>Update Status</p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {(['confirmed', 'cancelled', 'completed'] as const).map(status => {
            const st = STATUS_STYLES[status]
            const isActive = status === b.status
            return (
              <button
                key={status}
                style={{
                  background: isActive ? st.bg : 'transparent',
                  border: `1px solid ${isActive ? st.border : 'var(--color-border-light)'}`,
                  color: isActive ? st.color : 'var(--color-muted)',
                  padding: '0.4rem 1rem', fontFamily: 'var(--font-ui)', fontSize: '0.6rem',
                  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                  borderRadius: '3px',
                }}
              >
                {status}
              </button>
            )
          })}
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={labelStyle}>Internal Notes</label>
          <textarea
            placeholder="Add notes about this booking..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
        <button style={{ background: 'var(--color-charcoal)', color: 'var(--color-sand)', border: 'none', padding: '0.65rem 1.5rem', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
          Save Changes
        </button>
      </div>

      {/* Video upload */}
      <div className="admin-2col" style={{ marginTop: '1px' }}>
        <div style={{ background: 'var(--color-sand-2)', padding: '1.5rem', border: '1px solid var(--color-border-light)' }}>
          <p style={sectionLabel}>Upload from Device</p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Select a video from your phone&apos;s camera roll to upload directly.
          </p>
          <button style={{ background: 'transparent', color: 'var(--color-charcoal)', border: '1px solid var(--color-border-light)', padding: '0.65rem 1.5rem', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Choose File
          </button>
        </div>
        <div style={{ background: 'var(--color-sand-2)', padding: '1.5rem', border: '1px solid var(--color-border-light)' }}>
          <p style={sectionLabel}>Import from Google Drive</p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Paste a Google Drive share link and the video will be imported to the gallery.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input placeholder="https://drive.google.com/..." style={{ ...inputStyle, flex: 1 }} />
            <button style={{ background: 'var(--color-charcoal)', color: 'var(--color-sand)', border: 'none', padding: '0.65rem 1.25rem', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Gallery link */}
      <div style={{ background: 'var(--color-sand-2)', border: '1px solid var(--color-border-light)', padding: '1.5rem', marginTop: '1px' }}>
        <p style={sectionLabel}>Client Gallery Link</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
          https://demarks360.ca/gallery/{b.galleryToken}
        </p>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-crimson)' }}>
          Preview Gallery →
        </span>
      </div>
    </div>
  )
}

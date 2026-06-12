import Link from 'next/link'

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  pending:   { bg: 'rgba(201,145,63,0.12)',  color: 'var(--color-amber)',  border: 'rgba(201,145,63,0.35)' },
  confirmed: { bg: 'rgba(52,168,83,0.1)',   color: '#2d8a50',             border: 'rgba(52,168,83,0.3)' },
  cancelled: { bg: 'rgba(201,145,63,0.12)',  color: 'var(--color-amber)', border: 'rgba(201,145,63,0.35)' },
  completed: { bg: 'rgba(255,255,255,0.05)',   color: 'rgba(245,240,234,0.4)',  border: 'rgba(255,255,255,0.1)' },
}

const MOCK_BOOKINGS = [
  { id: 'bk_001', eventDate: '2026-06-14', customerName: 'Aisha Mohammed', eventType: 'Birthday Party', startTime: '18:00', endTime: '21:00', status: 'confirmed', deposit: 135 },
  { id: 'bk_002', eventDate: '2026-06-21', customerName: 'Jordan & Kezia Tran', eventType: 'Wedding Reception', startTime: '17:00', endTime: '22:00', status: 'confirmed', deposit: 225 },
  { id: 'bk_003', eventDate: '2026-07-03', customerName: 'Priya Sharma', eventType: 'Corporate Event', startTime: '19:00', endTime: '21:30', status: 'pending', deposit: 112.50 },
  { id: 'bk_004', eventDate: '2026-07-12', customerName: 'Marcus Okonkwo', eventType: 'Graduation Party', startTime: '15:00', endTime: '18:00', status: 'confirmed', deposit: 135 },
  { id: 'bk_005', eventDate: '2026-05-10', customerName: 'Sarah Leblanc', eventType: 'Birthday Party', startTime: '20:00', endTime: '23:00', status: 'completed', deposit: 135 },
  { id: 'bk_006', eventDate: '2026-07-19', customerName: 'Fatima Al-Hassan', eventType: 'Family Gathering', startTime: '14:00', endTime: '17:00', status: 'pending', deposit: 112.50 },
]

function fmt(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const stats = [
  { label: 'Total Bookings', value: '6' },
  { label: 'Confirmed Revenue', value: '$742' },
  { label: 'Next 30 Days', value: '4' },
  { label: 'Pending Payment', value: '2' },
]

export default function PreviewDashboard() {
  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-amber)', marginBottom: '0.5rem' }}>
          Admin
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-text-light)', lineHeight: 1 }}>
          Overview
        </h1>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {stats.map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--color-surface)', padding: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.35)', marginBottom: '0.5rem' }}>
              {label}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--color-text-light)', lineHeight: 1 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Bookings table */}
      <div style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'var(--color-surface)' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.4)' }}>
            All Bookings
          </p>
        </div>

        <div className="admin-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Date', 'Customer', 'Event Type', 'Time', 'Status', 'Deposit', ''].map(h => (
                  <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_BOOKINGS.map(b => {
                const s = STATUS_STYLES[b.status]
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap' }}>
                      {fmtDate(b.eventDate)}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-text-light)', fontWeight: 600 }}>
                      {b.customerName}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'rgba(245,240,234,0.55)' }}>
                      {b.eventType}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'rgba(245,240,234,0.45)', whiteSpace: 'nowrap' }}>
                      {fmt(b.startTime)} → {fmt(b.endTime)}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '3px', background: s.bg, border: `1px solid ${s.border}`, fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.color }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                      ${b.deposit.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <Link
                        href="/preview/bookings/detail"
                        style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-amber-light)', textDecoration: 'none' }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

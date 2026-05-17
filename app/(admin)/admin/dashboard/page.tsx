import Link from 'next/link'
import { getAllBookings } from '@/lib/db/queries/bookings'

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
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default async function DashboardPage() {
  const rows = await getAllBookings()

  const today = new Date().toISOString().split('T')[0]
  const in30 = new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0]

  const totalRevenue = rows
    .filter(r => r.booking.status === 'confirmed' || r.booking.status === 'completed')
    .reduce((sum, r) => sum + Number(r.booking.depositAmount ?? 0), 0)

  const upcoming = rows.filter(r =>
    r.booking.eventDate >= today &&
    r.booking.eventDate <= in30 &&
    (r.booking.status === 'confirmed' || r.booking.status === 'pending')
  ).length

  const pending = rows.filter(r => r.booking.status === 'pending').length

  const stats = [
    { label: 'Total Bookings', value: rows.length },
    { label: 'Confirmed Revenue', value: `$${totalRevenue.toFixed(0)}` },
    { label: 'Next 30 Days', value: upcoming },
    { label: 'Pending Payment', value: pending },
  ]

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-crimson)', marginBottom: '0.5rem' }}>
          Admin
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '0.01em', textTransform: 'uppercase', color: 'var(--color-text)', lineHeight: 1 }}>
          Overview
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '2.5rem' }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--color-surface)', padding: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.35)', marginBottom: '0.5rem' }}>
              {label}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>
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

        {rows.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(245,240,234,0.25)', fontFamily: 'var(--font-ui)', fontSize: '0.78rem' }}>
            No bookings yet
          </div>
        ) : (
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
              {rows.map(({ booking: b, customer: c }) => {
                const s = STATUS_STYLES[b.status] ?? STATUS_STYLES.pending
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                      {fmtDate(b.eventDate)}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-text)' }}>
                      {c?.name ?? '—'}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'rgba(245,240,234,0.55)' }}>
                      {b.eventType}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'rgba(245,240,234,0.45)', whiteSpace: 'nowrap' }}>
                      {fmt(b.startTime)} → {fmt(b.endTime)}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '3px', background: s.bg, fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.color }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-text)' }}>
                      ${Number(b.depositAmount ?? 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-crimson)', textDecoration: 'none' }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

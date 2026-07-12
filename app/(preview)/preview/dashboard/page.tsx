import Link from 'next/link'
import { statusLabel } from '@/lib/admin-status'

const MOCK_BOOKINGS = [
  { id: 'bk_000', eventDate: '2026-07-28', customerName: 'Noor Abdi', eventType: 'Engagement Party', startTime: '17:00', endTime: '20:00', status: 'requested', deposit: 135 },
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
  { label: 'Total Bookings', value: '7', action: false },
  { label: 'Confirmed Revenue', value: '$742', action: false },
  { label: 'Next 30 Days', value: '4', action: false },
  { label: 'Pending Payment', value: '2', action: true },
]

const requests = MOCK_BOOKINGS.filter(b => b.status === 'requested')

export default function PreviewDashboard() {
  return (
    <div className="adm-page">
      <div style={{ marginBottom: '2.5rem' }}>
        <p className="adm-eyebrow" style={{ marginBottom: '0.5rem' }}>
          Admin
        </p>
        <h1 className="adm-h1">
          Overview
        </h1>
      </div>

      {/* Needs your review */}
      <div style={{ marginBottom: '2.5rem' }}>
        {requests.length > 0 ? (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--color-text-light)', marginBottom: '1rem' }}>
              {requests.length} {requests.length === 1 ? 'request' : 'requests'} waiting for you
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {requests.map(b => (
                <div
                  key={b.id}
                  className="adm-card"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', flexWrap: 'wrap' }}
                >
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-text-light)', lineHeight: 1.1, marginBottom: '0.35rem' }}>
                      {b.customerName}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-muted-light)' }}>
                      {fmtDate(b.eventDate)} · {b.eventType} · ${b.deposit.toFixed(0)} deposit
                    </p>
                  </div>
                  <Link href="/preview/bookings/detail" className="btn-primary btn--sm" style={{ flexShrink: 0 }}>
                    Review →
                  </Link>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="adm-card">
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-muted-light)', margin: 0 }}>
              You&apos;re all caught up. No new requests.
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {stats.map(({ label, value, action }) => (
          <div key={label} className={`adm-stat${action ? ' adm-stat--action' : ''}`}>
            <p className="adm-stat-label">
              {label}
            </p>
            <p className="adm-stat-value">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Bookings table */}
      <div className="adm-card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border-dark)' }}>
          <p className="adm-card-label" style={{ margin: 0 }}>
            All Bookings
          </p>
        </div>

        <div className="admin-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                {['Date', 'Customer', 'Event Type', 'Time', 'Status', 'Deposit', ''].map(h => (
                  <th key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_BOOKINGS.map(b => {
                return (
                  <tr key={b.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {fmtDate(b.eventDate)}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {b.customerName}
                    </td>
                    <td style={{ color: 'var(--color-muted-light)' }}>
                      {b.eventType}
                    </td>
                    <td style={{ color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                      {fmt(b.startTime)} → {fmt(b.endTime)}
                    </td>
                    <td>
                      <span className={`adm-pill adm-pill--${b.status}`}>
                        {statusLabel(b.status)}
                      </span>
                    </td>
                    <td>
                      ${b.deposit.toFixed(2)}
                    </td>
                    <td>
                      <Link href="/preview/bookings/detail" className="adm-link">
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

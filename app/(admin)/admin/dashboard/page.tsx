import Link from 'next/link'
import { getAllBookings } from '@/lib/db/queries/bookings'
import { statusLabel } from '@/lib/admin-status'

const VALID_STATUSES = ['requested', 'approved', 'pending', 'confirmed', 'declined', 'expired', 'cancelled', 'completed'] as const
const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Requested', value: 'requested' },
  { label: 'Approved', value: 'approved' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Declined', value: 'declined' },
  { label: 'Expired', value: 'expired' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Completed', value: 'completed' },
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

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const activeStatus = status && (VALID_STATUSES as readonly string[]).includes(status) ? status : ''
  const allRows = await getAllBookings()
  const rows = activeStatus ? allRows.filter(r => r.booking.status === activeStatus) : allRows

  const today = new Date().toISOString().split('T')[0]
  const in30 = new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0]

  // Collected money only: deposit is always in by 'confirmed'; balance counts once charged
  const totalRevenue = allRows
    .filter(r => r.booking.status === 'confirmed' || r.booking.status === 'completed')
    .reduce((sum, r) =>
      sum
      + Number(r.booking.depositAmount ?? 0)
      + (r.booking.balanceChargedAt ? Number(r.booking.balanceAmount ?? 0) : 0),
    0)

  const upcoming = allRows.filter(r =>
    r.booking.eventDate >= today &&
    r.booking.eventDate <= in30 &&
    (r.booking.status === 'confirmed' || r.booking.status === 'requested' || r.booking.status === 'approved')
  ).length

  const requests = allRows.filter(r => r.booking.status === 'requested')
  const needsReview = requests.length
  const awaitingDeposit = allRows.filter(r => r.booking.status === 'approved').length

  const stats = [
    { label: 'Total Bookings', value: allRows.length, action: false },
    { label: 'Confirmed Revenue', value: `$${totalRevenue.toFixed(0)}`, action: false },
    { label: 'Next 30 Days', value: upcoming, action: false },
    { label: 'Needs Review', value: needsReview, action: needsReview > 0 },
    { label: 'Awaiting Deposit', value: awaitingDeposit, action: awaitingDeposit > 0 },
  ]

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
        {needsReview > 0 ? (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--color-text-light)', marginBottom: '1rem' }}>
              {needsReview} {needsReview === 1 ? 'request' : 'requests'} waiting for you
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {requests.map(({ booking: b, customer: c }) => (
                <div
                  key={b.id}
                  className="adm-card"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', flexWrap: 'wrap' }}
                >
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-text-light)', lineHeight: 1.1, marginBottom: '0.35rem' }}>
                      {c?.name ?? 'New customer'}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-muted-light)' }}>
                      {fmtDate(b.eventDate)} · {b.eventType} · ${Number(b.depositAmount ?? 0).toFixed(0)} deposit
                    </p>
                  </div>
                  <Link href={`/admin/bookings/${b.id}`} className="btn-primary btn--sm" style={{ flexShrink: 0 }}>
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
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--color-border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <p className="adm-card-label" style={{ margin: 0 }}>
            Bookings
          </p>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {STATUS_TABS.map(tab => {
              const isActive = activeStatus === tab.value
              return (
                <Link
                  key={tab.value}
                  href={tab.value ? `/admin/dashboard?status=${tab.value}` : '/admin/dashboard'}
                  className={`adm-tab${isActive ? ' adm-tab--active' : ''}`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
            No bookings yet
          </div>
        ) : (
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
              {rows.map(({ booking: b, customer: c }) => {
                return (
                  <tr key={b.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {fmtDate(b.eventDate)}
                    </td>
                    <td>
                      {c?.name ?? 'Not set'}
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
                      ${Number(b.depositAmount ?? 0).toFixed(2)}
                    </td>
                    <td>
                      <Link href={`/admin/bookings/${b.id}`} className="adm-link">
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}

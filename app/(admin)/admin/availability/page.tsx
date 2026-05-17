import { getAllBlocks } from '@/lib/db/queries/availability'
import { AvailabilityManager } from './availability-manager'

export default async function AvailabilityPage() {
  const blocks = await getAllBlocks()
  return (
    <div style={{ padding: '2.5rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-crimson)', marginBottom: '0.5rem' }}>
          Admin
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '0.01em', textTransform: 'uppercase', color: 'var(--color-text)', lineHeight: 1 }}>
          Availability
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'rgba(245,240,234,0.4)', marginTop: '0.5rem' }}>
          Block specific dates or time ranges to prevent new bookings.
        </p>
      </div>
      <AvailabilityManager initialBlocks={blocks} />
    </div>
  )
}

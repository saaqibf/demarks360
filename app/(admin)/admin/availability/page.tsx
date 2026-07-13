import { getAllBlocks, isActiveBooking } from '@/lib/db/queries/availability'
import { getAllBookings } from '@/lib/db/queries/bookings'
import { AvailabilityManager, type CalendarBooking } from './availability-manager'

// Statuses that put a real event on the calendar. Declined / cancelled / expired
// free the date, so they never show. Completed keeps past events visible for history.
function showsOnCalendar(b: { status: string; depositExpiresAt: Date | null }): boolean {
  return isActiveBooking(b) || b.status === 'completed'
}

export default async function AvailabilityPage() {
  const [blocks, rows] = await Promise.all([getAllBlocks(), getAllBookings()])

  const bookings: CalendarBooking[] = rows
    .filter(({ booking }) => showsOnCalendar(booking))
    .map(({ booking, customer }) => ({
      id: booking.id,
      date: booking.eventDate,
      start: booking.startTime,
      end: booking.endTime,
      name: customer?.name ?? 'Customer',
      eventType: booking.eventType,
      status: booking.status,
    }))

  return (
    <div className="adm-page" style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="adm-eyebrow" style={{ marginBottom: '0.5rem' }}>Admin</p>
        <h1 className="adm-h1">Availability</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--adm-text-2)', marginTop: '0.6rem' }}>
          Every booked event and every date you have blocked, in one place.
        </p>
      </div>
      <AvailabilityManager initialBlocks={blocks} bookings={bookings} />
    </div>
  )
}

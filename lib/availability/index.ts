import { getAvailabilityForDate, getAvailabilityForDateRange, isActiveBooking } from '@/lib/db/queries/availability'
import type { BookedSlot } from '@/lib/db/queries/availability'
import { PRICING } from '@/lib/pricing'
import { todayInEdmonton } from '@/lib/dates/edmonton'

export type { BookedSlot }

export type AdminBlock = {
  startTime: string | null
  endTime: string | null
  reason: string | null
}

export type DateAvailability =
  | { status: 'available'; bookedSlots: BookedSlot[]; bookingCount: number; adminBlocks: AdminBlock[] }
  | { status: 'full'; bookedSlots: BookedSlot[]; bookingCount: number }
  | { status: 'too-soon' }
  | { status: 'blocked'; reason: string }

const DAY_MS = 24 * 60 * 60 * 1000
// Anchor "today" to Edmonton (the operator's timezone), not the server's UTC.
// Both dates are parsed at UTC midnight so the subtraction is a pure calendar-day
// count, immune to server timezone and DST. Using server-local time here made the
// earliest bookable date flip a day every evening once UTC crossed midnight.
function daysFromToday(date: string): number {
  const utcMidnight = (d: string) => Date.parse(`${d}T00:00:00Z`)
  return Math.round((utcMidnight(date) - utcMidnight(todayInEdmonton())) / DAY_MS)
}

export async function getUnavailableDatesForMonth(year: number, month: number): Promise<string[]> {
  const pad = (n: number) => String(n).padStart(2, '0')
  const firstDate = `${year}-${pad(month)}-01`
  const lastDate = `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`

  const { rangeBookings, rangeBlocks } = await getAvailabilityForDateRange(firstDate, lastDate)

  const counts = new Map<string, number>()
  for (const b of rangeBookings) {
    if (isActiveBooking(b)) {
      counts.set(b.eventDate, (counts.get(b.eventDate) ?? 0) + 1)
    }
  }

  const unavailable = new Set<string>(rangeBlocks.map((b) => b.blockedDate))
  for (const [date, count] of counts) {
    if (count >= PRICING.MAX_BOOKINGS_PER_DAY) unavailable.add(date)
  }

  return [...unavailable].sort()
}

export async function checkBookingAvailability(
  date: string,
  // skipLeadTime: a request legitimately submitted 7+ days out can cross inside the lead
  // window while it sits in review; admin approval must not be blocked by the customer rule
  opts?: { excludeBookingId?: string; skipLeadTime?: boolean },
): Promise<DateAvailability> {
  if (!opts?.skipLeadTime && daysFromToday(date) < PRICING.LEAD_TIME_DAYS) {
    return { status: 'too-soon' }
  }

  const data = await getAvailabilityForDate(date, { excludeBookingId: opts?.excludeBookingId })

  if (data.adminBlocks.length > 0) {
    return { status: 'blocked', reason: data.adminBlocks[0].reason ?? 'Date unavailable' }
  }

  if (data.bookingCount >= PRICING.MAX_BOOKINGS_PER_DAY) {
    return { status: 'full', bookedSlots: data.bookedSlots, bookingCount: data.bookingCount }
  }

  return {
    status: 'available',
    bookedSlots: data.bookedSlots,
    bookingCount: data.bookingCount,
    adminBlocks: data.adminBlocks,
  }
}

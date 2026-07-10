import { getAvailabilityForDate, getAvailabilityForDateRange, isActiveBooking } from '@/lib/db/queries/availability'
import type { BookedSlot } from '@/lib/db/queries/availability'
import { PRICING } from '@/lib/pricing'

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

function daysFromToday(date: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const requested = new Date(date + 'T00:00:00')
  return Math.floor((requested.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
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

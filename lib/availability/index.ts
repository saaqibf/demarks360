import { getAvailabilityForDate } from '@/lib/db/queries/availability'
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

export async function checkBookingAvailability(date: string): Promise<DateAvailability> {
  if (daysFromToday(date) < PRICING.LEAD_TIME_DAYS) {
    return { status: 'too-soon' }
  }

  const data = await getAvailabilityForDate(date)

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

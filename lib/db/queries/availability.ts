import { db } from '@/lib/db'
import { bookings, availabilityBlocks } from '@/lib/db/schema'
import { eq, ne, asc, and, gte, lte } from 'drizzle-orm'

export interface BookedSlot {
  startTime: string
  endTime: string
  status: string
}

// Pending bookings hold a slot only while the customer could plausibly still be paying.
// Older pendings are abandoned checkouts and must not eat availability.
export const PENDING_BOOKING_TTL_MINUTES = 30

export function isActiveBooking(b: { status: string; createdAt: Date }): boolean {
  if (b.status === 'confirmed') return true
  if (b.status !== 'pending') return false
  return b.createdAt.getTime() > Date.now() - PENDING_BOOKING_TTL_MINUTES * 60_000
}

export interface AvailabilityResult {
  bookedSlots: BookedSlot[]
  adminBlocks: { startTime: string | null; endTime: string | null; reason: string | null }[]
  bookingCount: number
}

export async function getAvailabilityForDate(
  date: string,
  opts?: { excludeBookingId?: string },
): Promise<AvailabilityResult> {
  const bookingFilter = opts?.excludeBookingId
    ? and(eq(bookings.eventDate, date), ne(bookings.id, opts.excludeBookingId))
    : eq(bookings.eventDate, date)

  const [dayBookings, adminBlocks] = await Promise.all([
    db
      .select({
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .where(bookingFilter),
    db
      .select({
        startTime: availabilityBlocks.startTime,
        endTime: availabilityBlocks.endTime,
        reason: availabilityBlocks.reason,
      })
      .from(availabilityBlocks)
      .where(eq(availabilityBlocks.blockedDate, date)),
  ])

  const activeBookings = dayBookings
    .filter(isActiveBooking)
    .map(({ startTime, endTime, status }) => ({ startTime, endTime, status }))

  return {
    bookedSlots: activeBookings,
    adminBlocks,
    bookingCount: activeBookings.length,
  }
}

export async function getAvailabilityForDateRange(firstDate: string, lastDate: string) {
  const [rangeBookings, rangeBlocks] = await Promise.all([
    db
      .select({ eventDate: bookings.eventDate, status: bookings.status, createdAt: bookings.createdAt })
      .from(bookings)
      .where(and(gte(bookings.eventDate, firstDate), lte(bookings.eventDate, lastDate))),
    db
      .select({ blockedDate: availabilityBlocks.blockedDate })
      .from(availabilityBlocks)
      .where(and(gte(availabilityBlocks.blockedDate, firstDate), lte(availabilityBlocks.blockedDate, lastDate))),
  ])
  return { rangeBookings, rangeBlocks }
}

export async function getAllBlocks() {
  return db
    .select()
    .from(availabilityBlocks)
    .orderBy(asc(availabilityBlocks.blockedDate))
}

export async function blockDate(
  date: string,
  startTime?: string,
  endTime?: string,
  reason?: string,
) {
  const [block] = await db
    .insert(availabilityBlocks)
    .values({
      blockedDate: date,
      startTime: startTime ?? null,
      endTime: endTime ?? null,
      reason: reason ?? null,
    })
    .returning()
  return block
}

export async function unblockDate(id: string) {
  await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, id))
}

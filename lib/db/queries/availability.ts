import { db } from '@/lib/db'
import { bookings, availabilityBlocks } from '@/lib/db/schema'
import { eq, ne, asc, and, gte, lte } from 'drizzle-orm'

export interface BookedSlot {
  startTime: string
  endTime: string
  status: string
}

export function isActiveBooking(b: { status: string; depositExpiresAt: Date | null }): boolean {
  if (b.status === 'requested' || b.status === 'confirmed') return true
  // Approved holds the date only while the deposit window is open; cron formalizes expiry
  if (b.status === 'approved') return !b.depositExpiresAt || b.depositExpiresAt.getTime() > Date.now()
  return false
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
        depositExpiresAt: bookings.depositExpiresAt,
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
      .select({ eventDate: bookings.eventDate, status: bookings.status, depositExpiresAt: bookings.depositExpiresAt })
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

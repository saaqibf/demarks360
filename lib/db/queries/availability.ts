import { db } from '@/lib/db'
import { bookings, availabilityBlocks } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export interface BookedSlot {
  startTime: string
  endTime: string
  status: string
}

export interface AvailabilityResult {
  bookedSlots: BookedSlot[]
  adminBlocks: { startTime: string | null; endTime: string | null; reason: string | null }[]
  bookingCount: number
  isDateFull: boolean
}

export async function getAvailabilityForDate(date: string): Promise<AvailabilityResult> {
  const [dayBookings, adminBlocks] = await Promise.all([
    db
      .select({
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
      })
      .from(bookings)
      .where(eq(bookings.eventDate, date)),
    db
      .select({
        startTime: availabilityBlocks.startTime,
        endTime: availabilityBlocks.endTime,
        reason: availabilityBlocks.reason,
      })
      .from(availabilityBlocks)
      .where(eq(availabilityBlocks.blockedDate, date)),
  ])

  const activeBookings = dayBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  )

  return {
    bookedSlots: activeBookings,
    adminBlocks,
    bookingCount: activeBookings.length,
    isDateFull: activeBookings.length >= 2,
  }
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

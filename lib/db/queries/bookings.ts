import { db } from '@/lib/db'
import { bookings, customers } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export interface CreateBookingParams {
  customerId: string
  eventDate: string
  startTime: string
  endTime: string
  durationMinutes: number
  addOns: string[]
  eventType: string
  eventName?: string
  designNotes?: string
  eventPreferences?: {
    backgroundColorTheme?: string
    designThemeTags?: string[]
    songPreference?: string
    videoType?: 'video' | 'slomo'
    videoDuration?: number
    slomoBoomerang?: boolean
  }
  locationAddress: string
  locationCity: string
  travelSurcharge: number
  depositAmount: number
  balanceAmount: number
  balanceChargeDate: string
  stripePaymentIntentId: string
  stripeCustomerId: string
}

export async function createBookingRecord(params: CreateBookingParams) {
  const [booking] = await db
    .insert(bookings)
    .values({
      customerId: params.customerId,
      eventDate: params.eventDate,
      startTime: params.startTime,
      endTime: params.endTime,
      durationMinutes: params.durationMinutes,
      addOns: params.addOns,
      status: 'pending',
      eventType: params.eventType,
      locationAddress: params.locationAddress,
      locationCity: params.locationCity,
      travelSurcharge: String(params.travelSurcharge),
      depositAmount: String(params.depositAmount),
      balanceAmount: String(params.balanceAmount),
      balanceChargeDate: params.balanceChargeDate,
      stripePaymentIntentId: params.stripePaymentIntentId,
      stripeCustomerId: params.stripeCustomerId,
      eventName: params.eventName ?? null,
      designNotes: params.designNotes ?? null,
      eventPreferences: params.eventPreferences ?? null,
    })
    .returning()
  return booking
}

// Re-entry to checkout reuses the pending booking instead of inserting a duplicate.
// createdAt is bumped so the pending-expiry window restarts with the refreshed intent.
export async function updatePendingBooking(
  id: string,
  params: Omit<CreateBookingParams, 'customerId' | 'stripePaymentIntentId' | 'stripeCustomerId'>,
) {
  const [booking] = await db
    .update(bookings)
    .set({
      eventDate: params.eventDate,
      startTime: params.startTime,
      endTime: params.endTime,
      durationMinutes: params.durationMinutes,
      addOns: params.addOns,
      eventType: params.eventType,
      locationAddress: params.locationAddress,
      locationCity: params.locationCity,
      travelSurcharge: String(params.travelSurcharge),
      depositAmount: String(params.depositAmount),
      balanceAmount: String(params.balanceAmount),
      balanceChargeDate: params.balanceChargeDate,
      eventName: params.eventName ?? null,
      designNotes: params.designNotes ?? null,
      eventPreferences: params.eventPreferences ?? null,
      createdAt: new Date(),
    })
    .where(eq(bookings.id, id))
    .returning()
  return booking ?? null
}

export async function getBookingById(id: string) {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
  return booking ?? null
}

export async function getBookingWithCustomer(id: string) {
  const [row] = await db
    .select({ booking: bookings, customer: customers })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .where(eq(bookings.id, id))
  return row ?? null
}

export async function getAllBookings() {
  return db
    .select({ booking: bookings, customer: customers })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .orderBy(desc(bookings.eventDate))
}

export async function updateBookingStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
) {
  await db.update(bookings).set({ status }).where(eq(bookings.id, id))
}

export async function updateBookingNotes(id: string, notes: string) {
  await db.update(bookings).set({ notes }).where(eq(bookings.id, id))
}

export async function confirmBooking(stripePaymentIntentId: string) {
  const rows = await db
    .update(bookings)
    .set({ status: 'confirmed' })
    .where(eq(bookings.stripePaymentIntentId, stripePaymentIntentId))
    .returning({ id: bookings.id })
  return rows[0] ?? null
}

export async function getOrCreateCustomer(clerkUserId: string, name: string, email: string, phone: string) {
  const existing = await db
    .select()
    .from(customers)
    .where(eq(customers.id, clerkUserId))
  if (existing.length > 0) return existing[0]
  const [created] = await db
    .insert(customers)
    .values({ id: clerkUserId, name, email, phone })
    .returning()
  return created
}

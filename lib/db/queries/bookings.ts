import { db } from '@/lib/db'
import { bookings, customers } from '@/lib/db/schema'
import { eq, desc, and, isNull, lt, ne, inArray } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

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
  stripePaymentIntentId?: string
  stripeCustomerId?: string
  referredByBookingId?: string | null
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
      status: 'requested',
      eventType: params.eventType,
      locationAddress: params.locationAddress,
      locationCity: params.locationCity,
      travelSurcharge: String(params.travelSurcharge),
      depositAmount: String(params.depositAmount),
      balanceAmount: String(params.balanceAmount),
      balanceChargeDate: params.balanceChargeDate,
      stripePaymentIntentId: params.stripePaymentIntentId ?? null,
      stripeCustomerId: params.stripeCustomerId ?? null,
      eventName: params.eventName ?? null,
      designNotes: params.designNotes ?? null,
      eventPreferences: params.eventPreferences ?? null,
      referredByBookingId: params.referredByBookingId ?? null,
    })
    .returning()
  return booking
}

/** Resolve a ?ref=<galleryToken> to the referring booking's id, if it exists. */
export async function getBookingIdByGalleryToken(token: string): Promise<string | null> {
  const [row] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.galleryToken, token))
    .limit(1)
  return row?.id ?? null
}

/** The booking (with customer) that referred this one, for admin display. */
export async function getReferrer(bookingId: string) {
  const [self] = await db
    .select({ referredBy: bookings.referredByBookingId })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)
  if (!self?.referredBy) return null
  const [row] = await db
    .select({ booking: bookings, customer: customers })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .where(eq(bookings.id, self.referredBy))
    .limit(1)
  return row ?? null
}

/** How many bookings were driven by this booking's event gallery. */
export async function countReferralsFrom(bookingId: string): Promise<number> {
  const rows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.referredByBookingId, bookingId))
  return rows.length
}

// Re-submitting the wizard updates the existing requested booking instead of inserting a
// duplicate. customerId is re-set because the customer may have corrected their email
// between submits, and the deposit link must go to the address they actually entered.
export async function updateRequestedBooking(
  id: string,
  params: Omit<CreateBookingParams, 'stripePaymentIntentId' | 'stripeCustomerId'>,
) {
  const [booking] = await db
    .update(bookings)
    .set({
      customerId: params.customerId,
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
    })
    // Status guard: if the admin approved between the read and this write, the re-submit
    // must not silently rewrite the date or price of an approved booking
    .where(and(eq(bookings.id, id), eq(bookings.status, 'requested')))
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

export async function getBookingByPayToken(token: string) {
  const [row] = await db
    .select({ booking: bookings, customer: customers })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .where(eq(bookings.payToken, token))
  return row ?? null
}

export async function getAllBookings() {
  return db
    .select({ booking: bookings, customer: customers })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .orderBy(desc(bookings.eventDate))
}

// Admin PATCH is limited to these two; approve/decline flow through their dedicated
// endpoints so emails and Stripe side effects can never be skipped
export async function updateBookingStatus(
  id: string,
  status: 'cancelled' | 'completed',
) {
  await db.update(bookings).set({ status }).where(eq(bookings.id, id))
}

export async function updateBookingNotes(id: string, notes: string) {
  await db.update(bookings).set({ notes }).where(eq(bookings.id, id))
}

export async function setTouchpixGalleryUrl(id: string, touchpixGalleryUrl: string | null) {
  await db.update(bookings).set({ touchpixGalleryUrl }).where(eq(bookings.id, id))
}

export async function setClipCuration(id: string, clipCuration: { hidden?: string[]; featured?: string[] }) {
  await db.update(bookings).set({ clipCuration }).where(eq(bookings.id, id))
}

export async function approveBooking(
  id: string,
  params: { stripeCustomerId: string; depositExpiresAt: Date },
) {
  // Status guard in the WHERE makes concurrent double-approves lose the race atomically,
  // so only one deposit-link email can ever go out
  const [booking] = await db
    .update(bookings)
    .set({
      status: 'approved',
      approvedAt: new Date(),
      depositExpiresAt: params.depositExpiresAt,
      stripeCustomerId: params.stripeCustomerId,
    })
    .where(and(eq(bookings.id, id), inArray(bookings.status, ['requested', 'expired'])))
    .returning()
  return booking ?? null
}

export async function declineBooking(id: string) {
  const [booking] = await db
    .update(bookings)
    .set({ status: 'declined' })
    .where(and(eq(bookings.id, id), eq(bookings.status, 'requested')))
    .returning()
  return booking ?? null
}

export async function setAutoPayOptIn(id: string, autoPayOptIn: boolean) {
  await db.update(bookings).set({ autoPayOptIn }).where(eq(bookings.id, id))
}

export async function setDepositSessionId(id: string, sessionId: string) {
  await db.update(bookings).set({ stripeDepositSessionId: sessionId }).where(eq(bookings.id, id))
}

export async function setBalanceSessionId(id: string, sessionId: string) {
  await db.update(bookings).set({ stripeBalanceSessionId: sessionId }).where(eq(bookings.id, id))
}

// Only an 'approved' booking can transition to confirmed; the WHERE guard makes
// concurrent webhook deliveries and cron races resolve to exactly one winner
export async function markDepositPaid(
  id: string,
  params: { autoPayOptIn: boolean; stripePaymentIntentId: string | null; stripeCustomerId: string | null },
) {
  const [booking] = await db
    .update(bookings)
    .set({
      status: 'confirmed',
      depositPaidAt: new Date(),
      autoPayOptIn: params.autoPayOptIn,
      ...(params.stripePaymentIntentId ? { stripePaymentIntentId: params.stripePaymentIntentId } : {}),
      ...(params.stripeCustomerId ? { stripeCustomerId: params.stripeCustomerId } : {}),
    })
    .where(and(eq(bookings.id, id), eq(bookings.status, 'approved')))
    .returning()
  return booking ?? null
}

// Guarded on balanceChargedAt IS NULL so a cron charge and a customer-link payment
// racing each other can never both record the balance (or double-send the receipt)
export async function markBalancePaid(id: string, stripeBalancePaymentIntentId: string | null) {
  const [booking] = await db
    .update(bookings)
    .set({ balanceChargedAt: new Date(), stripeBalancePaymentIntentId })
    .where(and(eq(bookings.id, id), isNull(bookings.balanceChargedAt)))
    .returning()
  return booking ?? null
}

export async function markChargeFailed(id: string) {
  await db.update(bookings).set({ chargeFailedAt: new Date() }).where(eq(bookings.id, id))
}

export async function markBalanceDueEmailSent(id: string) {
  await db.update(bookings).set({ balanceDueEmailSentAt: new Date() }).where(eq(bookings.id, id))
}

export async function markBookingExpired(id: string) {
  // Status guard: if a delayed deposit webhook confirmed this booking after the cron
  // selected it, expiring must lose the race instead of clobbering a paid booking
  const [booking] = await db
    .update(bookings)
    .set({ status: 'expired' })
    .where(and(eq(bookings.id, id), eq(bookings.status, 'approved')))
    .returning()
  return booking ?? null
}

export async function getBalanceDueBookings(eventDate: string) {
  return db
    .select({ booking: bookings, customer: customers })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .where(and(
      eq(bookings.status, 'confirmed'),
      isNull(bookings.balanceChargedAt),
      eq(bookings.eventDate, eventDate),
    ))
}

export async function getExpiredApprovedBookings(now: Date) {
  return db
    .select({ booking: bookings, customer: customers })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .where(and(
      eq(bookings.status, 'approved'),
      lt(bookings.depositExpiresAt, now),
    ))
}

// Legacy bridge for in-flight old-flow PaymentElement payments. Old-flow bookings sit
// in 'pending' (remapped to 'expired' by migration 0006); the status guard keeps a
// replayed legacy event from clobbering a cancelled/completed booking or re-sending
// the confirmation email for an already-confirmed one.
export async function confirmBooking(stripePaymentIntentId: string) {
  const rows = await db
    .update(bookings)
    .set({ status: 'confirmed' })
    .where(and(
      eq(bookings.stripePaymentIntentId, stripePaymentIntentId),
      inArray(bookings.status, ['pending', 'expired']),
    ))
    .returning({ id: bookings.id })
  return rows[0] ?? null
}

// Data-retention: redact the event street address (the most sensitive PII) on
// long-past bookings in a terminal state. Amounts/dates stay for business records.
export async function redactOldBookingPii(cutoffDate: string): Promise<number> {
  const rows = await db
    .update(bookings)
    .set({ locationAddress: '[redacted]' })
    .where(
      and(
        lt(bookings.eventDate, cutoffDate),
        inArray(bookings.status, ['completed', 'cancelled', 'declined', 'expired']),
        ne(bookings.locationAddress, '[redacted]'),
      ),
    )
    .returning({ id: bookings.id })
  return rows.length
}

export async function getOrCreateCustomer(name: string, email: string, phone: string) {
  // Atomic upsert on the unique email: two concurrent bookings for the same
  // customer both resolve to one row instead of one throwing a unique-violation
  // 500 (the old check-then-insert had a race between the SELECT and the INSERT).
  const [customer] = await db
    .insert(customers)
    .values({ id: createId(), name, email, phone })
    .onConflictDoUpdate({ target: customers.email, set: { name, phone } })
    .returning()
  return customer
}

import { NextRequest, NextResponse } from 'next/server'
import { createBookingSchema } from '@/lib/validations/booking'
import { checkBookingAvailability } from '@/lib/availability'
import { createBookingRecord, getBookingWithCustomer, getOrCreateCustomer, updateRequestedBooking, getBookingIdByGalleryToken } from '@/lib/db/queries/bookings'
import { ADDON_CATALOG, calculateBookingCost, balanceChargeDate, timeToMinutes, PRICING } from '@/lib/pricing'
import { ADMIN_EMAILS, sendEmail } from '@/lib/email/send'
import { requestReceivedEmail } from '@/lib/email/templates/request-received'
import { adminNewRequestEmail } from '@/lib/email/templates/admin-new-request'
import { getClientIp, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`booking:${ip}`, { limit: 5, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many booking attempts. Please wait before trying again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)), ...rateLimitHeaders(0, rl.resetAt) } },
    )
  }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = createBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const input = parsed.data

  // Idempotent re-entry: if the wizard already submitted a request this session, update it in
  // place. bookingId is client-supplied (and appears in confirmation URLs), so reuse demands
  // ownership evidence: the same email, or a booking fresh enough to be this wizard session.
  const WIZARD_SESSION_TTL_MS = 30 * 60_000
  const existingRow = input.bookingId ? await getBookingWithCustomer(input.bookingId) : null
  const existingBooking = existingRow?.booking ?? null
  const ownsExistingBooking =
    existingRow?.customer?.email.trim().toLowerCase() === input.customerEmail.trim().toLowerCase() ||
    (existingBooking !== null && Date.now() - existingBooking.createdAt.getTime() < WIZARD_SESSION_TTL_MS)
  const reusableBooking =
    existingBooking && existingBooking.status === 'requested' && ownsExistingBooking ? existingBooking : null

  const availability = await checkBookingAvailability(
    input.eventDate,
    reusableBooking ? { excludeBookingId: reusableBooking.id } : undefined,
  )
  if (availability.status !== 'available') {
    const message =
      availability.status === 'full' ? 'This date is fully booked. Please choose another date.' :
      availability.status === 'too-soon' ? `Bookings must be made at least ${PRICING.LEAD_TIME_DAYS} days in advance.` :
      'This date is unavailable.'
    return NextResponse.json({ error: message }, { status: 409 })
  }

  const durationMinutes = timeToMinutes(input.endTime) - timeToMinutes(input.startTime)
  if (durationMinutes < PRICING.MIN_DURATION_MINUTES) {
    return NextResponse.json({ error: `Minimum booking duration is ${PRICING.MIN_DURATION_MINUTES / 60} hours.` }, { status: 422 })
  }

  // Server-side slot integrity: the client filters overlaps, but the boundary must enforce it
  const startMin = timeToMinutes(input.startTime)
  const endMin = timeToMinutes(input.endTime)
  const overlaps = availability.bookedSlots.some(
    (s) => startMin < timeToMinutes(s.endTime) && endMin > timeToMinutes(s.startTime),
  )
  if (overlaps) {
    return NextResponse.json({ error: 'That time slot was just taken. Please pick another time.' }, { status: 409 })
  }

  const pricing = calculateBookingCost({
    durationMinutes,
    addOnIds: input.addOnIds,
    locationCity: input.locationCity,
  })

  const bookingFields = {
    eventDate: input.eventDate,
    startTime: input.startTime,
    endTime: input.endTime,
    durationMinutes,
    addOns: input.addOnIds,
    eventType: input.eventType,
    eventName: input.eventName,
    designNotes: input.designNotes,
    eventPreferences: input.eventPreferences,
    locationAddress: input.locationAddress,
    locationCity: input.locationCity,
    travelSurcharge: pricing.travelSurcharge,
    depositAmount: pricing.depositAmount,
    balanceAmount: pricing.balanceAmount,
    balanceChargeDate: balanceChargeDate(input.eventDate),
  }

  // Resolved up front so a re-submit that corrected the email re-links the booking too
  const customer = await getOrCreateCustomer(input.customerName, input.customerEmail, input.customerPhone)

  let bookingId: string | null = null
  if (reusableBooking) {
    const updated = await updateRequestedBooking(reusableBooking.id, { ...bookingFields, customerId: customer.id })
    // Null means the admin approved mid-submit; keep the approved booking untouched
    bookingId = updated ? updated.id : reusableBooking.id
  }

  if (!bookingId) {
    // Referral attribution: a guest who landed here from an event gallery carries
    // a dm_ref cookie holding that event's gallery token. Resolve it to the
    // referring booking (never self-referential for a brand-new booking).
    const ref = req.cookies.get('dm_ref')?.value
    const referredByBookingId = ref ? await getBookingIdByGalleryToken(ref).catch(() => null) : null

    const booking = await createBookingRecord({ ...bookingFields, customerId: customer.id, referredByBookingId })
    bookingId = booking.id
  }

  // Notification failures must never fail the request itself; sendEmail logs and swallows
  await sendEmail({
    to: input.customerEmail,
    ...requestReceivedEmail({
      name: input.customerName,
      eventDate: input.eventDate,
      startTime: input.startTime,
      endTime: input.endTime,
      locationAddress: input.locationAddress,
      locationCity: input.locationCity,
    }),
  })
  await sendEmail({
    to: ADMIN_EMAILS,
    ...adminNewRequestEmail({
      bookingId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      eventDate: input.eventDate,
      startTime: input.startTime,
      endTime: input.endTime,
      eventType: input.eventType,
      locationAddress: input.locationAddress,
      locationCity: input.locationCity,
      eventName: input.eventName ?? null,
      durationMinutes: timeToMinutes(input.endTime) - timeToMinutes(input.startTime),
      subtotal: pricing.subtotal,
      depositAmount: pricing.depositAmount,
      balanceAmount: pricing.balanceAmount,
      addOnNames: input.addOnIds.filter(id => id in ADDON_CATALOG).map(id => ADDON_CATALOG[id].name),
      colorTheme: input.eventPreferences?.backgroundColorTheme ?? null,
      designNotes: input.designNotes ?? null,
      songPreference: input.eventPreferences?.songPreference ?? null,
    }),
  })

  return NextResponse.json({ bookingId })
}

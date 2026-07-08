import { NextRequest, NextResponse } from 'next/server'
import { createBookingSchema } from '@/lib/validations/booking'
import { checkBookingAvailability } from '@/lib/availability'
import { createBookingRecord, getBookingById, getOrCreateCustomer, updatePendingBooking } from '@/lib/db/queries/bookings'
import { calculateBookingCost, balanceChargeDate, timeToMinutes, PRICING } from '@/lib/pricing'
import { createBookingIntent } from '@/lib/stripe/booking-intent'
import { stripe } from '@/lib/stripe'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
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

  // Idempotent re-entry: if the wizard already created a pending booking this session, update it in place
  const existingBooking = input.bookingId ? await getBookingById(input.bookingId) : null
  const reusableBooking =
    existingBooking && existingBooking.status === 'pending' && existingBooking.stripePaymentIntentId
      ? existingBooking
      : null

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
    eventPreferences: input.eventPreferences,
    locationAddress: input.locationAddress,
    locationCity: input.locationCity,
    travelSurcharge: pricing.travelSurcharge,
    depositAmount: pricing.depositAmount,
    balanceAmount: pricing.balanceAmount,
    balanceChargeDate: balanceChargeDate(input.eventDate),
  }

  if (reusableBooking) {
    try {
      const intent = await stripe.paymentIntents.update(reusableBooking.stripePaymentIntentId!, {
        amount: pricing.depositCents,
        metadata: {
          eventDate: input.eventDate,
          startTime: input.startTime,
          endTime: input.endTime,
          customerEmail: input.customerEmail,
        },
      })
      const updated = await updatePendingBooking(reusableBooking.id, bookingFields)
      if (updated && intent.client_secret) {
        return NextResponse.json({ clientSecret: intent.client_secret, bookingId: updated.id })
      }
    } catch (err) {
      // PaymentIntent no longer updatable (canceled/succeeded); fall through and create fresh
      console.error('pending booking reuse failed, creating a new booking', err)
    }
  }

  const { stripeCustomerId, paymentIntentId, clientSecret } = await createBookingIntent({
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    depositCents: pricing.depositCents,
    eventDate: input.eventDate,
    startTime: input.startTime,
    endTime: input.endTime,
  })

  const customer = await getOrCreateCustomer(stripeCustomerId, input.customerName, input.customerEmail, input.customerPhone)

  const booking = await createBookingRecord({
    ...bookingFields,
    customerId: customer.id,
    stripePaymentIntentId: paymentIntentId,
    stripeCustomerId,
  })

  return NextResponse.json({ clientSecret, bookingId: booking.id })
}

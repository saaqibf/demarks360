import { NextRequest, NextResponse } from 'next/server'
import { createBookingSchema } from '@/lib/validations/booking'
import { checkBookingAvailability } from '@/lib/availability'
import { createBookingRecord, getOrCreateCustomer } from '@/lib/db/queries/bookings'
import { calculateBookingCost, balanceChargeDate, timeToMinutes, PRICING } from '@/lib/pricing'
import { createBookingIntent } from '@/lib/stripe/booking-intent'

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = createBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const input = parsed.data

  const availability = await checkBookingAvailability(input.eventDate)
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

  const pricing = calculateBookingCost({
    durationMinutes,
    addOnIds: input.addOnIds,
    locationCity: input.locationCity,
  })

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
    customerId: customer.id,
    eventDate: input.eventDate,
    startTime: input.startTime,
    endTime: input.endTime,
    durationMinutes,
    addOns: input.addOnIds,
    eventType: input.eventType,
    locationAddress: input.locationAddress,
    locationCity: input.locationCity,
    travelSurcharge: pricing.travelSurcharge,
    depositAmount: pricing.depositAmount,
    balanceAmount: pricing.balanceAmount,
    balanceChargeDate: balanceChargeDate(input.eventDate),
    stripePaymentIntentId: paymentIntentId,
    stripeCustomerId,
  })

  return NextResponse.json({ clientSecret, bookingId: booking.id })
}

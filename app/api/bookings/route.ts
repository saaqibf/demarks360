import { NextRequest, NextResponse } from 'next/server'
import { createBookingSchema } from '@/lib/validations/booking'
import { getTravelSurcharge } from '@/lib/validations/cities'
import { getAvailabilityForDate } from '@/lib/db/queries/availability'
import { createBookingRecord, getOrCreateCustomer } from '@/lib/db/queries/bookings'
import { stripe } from '@/lib/stripe'

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const ADDON_PRICES: Record<string, number> = { firecrackers: 75 }

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = createBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const input = parsed.data

  // Re-check availability to prevent races
  const availability = await getAvailabilityForDate(input.eventDate)
  if (availability.isDateFull) {
    return NextResponse.json({ error: 'This date is fully booked. Please choose another date.' }, { status: 409 })
  }

  // Calculate pricing
  const durationMinutes = timeToMinutes(input.endTime) - timeToMinutes(input.startTime)
  if (durationMinutes < 90) {
    return NextResponse.json({ error: 'Minimum booking duration is 1.5 hours.' }, { status: 422 })
  }

  const durationHours = durationMinutes / 60
  const hourlySubtotal = durationHours * 150
  const addOnSubtotal = input.addOnIds.reduce((sum, id) => sum + (ADDON_PRICES[id] ?? 0), 0)
  const travelSurcharge = getTravelSurcharge(input.locationCity)
  const subtotal = hourlySubtotal + addOnSubtotal + travelSurcharge
  const depositAmount = Math.round(subtotal * 0.30 * 100) / 100
  const balanceAmount = Math.round(subtotal * 0.70 * 100) / 100
  const depositCents = Math.round(depositAmount * 100)
  const balanceChargeDate = addDays(input.eventDate, -7)

  // Create or find Stripe customer
  const existingStripeCustomers = await stripe.customers.list({ email: input.customerEmail, limit: 1 })
  let stripeCustomer: { id: string }
  if (existingStripeCustomers.data.length > 0) {
    stripeCustomer = existingStripeCustomers.data[0]
  } else {
    stripeCustomer = await stripe.customers.create({
      name: input.customerName,
      email: input.customerEmail,
      phone: input.customerPhone,
    })
  }

  // Create PaymentIntent — setup_future_usage saves the card for balance charge
  const paymentIntent = await stripe.paymentIntents.create({
    amount: depositCents,
    currency: 'cad',
    customer: stripeCustomer.id,
    setup_future_usage: 'off_session',
    statement_descriptor_suffix: 'D360',
    metadata: {
      eventDate: input.eventDate,
      startTime: input.startTime,
      endTime: input.endTime,
      customerEmail: input.customerEmail,
    },
  })

  // Upsert customer in our DB (using Stripe customer ID as stand-in until Clerk auth is wired in Plan 5)
  const customer = await getOrCreateCustomer(
    stripeCustomer.id,
    input.customerName,
    input.customerEmail,
    input.customerPhone,
  )

  // Insert booking record
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
    travelSurcharge,
    depositAmount,
    balanceAmount,
    balanceChargeDate,
    stripePaymentIntentId: paymentIntent.id,
    stripeCustomerId: stripeCustomer.id,
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    bookingId: booking.id,
  })
}

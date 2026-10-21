import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { isAdmin } from '@/lib/auth/roles'
import { approveBooking, getBookingWithCustomer } from '@/lib/db/queries/bookings'
import { checkBookingAvailability } from '@/lib/availability'
import { balanceChargeDate, timeToMinutes } from '@/lib/pricing'
import { depositExpiryFrom } from '@/lib/dates/edmonton'
import { stripe } from '@/lib/stripe'
import { APP_URL } from '@/lib/app-url'
import { sendEmail } from '@/lib/email/send'
import { quoteSentEmail } from '@/lib/email/templates/quote-sent'
import { quoteSms, sendSms, smsHref } from '@/lib/sms'

const quoteSchema = z.object({
  total: z.number().min(1).max(100_000),
  firstPayment: z.number().min(1),
  message: z.string().max(1000).optional(),
}).refine((q) => q.firstPayment <= q.total, { message: 'The first payment cannot be more than the total' })

// Stripe needs a checkout to stay open at least 30 minutes, so a shorter hold is unpayable
const MIN_HOLD_MS = 30 * 60 * 1000

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = quoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Check the quote amounts' }, { status: 422 })
  }
  const cents = (n: number) => Math.round(n * 100) / 100
  const total = cents(parsed.data.total)
  const firstPayment = cents(parsed.data.firstPayment)

  const row = await getBookingWithCustomer(id)
  if (!row?.booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  const { booking, customer } = row
  if (!customer) return NextResponse.json({ error: 'Booking has no customer' }, { status: 409 })

  const fromStatus = booking.status
  if (fromStatus !== 'requested' && fromStatus !== 'expired' && fromStatus !== 'approved') {
    return NextResponse.json({ error: `Cannot send a quote for a ${booking.status} booking` }, { status: 409 })
  }
  const isUpdate = fromStatus === 'approved'

  const holdExpiresAt = depositExpiryFrom(new Date(), booking.eventDate)
  if (holdExpiresAt.getTime() - Date.now() < MIN_HOLD_MS) {
    return NextResponse.json({ error: 'This event is too close to hold online. Please call the customer instead.' }, { status: 409 })
  }

  // The slot may have been taken by another booking while this request sat in review.
  // skipLeadTime: a request can legitimately drift inside the customer lead window
  // while it waits for review; that must not block the admin from quoting it.
  const availability = await checkBookingAvailability(booking.eventDate, { excludeBookingId: id, skipLeadTime: true })
  if (availability.status !== 'available') {
    return NextResponse.json({ error: 'That date is no longer free, another booking or a block is on it.' }, { status: 409 })
  }
  const startMin = timeToMinutes(booking.startTime)
  const endMin = timeToMinutes(booking.endTime)
  const overlaps = availability.bookedSlots.some(
    (s) => startMin < timeToMinutes(s.endTime) && endMin > timeToMinutes(s.startTime),
  )
  if (overlaps) {
    return NextResponse.json({ error: 'Another booking already overlaps that time.' }, { status: 409 })
  }

  let stripeCustomerId = booking.stripeCustomerId
  if (!stripeCustomerId) {
    const existing = await stripe.customers.list({ email: customer.email, limit: 1 })
    stripeCustomerId = existing.data.length > 0
      ? existing.data[0].id
      : (await stripe.customers.create({ name: customer.name, email: customer.email, phone: customer.phone })).id
  }

  const updated = await approveBooking(id, {
    stripeCustomerId,
    depositExpiresAt: holdExpiresAt,
    depositAmount: firstPayment,
    balanceAmount: cents(total - firstPayment),
    balanceChargeDate: balanceChargeDate(booking.eventDate),
    fromStatus,
  })
  // Null means a concurrent request moved the booking first (double-click, or the
  // customer paid); the winner already emailed, so this attempt must not send again
  if (!updated) {
    return NextResponse.json({ error: 'This booking was just changed. Refresh the page.' }, { status: 409 })
  }

  // A checkout opened on the old price must not be payable after the price changes
  if (isUpdate && booking.stripeDepositSessionId) {
    // Fails harmlessly when the session already completed or expired on its own
    await stripe.checkout.sessions.expire(booking.stripeDepositSessionId).catch((err) => {
      console.error('[approve] could not expire the previous checkout session:', (err as Error).message)
    })
  }

  await sendEmail({
    to: customer.email,
    ...quoteSentEmail({
      name: customer.name,
      eventDate: updated.eventDate,
      startTime: updated.startTime,
      endTime: updated.endTime,
      eventType: updated.eventType,
      locationCity: updated.locationCity,
      depositAmount: firstPayment,
      balanceAmount: cents(total - firstPayment),
      payToken: updated.payToken!,
      holdExpiresAt,
      message: parsed.data.message,
      isUpdate,
    }),
  })

  const text = quoteSms({
    name: customer.name, eventDate: updated.eventDate, total, payUrl: `${APP_URL}/pay/${updated.payToken}`, holdExpiresAt,
  })
  const autoSent = await sendSms(customer.phone, text)

  return NextResponse.json({ booking: updated, sms: { text, href: smsHref(customer.phone, text), autoSent } })
}

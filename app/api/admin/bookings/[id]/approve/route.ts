import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { approveBooking, getBookingWithCustomer } from '@/lib/db/queries/bookings'
import { checkBookingAvailability } from '@/lib/availability'
import { timeToMinutes } from '@/lib/pricing'
import { depositExpiryFrom } from '@/lib/dates/edmonton'
import { stripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/email/send'
import { depositLinkEmail } from '@/lib/email/templates/deposit-link'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params

  const row = await getBookingWithCustomer(id)
  if (!row?.booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  const { booking, customer } = row
  if (!customer) return NextResponse.json({ error: 'Booking has no customer' }, { status: 409 })

  // Re-approving after expiry re-issues a fresh deposit window
  if (booking.status !== 'requested' && booking.status !== 'expired') {
    return NextResponse.json({ error: `Cannot approve a ${booking.status} booking` }, { status: 409 })
  }

  // The slot may have been taken by another booking while this request sat in review.
  // skipLeadTime: a request can legitimately drift inside the customer lead window
  // while it waits for review; that must not block the admin from approving it.
  const availability = await checkBookingAvailability(booking.eventDate, { excludeBookingId: id, skipLeadTime: true })
  if (availability.status !== 'available') {
    return NextResponse.json({ error: 'That slot has since been taken.' }, { status: 409 })
  }
  const startMin = timeToMinutes(booking.startTime)
  const endMin = timeToMinutes(booking.endTime)
  const overlaps = availability.bookedSlots.some(
    (s) => startMin < timeToMinutes(s.endTime) && endMin > timeToMinutes(s.startTime),
  )
  if (overlaps) {
    return NextResponse.json({ error: 'That slot has since been taken.' }, { status: 409 })
  }

  let stripeCustomerId = booking.stripeCustomerId
  if (!stripeCustomerId) {
    const existing = await stripe.customers.list({ email: customer.email, limit: 1 })
    stripeCustomerId = existing.data.length > 0
      ? existing.data[0].id
      : (await stripe.customers.create({ name: customer.name, email: customer.email, phone: customer.phone })).id
  }

  const depositExpiresAt = depositExpiryFrom(new Date(), booking.eventDate)
  const updated = await approveBooking(id, { stripeCustomerId, depositExpiresAt })
  // Null means a concurrent request changed the status first (e.g. a double-approve);
  // the winner already sent the deposit link, so this attempt must not send a second one
  if (!updated) {
    return NextResponse.json({ error: 'Booking was already handled by another request' }, { status: 409 })
  }

  await sendEmail({
    to: customer.email,
    ...depositLinkEmail({
      name: customer.name,
      eventDate: updated.eventDate,
      depositAmount: updated.depositAmount,
      balanceAmount: updated.balanceAmount,
      payToken: updated.payToken!,
      depositExpiresAt,
    }),
  })

  return NextResponse.json({ booking: updated })
}

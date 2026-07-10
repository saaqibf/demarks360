import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/roles'
import { declineBooking, getBookingWithCustomer } from '@/lib/db/queries/bookings'
import { sendEmail } from '@/lib/email/send'
import { requestDeclinedEmail } from '@/lib/email/templates/request-declined'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params

  const row = await getBookingWithCustomer(id)
  if (!row?.booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  const { booking, customer } = row

  if (booking.status !== 'requested') {
    return NextResponse.json({ error: `Cannot decline a ${booking.status} booking` }, { status: 409 })
  }

  const updated = await declineBooking(id)
  // Null means a concurrent request changed the status first; do not email the customer twice
  if (!updated) {
    return NextResponse.json({ error: 'Booking was already handled by another request' }, { status: 409 })
  }

  if (customer) {
    await sendEmail({
      to: customer.email,
      ...requestDeclinedEmail({ name: customer.name, eventDate: updated.eventDate }),
    })
  }

  return NextResponse.json({ booking: updated })
}

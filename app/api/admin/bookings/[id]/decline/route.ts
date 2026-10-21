import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { isAdmin } from '@/lib/auth/roles'
import { declineBooking, getBookingWithCustomer } from '@/lib/db/queries/bookings'
import { sendEmail } from '@/lib/email/send'
import { requestDeclinedEmail } from '@/lib/email/templates/request-declined'
import { declineSms, sendSms, smsHref } from '@/lib/sms'

const declineSchema = z.object({ message: z.string().max(1000).optional() })

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params

  // The note is optional, so an empty or missing body is still a valid decline
  const raw: unknown = await req.json().catch(() => ({}))
  const parsed = declineSchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: 'That message is too long' }, { status: 422 })
  const message = parsed.data.message?.trim() || null

  const row = await getBookingWithCustomer(id)
  if (!row?.booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  const { booking, customer } = row

  if (booking.status !== 'requested' && booking.status !== 'expired') {
    return NextResponse.json({ error: `Cannot decline a ${booking.status} booking` }, { status: 409 })
  }

  const updated = await declineBooking(id)
  // Null means a concurrent request changed the status first; do not email the customer twice
  if (!updated) {
    return NextResponse.json({ error: 'This booking was just changed. Refresh the page.' }, { status: 409 })
  }

  if (!customer) return NextResponse.json({ booking: updated, sms: null })

  await sendEmail({
    to: customer.email,
    ...requestDeclinedEmail({ name: customer.name, eventDate: updated.eventDate, message }),
  })
  const text = declineSms({ name: customer.name, eventDate: updated.eventDate, message })
  const autoSent = await sendSms(customer.phone, text)

  return NextResponse.json({ booking: updated, sms: { text, href: smsHref(customer.phone, text), autoSent } })
}

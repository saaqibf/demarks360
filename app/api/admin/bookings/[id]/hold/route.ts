import { NextRequest, NextResponse } from 'next/server'

import { isAdmin } from '@/lib/auth/roles'
import { extendHold, getBookingWithCustomer } from '@/lib/db/queries/bookings'
import { depositExpiryFrom } from '@/lib/dates/edmonton'
import { APP_URL } from '@/lib/app-url'
import { sendEmail } from '@/lib/email/send'
import { holdReminderEmail } from '@/lib/email/templates/hold-reminder'
import { holdReminderSms, smsHref } from '@/lib/sms'

// Gives a customer who asked for more time another full hold, counted from whichever
// is later (now or the current end), and still never past the start of event day
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params

  const row = await getBookingWithCustomer(id)
  if (!row?.booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  const { booking, customer } = row
  if (booking.status !== 'approved') {
    return NextResponse.json({ error: 'Only a quote that is waiting for payment can be extended' }, { status: 409 })
  }

  const from = new Date(Math.max(Date.now(), booking.depositExpiresAt?.getTime() ?? 0))
  const holdExpiresAt = depositExpiryFrom(from, booking.eventDate)
  if (booking.depositExpiresAt && holdExpiresAt.getTime() <= booking.depositExpiresAt.getTime()) {
    return NextResponse.json({ error: 'The hold already runs right up to the event day' }, { status: 409 })
  }

  const updated = await extendHold(id, holdExpiresAt)
  if (!updated) return NextResponse.json({ error: 'This booking was just changed. Refresh the page.' }, { status: 409 })
  if (!customer) return NextResponse.json({ booking: updated, sms: null })

  await sendEmail({
    to: customer.email,
    ...holdReminderEmail({ name: customer.name, eventDate: updated.eventDate, payToken: updated.payToken!, holdExpiresAt }),
  })
  const text = holdReminderSms({
    name: customer.name, eventDate: updated.eventDate, payUrl: `${APP_URL}/pay/${updated.payToken}`, holdExpiresAt,
  })
  return NextResponse.json({ booking: updated, sms: { text, href: smsHref(customer.phone, text), autoSent: false } })
}

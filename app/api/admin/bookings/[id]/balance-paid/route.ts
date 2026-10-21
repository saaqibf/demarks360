import { NextRequest, NextResponse } from 'next/server'

import { isAdmin } from '@/lib/auth/roles'
import { getBookingWithCustomer, markBalancePaid } from '@/lib/db/queries/bookings'
import { sendEmail } from '@/lib/email/send'
import { balanceReceiptEmail } from '@/lib/email/templates/balance-receipt'

// The second payment arrived outside Stripe (cash or e-transfer at the event): record
// it so no balance link or saved-card charge goes out, and send the customer a receipt
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params

  const row = await getBookingWithCustomer(id)
  if (!row?.booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  const { booking, customer } = row
  if (booking.status !== 'confirmed' && booking.status !== 'completed') {
    return NextResponse.json({ error: 'Only a booked event can have its second payment recorded' }, { status: 409 })
  }

  // Null means the balance was already recorded (paid online, or a double-click)
  const updated = await markBalancePaid(id, null)
  if (!updated) return NextResponse.json({ error: 'The second payment is already marked as paid' }, { status: 409 })

  if (customer) {
    await sendEmail({
      to: customer.email,
      ...balanceReceiptEmail({ name: customer.name, eventDate: updated.eventDate, balanceAmount: updated.balanceAmount }),
    })
  }
  return NextResponse.json({ booking: updated })
}

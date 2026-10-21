import { sendEmail } from './send'
import { bookingConfirmedEmail } from './templates/booking-confirmation'
import { getBookingWithCustomer } from '@/lib/db/queries/bookings'
import { isPaidInFull } from '@/lib/pricing/paid-in-full'

export async function sendBookingConfirmationEmail(bookingId: string) {
  const row = await getBookingWithCustomer(bookingId)
  if (!row?.customer?.email) return

  const { booking: b, customer: c } = row
  const { subject, html } = bookingConfirmedEmail({
    name: c.name,
    eventDate: b.eventDate,
    startTime: b.startTime,
    endTime: b.endTime,
    eventType: b.eventType,
    locationAddress: b.locationAddress,
    locationCity: b.locationCity,
    depositAmount: b.depositAmount,
    balanceAmount: b.balanceAmount,
    autoPayOptIn: b.autoPayOptIn,
    paidInFull: isPaidInFull(b),
  })
  await sendEmail({ to: c.email, subject, html })
}

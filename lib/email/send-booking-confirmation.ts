import { getResend, FROM_EMAIL } from './resend'
import { bookingConfirmationHtml } from './templates/booking-confirmation'
import { getBookingWithCustomer } from '@/lib/db/queries/bookings'

export async function sendBookingConfirmationEmail(bookingId: string) {
  const row = await getBookingWithCustomer(bookingId)
  if (!row?.customer?.email) return

  const { booking: b, customer: c } = row

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: c.email,
    subject: `Booking Confirmed — Demarks 360`,
    html: bookingConfirmationHtml({
      booking: {
        id: b.id,
        eventDate: b.eventDate,
        startTime: b.startTime,
        endTime: b.endTime,
        eventType: b.eventType,
        locationAddress: b.locationAddress,
        locationCity: b.locationCity,
        depositAmount: b.depositAmount,
        balanceAmount: b.balanceAmount,
        balanceChargeDate: b.balanceChargeDate,
        addOns: b.addOns,
        galleryToken: b.galleryToken,
      },
      customer: { name: c.name, email: c.email },
    }),
  })
}

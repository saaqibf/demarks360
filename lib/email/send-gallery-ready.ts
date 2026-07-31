import { getResend, FROM_EMAIL } from './resend'
import { galleryReadyHtml } from './templates/gallery-ready'
import { getBookingWithCustomer } from '@/lib/db/queries/bookings'

export async function sendGalleryReadyEmail(bookingId: string) {
  if (!process.env.RESEND_API_KEY) return

  const row = await getBookingWithCustomer(bookingId)
  if (!row?.customer?.email || !row.booking.galleryToken) return

  const { booking: b, customer: c } = row
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://demarks360.ca'
  const reviewUrl = process.env.GOOGLE_REVIEW_URL?.trim() || undefined

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: c.email,
    subject: `Your Gallery is Ready - Demarks 360`,
    html: galleryReadyHtml({
      booking: {
        eventDate: b.eventDate,
        eventType: b.eventType,
        galleryToken: b.galleryToken!,
      },
      customer: { name: c.name, email: c.email },
      appUrl,
      reviewUrl,
    }),
  })
}

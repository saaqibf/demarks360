import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { confirmBooking } from '@/lib/db/queries/bookings'
import { sendBookingConfirmationEmail } from '@/lib/email/send-booking-confirmation'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const confirmed = await confirmBooking(pi.id)

    if (confirmed && process.env.RESEND_API_KEY) {
      try {
        await sendBookingConfirmationEmail(confirmed.id)
      } catch (err) {
        console.error('[resend] Failed to send confirmation email:', err)
      }
    }
  }

  return NextResponse.json({ received: true })
}

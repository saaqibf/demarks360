import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import {
  confirmBooking,
  getBookingById,
  getBookingWithCustomer,
  markBalancePaid,
  markDepositPaid,
} from '@/lib/db/queries/bookings'
import * as Sentry from '@sentry/nextjs'
import { sendBookingConfirmationEmail } from '@/lib/email/send-booking-confirmation'
import { sendEmail, ADMIN_EMAILS } from '@/lib/email/send'
import { balanceReceiptEmail } from '@/lib/email/templates/balance-receipt'

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

  if (event.type === 'checkout.session.completed') {
    await handleCheckoutSessionCompleted(event.data.object)
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    // Deposit-session PIs and cron balance PIs carry purpose metadata and are handled
    // elsewhere; only in-flight old-flow PaymentElement payments fall through to here
    if (!pi.metadata?.purpose) {
      const confirmed = await confirmBooking(pi.id)
      if (confirmed) {
        try {
          await sendBookingConfirmationEmail(confirmed.id)
        } catch (err) {
          console.error('[webhook] failed to send confirmation email:', err)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Card-only sessions arrive paid, but async payment methods would not; guard anyway
  if (session.payment_status !== 'paid') return
  const bookingId = session.metadata?.bookingId
  if (!bookingId) return

  const booking = await getBookingById(bookingId)
  if (!booking) return

  if (session.metadata?.purpose === 'deposit') {
    // Stripe retries deliveries; an already-confirmed booking means this event was processed
    if (booking.status === 'confirmed') return
    const confirmed = await markDepositPaid(bookingId, {
      autoPayOptIn: session.metadata?.autoPay === 'true',
      stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
    })
    // Null means the booking left 'approved' between the payment and this delivery
    // (cron expired it, or the admin cancelled). Money was taken for a booking that
    // cannot be confirmed, so never send "you're booked": flag it for manual refund.
    if (!confirmed) {
      const msg = `[webhook] deposit paid for booking ${bookingId} but it is '${booking.status}', not 'approved'; needs manual review/refund`
      console.error(msg)
      // console.error alone is invisible in prod; raise a real alert + email so a
      // customer who paid for a booking that can't be confirmed is refunded.
      Sentry.captureMessage(msg, 'error')
      await sendEmail({
        to: ADMIN_EMAILS,
        subject: 'ACTION NEEDED: deposit paid on a non-approved Demarks booking',
        html: `<p>A deposit was paid but booking <strong>${bookingId}</strong> is '${booking.status}', not 'approved'. It cannot be confirmed, so it likely needs a manual refund. Please review in Stripe + admin.</p>`,
      })
      return
    }
    try {
      await sendBookingConfirmationEmail(bookingId)
    } catch (err) {
      console.error('[webhook] failed to send deposit confirmation email:', err)
    }
    return
  }

  if (session.metadata?.purpose === 'balance') {
    if (booking.balanceChargedAt) return
    const marked = await markBalancePaid(bookingId, typeof session.payment_intent === 'string' ? session.payment_intent : null)
    // Null means the cron (or a retried delivery) already recorded the balance and sent
    // the receipt; sending another would double-email the customer
    if (!marked) return
    const row = await getBookingWithCustomer(bookingId)
    if (row?.customer) {
      await sendEmail({
        to: row.customer.email,
        ...balanceReceiptEmail({
          name: row.customer.name,
          eventDate: row.booking.eventDate,
          balanceAmount: row.booking.balanceAmount,
        }),
      })
    }
  }
}

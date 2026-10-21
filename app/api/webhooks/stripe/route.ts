import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import {
  confirmBooking,
  getBookingById,
  getBookingWithCustomer,
  markBalancePaid,
  markDepositPaid,
  markPaidInFull,
} from '@/lib/db/queries/bookings'
import * as Sentry from '@sentry/nextjs'
import { sendBookingConfirmationEmail } from '@/lib/email/send-booking-confirmation'
import { sendEmail, ADMIN_EMAILS } from '@/lib/email/send'
import { balanceReceiptEmail } from '@/lib/email/templates/balance-receipt'
import { adminNoticeEmail } from '@/lib/email/templates/admin-notice'
import { fmtDate, money } from '@/lib/email/templates/shared'

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

  const purpose = session.metadata?.purpose
  if (purpose === 'deposit' || purpose === 'full') {
    // Stripe retries deliveries; an already-confirmed booking means this event was processed
    if (booking.status === 'confirmed') return
    const stripePaymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null
    const confirmed = purpose === 'full'
      ? await markPaidInFull(bookingId, { stripePaymentIntentId, stripeCustomerId })
      : await markDepositPaid(bookingId, {
        autoPayOptIn: session.metadata?.autoPay === 'true',
        stripePaymentIntentId,
        stripeCustomerId,
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
        ...adminNoticeEmail({
          subject: 'ACTION NEEDED: a payment came in for a booking that is no longer on hold',
          heading: 'A payment needs a refund check',
          lines: [
            `A customer paid for the ${fmtDate(booking.eventDate)} booking, but it was already '${booking.status}' (for example, the hold had ended).`,
            'It could not be confirmed automatically. Please check it in the admin and Stripe, and either re-book them or refund the payment.',
          ],
          bookingId,
        }),
      })
      return
    }
    try {
      await sendBookingConfirmationEmail(bookingId)
    } catch (err) {
      console.error('[webhook] failed to send deposit confirmation email:', err)
    }
    await notifyAdminsOfPayment(bookingId, purpose === 'full' ? 'Paid in full' : 'First payment received')
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
    await notifyAdminsOfPayment(bookingId, 'Second payment received')
  }
}

// Never let an alert failure bubble up: Stripe would retry the whole webhook
async function notifyAdminsOfPayment(bookingId: string, what: string) {
  try {
    const row = await getBookingWithCustomer(bookingId)
    if (!row) return
    const { booking: b, customer: c } = row
    const total = Number(b.depositAmount ?? 0) + Number(b.balanceAmount ?? 0)
    const amount = what === 'Paid in full' ? total : what === 'Second payment received' ? Number(b.balanceAmount ?? 0) : Number(b.depositAmount ?? 0)
    await sendEmail({
      to: ADMIN_EMAILS,
      ...adminNoticeEmail({
        subject: `${what}: ${c?.name ?? 'A customer'}, ${fmtDate(b.eventDate)}`,
        heading: what,
        lines: [
          `${c?.name ?? 'A customer'} paid ${money(amount)} for ${fmtDate(b.eventDate)}. The date is locked in.`,
          what === 'First payment received' ? `The second payment of ${money(b.balanceAmount)} is due the day before the event.` : 'Nothing left to collect for this booking.',
        ],
        bookingId,
      }),
    })
  } catch (err) {
    console.error('[webhook] admin payment alert failed:', err)
  }
}

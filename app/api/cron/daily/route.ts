import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { todayInEdmonton } from '@/lib/dates/edmonton'
import {
  getBalanceDueBookings,
  getExpiredApprovedBookings,
  getHoldsEndingSoon,
  markBalanceDueEmailSent,
  markBalancePaid,
  markBookingExpired,
  markChargeFailed,
  redactOldBookingPii,
} from '@/lib/db/queries/bookings'
import { stripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/email/send'
import { balanceDueEmail } from '@/lib/email/templates/balance-due'
import { balanceReceiptEmail } from '@/lib/email/templates/balance-receipt'
import { requestExpiredEmail } from '@/lib/email/templates/request-expired'
import { holdReminderEmail } from '@/lib/email/templates/hold-reminder'
import { adminNoticeEmail } from '@/lib/email/templates/admin-notice'
import { fmtDate } from '@/lib/email/templates/shared'
import { ADMIN_EMAILS } from '@/lib/email/send'

function isAuthorized(header: string | null): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || !header) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const actual = Buffer.from(header)
  // timingSafeEqual throws on unequal lengths; the length check itself leaks nothing useful
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let charged = 0
  let linked = 0
  let failed = 0
  let expired = 0
  let reminded = 0

  // Pass A: collect today's balances (auto-charge opted-in cards, email links otherwise)
  const dueRows = await getBalanceDueBookings(todayInEdmonton())
  for (const { booking, customer } of dueRows) {
    try {
      if (booking.autoPayOptIn && booking.stripePaymentIntentId && booking.stripeCustomerId) {
        try {
          const balanceCents = Math.round(Number(booking.balanceAmount ?? 0) * 100)
          const depositPi = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId)
          if (!depositPi.payment_method) throw new Error('deposit PI has no saved payment method')
          const pi = await stripe.paymentIntents.create({
            amount: balanceCents,
            currency: 'cad',
            customer: booking.stripeCustomerId,
            payment_method: depositPi.payment_method as string,
            off_session: true,
            confirm: true,
            statement_descriptor_suffix: 'D360',
            metadata: { bookingId: booking.id, purpose: 'balance' },
          }, { idempotencyKey: `balance-${booking.id}` })
          if (pi.status !== 'succeeded') throw new Error(`balance PI status ${pi.status}`)
          const marked = await markBalancePaid(booking.id, pi.id)
          // Null means the customer paid through their link while this run was in flight:
          // the off-session charge above collected the balance a second time
          if (!marked) {
            console.error(`[cron] balance for booking ${booking.id} was paid concurrently; PI ${pi.id} needs a manual refund`)
            failed++
            continue
          }
          if (customer) {
            await sendEmail({
              to: customer.email,
              ...balanceReceiptEmail({
                name: customer.name,
                eventDate: booking.eventDate,
                balanceAmount: booking.balanceAmount,
              }),
            })
          }
          charged++
        } catch (err) {
          const code = (err as { code?: string }).code ?? (err as Error).message
          console.error(`[cron] balance charge failed for booking ${booking.id}: ${code}`)
          await markChargeFailed(booking.id)
          if (customer && booking.payToken && !booking.balanceDueEmailSentAt) {
            await sendEmail({
              to: customer.email,
              ...balanceDueEmail({
                name: customer.name,
                balanceAmount: booking.balanceAmount,
                payToken: booking.payToken,
                cardFailed: true,
              }),
            })
            await markBalanceDueEmailSent(booking.id)
          }
          failed++
        }
      } else if (customer && booking.payToken && !booking.balanceDueEmailSentAt) {
        await sendEmail({
          to: customer.email,
          ...balanceDueEmail({
            name: customer.name,
            balanceAmount: booking.balanceAmount,
            payToken: booking.payToken,
          }),
        })
        await markBalanceDueEmailSent(booking.id)
        linked++
      }
    } catch (err) {
      // One bad row must never abort the rest of the run
      console.error(`[cron] balance pass failed for booking ${booking.id}:`, err)
      failed++
    }
  }

  // Pass B: remind customers whose hold ends within the next day (one run sees each hold once)
  const now = new Date()
  const remindRows = await getHoldsEndingSoon(now, new Date(now.getTime() + 24 * 60 * 60 * 1000))
  for (const { booking, customer } of remindRows) {
    try {
      if (!customer || !booking.payToken || !booking.depositExpiresAt) continue
      await sendEmail({
        to: customer.email,
        ...holdReminderEmail({
          name: customer.name,
          eventDate: booking.eventDate,
          payToken: booking.payToken,
          holdExpiresAt: booking.depositExpiresAt,
        }),
      })
      reminded++
    } catch (err) {
      console.error(`[cron] hold reminder failed for booking ${booking.id}:`, err)
      failed++
    }
  }

  // Pass C: expire quotes whose hold ended, freeing their dates
  const expiredRows = await getExpiredApprovedBookings(new Date())
  for (const { booking, customer } of expiredRows) {
    try {
      // Null means a deposit webhook confirmed this booking between the select and this
      // update; the customer paid, so they must not receive an "expired" email
      const marked = await markBookingExpired(booking.id)
      if (!marked) continue
      if (customer) {
        await sendEmail({
          to: customer.email,
          ...requestExpiredEmail({ name: customer.name, eventDate: booking.eventDate }),
        })
      }
      await sendEmail({
        to: ADMIN_EMAILS,
        ...adminNoticeEmail({
          subject: `Hold ended: ${customer?.name ?? 'a customer'}, ${fmtDate(booking.eventDate)}`,
          heading: 'A hold ended without payment',
          lines: [
            `${customer?.name ?? 'The customer'} did not pay before their hold ended, so ${fmtDate(booking.eventDate)} is open again on the calendar.`,
            'If they still want it, open the booking and send the quote again.',
          ],
          bookingId: booking.id,
        }),
      })
      expired++
    } catch (err) {
      console.error(`[cron] expiry pass failed for booking ${booking.id}:`, err)
      failed++
    }
  }

  // Data-retention: redact the street address on bookings whose event was 18+
  // months ago and are in a terminal state (no business need to keep the PII).
  let redacted = 0
  try {
    const cutoff = new Date(`${todayInEdmonton()}T00:00:00Z`)
    cutoff.setUTCMonth(cutoff.getUTCMonth() - 18)
    redacted = await redactOldBookingPii(cutoff.toISOString().slice(0, 10))
  } catch (err) {
    console.error('[cron] PII retention pass failed:', err)
  }

  return NextResponse.json({ charged, linked, failed, reminded, expired, redacted })
}

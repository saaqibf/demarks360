import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getBookingByPayToken, setAutoPayOptIn, setBalanceSessionId, setDepositSessionId } from '@/lib/db/queries/bookings'
import { stripe } from '@/lib/stripe'
import { APP_URL } from '@/lib/app-url'
import { getClientIp, checkRateLimitDb, rateLimitHeaders } from '@/lib/rate-limit'

const checkoutSchema = z.object({
  token: z.string().min(1).max(64),
  autoPay: z.boolean().optional(),
  // 'full' pays the whole quote now; 'split' pays the first part and the rest the day before
  plan: z.enum(['full', 'split']).optional(),
})

const THIRTY_MINUTES_MS = 30 * 60 * 1000
const DAY_MS = 24 * 3600 * 1000

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = await checkRateLimitDb(`pay:${ip}`, { limit: 5, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait before trying again.' },
      { status: 429, headers: rateLimitHeaders(0, rl.resetAt) },
    )
  }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 })
  const { token, autoPay, plan } = parsed.data

  const row = await getBookingByPayToken(token)
  if (!row?.booking) return NextResponse.json({ error: 'Payment link not found' }, { status: 404 })
  const booking = row.booking

  if (booking.status === 'approved' && !booking.depositPaidAt) {
    // Stripe needs the session to live at least 30 minutes, so a nearly-expired window counts as expired
    if (!booking.depositExpiresAt || booking.depositExpiresAt.getTime() <= Date.now() + THIRTY_MINUTES_MS) {
      return NextResponse.json({ error: 'The hold on this date has ended. Reply to our email and we will check if it is still free.' }, { status: 409 })
    }
    if (!booking.stripeCustomerId || !booking.depositAmount) {
      return NextResponse.json({ error: 'This booking is not ready for payment.' }, { status: 409 })
    }

    const depositCents = Math.round(Number(booking.depositAmount) * 100)
    const balanceCents = Math.round(Number(booking.balanceAmount ?? 0) * 100)
    // A quote with nothing left after the first part is a single payment either way
    const payInFull = plan === 'full' || balanceCents === 0
    const purpose = payInFull ? 'full' : 'deposit'
    const saveCard = !payInFull && !!autoPay

    // Opt-in is decided on our page BEFORE session creation, since Checkout cannot toggle setup_future_usage mid-flow
    await setAutoPayOptIn(booking.id, saveCard)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: booking.stripeCustomerId,
      // Card-only so checkout.session.completed always means paid
      payment_method_types: ['card'],
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'cad',
          // Stored amounts, never recomputed
          unit_amount: payInFull ? depositCents + balanceCents : depositCents,
          product_data: {
            name: payInFull
              ? `Demarks 360 booking, paid in full - ${booking.eventDate}`
              : `Demarks 360 booking, first payment - ${booking.eventDate}`,
          },
        },
      }],
      payment_intent_data: {
        ...(saveCard ? { setup_future_usage: 'off_session' as const } : {}),
        statement_descriptor_suffix: 'D360',
        metadata: { bookingId: booking.id, purpose },
      },
      metadata: { bookingId: booking.id, purpose, autoPay: saveCard ? 'true' : 'false' },
      // Stripe caps sessions at 24h; the emailed link is our /pay page, which mints fresh
      // sessions, so the hold itself lives in depositExpiresAt, not in any session
      expires_at: Math.floor(Math.min(Date.now() + DAY_MS, booking.depositExpiresAt.getTime()) / 1000),
      success_url: `${APP_URL}/pay/${token}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pay/${token}`,
    })
    await setDepositSessionId(booking.id, session.id)
    return NextResponse.json({ url: session.url })
  }

  if (booking.status === 'confirmed' && !booking.balanceChargedAt) {
    if (!booking.stripeCustomerId || !booking.balanceAmount) {
      return NextResponse.json({ error: 'This booking is not ready for payment.' }, { status: 409 })
    }
    const balanceCents = Math.round(Number(booking.balanceAmount) * 100)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: booking.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'cad',
          unit_amount: balanceCents,
          product_data: { name: `Demarks 360 booking, second payment - ${booking.eventDate}` },
        },
      }],
      payment_intent_data: {
        statement_descriptor_suffix: 'D360',
        metadata: { bookingId: booking.id, purpose: 'balance' },
      },
      metadata: { bookingId: booking.id, purpose: 'balance' },
      success_url: `${APP_URL}/pay/${token}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pay/${token}`,
    })
    await setBalanceSessionId(booking.id, session.id)
    return NextResponse.json({ url: session.url })
  }

  return NextResponse.json({ error: 'This booking has nothing left to pay.' }, { status: 409 })
}

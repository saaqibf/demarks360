import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const constructEvent = vi.fn()
vi.mock('@/lib/stripe', () => ({
  stripe: { webhooks: { constructEvent: (...args: unknown[]) => constructEvent(...args) } },
}))

const getBookingById = vi.fn()
const getBookingWithCustomer = vi.fn()
const markDepositPaid = vi.fn()
const markBalancePaid = vi.fn()
const confirmBooking = vi.fn()
vi.mock('@/lib/db/queries/bookings', () => ({
  getBookingById: (...args: unknown[]) => getBookingById(...args),
  getBookingWithCustomer: (...args: unknown[]) => getBookingWithCustomer(...args),
  markDepositPaid: (...args: unknown[]) => markDepositPaid(...args),
  markBalancePaid: (...args: unknown[]) => markBalancePaid(...args),
  confirmBooking: (...args: unknown[]) => confirmBooking(...args),
}))

const sendBookingConfirmationEmail = vi.fn()
vi.mock('@/lib/email/send-booking-confirmation', () => ({
  sendBookingConfirmationEmail: (...args: unknown[]) => sendBookingConfirmationEmail(...args),
}))

const sendEmail = vi.fn()
vi.mock('@/lib/email/send', () => ({
  sendEmail: (...args: unknown[]) => sendEmail(...args),
  ADMIN_EMAILS: ['admin@test.local'],
}))

import { POST } from './route'

function webhookRequest(): NextRequest {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body: '{}',
    headers: { 'stripe-signature': 'sig' },
  }) as unknown as NextRequest
}

function depositSessionEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        payment_status: 'paid',
        payment_intent: 'pi_dep_1',
        customer: 'cus_1',
        metadata: { bookingId: 'bk_1', purpose: 'deposit', autoPay: 'true' },
        ...overrides,
      },
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
})

describe('stripe webhook', () => {
  it('confirms the booking when a deposit session completes', async () => {
    constructEvent.mockReturnValue(depositSessionEvent())
    getBookingById.mockResolvedValue({ id: 'bk_1', status: 'approved', balanceChargedAt: null })
    markDepositPaid.mockResolvedValue({ id: 'bk_1', status: 'confirmed' })

    const res = await POST(webhookRequest())

    expect(res.status).toBe(200)
    expect(markDepositPaid).toHaveBeenCalledWith('bk_1', {
      autoPayOptIn: true,
      stripePaymentIntentId: 'pi_dep_1',
      stripeCustomerId: 'cus_1',
    })
    expect(sendBookingConfirmationEmail).toHaveBeenCalledWith('bk_1')
  })

  it('never sends "you are booked" when the deposit lands on a booking that left approved', async () => {
    constructEvent.mockReturnValue(depositSessionEvent())
    getBookingById.mockResolvedValue({ id: 'bk_1', status: 'expired', balanceChargedAt: null })
    markDepositPaid.mockResolvedValue(null)

    const res = await POST(webhookRequest())

    expect(res.status).toBe(200)
    expect(sendBookingConfirmationEmail).not.toHaveBeenCalled()
  })

  it('treats a second deposit delivery as a no-op with no duplicate email', async () => {
    constructEvent.mockReturnValue(depositSessionEvent())
    getBookingById.mockResolvedValue({ id: 'bk_1', status: 'confirmed', balanceChargedAt: null })

    await POST(webhookRequest())

    expect(markDepositPaid).not.toHaveBeenCalled()
    expect(sendBookingConfirmationEmail).not.toHaveBeenCalled()
  })

  it('marks the balance paid when a balance session completes', async () => {
    constructEvent.mockReturnValue(depositSessionEvent({
      payment_intent: 'pi_bal_1',
      metadata: { bookingId: 'bk_1', purpose: 'balance' },
    }))
    getBookingById.mockResolvedValue({ id: 'bk_1', status: 'confirmed', balanceChargedAt: null })
    markBalancePaid.mockResolvedValue({ id: 'bk_1' })
    getBookingWithCustomer.mockResolvedValue({
      booking: { id: 'bk_1', eventDate: '2026-08-15', balanceAmount: '120.00' },
      customer: { name: 'Ada Test', email: 'ada@test.local' },
    })

    await POST(webhookRequest())

    expect(markBalancePaid).toHaveBeenCalledWith('bk_1', 'pi_bal_1')
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'ada@test.local' }))
  })

  it('sends no receipt when the cron recorded the balance first', async () => {
    constructEvent.mockReturnValue(depositSessionEvent({
      payment_intent: 'pi_bal_1',
      metadata: { bookingId: 'bk_1', purpose: 'balance' },
    }))
    getBookingById.mockResolvedValue({ id: 'bk_1', status: 'confirmed', balanceChargedAt: null })
    markBalancePaid.mockResolvedValue(null)

    await POST(webhookRequest())

    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('skips an already-settled balance session', async () => {
    constructEvent.mockReturnValue(depositSessionEvent({
      metadata: { bookingId: 'bk_1', purpose: 'balance' },
    }))
    getBookingById.mockResolvedValue({ id: 'bk_1', status: 'confirmed', balanceChargedAt: new Date() })

    await POST(webhookRequest())

    expect(markBalancePaid).not.toHaveBeenCalled()
  })

  it('ignores unpaid checkout sessions', async () => {
    constructEvent.mockReturnValue(depositSessionEvent({ payment_status: 'unpaid' }))

    await POST(webhookRequest())

    expect(getBookingById).not.toHaveBeenCalled()
    expect(markDepositPaid).not.toHaveBeenCalled()
  })

  it('ignores payment_intent.succeeded events that carry purpose metadata', async () => {
    constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_bal_1', metadata: { purpose: 'balance', bookingId: 'bk_1' } } },
    })

    await POST(webhookRequest())

    expect(confirmBooking).not.toHaveBeenCalled()
  })

  it('routes purpose-less payment_intent.succeeded through the legacy confirm path', async () => {
    constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_legacy_1', metadata: {} } },
    })
    confirmBooking.mockResolvedValue({ id: 'bk_legacy' })

    await POST(webhookRequest())

    expect(confirmBooking).toHaveBeenCalledWith('pi_legacy_1')
    expect(sendBookingConfirmationEmail).toHaveBeenCalledWith('bk_legacy')
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const paymentIntentsRetrieve = vi.fn()
const paymentIntentsCreate = vi.fn()
vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      retrieve: (...args: unknown[]) => paymentIntentsRetrieve(...args),
      create: (...args: unknown[]) => paymentIntentsCreate(...args),
    },
  },
}))

const getBalanceDueBookings = vi.fn()
const getExpiredApprovedBookings = vi.fn()
const markBalancePaid = vi.fn()
const markChargeFailed = vi.fn()
const markBalanceDueEmailSent = vi.fn()
const markBookingExpired = vi.fn()
vi.mock('@/lib/db/queries/bookings', () => ({
  getBalanceDueBookings: (...args: unknown[]) => getBalanceDueBookings(...args),
  getExpiredApprovedBookings: (...args: unknown[]) => getExpiredApprovedBookings(...args),
  markBalancePaid: (...args: unknown[]) => markBalancePaid(...args),
  markChargeFailed: (...args: unknown[]) => markChargeFailed(...args),
  markBalanceDueEmailSent: (...args: unknown[]) => markBalanceDueEmailSent(...args),
  markBookingExpired: (...args: unknown[]) => markBookingExpired(...args),
}))

const sendEmail = vi.fn()
vi.mock('@/lib/email/send', () => ({
  sendEmail: (...args: unknown[]) => sendEmail(...args),
  ADMIN_EMAIL: 'admin@test.local',
}))

import { GET } from './route'
import { todayInEdmonton } from '@/lib/dates/edmonton'

const CRON_SECRET = 'test-cron-secret'

function cronRequest(auth?: string): NextRequest {
  return new Request('http://localhost/api/cron/daily', {
    headers: auth ? { authorization: auth } : {},
  }) as unknown as NextRequest
}

function dueBookingRow(overrides: Record<string, unknown> = {}) {
  return {
    booking: {
      id: 'bk_1',
      eventDate: todayInEdmonton(),
      balanceAmount: '120.00',
      autoPayOptIn: true,
      stripePaymentIntentId: 'pi_dep_1',
      stripeCustomerId: 'cus_1',
      payToken: 'tok_1',
      balanceDueEmailSentAt: null,
      ...overrides,
    },
    customer: { name: 'Ada Test', email: 'ada@test.local' },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.CRON_SECRET = CRON_SECRET
  getBalanceDueBookings.mockResolvedValue([])
  getExpiredApprovedBookings.mockResolvedValue([])
})

describe('daily cron auth', () => {
  it('rejects requests without the cron secret', async () => {
    const res = await GET(cronRequest())
    expect(res.status).toBe(401)
  })

  it('rejects requests with the wrong secret', async () => {
    const res = await GET(cronRequest('Bearer wrong-secret!!'))
    expect(res.status).toBe(401)
  })
})

describe('daily cron balance pass', () => {
  it('queries only bookings due today in Edmonton', async () => {
    await GET(cronRequest(`Bearer ${CRON_SECRET}`))
    expect(getBalanceDueBookings).toHaveBeenCalledWith(todayInEdmonton())
  })

  it('charges the saved card off-session for opted-in bookings', async () => {
    getBalanceDueBookings.mockResolvedValue([dueBookingRow()])
    paymentIntentsRetrieve.mockResolvedValue({ payment_method: 'pm_1' })
    paymentIntentsCreate.mockResolvedValue({ id: 'pi_bal_1', status: 'succeeded' })
    markBalancePaid.mockResolvedValue({ id: 'bk_1' })

    const res = await GET(cronRequest(`Bearer ${CRON_SECRET}`))

    expect(paymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 12000,
        customer: 'cus_1',
        payment_method: 'pm_1',
        off_session: true,
        confirm: true,
        metadata: { bookingId: 'bk_1', purpose: 'balance' },
      }),
      { idempotencyKey: 'balance-bk_1' },
    )
    expect(markBalancePaid).toHaveBeenCalledWith('bk_1', 'pi_bal_1')
    await expect(res.json()).resolves.toEqual({ charged: 1, linked: 0, failed: 0, expired: 0 })
  })

  it('sends no receipt and reports a failure when the balance was paid concurrently', async () => {
    getBalanceDueBookings.mockResolvedValue([dueBookingRow()])
    paymentIntentsRetrieve.mockResolvedValue({ payment_method: 'pm_1' })
    paymentIntentsCreate.mockResolvedValue({ id: 'pi_bal_1', status: 'succeeded' })
    markBalancePaid.mockResolvedValue(null)

    const res = await GET(cronRequest(`Bearer ${CRON_SECRET}`))

    expect(sendEmail).not.toHaveBeenCalled()
    await expect(res.json()).resolves.toEqual({ charged: 0, linked: 0, failed: 1, expired: 0 })
  })

  it('falls back to the payment link once when the charge fails', async () => {
    getBalanceDueBookings.mockResolvedValue([dueBookingRow()])
    paymentIntentsRetrieve.mockResolvedValue({ payment_method: 'pm_1' })
    paymentIntentsCreate.mockRejectedValue(Object.assign(new Error('declined'), { code: 'card_declined' }))

    const res = await GET(cronRequest(`Bearer ${CRON_SECRET}`))

    expect(markChargeFailed).toHaveBeenCalledWith('bk_1')
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'ada@test.local',
      subject: 'Your remaining balance is due today',
    }))
    expect(markBalanceDueEmailSent).toHaveBeenCalledWith('bk_1')
    await expect(res.json()).resolves.toEqual({ charged: 0, linked: 0, failed: 1, expired: 0 })
  })

  it('emails the payment link for bookings without auto-pay opt-in', async () => {
    getBalanceDueBookings.mockResolvedValue([dueBookingRow({ autoPayOptIn: false })])

    const res = await GET(cronRequest(`Bearer ${CRON_SECRET}`))

    expect(paymentIntentsCreate).not.toHaveBeenCalled()
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      subject: 'Your remaining balance is due today',
    }))
    expect(markBalanceDueEmailSent).toHaveBeenCalledWith('bk_1')
    await expect(res.json()).resolves.toEqual({ charged: 0, linked: 1, failed: 0, expired: 0 })
  })

  it('never re-emails a link once the balance-due email was stamped', async () => {
    getBalanceDueBookings.mockResolvedValue([
      dueBookingRow({ autoPayOptIn: false, balanceDueEmailSentAt: new Date() }),
    ])

    await GET(cronRequest(`Bearer ${CRON_SECRET}`))

    expect(sendEmail).not.toHaveBeenCalled()
    expect(markBalanceDueEmailSent).not.toHaveBeenCalled()
  })
})

describe('daily cron expiry pass', () => {
  it('expires approved bookings past their deposit window and emails the customer', async () => {
    getExpiredApprovedBookings.mockResolvedValue([
      {
        booking: { id: 'bk_2', eventDate: '2026-09-01' },
        customer: { name: 'Ada Test', email: 'ada@test.local' },
      },
    ])
    markBookingExpired.mockResolvedValue({ id: 'bk_2', status: 'expired' })

    const res = await GET(cronRequest(`Bearer ${CRON_SECRET}`))

    expect(markBookingExpired).toHaveBeenCalledWith('bk_2')
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'ada@test.local',
      subject: 'Your booking request has expired',
    }))
    await expect(res.json()).resolves.toEqual({ charged: 0, linked: 0, failed: 0, expired: 1 })
  })

  it('sends no expiry email when a deposit webhook confirmed the booking first', async () => {
    getExpiredApprovedBookings.mockResolvedValue([
      {
        booking: { id: 'bk_2', eventDate: '2026-09-01' },
        customer: { name: 'Ada Test', email: 'ada@test.local' },
      },
    ])
    markBookingExpired.mockResolvedValue(null)

    const res = await GET(cronRequest(`Bearer ${CRON_SECRET}`))

    expect(sendEmail).not.toHaveBeenCalled()
    await expect(res.json()).resolves.toEqual({ charged: 0, linked: 0, failed: 0, expired: 0 })
  })
})

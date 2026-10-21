import { describe, expect, it } from 'vitest'

import { isPaidInFull } from './paid-in-full'

const paidAt = new Date('2026-10-01T12:00:00Z')

describe('isPaidInFull', () => {
  it('is true when one payment intent covered both halves', () => {
    expect(isPaidInFull({ balanceChargedAt: paidAt, stripePaymentIntentId: 'pi_1', stripeBalancePaymentIntentId: 'pi_1' })).toBe(true)
  })

  it('is false when the second payment was recorded by hand', () => {
    expect(isPaidInFull({ balanceChargedAt: paidAt, stripePaymentIntentId: null, stripeBalancePaymentIntentId: null })).toBe(false)
  })

  it('is false when the halves were paid separately', () => {
    expect(isPaidInFull({ balanceChargedAt: paidAt, stripePaymentIntentId: 'pi_1', stripeBalancePaymentIntentId: 'pi_2' })).toBe(false)
  })
})

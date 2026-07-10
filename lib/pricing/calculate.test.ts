import { describe, expect, it } from 'vitest'

import { balanceChargeDate, calculateBookingCost, timeToMinutes } from './calculate'

describe('calculateBookingCost', () => {
  it('prices the 2-hour Calgary baseline: $240, $120 deposit, $120 balance', () => {
    const cost = calculateBookingCost({ durationMinutes: 120, addOnIds: [], locationCity: 'Calgary' })
    expect(cost.subtotal).toBe(240)
    expect(cost.depositAmount).toBe(120)
    expect(cost.balanceAmount).toBe(120)
    expect(cost.depositCents).toBe(12000)
    expect(cost.balanceCents).toBe(12000)
  })

  it('deposit and balance always reassemble the subtotal exactly', () => {
    // 2 hrs + firecrackers = $315: 50% is $157.50, a non-integer split
    const cost = calculateBookingCost({ durationMinutes: 120, addOnIds: ['firecrackers'], locationCity: 'Calgary' })
    expect(cost.depositAmount).toBe(157.5)
    expect(cost.depositAmount + cost.balanceAmount).toBe(cost.subtotal)
  })

  it('exposes the balance in cents for the Stripe balance charge', () => {
    const cost = calculateBookingCost({ durationMinutes: 120, addOnIds: ['firecrackers'], locationCity: 'Calgary' })
    expect(cost.balanceCents).toBe(15750)
  })

  it('adds firecrackers flat and shows them as a line item', () => {
    const cost = calculateBookingCost({ durationMinutes: 120, addOnIds: ['firecrackers'], locationCity: 'Calgary' })
    expect(cost.addOnSubtotal).toBe(75)
    expect(cost.subtotal).toBe(315)
    expect(cost.lineItems.map(l => l.label)).toContain('Firecrackers')
  })

  it('ignores unknown add-on ids instead of charging for them', () => {
    const cost = calculateBookingCost({ durationMinutes: 120, addOnIds: ['jetpack'], locationCity: 'Calgary' })
    expect(cost.addOnSubtotal).toBe(0)
    expect(cost.lineItems).toHaveLength(1)
  })

  it('charges the travel surcharge outside Calgary and itemizes it', () => {
    const cost = calculateBookingCost({ durationMinutes: 120, addOnIds: [], locationCity: 'Airdrie' })
    expect(cost.travelSurcharge).toBe(50)
    expect(cost.subtotal).toBe(290)
    expect(cost.lineItems.map(l => l.label)).toContain('Travel surcharge')
  })

  it('formats whole hours without a trailing .0 in the line item', () => {
    const twoHours = calculateBookingCost({ durationMinutes: 120, addOnIds: [], locationCity: 'Calgary' })
    expect(twoHours.lineItems[0].label).toBe('2 hrs × $120/hr')
    const ninetyMin = calculateBookingCost({ durationMinutes: 90, addOnIds: [], locationCity: 'Calgary' })
    expect(ninetyMin.lineItems[0].label).toBe('1.5 hrs × $120/hr')
  })
})

describe('balanceChargeDate', () => {
  it('lands on the event day itself', () => {
    expect(balanceChargeDate('2026-08-15')).toBe('2026-08-15')
  })

  it('does not shift across month boundaries', () => {
    expect(balanceChargeDate('2026-08-01')).toBe('2026-08-01')
  })

  it('does not shift across year boundaries', () => {
    expect(balanceChargeDate('2027-01-01')).toBe('2027-01-01')
  })
})

describe('timeToMinutes', () => {
  it('converts HH:MM to minutes since midnight', () => {
    expect(timeToMinutes('00:00')).toBe(0)
    expect(timeToMinutes('09:30')).toBe(570)
    expect(timeToMinutes('23:59')).toBe(1439)
  })
})

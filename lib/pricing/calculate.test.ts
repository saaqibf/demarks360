import { describe, expect, it } from 'vitest'

import { balanceChargeDate, calculateBookingCost, timeToMinutes } from './calculate'

describe('calculateBookingCost', () => {
  it('prices the 2-hour Calgary baseline: $300, $90 deposit, $210 balance', () => {
    const cost = calculateBookingCost({ durationMinutes: 120, addOnIds: [], locationCity: 'Calgary' })
    expect(cost.subtotal).toBe(300)
    expect(cost.depositAmount).toBe(90)
    expect(cost.balanceAmount).toBe(210)
    expect(cost.depositCents).toBe(9000)
  })

  it('deposit and balance always reassemble the subtotal exactly', () => {
    // 1.5 hrs = $225: 30% is $67.50, a non-integer split
    const cost = calculateBookingCost({ durationMinutes: 90, addOnIds: [], locationCity: 'Calgary' })
    expect(cost.depositAmount).toBe(67.5)
    expect(cost.depositAmount + cost.balanceAmount).toBe(cost.subtotal)
  })

  it('adds firecrackers flat and shows them as a line item', () => {
    const cost = calculateBookingCost({ durationMinutes: 120, addOnIds: ['firecrackers'], locationCity: 'Calgary' })
    expect(cost.addOnSubtotal).toBe(75)
    expect(cost.subtotal).toBe(375)
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
    expect(cost.subtotal).toBe(350)
    expect(cost.lineItems.map(l => l.label)).toContain('Travel surcharge')
  })

  it('formats whole hours without a trailing .0 in the line item', () => {
    const twoHours = calculateBookingCost({ durationMinutes: 120, addOnIds: [], locationCity: 'Calgary' })
    expect(twoHours.lineItems[0].label).toBe('2 hrs × $150/hr')
    const ninetyMin = calculateBookingCost({ durationMinutes: 90, addOnIds: [], locationCity: 'Calgary' })
    expect(ninetyMin.lineItems[0].label).toBe('1.5 hrs × $150/hr')
  })
})

describe('balanceChargeDate', () => {
  it('lands 7 days before the event', () => {
    expect(balanceChargeDate('2026-08-15')).toBe('2026-08-08')
  })

  it('crosses month boundaries correctly', () => {
    expect(balanceChargeDate('2026-08-03')).toBe('2026-07-27')
  })

  it('crosses year boundaries correctly', () => {
    expect(balanceChargeDate('2027-01-04')).toBe('2026-12-28')
  })
})

describe('timeToMinutes', () => {
  it('converts HH:MM to minutes since midnight', () => {
    expect(timeToMinutes('00:00')).toBe(0)
    expect(timeToMinutes('09:30')).toBe(570)
    expect(timeToMinutes('23:59')).toBe(1439)
  })
})

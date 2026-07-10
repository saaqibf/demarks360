import { describe, expect, it } from 'vitest'

import { depositExpiryFrom, eventDayStartEdmonton, todayInEdmonton } from './edmonton'

describe('todayInEdmonton', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(todayInEdmonton()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('eventDayStartEdmonton', () => {
  it('maps a summer event day to 06:00 UTC (MDT, UTC-6)', () => {
    expect(eventDayStartEdmonton('2026-08-15').toISOString()).toBe('2026-08-15T06:00:00.000Z')
  })

  it('maps a winter event day to 07:00 UTC (MST, UTC-7)', () => {
    expect(eventDayStartEdmonton('2026-01-15').toISOString()).toBe('2026-01-15T07:00:00.000Z')
  })
})

describe('depositExpiryFrom', () => {
  it('clamps to event-day midnight when approval is 2 days before the event', () => {
    const now = new Date('2026-08-13T18:00:00Z')
    expect(depositExpiryFrom(now, '2026-08-15').toISOString()).toBe('2026-08-15T06:00:00.000Z')
  })

  it('gives the full 7-day window when approval is 30 days before the event', () => {
    const now = new Date('2026-07-16T18:00:00Z')
    expect(depositExpiryFrom(now, '2026-08-15').toISOString()).toBe('2026-07-23T18:00:00.000Z')
  })
})

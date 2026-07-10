import { describe, expect, it, vi } from 'vitest'

// The module under test imports the db client, which needs a DATABASE_URL at load time
vi.mock('@/lib/db', () => ({ db: {} }))

import { isActiveBooking } from './availability'

const HOUR_MS = 60 * 60 * 1000

describe('isActiveBooking', () => {
  it('blocks the slot while a request awaits review', () => {
    expect(isActiveBooking({ status: 'requested', depositExpiresAt: null })).toBe(true)
  })

  it('blocks the slot once confirmed', () => {
    expect(isActiveBooking({ status: 'confirmed', depositExpiresAt: null })).toBe(true)
  })

  it('blocks the slot while an approved deposit window is still open', () => {
    const inWindow = new Date(Date.now() + HOUR_MS)
    expect(isActiveBooking({ status: 'approved', depositExpiresAt: inWindow })).toBe(true)
  })

  it('frees the slot once the approved deposit window has passed', () => {
    const pastWindow = new Date(Date.now() - HOUR_MS)
    expect(isActiveBooking({ status: 'approved', depositExpiresAt: pastWindow })).toBe(false)
  })

  it('blocks the slot for approved bookings missing an expiry', () => {
    expect(isActiveBooking({ status: 'approved', depositExpiresAt: null })).toBe(true)
  })

  it('frees the slot when expired', () => {
    expect(isActiveBooking({ status: 'expired', depositExpiresAt: null })).toBe(false)
  })

  it('frees the slot when declined', () => {
    expect(isActiveBooking({ status: 'declined', depositExpiresAt: null })).toBe(false)
  })

  it('frees the slot when cancelled', () => {
    expect(isActiveBooking({ status: 'cancelled', depositExpiresAt: null })).toBe(false)
  })

  it('ignores legacy pending rows entirely', () => {
    expect(isActiveBooking({ status: 'pending', depositExpiresAt: null })).toBe(false)
  })
})

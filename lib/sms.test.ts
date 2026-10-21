import { describe, expect, it } from 'vitest'

import { declineSms, smsHref, toE164 } from './sms'

describe('toE164', () => {
  it('adds the +1 country code to a 10-digit Canadian number', () => {
    expect(toE164('(403) 402-0816')).toBe('+14034020816')
  })

  it('keeps an 11-digit number that already starts with 1', () => {
    expect(toE164('1-403-402-0816')).toBe('+14034020816')
  })

  it('rejects input too short to be a phone number', () => {
    expect(toE164('12345')).toBeNull()
  })
})

describe('smsHref', () => {
  it('builds a Messages link with the body encoded', () => {
    expect(smsHref('403 402 0816', 'Hi & bye')).toBe('sms:+14034020816?&body=Hi%20%26%20bye')
  })
})

describe('declineSms', () => {
  it('includes the personal note when one is given', () => {
    expect(declineSms({ name: 'Ada Obi', eventDate: '2026-11-14', message: 'We are fully booked that day.' }))
      .toContain('We are fully booked that day.')
  })
})

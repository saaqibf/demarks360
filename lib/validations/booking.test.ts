import { describe, it, expect } from 'vitest'
import { createBookingSchema } from './booking'

const base = {
  eventDate: '2026-09-15',
  startTime: '18:00',
  endTime: '21:00',
  addOnIds: [],
  customerName: 'Saaqib Fagbenro',
  customerEmail: 'saaqib@example.com',
  customerPhone: '4031234567',
  locationAddress: '123 Main Street NW',
  locationCity: 'Calgary',
  eventType: 'Birthday Party',
  agreedToTerms: true as const,
}

describe('createBookingSchema — core fields', () => {
  it('accepts a minimal valid booking', () => {
    expect(createBookingSchema.safeParse(base).success).toBe(true)
  })

  it('rejects eventDate not matching YYYY-MM-DD', () => {
    const result = createBookingSchema.safeParse({ ...base, eventDate: '15-09-2026' })
    expect(result.success).toBe(false)
  })

  it('rejects startTime not matching HH:MM', () => {
    const result = createBookingSchema.safeParse({ ...base, startTime: '6:00pm' })
    expect(result.success).toBe(false)
  })

  it('rejects customerName shorter than 2 characters', () => {
    const result = createBookingSchema.safeParse({ ...base, customerName: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid customerEmail', () => {
    const result = createBookingSchema.safeParse({ ...base, customerEmail: 'notanemail' })
    expect(result.success).toBe(false)
  })

  it('rejects customerPhone shorter than 10 digits', () => {
    const result = createBookingSchema.safeParse({ ...base, customerPhone: '123456' })
    expect(result.success).toBe(false)
  })

  it('rejects locationAddress shorter than 5 characters', () => {
    const result = createBookingSchema.safeParse({ ...base, locationAddress: '123' })
    expect(result.success).toBe(false)
  })

  it('rejects a city not in SERVICE_CITIES', () => {
    const result = createBookingSchema.safeParse({ ...base, locationCity: 'Toronto' })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown eventType', () => {
    const result = createBookingSchema.safeParse({ ...base, eventType: 'Rave' })
    expect(result.success).toBe(false)
  })

  it('rejects when agreedToTerms is false', () => {
    const result = createBookingSchema.safeParse({ ...base, agreedToTerms: false })
    expect(result.success).toBe(false)
  })

  it('accepts eventType Birthday Party', () => {
    expect(createBookingSchema.safeParse({ ...base, eventType: 'Birthday Party' }).success).toBe(true)
  })

  it('accepts eventType Wedding', () => {
    expect(createBookingSchema.safeParse({ ...base, eventType: 'Wedding' }).success).toBe(true)
  })

  it('accepts eventType Graduation', () => {
    expect(createBookingSchema.safeParse({ ...base, eventType: 'Graduation' }).success).toBe(true)
  })

  it('accepts eventType Corporate Event', () => {
    expect(createBookingSchema.safeParse({ ...base, eventType: 'Corporate Event' }).success).toBe(true)
  })

  it('accepts eventType Engagement Party', () => {
    expect(createBookingSchema.safeParse({ ...base, eventType: 'Engagement Party' }).success).toBe(true)
  })

  it('accepts eventType Baby Shower & Gender Reveal', () => {
    expect(createBookingSchema.safeParse({ ...base, eventType: 'Baby Shower & Gender Reveal' }).success).toBe(true)
  })

  it('accepts eventType Holiday Party', () => {
    expect(createBookingSchema.safeParse({ ...base, eventType: 'Holiday Party' }).success).toBe(true)
  })

  it('accepts eventType Other', () => {
    expect(createBookingSchema.safeParse({ ...base, eventType: 'Other' }).success).toBe(true)
  })

  it('accepts optional eventName', () => {
    const result = createBookingSchema.safeParse({ ...base, eventName: 'Bolu @ 80' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.eventName).toBe('Bolu @ 80')
  })

  it('trims whitespace from eventName', () => {
    const result = createBookingSchema.safeParse({ ...base, eventName: '  My Party  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.eventName).toBe('My Party')
  })

  it('rejects eventName longer than 100 characters', () => {
    const result = createBookingSchema.safeParse({ ...base, eventName: 'x'.repeat(101) })
    expect(result.success).toBe(false)
  })
})

describe('createBookingSchema — eventPreferences', () => {
  it('accepts booking without eventPreferences', () => {
    const result = createBookingSchema.safeParse(base)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.eventPreferences).toBeUndefined()
  })

  it('accepts empty eventPreferences object', () => {
    const result = createBookingSchema.safeParse({ ...base, eventPreferences: {} })
    expect(result.success).toBe(true)
  })

  it('accepts videoType video', () => {
    const result = createBookingSchema.safeParse({
      ...base,
      eventPreferences: { videoType: 'video' },
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.eventPreferences?.videoType).toBe('video')
  })

  it('accepts videoType slomo', () => {
    const result = createBookingSchema.safeParse({
      ...base,
      eventPreferences: { videoType: 'slomo' },
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.eventPreferences?.videoType).toBe('slomo')
  })

  it('rejects unknown videoType', () => {
    const result = createBookingSchema.safeParse({
      ...base,
      eventPreferences: { videoType: 'gif' },
    })
    expect(result.success).toBe(false)
  })

  it('accepts videoDuration of 1 (minimum)', () => {
    const result = createBookingSchema.safeParse({ ...base, eventPreferences: { videoDuration: 1 } })
    expect(result.success).toBe(true)
  })

  it('accepts videoDuration of 12 (slomo max)', () => {
    const result = createBookingSchema.safeParse({ ...base, eventPreferences: { videoDuration: 12 } })
    expect(result.success).toBe(true)
  })

  it('accepts videoDuration of 20 (video recommended)', () => {
    const result = createBookingSchema.safeParse({ ...base, eventPreferences: { videoDuration: 20 } })
    expect(result.success).toBe(true)
  })

  it('accepts videoDuration of 120 (maximum)', () => {
    const result = createBookingSchema.safeParse({ ...base, eventPreferences: { videoDuration: 120 } })
    expect(result.success).toBe(true)
  })

  it('rejects videoDuration of 0', () => {
    const result = createBookingSchema.safeParse({
      ...base,
      eventPreferences: { videoDuration: 0 },
    })
    expect(result.success).toBe(false)
  })

  it('rejects videoDuration above 120', () => {
    const result = createBookingSchema.safeParse({
      ...base,
      eventPreferences: { videoDuration: 121 },
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer videoDuration', () => {
    const result = createBookingSchema.safeParse({
      ...base,
      eventPreferences: { videoDuration: 10.5 },
    })
    expect(result.success).toBe(false)
  })

  it('accepts slomoBoomerang true', () => {
    const result = createBookingSchema.safeParse({ ...base, eventPreferences: { slomoBoomerang: true } })
    expect(result.success).toBe(true)
  })

  it('accepts slomoBoomerang false', () => {
    const result = createBookingSchema.safeParse({ ...base, eventPreferences: { slomoBoomerang: false } })
    expect(result.success).toBe(true)
  })

  it('accepts backgroundColorTheme up to 200 chars', () => {
    const result = createBookingSchema.safeParse({
      ...base,
      eventPreferences: { backgroundColorTheme: 'Gold and Black' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects backgroundColorTheme longer than 200 chars', () => {
    const result = createBookingSchema.safeParse({
      ...base,
      eventPreferences: { backgroundColorTheme: 'x'.repeat(201) },
    })
    expect(result.success).toBe(false)
  })

  it('accepts designThemeTags with all 12 preset categories', () => {
    const result = createBookingSchema.safeParse({
      ...base,
      eventPreferences: {
        designThemeTags: [
          'Birthday (Adult)', 'Birthday (Kids)', 'Baby Shower', 'Bachelorette',
          'Wedding', 'Graduation', 'Corporate', 'Holiday / Christmas',
          'Carnival / Tropical', 'Casino Night', 'Sports', 'Custom / Other',
        ],
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejects a designThemeTags item longer than 100 chars', () => {
    const result = createBookingSchema.safeParse({
      ...base,
      eventPreferences: { designThemeTags: ['x'.repeat(101)] },
    })
    expect(result.success).toBe(false)
  })

  it('accepts songPreference up to 200 chars', () => {
    const result = createBookingSchema.safeParse({
      ...base,
      eventPreferences: { songPreference: 'Davido - Champion Sound' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects songPreference longer than 200 chars', () => {
    const result = createBookingSchema.safeParse({
      ...base,
      eventPreferences: { songPreference: 'x'.repeat(201) },
    })
    expect(result.success).toBe(false)
  })

  const fullPrefs = {
    backgroundColorTheme: 'Gold and Black',
    designThemeTags: ['Birthday (Adult)', 'Glam'],
    songPreference: 'Davido - Champion Sound',
    videoType: 'slomo' as const,
    videoDuration: 12,
    slomoBoomerang: true,
  }

  it('accepts a fully populated eventPreferences object', () => {
    const result = createBookingSchema.safeParse({ ...base, eventPreferences: fullPrefs })
    expect(result.success).toBe(true)
  })

  it('fully populated eventPreferences preserves videoType slomo', () => {
    const result = createBookingSchema.safeParse({ ...base, eventPreferences: fullPrefs })
    expect(result.success && result.data.eventPreferences?.videoType).toBe('slomo')
  })

  it('fully populated eventPreferences preserves slomoBoomerang', () => {
    const result = createBookingSchema.safeParse({ ...base, eventPreferences: fullPrefs })
    expect(result.success && result.data.eventPreferences?.slomoBoomerang).toBe(true)
  })

  it('fully populated eventPreferences preserves videoDuration', () => {
    const result = createBookingSchema.safeParse({ ...base, eventPreferences: fullPrefs })
    expect(result.success && result.data.eventPreferences?.videoDuration).toBe(12)
  })
})

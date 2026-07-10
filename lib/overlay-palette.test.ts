import { describe, expect, it } from 'vitest'
import { paletteToFrameVariant, parseColorTheme, pickOverlayFrame } from './overlay-palette'

// Independent WCAG relative luminance so legibility assertions verify behavior,
// not the parser's own internals
function relativeLuminance(hex: string): number {
  const [r, g, b] = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map(pair => {
    const s = parseInt(pair, 16) / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

describe('parseColorTheme', () => {
  it('matches a compound term before its constituent single', () => {
    expect(parseColorTheme('rose gold').label).toBe('Rose Gold')
  })

  it('labels two recognized colors in input order', () => {
    expect(parseColorTheme('Navy and Silver').label).toBe('Navy + Silver')
  })

  it('puts the lighter of two colors on primary', () => {
    expect(parseColorTheme('Navy and Silver').primary).toBe('#C9CDD4')
  })

  it('keeps the darker of two colors as secondary', () => {
    expect(parseColorTheme('Navy and Silver').secondary).toBe('#33507A')
  })

  it('puts gold type on primary for gold and black', () => {
    expect(parseColorTheme('Gold and Black').primary).toBe('#E8B25C')
  })

  it('derives a readable light primary from a single dark color', () => {
    expect(relativeLuminance(parseColorTheme('navy').primary)).toBeGreaterThanOrEqual(0.22)
  })

  it('keeps the single recognized dark color as secondary', () => {
    expect(parseColorTheme('navy').secondary).toBe('#33507A')
  })

  it('returns the brand fallback for empty input', () => {
    expect(parseColorTheme('')).toEqual({ primary: '#E8B25C', secondary: '#C9913F', label: 'Signature Gold' })
  })

  it('returns the brand fallback for unrecognized input', () => {
    expect(parseColorTheme('vibrant!!').label).toBe('Signature Gold')
  })

  it('ignores case and punctuation when matching', () => {
    expect(parseColorTheme('HOT-PINK & silver').label).toBe('Hot Pink + Silver')
  })

  it('lifts an all-dark pairing above the legibility floor', () => {
    expect(relativeLuminance(parseColorTheme('navy and black').primary)).toBeGreaterThanOrEqual(0.22)
  })
})

describe('paletteToFrameVariant', () => {
  it('maps the compound rose gold to the rose-gold frame, not gold-black', () => {
    expect(paletteToFrameVariant(parseColorTheme('Rose Gold'))).toBe('rose-gold')
  })

  it('keeps rose gold winning when paired with cream', () => {
    expect(paletteToFrameVariant(parseColorTheme('rose gold and cream'))).toBe('rose-gold')
  })

  it('maps navy to the navy-silver frame', () => {
    expect(paletteToFrameVariant(parseColorTheme('Navy and White'))).toBe('navy-silver')
  })

  it('maps silver to the navy-silver frame', () => {
    expect(paletteToFrameVariant(parseColorTheme('silver'))).toBe('navy-silver')
  })

  it('maps any pink to the pink-gold frame', () => {
    expect(paletteToFrameVariant(parseColorTheme('Hot Pink and Gold'))).toBe('pink-gold')
  })

  it('lets a pink-led theme beat its silver accent', () => {
    expect(paletteToFrameVariant(parseColorTheme('hot pink and silver'))).toBe('pink-gold')
  })

  it('maps burgundy to the burgundy-gold frame', () => {
    expect(paletteToFrameVariant(parseColorTheme('Burgundy and Gold'))).toBe('burgundy-gold')
  })

  it('maps red to the burgundy-gold frame', () => {
    expect(paletteToFrameVariant(parseColorTheme('red'))).toBe('burgundy-gold')
  })

  it('maps emerald to the emerald-gold frame', () => {
    expect(paletteToFrameVariant(parseColorTheme('Emerald Green'))).toBe('emerald-gold')
  })

  it('maps gold and black to the signature frame', () => {
    expect(paletteToFrameVariant(parseColorTheme('Gold and Black'))).toBe('gold-black')
  })

  it('falls back to gold-black for unrecognized input', () => {
    expect(paletteToFrameVariant(parseColorTheme('vibrant!!'))).toBe('gold-black')
  })

  it('falls back to gold-black for empty input', () => {
    expect(paletteToFrameVariant(parseColorTheme(''))).toBe('gold-black')
  })
})

describe('pickOverlayFrame', () => {
  const goldPalette = parseColorTheme('Gold and Black')

  it('lets a design-note keyword override the event type', () => {
    expect(pickOverlayFrame({ eventTypeKey: 'Wedding', designNotes: 'stars and galaxy everywhere', palette: goldPalette })).toBe('frame-starlight-navy.webp')
  })

  it('maps floral notes to the floral-blush frame', () => {
    expect(pickOverlayFrame({ eventTypeKey: 'Birthday Party', designNotes: 'She loves roses and garden vibes', palette: goldPalette })).toBe('frame-floral-blush.webp')
  })

  it('maps sophisticated notes to the luxe-gold frame', () => {
    expect(pickOverlayFrame({ eventTypeKey: 'Birthday Party', designNotes: 'Sophisticated and clean, nothing busy', palette: goldPalette })).toBe('frame-luxe-gold.webp')
  })

  it('maps playful notes to the confetti-pop frame', () => {
    expect(pickOverlayFrame({ eventTypeKey: 'Wedding', designNotes: 'colorful and playful please', palette: goldPalette })).toBe('frame-confetti-pop.webp')
  })

  it('resolves a balloons note to the balloon family in the palette color', () => {
    expect(pickOverlayFrame({ eventTypeKey: 'Corporate Event', designNotes: 'lots of balloons', palette: parseColorTheme('Navy and Silver') })).toBe('frame-navy-silver.webp')
  })

  it('maps a wedding with no notes to the floral-blush frame', () => {
    expect(pickOverlayFrame({ eventTypeKey: 'Wedding', designNotes: '', palette: goldPalette })).toBe('frame-floral-blush.webp')
  })

  it('maps a baby shower with no notes to the floral-blush frame', () => {
    expect(pickOverlayFrame({ eventTypeKey: 'Baby Shower & Gender Reveal', designNotes: '', palette: goldPalette })).toBe('frame-floral-blush.webp')
  })

  it('maps a corporate event with no notes to the luxe-gold frame', () => {
    expect(pickOverlayFrame({ eventTypeKey: 'Corporate Event', designNotes: '', palette: goldPalette })).toBe('frame-luxe-gold.webp')
  })

  it('maps a graduation with no notes to the luxe-gold frame', () => {
    expect(pickOverlayFrame({ eventTypeKey: 'Graduation', designNotes: '', palette: goldPalette })).toBe('frame-luxe-gold.webp')
  })

  it('maps a kids birthday with no notes to the confetti-pop frame', () => {
    expect(pickOverlayFrame({ eventTypeKey: 'Kids Birthday', designNotes: '', palette: goldPalette })).toBe('frame-confetti-pop.webp')
  })

  it('falls back to the balloon family resolved by the palette variant', () => {
    expect(pickOverlayFrame({ eventTypeKey: 'Birthday Party', designNotes: '', palette: parseColorTheme('Rose Gold') })).toBe('frame-rose-gold.webp')
  })

  it('falls back to the signature balloon frame with no signals at all', () => {
    expect(pickOverlayFrame({ eventTypeKey: '', designNotes: '', palette: parseColorTheme('') })).toBe('frame-gold-black.webp')
  })
})

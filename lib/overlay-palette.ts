// Recognizes typed color themes ("Gold and Black") and maps them to the curated
// overlay palette used by the live booking preview. Hexes in this module are data
// (the designer's overlay color library tuned for a dark charcoal frame), not styling tokens.

export interface OverlayPalette {
  /** Always the type-bearing (lighter) color: drives the event-name text and photo ring */
  primary: string
  /** The accent: drives keylines, ornaments, bokeh tint, eyebrow */
  secondary: string
  /** Human description of what was recognized, e.g. 'Navy + Silver', for the aria-label */
  label: string
}

export type FrameVariant =
  | 'gold-black'
  | 'rose-gold'
  | 'navy-silver'
  | 'pink-gold'
  | 'burgundy-gold'
  | 'emerald-gold'

/** Non-balloon design archetypes; single-colorway frames sharing the balloon family's macro-geometry */
export type FrameArchetype = 'floral-blush' | 'starlight-navy' | 'luxe-gold' | 'confetti-pop'

export type OverlayFrameFile = `frame-${FrameVariant | FrameArchetype}.webp`

/** Silhouette fill / deepest venue shadow */
export const OVERLAY_INK = '#0B0805'
/** Event-name ink on the frame's satin ribbon: near-black warm, reads as engraving on gold */
export const OVERLAY_RIBBON_INK = '#241A0E'
/** Warm haze at the top of the venue plate gradient */
export const OVERLAY_HAZE = '#221A0F'
/** REC dot */
export const OVERLAY_REC_RED = '#E5484D'

const FALLBACK: OverlayPalette = { primary: '#E8B25C', secondary: '#C9913F', label: 'Signature Gold' }

const LIGHT_TINT_TARGET = '#F5EFE2'

// Below this WCAG relative luminance, event-name type sinks into the dark frame
const PRIMARY_LUMINANCE_FLOOR = 0.22
const PRIMARY_LIFT_AMOUNT = 0.45
const DERIVED_SECONDARY_TINT_AMOUNT = 0.55

// Matched before singles so "rose gold" never re-matches as "gold"
const COMPOUND_COLORS: ReadonlyArray<readonly [string, string]> = [
  ['rose gold', '#E8A98F'],
  ['hot pink', '#F0479C'],
  ['baby pink', '#F3B8CE'],
  ['baby blue', '#A8CBEA'],
  ['royal blue', '#4169C8'],
  ['navy blue', '#33507A'],
  ['sky blue', '#8FC3E8'],
  ['forest green', '#2F6B4F'],
  ['emerald green', '#2ECC87'],
  ['sage green', '#A8B89A'],
  ['burnt orange', '#C96A2E'],
  ['off white', '#F5EFE2'],
  ['jet black', '#3A342B'],
  ['tiffany blue', '#81D8D0'],
]

const SINGLE_COLORS: Readonly<Record<string, string>> = {
  gold: '#E8B25C',
  champagne: '#EDD9B4',
  silver: '#C9CDD4',
  black: '#3A342B',
  white: '#F5EFE2',
  ivory: '#F1E8D4',
  cream: '#F5EFE2',
  navy: '#33507A',
  blue: '#4A7BC4',
  teal: '#2E8B8B',
  turquoise: '#45C4C4',
  emerald: '#2ECC87',
  green: '#4E9B5E',
  sage: '#A8B89A',
  mint: '#A9E5C5',
  pink: '#F090B4',
  blush: '#EFC0C6',
  fuchsia: '#D9439E',
  magenta: '#D9439E',
  purple: '#9B6FC4',
  lavender: '#C3AEE0',
  lilac: '#C8A2D8',
  red: '#D64545',
  burgundy: '#8B2E3C',
  maroon: '#7E2A38',
  wine: '#7E2F45',
  orange: '#E8823C',
  peach: '#F5B58C',
  coral: '#F08070',
  copper: '#C97C4A',
  bronze: '#B08147',
  brown: '#8A6248',
  chocolate: '#6B4A34',
  yellow: '#E8C84A',
  mustard: '#C9A23C',
  grey: '#A8A8A8',
  gray: '#A8A8A8',
  charcoal: '#6B655A',
}

export function parseColorTheme(input: string): OverlayPalette {
  const normalized = input.toLowerCase().replace(/[^a-z]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!normalized) return { ...FALLBACK }

  const hits: Array<{ name: string; hex: string; index: number }> = []

  // Masking a matched compound with same-length spaces keeps indices stable and
  // prevents its words from re-matching as singles
  let masked = normalized
  for (const [term, hex] of COMPOUND_COLORS) {
    const pattern = new RegExp(`\\b${term}\\b`, 'g')
    let match: RegExpExecArray | null
    while ((match = pattern.exec(masked)) !== null) {
      hits.push({ name: term, hex, index: match.index })
      masked = masked.slice(0, match.index) + ' '.repeat(term.length) + masked.slice(match.index + term.length)
    }
  }

  for (const match of masked.matchAll(/[a-z]+/g)) {
    const hex = SINGLE_COLORS[match[0]]
    if (hex) hits.push({ name: match[0], hex, index: match.index })
  }

  hits.sort((a, b) => a.index - b.index)

  const distinct: Array<{ name: string; hex: string }> = []
  for (const hit of hits) {
    if (distinct.length === 2) break
    if (!distinct.some(d => d.hex === hit.hex)) distinct.push(hit)
  }
  if (distinct.length === 0) return { ...FALLBACK }

  const label = distinct.map(d => toTitleCase(d.name)).join(' + ')
  const colorA = distinct[0].hex
  const colorB = distinct.length === 2
    ? distinct[1].hex
    : lerpToward(colorA, LIGHT_TINT_TARGET, DERIVED_SECONDARY_TINT_AMOUNT)

  // Legibility guard: the lighter color always carries the type, and an
  // all-dark pairing ("navy and black") gets lifted so it never vanishes
  const isAInFront = relativeLuminance(colorA) >= relativeLuminance(colorB)
  let primary = isAInFront ? colorA : colorB
  const secondary = isAInFront ? colorB : colorA
  if (relativeLuminance(primary) < PRIMARY_LUMINANCE_FLOOR) {
    primary = lerpToward(primary, LIGHT_TINT_TARGET, PRIMARY_LIFT_AMOUNT)
  }

  return { primary, secondary, label }
}

// Ordered by specificity: "rose gold" must win before pink, and a pink-led theme
// ("hot pink and silver") should get the pink frame, not the navy-silver one
const FRAME_RULES: ReadonlyArray<readonly [RegExp, FrameVariant]> = [
  [/\brose gold\b/, 'rose-gold'],
  [/\b(?:pink|blush|fuchsia|magenta)\b/, 'pink-gold'],
  [/\b(?:red|burgundy|maroon|wine)\b/, 'burgundy-gold'],
  [/\b(?:green|emerald|sage|mint)\b/, 'emerald-gold'],
  [/\b(?:navy|silver)\b/, 'navy-silver'],
]

/** Picks the production frame artwork that matches the recognized color theme */
export function paletteToFrameVariant(palette: OverlayPalette): FrameVariant {
  const label = palette.label.toLowerCase()
  for (const [pattern, variant] of FRAME_RULES) {
    if (pattern.test(label)) return variant
  }
  return 'gold-black'
}

// Customer wording beats event type, and rules run in listed order, so a note
// mixing motifs ("classy, she loves roses") resolves to the first family listed
const DESIGN_NOTE_RULES: ReadonlyArray<readonly [RegExp, FrameArchetype | 'balloon-arch']> = [
  [/\b(?:flowers?|roses?|floral|garden)\b/, 'floral-blush'],
  [/\b(?:stars?|starlight|galaxy|elegant night)\b/, 'starlight-navy'],
  [/\b(?:minimal|minimalist|classy|corporate|clean|sophisticated)\b/, 'luxe-gold'],
  [/\b(?:kids?|fun|playful|colorful|colourful|rainbow)\b/, 'confetti-pop'],
  [/\bballoons?\b/, 'balloon-arch'],
]

const EVENT_TYPE_RULES: ReadonlyArray<readonly [RegExp, FrameArchetype]> = [
  [/wedding|anniversary|shower/, 'floral-blush'],
  [/corporate|graduation/, 'luxe-gold'],
  [/kid|child/, 'confetti-pop'],
]

export interface PickOverlayFrameInput {
  /** The booking's event type, canonical option or the customer's free-text "Other" description */
  eventTypeKey: string
  /** The customer's "describe your vision" notes */
  designNotes: string
  palette: OverlayPalette
}

/**
 * Chooses the production frame artwork for the live preview. Priority:
 * design-note keywords, then event type, then the balloon arch family
 * resolved to its color variant by the palette.
 */
export function pickOverlayFrame({ eventTypeKey, designNotes, palette }: PickOverlayFrameInput): OverlayFrameFile {
  const notes = designNotes.toLowerCase()
  for (const [pattern, frame] of DESIGN_NOTE_RULES) {
    if (pattern.test(notes)) {
      return frame === 'balloon-arch' ? toFrameFile(paletteToFrameVariant(palette)) : toFrameFile(frame)
    }
  }

  const eventType = eventTypeKey.toLowerCase()
  for (const [pattern, frame] of EVENT_TYPE_RULES) {
    if (pattern.test(eventType)) return toFrameFile(frame)
  }

  return toFrameFile(paletteToFrameVariant(palette))
}

function toFrameFile(name: FrameVariant | FrameArchetype): OverlayFrameFile {
  return `frame-${name}.webp`
}

function toTitleCase(name: string): string {
  return name.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
}

function lerpToward(hex: string, targetHex: string, amount: number): string {
  const from = hexToRgb(hex)
  const to = hexToRgb(targetHex)
  const mixed = from.map((c, i) => Math.round(c + (to[i] - c) * amount)) as [number, number, number]
  return rgbToHex(mixed)
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0').toUpperCase()).join('')
}

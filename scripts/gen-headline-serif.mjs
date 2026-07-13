// One-off generator for the hero headline's HAND-DRAWN letterforms.
//
// Reads Hershey Serif (roman + italic) — single-stroke (centerline) engraving
// serifs (OFL, A.V. Hershey / Windell H. Oskay). Because each glyph is a single
// pen-stroke rather than a filled outline, stroke-drawing the path grows ink
// along the pen's spine, so the line appears to be written by hand in an upright
// serif that matches the site's display register (no swirly script). Emits one
// path PER LETTER in reading order for the hero to draw one at a time.
//
// Run once from the repo root:  node scripts/gen-headline-serif.mjs
// It does not run at build or request time — the letterforms are fixed.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const FONT_SIZE = 100 // screen units per em; the SVG is unitless and scales via viewBox
const LINE_HEIGHT = 1.0 * FONT_SIZE
const PAD = 10 // viewBox breathing room so overshoots/stroke width never clip
const OUTPUT_PRECISION = 2

const CREAM = '#F3EAD9' // var(--color-text-light)
const GOLD = '#E8B25C' // var(--color-amber-light)

const FONTS = {
  regular: parseFont('fonts/HersheySerifMed.svg'),
  italic: parseFont('fonts/HersheySerifMedItalic.svg'),
}

function parseFont(rel) {
  const svg = readFileSync(resolve(__dirname, rel), 'utf8')
  const upm = Number(/units-per-em="([\d.]+)"/.exec(svg)[1])
  const defAdv = Number(/<font\b[^>]*horiz-adv-x="([\d.]+)"/.exec(svg)[1])
  const glyphs = new Map()
  for (const tag of svg.match(/<glyph\b[^>]*\/?>/g) ?? []) {
    const u = /unicode="([^"]*)"/.exec(tag)
    if (!u) continue
    const ch = decodeEntity(u[1])
    const adv = Number((/horiz-adv-x="([\d.]+)"/.exec(tag) ?? [])[1] ?? defAdv)
    const d = (/\sd="([^"]*)"/.exec(tag) ?? [])[1] ?? ''
    glyphs.set(ch, { adv, d })
  }
  return { upm, defAdv, glyphs, scale: FONT_SIZE / upm }
}

function decodeEntity(s) {
  if (s === '&amp;') return '&'
  if (s === '&lt;') return '<'
  if (s === '&gt;') return '>'
  if (s === '&quot;') return '"'
  if (s === '&apos;') return "'"
  return s
}

function num(n) {
  return Number(n.toFixed(OUTPUT_PRECISION)).toString()
}

// Transform a glyph's path (font units, y-up) into final screen coords:
//   sx = penX + scale * fx      sy = baseline - scale * fy
// Hershey fonts only use absolute M / L, so a light tokenizer covers it.
function placePath(d, penX, baseline, scale, bounds) {
  const X = (fx) => penX + scale * fx
  const Y = (fy) => baseline - scale * fy
  const track = (x, y) => {
    if (x < bounds.minX) bounds.minX = x
    if (x > bounds.maxX) bounds.maxX = x
    if (y < bounds.minY) bounds.minY = y
    if (y > bounds.maxY) bounds.maxY = y
  }
  const tokens = d.match(/[MLC]|-?[\d.]+/g) ?? []
  let out = ''
  let i = 0
  while (i < tokens.length) {
    const cmd = tokens[i++]
    if (cmd === 'M' || cmd === 'L') {
      const x = X(Number(tokens[i++])), y = Y(Number(tokens[i++]))
      track(x, y)
      out += `${cmd}${num(x)} ${num(y)}`
    } else if (cmd === 'C') {
      const x1 = X(Number(tokens[i++])), y1 = Y(Number(tokens[i++]))
      const x2 = X(Number(tokens[i++])), y2 = Y(Number(tokens[i++]))
      const x = X(Number(tokens[i++])), y = Y(Number(tokens[i++]))
      track(x1, y1); track(x2, y2); track(x, y)
      out += `C${num(x1)} ${num(y1)} ${num(x2)} ${num(y2)} ${num(x)} ${num(y)}`
    }
  }
  return out
}

function advanceOf(font, text) {
  let w = 0
  for (const ch of text) w += (font.glyphs.get(ch)?.adv ?? font.defAdv) * font.scale
  return w
}

// The headline, split into styled segments in reading order.
// Line 1: "Every angle" (roman, cream)
// Line 2: "of " (roman, cream) + "the moment." (italic, gold)
const LINES = [
  { baseline: 0, segments: [{ text: 'Every angle', font: 'regular', color: CREAM }] },
  {
    baseline: LINE_HEIGHT,
    segments: [
      { text: 'of ', font: 'regular', color: CREAM },
      { text: 'the moment.', font: 'italic', color: GOLD },
    ],
  },
]

const lineWidth = (line) => line.segments.reduce((w, s) => w + advanceOf(FONTS[s.font], s.text), 0)
const maxWidth = Math.max(...LINES.map(lineWidth))

const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
const letters = []
for (const line of LINES) {
  let penX = (maxWidth - lineWidth(line)) / 2
  for (const seg of line.segments) {
    const font = FONTS[seg.font]
    for (const ch of seg.text) {
      const g = font.glyphs.get(ch) ?? { adv: font.defAdv, d: '' }
      if (g.d) {
        const d = placePath(g.d, penX, line.baseline, font.scale, bounds)
        letters.push({ d, color: seg.color })
      }
      penX += g.adv * font.scale
    }
  }
}

const minX = round(bounds.minX - PAD)
const minY = round(bounds.minY - PAD)
const vbW = round(bounds.maxX + PAD - minX)
const vbH = round(bounds.maxY + PAD - minY)
const viewBox = `${minX} ${minY} ${vbW} ${vbH}`

function round(n) {
  return Math.round(n * 100) / 100
}

const banner = `// GENERATED FILE — do not edit by hand.
// Source: scripts/gen-headline-serif.mjs (Hershey Serif roman + italic, single-stroke, OFL).
// Each entry is one letter of "Every angle / of the moment." as a single pen-stroke
// path, in reading order, so the hero can draw them one at a time like handwriting.`

const ts = `${banner}

export type HeadlineLetter = {
  /** SVG path data for one glyph's single pen-stroke (centerline, not an outline). */
  d: string
  /** Stroke colour for the letter (literal hex — this is ink). */
  color: string
}

export const HEADLINE_VIEWBOX = '${viewBox}'
export const HEADLINE_WIDTH = ${vbW}
export const HEADLINE_HEIGHT = ${vbH}

export const HEADLINE_LETTERS: HeadlineLetter[] = ${JSON.stringify(letters, null, 2)}
`

const outPath = resolve(root, 'components/public/hero-headline-paths.ts')
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, ts)

console.log(`Wrote ${letters.length} letters to ${outPath}`)
console.log(`viewBox="${viewBox}"`)

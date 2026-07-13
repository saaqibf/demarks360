// One-off generator for the hero headline's HANDWRITTEN letterforms.
//
// Reads EMS Allure — a single-stroke (centerline) cursive SVG font derived from
// Allura (OFL, Sheldon B. Michaels / Windell H. Oskay). Because each glyph is a
// single pen-stroke rather than a filled outline, stroke-drawing the path grows
// ink along the pen's spine, exactly like a hand writing the letter. Emits one
// path PER LETTER in reading order for the hero to draw one at a time.
//
// Run once from the repo root:  node scripts/gen-headline-cursive.mjs
// It does not run at build or request time — the letterforms are fixed.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const FONT_SIZE = 100 // screen units per em; the SVG is unitless and scales via viewBox
const LINE_HEIGHT = 1.02 * FONT_SIZE // cursive wants a touch more air than the Didone did
const PAD = 10 // viewBox breathing room so overshoots/stroke width never clip
const OUTPUT_PRECISION = 2

const CREAM = '#F3EAD9' // var(--color-text-light)
const GOLD = '#E8B25C' // var(--color-amber-light)

const svg = readFileSync(resolve(__dirname, 'fonts/EMSAllure.svg'), 'utf8')

// --- Parse the SVG font -----------------------------------------------------
const upm = Number(/units-per-em="([\d.]+)"/.exec(svg)[1])
const scale = FONT_SIZE / upm

const glyphs = new Map() // char -> { adv, d }
for (const tag of svg.match(/<glyph\b[^>]*\/?>/g) ?? []) {
  const u = /unicode="([^"]*)"/.exec(tag)
  if (!u) continue
  const ch = decodeEntity(u[1])
  const adv = Number((/horiz-adv-x="([\d.]+)"/.exec(tag) ?? [])[1] ?? /<font\b[^>]*horiz-adv-x="([\d.]+)"/.exec(svg)[1])
  const d = (/\sd="([^"]*)"/.exec(tag) ?? [])[1] ?? ''
  glyphs.set(ch, { adv, d })
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
// EMS Allure only uses absolute M / L / C, so a light tokenizer covers it.
function placePath(d, penX, baseline, bounds) {
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

function advanceOf(text) {
  let w = 0
  for (const ch of text) w += (glyphs.get(ch)?.adv ?? glyphs.get(' ').adv) * scale
  return w
}

// The headline, split into styled segments in reading order.
// Line 1: "Every angle" (cream)
// Line 2: "of " (cream) + "the moment." (gold)
const LINES = [
  { baseline: 0, segments: [{ text: 'Every angle', color: CREAM }] },
  {
    baseline: LINE_HEIGHT,
    segments: [
      { text: 'of ', color: CREAM },
      { text: 'the moment.', color: GOLD },
    ],
  },
]

const lineWidth = (line) => line.segments.reduce((w, s) => w + advanceOf(s.text), 0)
const maxWidth = Math.max(...LINES.map(lineWidth))

const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
const letters = []
for (const line of LINES) {
  let penX = (maxWidth - lineWidth(line)) / 2
  for (const seg of line.segments) {
    for (const ch of seg.text) {
      const g = glyphs.get(ch) ?? glyphs.get(' ')
      if (g.d) {
        const d = placePath(g.d, penX, line.baseline, bounds)
        letters.push({ d, color: seg.color })
      }
      penX += g.adv * scale
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
// Source: scripts/gen-headline-cursive.mjs (EMS Allure, single-stroke cursive, OFL).
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

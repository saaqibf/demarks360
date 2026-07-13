// One-off generator for the hero headline's traced letterforms.
//
// Reads the static Bodoni Moda variable fonts (regular + italic), pins them to
// the display instance the hero renders at (wght 400, opsz 96 — the high-contrast
// Didone look at large sizes), and emits one SVG outline path PER LETTER in
// reading order. The output is written as a typed data module the hero-headline
// component renders inline and stroke-draws letter by letter.
//
// Run once from the repo root:  node scripts/gen-headline-svg.mjs
// It does not run at build or request time — the letterforms are fixed.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const FONT_SIZE = 100 // path units per em; the SVG is unitless and scales via viewBox
const LINE_HEIGHT = 0.98 * FONT_SIZE // matches .dm-hero h1 line-height
const PAD = 8 // viewBox breathing room so strokes/overshoots never clip
const OUTPUT_PRECISION = 2

const CREAM = '#F3EAD9' // var(--color-text-light)
const GOLD = '#E8B25C' // var(--color-amber-light)

// Static Bodoni Moda variable fonts, pulled from google/fonts (OFL). They live
// beside this script only so the generator can be re-run; nothing loads them at
// build or request time.
const RAW = {
  regular: readFileSync(resolve(__dirname, 'fonts/BodoniModa.ttf')),
  italic: readFileSync(resolve(__dirname, 'fonts/BodoniModa-Italic.ttf')),
}

// opentype.js 2.0 mutates a variable font's cached advances the first time getPaths
// runs on it, which corrupts every later measurement/draw on the same instance. So
// we parse a FRESH instance for every single operation — each parse is cheap and the
// script only runs by hand.
function freshFont(which) {
  const buf = RAW[which]
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
  font.variation.set({ wght: 400, opsz: 96 })
  return font
}

function advanceOf(which, text) {
  return freshFont(which).getAdvanceWidth(text, FONT_SIZE)
}

function glyphPathsOf(which, text, x, baseline) {
  return freshFont(which).getPaths(text, x, baseline, FONT_SIZE)
}

function num(n) {
  // Round to OUTPUT_PRECISION and drop any trailing zeros / point.
  return Number(n.toFixed(OUTPUT_PRECISION)).toString()
}

// opentype.js 2.0's Path.toPathData emits literal "NaN" for some offset coordinates
// (a serializer bug on float noise like 341.95000000000005), so we serialize the
// clean command objects ourselves.
function commandsToPathData(commands) {
  return commands
    .map((c) => {
      switch (c.type) {
        case 'M':
          return `M${num(c.x)} ${num(c.y)}`
        case 'L':
          return `L${num(c.x)} ${num(c.y)}`
        case 'C':
          return `C${num(c.x1)} ${num(c.y1)} ${num(c.x2)} ${num(c.y2)} ${num(c.x)} ${num(c.y)}`
        case 'Q':
          return `Q${num(c.x1)} ${num(c.y1)} ${num(c.x)} ${num(c.y)}`
        case 'Z':
          return 'Z'
        default:
          return ''
      }
    })
    .join('')
}

// The headline, split into styled segments in reading order.
// Line 1: "Every angle" (regular, cream)
// Line 2: "of " (regular, cream) + "the moment." (italic, gold)
const LINES = [
  {
    baseline: 0,
    segments: [{ text: 'Every angle', which: 'regular', italic: false, color: CREAM }],
  },
  {
    baseline: LINE_HEIGHT,
    segments: [
      { text: 'of ', which: 'regular', italic: false, color: CREAM },
      { text: 'the moment.', which: 'italic', italic: true, color: GOLD },
    ],
  },
]

function lineWidth(line) {
  return line.segments.reduce((w, s) => w + advanceOf(s.which, s.text), 0)
}

const maxWidth = Math.max(...LINES.map(lineWidth))

// Build every glyph path, centering each line horizontally within maxWidth.
const letters = []
for (const line of LINES) {
  let x = (maxWidth - lineWidth(line)) / 2
  for (const seg of line.segments) {
    // getPaths returns one Path per glyph, already positioned along the baseline;
    // spaces come back as empty command lists and are dropped from the output.
    const glyphPaths = glyphPathsOf(seg.which, seg.text, x, line.baseline)
    for (const p of glyphPaths) {
      if (p.commands.length === 0) continue
      letters.push({
        d: commandsToPathData(p.commands),
        color: seg.color,
        italic: seg.italic,
        box: p.getBoundingBox(),
      })
    }
    x += advanceOf(seg.which, seg.text)
  }
}

// Tight viewBox from the real ink bounds, plus padding for the stroke overshoot.
const minX = Math.min(...letters.map((l) => l.box.x1)) - PAD
const minY = Math.min(...letters.map((l) => l.box.y1)) - PAD
const maxX = Math.max(...letters.map((l) => l.box.x2)) + PAD
const maxY = Math.max(...letters.map((l) => l.box.y2)) + PAD
const vbW = round(maxX - minX)
const vbH = round(maxY - minY)
const viewBox = `${round(minX)} ${round(minY)} ${vbW} ${vbH}`

function round(n) {
  return Math.round(n * 100) / 100
}

const data = letters.map((l) => ({ d: l.d, color: l.color, italic: l.italic }))

const banner = `// GENERATED FILE — do not edit by hand.
// Source: scripts/gen-headline-svg.mjs (Bodoni Moda regular + italic, wght 400 / opsz 96).
// Each entry is one letter of "Every angle / of the moment." as an SVG outline path,
// in reading order, so the hero can stroke-draw them one at a time.`

const ts = `${banner}

export type HeadlineLetter = {
  /** SVG path data for a single glyph outline. */
  d: string
  /** Fill/stroke colour for the letter (literal hex — this is a graphic fill). */
  color: string
  /** True for the italic gold segment, so the component can class it. */
  italic: boolean
}

export const HEADLINE_VIEWBOX = '${viewBox}'
export const HEADLINE_WIDTH = ${vbW}
export const HEADLINE_HEIGHT = ${vbH}

export const HEADLINE_LETTERS: HeadlineLetter[] = ${JSON.stringify(data, null, 2)}
`

const outPath = resolve(root, 'components/public/hero-headline-paths.ts')
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, ts)

console.log(`Wrote ${letters.length} letters to ${outPath}`)
console.log(`viewBox="${viewBox}"`)

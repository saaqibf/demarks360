// Preview renderer: lays out "Every angle / of the moment." in a single-stroke
// SVG font and rasterises it on the dark hero background so we can compare font
// candidates for the hand-drawn hero headline. Not part of the build.
//
//   node scripts/preview-headline-font.mjs <regular.svg> [italic.svg] <out.svg>

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const [regRel, maybeItalic, maybeOut] = process.argv.slice(2)
const italRel = maybeOut ? maybeItalic : regRel
const outRel = maybeOut ?? maybeItalic

const FONT_SIZE = 100
const LINE_HEIGHT = 1.02 * FONT_SIZE
const PAD = 14
const CREAM = '#F3EAD9'
const GOLD = '#E8B25C'

function parseFont(rel) {
  const svg = readFileSync(resolve(__dirname, rel), 'utf8')
  const upm = Number(/units-per-em="([\d.]+)"/.exec(svg)[1])
  const defAdv = Number(/<font\b[^>]*horiz-adv-x="([\d.]+)"/.exec(svg)[1])
  const glyphs = new Map()
  for (const tag of svg.match(/<glyph\b[^>]*\/?>/g) ?? []) {
    const u = /unicode="([^"]*)"/.exec(tag)
    if (!u) continue
    const ch = decode(u[1])
    const adv = Number((/horiz-adv-x="([\d.]+)"/.exec(tag) ?? [])[1] ?? defAdv)
    const d = (/\sd="([^"]*)"/.exec(tag) ?? [])[1] ?? ''
    glyphs.set(ch, { adv, d })
  }
  return { upm, defAdv, glyphs, scale: FONT_SIZE / upm }
}
const decode = (s) =>
  ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" }[s] ?? s)
const num = (n) => Number(n.toFixed(2)).toString()

function placePath(d, penX, baseline, scale, b) {
  const X = (fx) => penX + scale * fx
  const Y = (fy) => baseline - scale * fy
  const track = (x, y) => {
    if (x < b.minX) b.minX = x
    if (x > b.maxX) b.maxX = x
    if (y < b.minY) b.minY = y
    if (y > b.maxY) b.maxY = y
  }
  const t = d.match(/[MLC]|-?[\d.]+/g) ?? []
  let out = '', i = 0
  while (i < t.length) {
    const cmd = t[i++]
    if (cmd === 'M' || cmd === 'L') {
      const x = X(+t[i++]), y = Y(+t[i++]); track(x, y); out += `${cmd}${num(x)} ${num(y)}`
    } else if (cmd === 'C') {
      const x1 = X(+t[i++]), y1 = Y(+t[i++]), x2 = X(+t[i++]), y2 = Y(+t[i++]), x = X(+t[i++]), y = Y(+t[i++])
      track(x1, y1); track(x2, y2); track(x, y)
      out += `C${num(x1)} ${num(y1)} ${num(x2)} ${num(y2)} ${num(x)} ${num(y)}`
    }
  }
  return out
}

const FONTS = { regular: parseFont(regRel), italic: parseFont(italRel) }
const advanceOf = (font, text) => {
  let w = 0
  for (const ch of text) w += (font.glyphs.get(ch)?.adv ?? font.defAdv) * font.scale
  return w
}
const LINES = [
  { baseline: 0, segments: [{ text: 'Every angle', font: 'regular', color: CREAM }] },
  { baseline: LINE_HEIGHT, segments: [
    { text: 'of ', font: 'regular', color: CREAM },
    { text: 'the moment.', font: 'italic', color: GOLD },
  ] },
]
const lineWidth = (line) => line.segments.reduce((w, s) => w + advanceOf(FONTS[s.font], s.text), 0)
const maxWidth = Math.max(...LINES.map(lineWidth))
const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
const letters = []
for (const line of LINES) {
  let penX = (maxWidth - lineWidth(line)) / 2
  for (const seg of line.segments) {
    const font = FONTS[seg.font]
    for (const ch of seg.text) {
      const g = font.glyphs.get(ch) ?? { adv: font.defAdv, d: '' }
      if (g.d) letters.push({ d: placePath(g.d, penX, line.baseline, font.scale, b), color: seg.color })
      penX += g.adv * font.scale
    }
  }
}
const minX = b.minX - PAD, minY = b.minY - PAD
const vbW = b.maxX + PAD - minX, vbH = b.maxY + PAD - minY
const W = 1600, H = Math.round(W * (vbH / vbW))
const paths = letters
  .map((l) => `<path d="${l.d}" fill="none" stroke="${l.color}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>`)
  .join('\n')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${num(minX)} ${num(minY)} ${num(vbW)} ${num(vbH)}">
<rect x="${num(minX)}" y="${num(minY)}" width="${num(vbW)}" height="${num(vbH)}" fill="#171009"/>
${paths}
</svg>`
writeFileSync(resolve(__dirname, outRel), svg)
console.log(`wrote ${outRel} (${letters.length} letters, ${W}x${H})`)

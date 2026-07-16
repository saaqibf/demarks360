// Builds ONE self-contained HTML page comparing single-stroke font candidates
// for the hand-drawn hero headline, rendered exactly as the browser will draw
// them. Not part of the build.  node scripts/build-font-compare.mjs <out.html>

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outRel = process.argv[2] ?? 'font-compare.html'

const FONT_SIZE = 100
const LINE_HEIGHT = 1.04 * FONT_SIZE
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
    if (x < b.minX) b.minX = x; if (x > b.maxX) b.maxX = x
    if (y < b.minY) b.minY = y; if (y > b.maxY) b.maxY = y
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

function renderSvg(regRel, italRel) {
  const FONTS = { regular: parseFont(regRel), italic: parseFont(italRel ?? regRel) }
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
  const paths = letters
    .map((l) => `<path d="${l.d}" fill="none" stroke="${l.color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join('')
  return `<svg viewBox="${num(minX)} ${num(minY)} ${num(vbW)} ${num(vbH)}" preserveAspectRatio="xMidYMid meet">${paths}</svg>`
}

const CANDIDATES = [
  ['1', 'Single-stroke serif (upright, editorial)', 'fonts/HersheySerifMed.svg', 'fonts/HersheySerifMedItalic.svg'],
  ['6', 'Upright handwriting (Nixish)', 'fonts/EMSNixish.svg', 'fonts/EMSNixishItalic.svg'],
  ['2', 'Decorous script (restrained, elegant)', 'fonts/EMSDecorousScript.svg', null],
  ['4', 'Society script', 'fonts/EMSSociety.svg', null],
  ['3', 'Invite script', 'fonts/EMSInvite.svg', null],
  ['5', 'Delight', 'fonts/EMSDelight.svg', null],
  ['7', 'Allure (the swirly one you saw before)', 'fonts/EMSAllure.svg', null],
]

const cards = CANDIDATES.map(([n, label, reg, ital]) => `
  <section class="card">
    <div class="tag"><span class="num">${n}</span> ${label}</div>
    <div class="stage">${renderSvg(reg, ital)}</div>
  </section>`).join('')

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Headline font options</title>
<style>
  :root { color-scheme: dark; }
  * { margin: 0; box-sizing: border-box; }
  body { background: #0c0805; font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 34px 40px 60px; }
  h1 { color: #E8B25C; font-weight: 600; font-size: 20px; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 6px; }
  p.sub { color: #b9a98f; font-size: 14px; margin-bottom: 30px; }
  .card { background: #171009; border: 1px solid #2a1e10; border-radius: 16px; padding: 20px 26px 26px; margin-bottom: 22px; }
  .tag { color: #d8c5a4; font-size: 15px; letter-spacing: .04em; margin-bottom: 12px; }
  .num { display: inline-flex; width: 26px; height: 26px; align-items: center; justify-content: center;
         background: #E8B25C; color: #1a1206; border-radius: 999px; font-weight: 700; margin-right: 10px; }
  .stage { height: 190px; display: flex; align-items: center; justify-content: center; }
  .stage svg { height: 100%; width: auto; max-width: 100%; }
</style></head>
<body>
  <h1>Hero headline &mdash; pick a font</h1>
  <p class="sub">Same words, same gold italic accent, drawn stroke by stroke (the write-on animation you liked). Tell me a number.</p>
  ${cards}
</body></html>`

writeFileSync(resolve(__dirname, '..', outRel), html)
console.log('wrote', outRel)

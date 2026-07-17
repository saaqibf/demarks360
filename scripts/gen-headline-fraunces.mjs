// One-off generator: the hero headline in the founder-picked pairing
// (Fraunces display roman + Instrument Serif italic accent), revealed as if
// written by hand.
//
// A pen-write can't be faked by stroking the outline (that reads as
// "outlining" or "filling"). Instead we keep the genuine letterform and
// reveal it along its own writing SPINE: for each glyph we rasterise the real
// fill, thin it to a 1px skeleton (Zhang-Suen), and trace that skeleton into an
// ordered centreline path. At runtime the hero clips a thick "pen" stroke to the
// true outline and sweeps it down the spine, so the real ink appears in the
// natural writing direction, letter by letter.
//
// Emits, per letter: { fill } the true glyph outline, { spine } the centreline
// the pen follows, { color }. Run once from the repo root:
//   node scripts/gen-headline-fraunces.mjs
//
// Fraunces-static.ttf is pre-instanced from the variable Fraunces.ttf because
// opentype.js can't shape these fonts (GSUB ccmp crash). Regenerate with:
//   uvx --from fonttools fonttools varLib.instancer scripts/fonts/Fraunces.ttf \
//     wght=600 opsz=144 SOFT=40 WONK=0 -o scripts/fonts/Fraunces-static.ttf

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const FONT_SIZE = 100
const LINE_HEIGHT = 1.0 * FONT_SIZE
const PAD = 12
const P = 2 // output precision
const RASTER = 3 // raster pixels per font unit (skeleton resolution)

const CREAM = '#F3EAD9'
const GOLD = '#E8B25C'

// Headline pairing (founder-picked): the roman words are the real Fraunces
// display cut (heavy, warm, never spindly); the gold accent "the moment." is
// Instrument Serif's tall editorial italic.
//
// Per-glyph access ONLY: both fonts carry a ccmp GSUB lookup that opentype.js
// cannot parse ("substitutionType 62 lookupType 6 substFormat 2 not
// supported"), and every string API (getPaths / getAdvanceWidth) runs the
// shaper over it. charToGlyph + glyph.getPath never touch GSUB.
const parseFont = (file) => {
  const buf = readFileSync(resolve(__dirname, `fonts/${file}`))
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
}
const FONTS = {
  regular: parseFont('Fraunces-static.ttf'),
  italic: parseFont('InstrumentSerif-Italic.ttf'),
}
const scaleOf = (font) => FONT_SIZE / font.unitsPerEm
const kernOf = (font, a, b) => {
  try { return font.getKerningValue(a, b) || 0 } catch { return 0 }
}
function advanceOf(which, text) {
  const font = FONTS[which]
  const s = scaleOf(font)
  const glyphs = [...text].map((ch) => font.charToGlyph(ch))
  let w = 0
  for (let i = 0; i < glyphs.length; i++) {
    w += (glyphs[i].advanceWidth || 0) * s
    if (i + 1 < glyphs.length) w += kernOf(font, glyphs[i], glyphs[i + 1]) * s
  }
  return w
}

const num = (n) => Number(n.toFixed(P)).toString()

function commandsToPathData(commands) {
  return commands
    .map((c) => {
      switch (c.type) {
        case 'M': return `M${num(c.x)} ${num(c.y)}`
        case 'L': return `L${num(c.x)} ${num(c.y)}`
        case 'C': return `C${num(c.x1)} ${num(c.y1)} ${num(c.x2)} ${num(c.y2)} ${num(c.x)} ${num(c.y)}`
        case 'Q': return `Q${num(c.x1)} ${num(c.y1)} ${num(c.x)} ${num(c.y)}`
        case 'Z': return 'Z'
        default: return ''
      }
    })
    .join('')
}

// --- Flatten a glyph's commands into closed polygons (device coords) ---------
function flatten(commands) {
  const polys = []
  let cur = []
  let x0 = 0, y0 = 0, sx = 0, sy = 0
  const STEPS = 18
  for (const c of commands) {
    if (c.type === 'M') { if (cur.length) polys.push(cur); cur = [{ x: c.x, y: c.y }]; x0 = sx = c.x; y0 = sy = c.y }
    else if (c.type === 'L') { cur.push({ x: c.x, y: c.y }); x0 = c.x; y0 = c.y }
    else if (c.type === 'C') {
      for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS, mt = 1 - t
        const x = mt*mt*mt*x0 + 3*mt*mt*t*c.x1 + 3*mt*t*t*c.x2 + t*t*t*c.x
        const y = mt*mt*mt*y0 + 3*mt*mt*t*c.y1 + 3*mt*t*t*c.y2 + t*t*t*c.y
        cur.push({ x, y })
      }
      x0 = c.x; y0 = c.y
    } else if (c.type === 'Q') {
      for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS, mt = 1 - t
        const x = mt*mt*x0 + 2*mt*t*c.x1 + t*t*c.x
        const y = mt*mt*y0 + 2*mt*t*c.y1 + t*t*c.y
        cur.push({ x, y })
      }
      x0 = c.x; y0 = c.y
    } else if (c.type === 'Z') { if (cur.length) { polys.push(cur); cur = [] } x0 = sx; y0 = sy }
  }
  if (cur.length) polys.push(cur)
  return polys
}

// --- Scanline rasterise (even-odd) into a binary grid -----------------------
function rasterize(polys) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of polys) for (const pt of p) {
    if (pt.x < minX) minX = pt.x; if (pt.x > maxX) maxX = pt.x
    if (pt.y < minY) minY = pt.y; if (pt.y > maxY) maxY = pt.y
  }
  const ox = minX - 1, oy = minY - 1
  const w = Math.ceil((maxX - minX) * RASTER) + 3
  const h = Math.ceil((maxY - minY) * RASTER) + 3
  const grid = new Uint8Array(w * h)
  // Edge list
  const edges = []
  for (const poly of polys) {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length]
      if (a.y !== b.y) edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
    }
  }
  for (let py = 0; py < h; py++) {
    const wy = oy + (py + 0.5) / RASTER
    const xs = []
    for (const e of edges) {
      const yA = e.y1, yB = e.y2
      if ((wy >= yA && wy < yB) || (wy >= yB && wy < yA)) {
        const t = (wy - yA) / (yB - yA)
        xs.push(e.x1 + t * (e.x2 - e.x1))
      }
    }
    xs.sort((a, b) => a - b)
    for (let k = 0; k + 1 < xs.length; k += 2) {
      let pxA = Math.round((xs[k] - ox) * RASTER)
      let pxB = Math.round((xs[k + 1] - ox) * RASTER)
      if (pxA < 0) pxA = 0
      if (pxB > w) pxB = w
      for (let px = pxA; px < pxB; px++) grid[py * w + px] = 1
    }
  }
  return { grid, w, h, ox, oy }
}

// --- Zhang-Suen thinning -----------------------------------------------------
function thin({ grid, w, h }) {
  const at = (g, x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : g[y * w + x])
  let changed = true
  const g = grid.slice()
  while (changed) {
    changed = false
    for (const step of [0, 1]) {
      const del = []
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        if (!g[y * w + x]) continue
        const p2 = at(g, x, y - 1), p3 = at(g, x + 1, y - 1), p4 = at(g, x + 1, y),
              p5 = at(g, x + 1, y + 1), p6 = at(g, x, y + 1), p7 = at(g, x - 1, y + 1),
              p8 = at(g, x - 1, y), p9 = at(g, x - 1, y - 1)
        const nb = [p2, p3, p4, p5, p6, p7, p8, p9]
        const B = nb.reduce((s, v) => s + v, 0)
        if (B < 2 || B > 6) continue
        let A = 0
        for (let i = 0; i < 8; i++) if (nb[i] === 0 && nb[(i + 1) % 8] === 1) A++
        if (A !== 1) continue
        if (step === 0) {
          if (p2 * p4 * p6 !== 0) continue
          if (p4 * p6 * p8 !== 0) continue
        } else {
          if (p2 * p4 * p8 !== 0) continue
          if (p2 * p6 * p8 !== 0) continue
        }
        del.push(y * w + x)
      }
      if (del.length) { changed = true; for (const idx of del) g[idx] = 0 }
    }
  }
  return g
}

// --- Trace skeleton pixels into ordered polylines ---------------------------
function trace(g, w, h) {
  const idx = (x, y) => y * w + x
  const nbrs = (x, y) => {
    const r = []
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue
      const nx = x + dx, ny = y + dy
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && g[idx(nx, ny)]) r.push([nx, ny])
    }
    return r
  }
  const visited = new Uint8Array(w * h)
  const pts = []
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (g[idx(x, y)]) pts.push([x, y])
  // Prefer starting walks at endpoints (degree 1), top-left first.
  const deg = new Map()
  for (const [x, y] of pts) deg.set(idx(x, y), nbrs(x, y).length)
  const starts = pts.filter(([x, y]) => deg.get(idx(x, y)) === 1)
    .sort((a, b) => a[1] - b[1] || a[0] - b[0])
  const polylines = []
  const walk = (sx, sy) => {
    const line = []
    let cx = sx, cy = sy
    while (true) {
      visited[idx(cx, cy)] = 1
      line.push([cx, cy])
      const next = nbrs(cx, cy).filter(([nx, ny]) => !visited[idx(nx, ny)])
      if (!next.length) break
      // prefer straight-ish continuation: pick neighbour with fewest onward branches
      next.sort((a, b) => nbrs(a[0], a[1]).length - nbrs(b[0], b[1]).length)
      ;[cx, cy] = next[0]
    }
    if (line.length > 1) polylines.push(line)
  }
  for (const [x, y] of starts) if (!visited[idx(x, y)]) walk(x, y)
  // loops with no endpoint (e.g. o): start anywhere remaining
  for (const [x, y] of pts) if (!visited[idx(x, y)]) walk(x, y)
  // Order strokes roughly in writing order (top-left of each stroke)
  polylines.sort((a, b) => a[0][1] - b[0][1] || a[0][0] - b[0][0])
  return polylines
}

// Douglas-Peucker simplify (pixel space)
function simplify(line, eps) {
  if (line.length < 3) return line
  const d2 = (p, a, b) => {
    const [px, py] = p, [ax, ay] = a, [bx, by] = b
    const dx = bx - ax, dy = by - ay
    const L = dx * dx + dy * dy || 1
    let t = ((px - ax) * dx + (py - ay) * dy) / L
    t = Math.max(0, Math.min(1, t))
    const cx = ax + t * dx, cy = ay + t * dy
    return (px - cx) ** 2 + (py - cy) ** 2
  }
  const rec = (s, e, out) => {
    let maxD = 0, idx = -1
    for (let i = s + 1; i < e; i++) {
      const dd = d2(line[i], line[s], line[e])
      if (dd > maxD) { maxD = dd; idx = i }
    }
    if (maxD > eps * eps && idx !== -1) { rec(s, idx, out); out.push(line[idx]); rec(idx, e, out) }
  }
  const out = [line[0]]
  rec(0, line.length - 1, [])
  const mids = []
  const rec2 = (s, e) => {
    let maxD = 0, idx = -1
    for (let i = s + 1; i < e; i++) { const dd = d2(line[i], line[s], line[e]); if (dd > maxD) { maxD = dd; idx = i } }
    if (maxD > eps * eps && idx !== -1) { rec2(s, idx); mids.push(idx); rec2(idx, e) }
  }
  rec2(0, line.length - 1)
  mids.sort((a, b) => a - b)
  const res = [line[0], ...mids.map((i) => line[i]), line[line.length - 1]]
  return res
}

function skeletonPath(polys, ox, oy) {
  const raster = rasterize(polys)
  const thinned = thin(raster)
  let lines = trace(thinned, raster.w, raster.h)
  // prune tiny spur strokes
  lines = lines.filter((l) => l.length >= 4)
  const toFont = ([px, py]) => [raster.ox + px / RASTER, raster.oy + py / RASTER]
  let d = ''
  for (let line of lines) {
    line = simplify(line, 2.2)
    if (line.length < 2) continue
    const [x0, y0] = toFont(line[0])
    d += `M${num(x0)} ${num(y0)}`
    for (let i = 1; i < line.length; i++) { const [x, y] = toFont(line[i]); d += `L${num(x)} ${num(y)}` }
  }
  return d
}

// --- Build the headline ------------------------------------------------------
const LINES = [
  { baseline: 0, segments: [{ text: 'Every angle', which: 'regular', color: CREAM }] },
  {
    baseline: LINE_HEIGHT,
    segments: [
      { text: 'of ', which: 'regular', color: CREAM },
      { text: 'the moment.', which: 'italic', color: GOLD },
    ],
  },
]
const lineWidth = (line) => line.segments.reduce((w, s) => w + advanceOf(s.which, s.text), 0)
const maxWidth = Math.max(...LINES.map(lineWidth))

const letters = []
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
for (const line of LINES) {
  let x = (maxWidth - lineWidth(line)) / 2
  for (const seg of line.segments) {
    const font = FONTS[seg.which]
    const s = scaleOf(font)
    const chars = [...seg.text]
    // Per-glyph so each letter's fill + spine align in the same coord space.
    for (let i = 0; i < chars.length; i++) {
      const glyph = font.charToGlyph(chars[i])
      const path = glyph.getPath(x, line.baseline, FONT_SIZE)
      const cmds = path.commands
      if (cmds.length) {
        const fill = commandsToPathData(cmds)
        const polys = flatten(cmds)
        const spine = skeletonPath(polys)
        letters.push({ fill, spine, color: seg.color })
        const b = path.getBoundingBox()
        if (b.x1 < minX) minX = b.x1; if (b.y1 < minY) minY = b.y1
        if (b.x2 > maxX) maxX = b.x2; if (b.y2 > maxY) maxY = b.y2
      }
      x += (glyph.advanceWidth || 0) * s
      if (i + 1 < chars.length) x += kernOf(font, glyph, font.charToGlyph(chars[i + 1])) * s
    }
  }
}

const round = (n) => Math.round(n * 100) / 100
const vbMinX = round(minX - PAD), vbMinY = round(minY - PAD)
const vbW = round(maxX + PAD - vbMinX), vbH = round(maxY + PAD - vbMinY)
const viewBox = `${vbMinX} ${vbMinY} ${vbW} ${vbH}`

const banner = `// GENERATED FILE — do not edit by hand.
// Source: scripts/gen-headline-fraunces.mjs (Fraunces display wght 600 / opsz 144 + Instrument Serif Italic accent).
// Per letter: the true glyph outline (fill) plus its centreline writing spine,
// so the hero can reveal the real font letter by letter as if written by hand.`

const ts = `${banner}

export type HeadlineLetter = {
  /** True glyph outline — the real letterform (used as clip + ink). */
  fill: string
  /** Centreline the pen follows while the fill is revealed along it. */
  spine: string
  /** Ink colour for the letter (literal hex). */
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

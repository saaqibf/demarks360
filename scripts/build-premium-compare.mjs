// Builds one comparison page rendering the hero headline in each candidate
// premium font, on the dark golden-hour hero, so the founder can pick. Not part
// of the build.  node scripts/build-premium-compare.mjs <candidates.json> <out.html>
//
// candidates.json: [{ id, name, note, family, googleHref?, localCss? }]
//   googleHref -> a <link> to fonts.googleapis.com (CSP-allowed)
//   localCss   -> raw @font-face CSS pointing at a same-origin woff2 (CSP-allowed)

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const [inRel, outRel] = process.argv.slice(2)
const cands = JSON.parse(readFileSync(resolve(inRel), 'utf8'))

const links = cands.filter((c) => c.googleHref).map((c) => `<link rel="stylesheet" href="${c.googleHref}">`).join('\n')
const faces = cands.filter((c) => c.localCss).map((c) => c.localCss).join('\n')

const cards = cands.map((c) => {
  const mainStyle = `font-family:${c.family};font-weight:${c.weight ?? 500}` +
    (c.varSettings ? `;font-variation-settings:${c.varSettings}` : '')
  const emStyle = `font-family:${c.emFamily ?? c.family};font-weight:${c.emWeight ?? c.weight ?? 500}` +
    (c.emVarSettings ? `;font-variation-settings:${c.emVarSettings}` : '')
  return `
  <section class="card">
    <div class="tag"><span class="num">${c.id}</span> ${c.name}<span class="note">${c.note ?? ''}</span></div>
    <h2 class="hl" style="${mainStyle}">Every angle<br>of <em style="${emStyle}">the moment.</em></h2>
  </section>`
}).join('')

void links; void faces
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Premium hero fonts</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Instrument+Serif:ital@0;1&display=swap">
<link rel="stylesheet" href="/_fp/fonts.css">
<style>
  :root { color-scheme: dark; }
  * { margin: 0; box-sizing: border-box; }
  body { background: #0c0805; font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 34px 44px 80px; }
  h1 { color: #E8B25C; font-weight: 600; font-size: 20px; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 6px; }
  p.sub { color: #b9a98f; font-size: 14px; margin-bottom: 30px; }
  .card { background: linear-gradient(160deg,#1b130a,#120c06); border: 1px solid #2a1e10; border-radius: 18px; padding: 22px 30px 30px; margin-bottom: 22px; }
  .tag { color: #d8c5a4; font-size: 15px; letter-spacing: .03em; margin-bottom: 6px; }
  .note { color: #8f7f66; margin-left: 12px; font-size: 13px; }
  .num { display: inline-flex; width: 26px; height: 26px; align-items: center; justify-content: center;
         background: #E8B25C; color: #1a1206; border-radius: 999px; font-weight: 700; margin-right: 10px; }
  .hl { color: #F3EAD9; font-weight: 500; font-size: clamp(2.6rem, 6vw, 5.2rem); line-height: 0.98; letter-spacing: -0.015em;
        text-shadow: 0 2px 14px rgba(12,8,3,.66); margin-top: 6px; }
  .hl em { font-style: italic; color: #E8B25C; }
</style></head>
<body>
  <h1>Hero headline &mdash; premium fonts</h1>
  <p class="sub">The real display faces used by top-tier sites, on your dark hero. Tell me a number. (Animation stays the write-on; this is just the typeface.)</p>
  ${cards}
</body></html>`

writeFileSync(resolve(outRel), html)
console.log('wrote', outRel, '-', cands.length, 'candidates')

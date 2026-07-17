// Downloads Fontshare woff2 files referenced in fetched CSS and rewrites the CSS
// to same-origin /_fp/ URLs (so the site CSP font-src 'self' serves them).
// One-off preview helper.  node scripts/localize-fontshare.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fpDir = resolve(__dirname, '..', 'public', '_fp')
const FONTS = ['gambetta', 'zodiak', 'general-sans', 'melodrama']

async function download(url, outPath) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(outPath, buf)
  return buf.length
}

let combined = ''
for (const f of FONTS) {
  let css = readFileSync(resolve(fpDir, `${f}.css`), 'utf8')
  // For each @font-face, keep only the woff2 src, localized. Fontshare blocks form differ,
  // so operate on all woff2 URLs and strip woff/ttf fallbacks.
  const woff2s = [...css.matchAll(/url\('(\/\/[^']+\.woff2)'\)/g)].map((m) => 'https:' + m[1])
  let n = 0
  for (const url of woff2s) {
    const local = `${f}-${n}.woff2`
    const size = await download(url, resolve(fpDir, local))
    // replace the whole src: ... ; line for this face's woff2 with a single local src
    css = css.replace(`url('${url.replace('https:', '')}') format("woff2")`, `url('/_fp/${local}') format('woff2')`)
    css = css.replace(`url('${url.replace('https:', '')}')`, `url('/_fp/${local}')`)
    console.log(`  ${f}[${n}] ${(size / 1024).toFixed(0)}kb`)
    n++
  }
  // Drop any remaining remote (woff/ttf) src fragments so nothing hits the blocked CDN.
  css = css.replace(/,\s*url\('\/\/cdn\.fontshare\.com[^']+'\)\s*format\("[^"]+"\)/g, '')
  combined += `/* ${f} */\n${css}\n`
}
writeFileSync(resolve(fpDir, 'fonts.css'), combined)
console.log('wrote public/_fp/fonts.css')

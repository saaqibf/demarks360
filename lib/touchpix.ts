// Touchpix integration: our booth software (Touchpix) captures every guest's
// 360 video and hosts them on a public DigitalOcean CDN behind a public gallery
// URL. Rather than re-upload anything, we read that public gallery and mirror
// the clips on our own branded page. Every filename encodes a sequence number
// and a microsecond capture timestamp, which is what lets a guest find their
// own clip instantly (newest-first + time filter) instead of scrolling 100+.

export interface TouchpixItem {
  seq: number
  /** ISO string of capture time, or null if the filename was not parseable */
  capturedAt: string | null
  videoUrl: string
  thumbnailUrl: string
}

export interface TouchpixGallery {
  eventName: string | null
  eventId: string | null
  /** YYYY-MM-DD of the event, derived from the clip capture times (most common day). */
  eventDate: string | null
  items: TouchpixItem[]
}

const MEDIA_RE =
  /https?:\/\/[a-z0-9.-]+\/buckets_[a-z0-9]+\/[a-z0-9-]+\/(\d+)\/([^"'\\\s]+?\.mp4)/gi

/** Derive the /thumbs/<name>.png poster URL from a Touchpix video URL. */
function thumbFromVideo(videoUrl: string): string {
  // .../<eventId>/<name>.mp4  ->  .../<eventId>/thumbs/<name>.png
  return videoUrl.replace(/\/([^/]+)\.mp4$/i, '/thumbs/$1.png')
}

/** Parse `<seq>-<YYYYMMDD>-<HHMMSS>.<micro>-slomo.mp4` into seq + Date. */
function parseFilename(file: string): { seq: number; capturedAt: string | null } {
  const seqMatch = file.match(/^(\d+)-/)
  const seq = seqMatch ? parseInt(seqMatch[1], 10) : 0

  const tsMatch = file.match(/-(\d{8})-(\d{2})(\d{2})(\d{2})(?:\.(\d+))?/)
  if (!tsMatch) return { seq, capturedAt: null }
  const [, ymd, hh, mm, ss, micro] = tsMatch
  const year = +ymd.slice(0, 4)
  const month = +ymd.slice(4, 6) - 1
  const day = +ymd.slice(6, 8)
  const ms = micro ? Math.floor(+`0.${micro}` * 1000) : 0
  // The filename time is the booth's wall clock. Encode it as UTC so it renders
  // identically regardless of the server timezone; the UI formats it as UTC.
  const d = new Date(Date.UTC(year, month, day, +hh, +mm, +ss, ms))
  return { seq, capturedAt: isNaN(d.getTime()) ? null : d.toISOString() }
}

function extractEventName(html: string): string | null {
  // Touchpix renders the gallery title into the RSC payload as escaped JSON, so
  // the quotes appear as \" in the HTML. Match with optional backslashes so it
  // works whether or not the payload is escaped. Title lives in header_message.
  const keys = ['header_message', 'event_name', 'eventName', 'galleryName']
  for (const key of keys) {
    const re = new RegExp(`${key}\\\\?"\\s*:\\s*\\\\?"([^"\\\\]{1,80})`, 'i')
    const m = html.match(re)
    if (m && m[1] && m[1].trim() && !m[1].startsWith('http')) return m[1].trim()
  }
  return null
}

/**
 * Parse a Touchpix public gallery. Accepts either the full share URL or already
 * fetched HTML (for testing). Returns a de-duplicated, chronologically-usable
 * item list. Throws if the URL cannot be fetched.
 */
export function parseTouchpixHtml(html: string): TouchpixGallery {
  const byUrl = new Map<string, TouchpixItem>()
  let eventId: string | null = null

  for (const m of html.matchAll(MEDIA_RE)) {
    const videoUrl = m[0]
    if (byUrl.has(videoUrl)) continue
    eventId = eventId ?? m[1]
    const file = m[2]
    const { seq, capturedAt } = parseFilename(file)
    byUrl.set(videoUrl, { seq, capturedAt, videoUrl, thumbnailUrl: thumbFromVideo(videoUrl) })
  }

  const items = [...byUrl.values()].sort((a, b) => {
    // newest first; fall back to sequence when timestamps are missing
    if (a.capturedAt && b.capturedAt) return b.capturedAt.localeCompare(a.capturedAt)
    return b.seq - a.seq
  })

  // Event date = the most common capture day (UTC, since times are wall-clock UTC)
  const dayCounts = new Map<string, number>()
  for (const it of items) {
    if (!it.capturedAt) continue
    const day = it.capturedAt.slice(0, 10)
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1)
  }
  const eventDate = [...dayCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return { eventName: extractEventName(html), eventId, eventDate, items }
}

export async function fetchTouchpixGallery(
  galleryUrl: string,
  opts?: { revalidate?: number },
): Promise<TouchpixGallery> {
  // Cap the wait: this runs during the admin booking page's server render, so a
  // slow or hung Touchpix CDN must not hang the whole page on the operator's phone.
  const res = await fetch(galleryUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Demarks360Gallery/1.0)' },
    next: { revalidate: opts?.revalidate ?? 300 },
    signal: AbortSignal.timeout(6000),
  })
  if (!res.ok) throw new Error(`Touchpix gallery fetch failed: ${res.status}`)
  const html = await res.text()
  return parseTouchpixHtml(html)
}

/** Basic shape check so the admin can validate a pasted URL before saving. */
export function isTouchpixGalleryUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return /phtbth-upload\.com$/i.test(u.hostname) || /touchpix/i.test(u.hostname)
  } catch {
    return false
  }
}

import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { resolveGalleryAccess } from '@/lib/gallery-access'
import { fetchTouchpixGallery, type TouchpixItem } from '@/lib/touchpix'
import { APP_URL } from '@/lib/app-url'
import { GalleryPlayer } from './gallery-player'
import { GalleryShare } from '@/components/public/gallery-share'
import { TouchpixGallery } from '@/components/public/touchpix-gallery'

// resolveGalleryAccess is a direct DB query (not fetch), so it isn't request-
// memoized on its own; cache() dedupes the generateMetadata + render lookups.
const getGalleryAccess = cache(resolveGalleryAccess)

interface Props {
  params: Promise<{ token: string }>
  searchParams: Promise<{ v?: string }>
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function muxThumb(playbackId: string): string {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1200&height=630&fit_mode=smartcrop&time=1`
}

// A curated handful spread evenly across the event (the clips are newest-first),
// so the branded page reads as a highlight reel, not a wall of every guest's clip.
function pickHighlights<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items
  const step = items.length / n
  return Array.from({ length: n }, (_, i) => items[Math.floor(i * step)])
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { token } = await params
  const { v } = await searchParams
  const result = await getGalleryAccess(token)
  if (result.status === 'not-found' || result.status === 'cancelled') {
    return { title: 'Gallery | Demarks 360' }
  }
  const b = result.booking
  let label = b.eventName?.trim() || b.eventType
  const url = `${APP_URL}/gallery/${token}`

  let image = `${APP_URL}/og-image.jpg`
  if (b.touchpixGalleryUrl) {
    try {
      const g = await fetchTouchpixGallery(b.touchpixGalleryUrl)
      if (g.eventName?.trim()) label = g.eventName.trim()
      const clip = v ? g.items.find(i => i.seq === Number(v)) : g.items[0]
      if (clip) image = clip.thumbnailUrl
    } catch { /* keep default */ }
  } else if (result.status === 'published' && result.items[0]) {
    image = muxThumb(result.items[0].muxPlaybackId)
  }

  const title = v ? `A 360 video from ${label} | Demarks 360` : `360 videos from ${label} | Demarks 360`
  const description = 'Cinematic 360 slow-motion video booth reels from a Calgary event. Want this at yours? Demarks 360.'

  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: 'Demarks 360', url, title, description, images: [{ url: image, width: 1200, height: 630, alt: `360 video booth reel from ${label}` }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export default async function GalleryPage({ params }: Props) {
  const { token } = await params
  const result = await getGalleryAccess(token)
  if (result.status === 'not-found' || result.status === 'cancelled') notFound()

  const b = result.booking
  const shareBase = `${APP_URL}/gallery/${token}`

  // Touchpix-backed events mirror the booth clips live; this is the primary path.
  // When connected, the event's real name + date come from Touchpix (the booth
  // is ground truth), not the booking record.
  let touchpixItems: TouchpixItem[] | null = null
  let touchpixName: string | null = null
  let touchpixDate: string | null = null
  let touchpixError = false
  if (b.touchpixGalleryUrl) {
    try {
      const tp = await fetchTouchpixGallery(b.touchpixGalleryUrl)
      touchpixItems = tp.items
      touchpixName = tp.eventName
      touchpixDate = tp.eventDate
    } catch {
      touchpixError = true
    }
  }

  const label = touchpixName?.trim() || b.eventName?.trim() || b.eventType
  const displayDate = touchpixDate ?? b.eventDate

  // Per-event curation set by the operator in the admin: hidden clips never show,
  // featured clips lead the gallery. Falls back to an even spread when unset.
  const hiddenSet = new Set(b.clipCuration?.hidden ?? [])
  const featuredUrls = b.clipCuration?.featured ?? []
  const totalCaptured = touchpixItems?.length ?? 0
  const visibleItems = touchpixItems ? touchpixItems.filter(it => !hiddenSet.has(it.videoUrl)) : null

  let shownItems: TouchpixItem[] | null = null
  if (visibleItems) {
    const featuredItems = featuredUrls
      .map(u => visibleItems.find(it => it.videoUrl === u))
      .filter((x): x is TouchpixItem => !!x)
    if (featuredItems.length > 0) {
      const featuredSet = new Set(featuredUrls)
      const rest = visibleItems.filter(it => !featuredSet.has(it.videoUrl))
      shownItems = [...featuredItems, ...pickHighlights(rest, Math.max(0, 9 - featuredItems.length))]
    } else {
      shownItems = pickHighlights(visibleItems, 9)
    }
  }

  const muxItems = result.status === 'published' ? result.items : []
  const hasTouchpix = !!shownItems && shownItems.length > 0
  const hasMux = muxItems.length > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ink)' }}>
      {/* Header */}
      <div style={{ background: 'var(--color-ink)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem clamp(1.25rem, 5vw, 3rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-text-light)', margin: 0 }}>
              DEMARKS <span style={{ color: 'var(--color-amber)' }}>360</span>
            </p>
          </Link>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.35)', margin: 0 }}>
            Event Gallery
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 3.5rem)' }}>
        {hasTouchpix ? (
          <TouchpixGallery
            items={shownItems!}
            eventLabel={label}
            eventDate={fmtDate(displayDate)}
            totalCount={totalCaptured}
            shareBase={shareBase}
            fullGalleryUrl={b.touchpixGalleryUrl}
          />
        ) : hasMux ? (
          <>
            <div style={{ marginBottom: '2.5rem' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber-light)', margin: '0 0 1rem' }}>{fmtDate(displayDate)} · Calgary</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 400, color: 'var(--color-sand)', lineHeight: 1, margin: '0 0 1rem' }}>{label}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-muted-light)', margin: 0 }}>{muxItems.length} video{muxItems.length !== 1 ? 's' : ''}, captured by Demarks 360.</p>
                <GalleryShare url={shareBase} title={`Demarks 360 · ${label}`} text={`Watch the 360 videos from this ${b.eventType.toLowerCase()} 🎬`} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
              {muxItems.map((item, i) => (
                <GalleryPlayer key={item.id} playbackId={item.muxPlaybackId} index={i + 1} title={item.title} />
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 2rem 3rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid rgba(201,145,63,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '1.5rem' }}>🎬</div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-amber)', marginBottom: '0.75rem' }}>
              {touchpixError ? 'Loading soon' : 'Coming Soon'}
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--color-text-light)', marginBottom: '1rem' }}>
              {label}&apos;s videos<br />are being prepared
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(245,240,234,0.45)', fontWeight: 300, lineHeight: 1.75, maxWidth: '400px', margin: '0 auto' }}>
              The 360 recordings are being processed. Everyone at the event will be able to watch and share them here, usually the same day.
            </p>
          </div>
        )}

        {/* Conversion band */}
        <section className="gallery-cta" style={{ marginTop: '3.5rem' }}>
          <div className="gallery-cta-copy">
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-amber)', margin: '0 0 0.9rem' }}>Your turn</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 4vw, 2.9rem)', fontWeight: 400, color: 'var(--color-text-light)', lineHeight: 1.05, margin: '0 0 1rem', maxWidth: '18ch' }}>
              Everyone remembers the booth. Put it at <em style={{ fontStyle: 'italic', color: 'var(--color-amber-light)' }}>your</em> event.
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-muted-light)', fontWeight: 300, lineHeight: 1.7, margin: '0 0 1.75rem', maxWidth: '42ch' }}>
              Demarks 360 is Calgary&apos;s 360 slow-motion video booth. Unlimited takes, a same-day gallery like this one, and a night your guests keep sharing for weeks.
            </p>
            <div className="gallery-cta-actions">
              <Link href={`/book?ref=${token}`} className="btn-primary">Check your date</Link>
              <Link href="/gallery" className="gallery-share-chip">See more Calgary events →</Link>
            </div>
          </div>
          {hasTouchpix && (
            <div className="gallery-cta-fan" aria-hidden="true">
              {shownItems!.slice(0, 3).map((it, i) => (
                <img key={it.videoUrl} src={it.thumbnailUrl} alt="" loading="lazy" className="gallery-cta-card" style={{ ['--k' as string]: i - 1 }} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

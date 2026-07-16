'use client'
import { useEffect, useRef, useState } from 'react'

export interface ClipItem {
  seq: number
  capturedAt: string | null
  videoUrl: string
  thumbnailUrl: string
}

interface Props {
  items: ClipItem[]
  eventLabel: string
  eventDate: string // pre-formatted, e.g. "Saturday, July 11, 2026"
  totalCount: number
  shareBase: string
  fullGalleryUrl?: string | null
}

// Times are encoded as wall-clock UTC (see lib/touchpix), so format as UTC.
function fmtClock(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
}

export function TouchpixGallery({ items, eventLabel, eventDate, totalCount, shareBase, fullGalleryUrl }: Props) {
  const [active, setActive] = useState<ClipItem | null>(null)
  const [galleryCopied, setGalleryCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const featured = items[0]
  const rest = items.slice(1)

  async function shareGallery() {
    const text = `360 videos from ${eventLabel} 🎬 · Demarks 360`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: 'Demarks 360', text, url: shareBase }); return } catch { /* fall through */ }
    }
    try { await navigator.clipboard.writeText(shareBase); setGalleryCopied(true); setTimeout(() => setGalleryCopied(false), 2000) } catch { /* noop */ }
  }

  // Open a deep-linked clip (?v=<seq>)
  useEffect(() => {
    const seq = Number(new URLSearchParams(window.location.search).get('v'))
    if (seq) {
      const found = items.find(i => i.seq === seq)
      if (found) setActive(found)
    }
  }, [items])

  // Staggered scroll-reveal for the mosaic tiles.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.querySelectorAll('.tpx-reveal').forEach(el => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }),
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    root.querySelectorAll('.tpx-reveal').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [items])

  if (!featured) return null

  return (
    <div ref={rootRef}>
      {/* Hero: the event title paired with a clip that plays the spin on load */}
      <section className="tpx-hero">
        <div className="tpx-hero-copy tpx-reveal">
          <p className="tpx-kicker">{eventDate} · Calgary</p>
          <h1 className="tpx-title">{eventLabel}</h1>
          <p className="tpx-lead">
            {totalCount} moments, captured in a single spin. A few favourites from the night are below,
            each one delivered the same day.
          </p>
          <div className="tpx-hero-actions">
            <button className="btn-primary" onClick={() => setActive(featured)}>Watch the reel</button>
            <button className="gallery-share-chip" onClick={shareGallery}>{galleryCopied ? 'Link copied ✓' : 'Share gallery'}</button>
          </div>
          <p className="tpx-signoff">Captured by <span>Demarks&nbsp;360</span> · Calgary</p>
        </div>

        <button className="tpx-featured tpx-reveal" onClick={() => setActive(featured)} aria-label="Play the featured clip">
          <video
            src={featured.videoUrl}
            poster={featured.thumbnailUrl}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            className="tpx-featured-media"
          />
          <span className="tpx-featured-glow" aria-hidden="true" />
          <span className="tpx-featured-tag">Now playing</span>
          <span className="tpx-featured-expand" aria-hidden="true">Tap to watch full ↗</span>
        </button>
      </section>

      {/* The mosaic of the rest */}
      {rest.length > 0 && (
        <section className="tpx-mosaic-wrap">
          <div className="tpx-mosaic-head tpx-reveal">
            <h2 className="tpx-mosaic-title">More from the night</h2>
            {fullGalleryUrl && (
              <a href={fullGalleryUrl} target="_blank" rel="noopener noreferrer" className="tpx-seeall">
                Find your own clip <span aria-hidden="true">→</span>
              </a>
            )}
          </div>

          <div className="tpx-mosaic">
            {rest.map((item, i) => (
              <button
                key={item.videoUrl}
                className="tpx-tile tpx-reveal"
                style={{ ['--i' as string]: i % 6 }}
                onClick={() => setActive(item)}
                aria-label={`Play clip from ${fmtClock(item.capturedAt)}`}
              >
                <img src={item.thumbnailUrl} alt="" loading="lazy" decoding="async" className="tpx-tile-media" />
                <span className="tpx-tile-veil" aria-hidden="true" />
                <span className="tpx-tile-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </span>
                {item.capturedAt && <span className="tpx-tile-time">{fmtClock(item.capturedAt)}</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {active && <ClipModal item={active} shareBase={shareBase} eventLabel={eventLabel} onClose={() => setActive(null)} />}
    </div>
  )
}

function ClipModal({ item, shareBase, eventLabel, onClose }: { item: ClipItem; shareBase: string; eventLabel: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const deepLink = `${shareBase}?v=${item.seq}`
  const shareText = `My 360 video from ${eventLabel} 🎬 · Demarks 360`
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  // Move focus into the dialog on open, lock the page scroll, and restore focus
  // to whatever opened it on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      previouslyFocused?.focus?.()
    }
  }, [])

  // Escape closes; Tab / Shift+Tab cycle within the dialog so focus cannot reach
  // the page underneath while the overlay is modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const inner = innerRef.current
      if (!inner) return
      const focusables = inner.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function share() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: 'Demarks 360', text: shareText, url: deepLink }); return } catch { /* fall through */ }
    }
    try { await navigator.clipboard.writeText(deepLink); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* noop */ }
  }

  return (
    <div className="clip-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="clip-modal-inner" ref={innerRef} onClick={e => e.stopPropagation()}>
        <button ref={closeButtonRef} className="clip-modal-close" onClick={onClose} aria-label="Close">✕</button>
        <video src={item.videoUrl} poster={item.thumbnailUrl} controls autoPlay playsInline className="clip-modal-video" />
        <div className="clip-modal-actions">
          <a href={`/api/clip-download?url=${encodeURIComponent(item.videoUrl)}`} download className="btn-primary btn--sm">Download my video</a>
          <button onClick={share} className="gallery-share-chip">{copied ? 'Link copied ✓' : 'Share'}</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + deepLink)}`} target="_blank" rel="noopener noreferrer" className="gallery-share-chip">WhatsApp</a>
        </div>
      </div>
    </div>
  )
}

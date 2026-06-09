import { getPublicShowcaseItems } from '@/lib/db/queries/gallery'
import { Reveal } from './reveal'
import { ShowcasePlayer } from './showcase-player'

const GRID_SIZE = 4

export async function GalleryShowcase() {
  let showcaseItems: Awaited<ReturnType<typeof getPublicShowcaseItems>> = []
  try {
    showcaseItems = await getPublicShowcaseItems()
  } catch {
    // DB unavailable — render empty slots
  }
  const slots = Array.from({ length: GRID_SIZE }, (_, i) => showcaseItems[i] ?? null)

  return (
    <section id="gallery" style={{
      background: 'var(--color-charcoal)',
      borderBottom: '1px solid rgba(237,232,223,0.06)',
    }}>
      {/* Header */}
      <div style={{ padding: '6rem 3rem 3rem' }}>
        <Reveal>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap',
            paddingBottom: '3rem',
            borderBottom: '1px solid rgba(237,232,223,0.08)',
          }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.6rem',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(237,232,223,0.28)',
                marginBottom: '1.25rem',
              }}>
                Gallery
              </p>
              <h2 style={{
                fontFamily: 'var(--font-wordmark)',
                fontSize: 'clamp(4rem, 8vw, 6.5rem)',
                fontWeight: 400,
                lineHeight: 0.9,
                color: 'var(--color-sand)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                From Our{' '}
                <span style={{ color: 'var(--color-amber)' }}>Events</span>
              </h2>
            </div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.82rem',
              color: 'rgba(237,232,223,0.35)',
              lineHeight: 1.7,
              maxWidth: '280px',
            }}>
              Every take, captured and delivered. Your gallery link is ready before the night ends.
            </p>
          </div>
        </Reveal>
      </div>

      {/* 2+2 offset grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0',
        padding: '0 3rem 3rem',
      }}>
        {/* Left column — two tall items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[slots[0], slots[1]].map((item, i) => (
            <Reveal key={item?.id ?? i} delay={i * 55}>
              <div className="gallery-cell" style={{
                aspectRatio: '4/3',
                background: i === 0 ? 'var(--color-charcoal-2)' : 'var(--color-charcoal-3)',
                position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderBottom: '1px solid rgba(237,232,223,0.04)',
                borderRight: '1px solid rgba(237,232,223,0.04)',
              }}>
                {item ? (
                  <ShowcasePlayer playbackId={item.muxPlaybackId} title={item.title} />
                ) : (
                  <span aria-hidden="true" style={{
                    fontFamily: 'var(--font-wordmark)',
                    fontSize: '4rem',
                    fontWeight: 400,
                    opacity: 0.06,
                    color: 'var(--color-sand)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    360°
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Right column — two portrait items offset down */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginTop: '4rem' }}>
          {[slots[2], slots[3]].map((item, i) => (
            <Reveal key={item?.id ?? (i + 2)} delay={(i + 2) * 55}>
              <div className="gallery-cell" style={{
                aspectRatio: '4/3',
                background: i === 0 ? '#221E1A' : 'var(--color-charcoal-2)',
                position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderBottom: '1px solid rgba(237,232,223,0.04)',
              }}>
                {item ? (
                  <ShowcasePlayer playbackId={item.muxPlaybackId} title={item.title} />
                ) : (
                  <span aria-hidden="true" style={{
                    fontFamily: 'var(--font-wordmark)',
                    fontSize: '4rem',
                    fontWeight: 400,
                    opacity: 0.06,
                    color: 'var(--color-sand)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    360°
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 3rem 4rem' }}>
        <Reveal>
          <a href="/book" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#fff',
            background: 'var(--color-amber)',
            padding: '0.9rem 2.5rem',
            borderRadius: '3px',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'opacity 0.2s ease',
          }}>
            Book Your Experience
          </a>
        </Reveal>
      </div>
    </section>
  )
}

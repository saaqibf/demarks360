import { getPublicShowcaseItems } from '@/lib/db/queries/gallery'
import { Reveal } from './reveal'
import { ShowcasePlayer } from './showcase-player'

const GRID_SIZE = 6

export async function GalleryShowcase() {
  let showcaseItems: Awaited<ReturnType<typeof getPublicShowcaseItems>> = []
  try {
    showcaseItems = await getPublicShowcaseItems()
  } catch {
    // DB unavailable — render empty slots
  }
  const slots = Array.from({ length: GRID_SIZE }, (_, i) => showcaseItems[i] ?? null)

  return (
    <section id="gallery" style={{ background: 'var(--color-charcoal)', borderBottom: '1px solid rgba(237,232,223,0.06)' }}>
      {/* Header */}
      <div style={{ padding: '6rem 3rem 0' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap', paddingBottom: '3rem', borderBottom: '1px solid rgba(237,232,223,0.08)' }}>
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
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                fontWeight: 300,
                lineHeight: 1.0,
                color: 'var(--color-sand)',
                letterSpacing: '-0.025em',
              }}>
                From Our{' '}
                <em style={{ color: 'var(--color-amber)' }}>Events</em>
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

      {/* Grid */}
      <div className="gallery-grid" style={{ padding: '0 3rem 3rem' }}>
        {slots.map((item, i) => (
          <Reveal key={item?.id ?? i} delay={i * 55}>
            <div style={{
              aspectRatio: i === 0 ? '16/9' : '9/16',
              background: i % 3 === 0 ? 'var(--color-charcoal-2)' : i % 3 === 1 ? 'var(--color-charcoal-3)' : '#221E1A',
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gridColumn: i === 0 ? 'span 2' : undefined,
            }}>
              {item ? (
                <ShowcasePlayer playbackId={item.muxPlaybackId} title={item.title} />
              ) : (
                <span aria-hidden="true" style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '4rem',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  opacity: 0.06,
                  color: 'var(--color-sand)',
                  letterSpacing: '-0.02em',
                }}>
                  360°
                </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <div style={{ padding: '0 3rem 4rem' }}>
        <Reveal>
          <a href="/book" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-charcoal)',
            background: 'var(--color-sand)',
            padding: '0.9rem 2.5rem',
            borderRadius: '3px',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'background 0.2s ease',
          }}>
            Book Your Experience
          </a>
        </Reveal>
      </div>
    </section>
  )
}

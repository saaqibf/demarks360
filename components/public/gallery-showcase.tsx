import { getPublicShowcaseItems } from '@/lib/db/queries/gallery'
import { Reveal } from './reveal'
import { ShowcasePlayer } from './showcase-player'

const GRID_SIZE = 6

export async function GalleryShowcase() {
  let showcaseItems: Awaited<ReturnType<typeof getPublicShowcaseItems>> = []
  try {
    showcaseItems = await getPublicShowcaseItems()
  } catch {
    // DB unavailable in local dev — render empty slots
  }
  const slots = Array.from({ length: GRID_SIZE }, (_, i) => showcaseItems[i] ?? null)

  return (
    <section id="gallery" className="sec-pad" style={{ background: 'var(--color-charcoal)', borderBottom: '1px solid rgba(237,232,223,0.06)' }}>
      <Reveal>
        <p className="section-label section-label-light" style={{ marginBottom: '0.85rem' }}>Gallery</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          lineHeight: 1.0,
          color: 'var(--color-sand)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}>
          From Our
        </h2>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          fontStyle: 'italic',
          lineHeight: 1.0,
          color: 'var(--color-amber)',
          marginBottom: '0',
          letterSpacing: '-0.02em',
        }}>
          Events
        </p>
      </Reveal>

      <div className="gallery-grid">
        {slots.map((item, i) => (
          <Reveal key={item?.id ?? i} delay={i * 60}>
            <div style={{
              aspectRatio: '9/16',
              background: i % 2 === 0 ? 'var(--color-charcoal-2)' : 'var(--color-charcoal-3)',
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '12px',
            }}>
              {item ? (
                <ShowcasePlayer playbackId={item.muxPlaybackId} title={item.title} />
              ) : (
                <span aria-hidden="true" style={{
                  fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 400,
                  fontStyle: 'italic', opacity: 0.07, color: 'var(--color-sand)',
                  letterSpacing: '-0.02em',
                }}>
                  360°
                </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={100}>
        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'rgba(237,232,223,0.35)', fontWeight: 400 }}>
          Videos are added after each event — your gallery will be ready the same day.
        </p>
      </Reveal>
    </section>
  )
}

import { getPublicShowcaseItems } from '@/lib/db/queries/gallery'
import { Reveal } from './reveal'
import { ShowcasePlayer } from './showcase-player'

const GRID_SIZE = 4

export async function GalleryShowcase() {
  let showcaseItems: Awaited<ReturnType<typeof getPublicShowcaseItems>> = []
  try {
    showcaseItems = await getPublicShowcaseItems()
  } catch {
    // DB unavailable, render empty slots
  }
  const slots = Array.from({ length: GRID_SIZE }, (_, i) => showcaseItems[i] ?? null)

  return (
    <section id="gallery" className="sec-pad" style={{
      background: 'var(--color-charcoal)',
      borderBottom: '1px solid var(--color-border-dark)',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <Reveal>
          <div style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap',
            marginBottom: '3rem',
          }}>
            <div>
              <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '1.25rem' }}>
                Gallery
              </p>
              <h2 className="t-heading" style={{ color: 'var(--color-sand)', maxWidth: '13ch' }}>
                From <em>last weekend&apos;s</em> events.
              </h2>
            </div>
            <p className="t-body-dark" style={{
              color: 'var(--color-muted-light)',
              maxWidth: '34ch',
            }}>
              Every take, captured and delivered. Your gallery link is ready before the night ends.
            </p>
          </div>
        </Reveal>

        <div className="gallery-cinema-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          {slots.map((item, i) => (
            <Reveal key={item?.id ?? i} delay={i * 55}>
              <figure style={{
                margin: 0,
                transform: i % 2 === 1 ? 'translateY(2rem)' : undefined,
              }}>
                <div className="gallery-cell" style={{
                  aspectRatio: '3 / 4',
                  background: i % 2 === 0 ? 'var(--color-charcoal-2)' : 'var(--color-charcoal-3)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--color-border-dark)',
                  borderRadius: '6px',
                }}>
                  {item ? (
                    <ShowcasePlayer playbackId={item.muxPlaybackId} title={item.title} />
                  ) : (
                    <span aria-hidden="true" style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '4rem',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      opacity: 0.12,
                      color: 'var(--color-amber-light)',
                    }}>
                      360°
                    </span>
                  )}
                </div>
                <figcaption className="t-label" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  color: 'var(--color-muted-light)',
                  marginTop: '0.85rem',
                  letterSpacing: '0.18em',
                }}>
                  <span>{item?.title ?? 'Demarks reel'}</span>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <a href="/book" className="btn-primary" style={{ marginTop: '4rem' }}>
            Book your experience
          </a>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .gallery-cinema-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 560px) {
          .gallery-cinema-grid {
            grid-template-columns: 1fr !important;
          }
          .gallery-cinema-grid figure {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  )
}

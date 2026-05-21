import { getPublicShowcaseItems } from '@/lib/db/queries/gallery'
import { Reveal } from './reveal'
import { ShowcasePlayer } from './showcase-player'

const D = 'rgba(255,255,255,0.07)'

const GRID_SIZE = 6

export async function GalleryShowcase() {
  const showcaseItems = await getPublicShowcaseItems()
  const slots = Array.from({ length: GRID_SIZE }, (_, i) => showcaseItems[i] ?? null)

  return (
    <section id="gallery" className="sec-pad" style={{ background: 'var(--color-ink)', borderBottom: `1px solid ${D}` }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.75rem' }}>Gallery</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(3rem, 6vw, 6rem)',
          fontWeight: 700,
          fontStyle: 'italic',
          letterSpacing: '0.01em',
          lineHeight: 0.92,
          color: 'var(--color-text)',
          marginBottom: '3rem',
        }}>
          From Our<br />
          <em style={{ fontStyle: 'normal', color: 'var(--color-crimson)', fontFamily: 'var(--font-display)', fontSize: '0.85em', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Events
          </em>
        </h2>
      </Reveal>

      <div className="gallery-grid">
        {slots.map((item, i) => (
          <Reveal key={item?.id ?? i} delay={i * 60}>
            <div style={{
              aspectRatio: '9/16',
              background: i % 2 === 0 ? '#111111' : '#161616',
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item ? (
                <ShowcasePlayer playbackId={item.muxPlaybackId} title={item.title} />
              ) : (
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 900, opacity: 0.06, color: '#fff' }}>360</span>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={100}>
        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 300 }}>
          Videos are added after each event. Your gallery will be ready the same day.
        </p>
      </Reveal>
    </section>
  )
}

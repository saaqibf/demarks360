import { Reveal } from './reveal'

const reviews = [
  {
    name: 'Aisha M.',
    event: 'Birthday Party · Calgary',
    quote: 'The 360 booth was the highlight of my birthday. Everyone was absolutely obsessed. The video quality was incredible and we had our gallery link the same night.',
  },
  {
    name: 'Jordan & Kezia T.',
    event: 'Wedding Reception · Airdrie',
    quote: 'We added firecrackers and it was the most fun part of the whole reception. Worth every penny. Professional, punctual, and so easy to work with.',
  },
  {
    name: 'Priya S.',
    event: 'Corporate Event · Downtown Calgary',
    quote: 'Booked for our holiday party. Seamless booking, the team showed up early, and the videos looked amazing. Will book again without hesitation.',
  },
]

export function Testimonials() {
  const featured = reviews[0]
  const secondary = reviews.slice(1)

  return (
    <section className="sec-pad" style={{
      background: 'var(--color-charcoal-2)',
      borderBottom: '1px solid var(--color-border-dark)',
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <Reveal>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '0.9fr 1.1fr',
            gap: 'clamp(2rem, 6vw, 5rem)',
            alignItems: 'start',
          }} className="reviews-cinema">
            <div>
              <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '1.25rem' }}>
                Reviews
              </p>
              <h2 className="t-heading" style={{ color: 'var(--color-sand)', maxWidth: '13ch' }}>
                The part of the night <em>everyone remembers.</em>
              </h2>
            </div>

            <article style={{
              padding: '2.5rem',
              background: 'var(--color-charcoal-3)',
              border: '1px solid var(--color-border-dark)',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div aria-hidden="true" style={{
                position: 'absolute',
                top: '-1rem',
                right: '1rem',
                fontFamily: 'var(--font-display)',
                fontSize: '9rem',
                fontStyle: 'italic',
                lineHeight: 1,
                color: 'var(--color-amber)',
                opacity: 0.16,
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 0,
              }}>
                &ldquo;
              </div>
              <div style={{ display: 'flex', marginBottom: '1.5rem', color: 'var(--color-amber-light)', fontSize: '0.75rem', letterSpacing: '0.15em', position: 'relative', zIndex: 1 }} aria-label="5 star rating">
                ★★★★★
              </div>
              <blockquote style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 'clamp(1.45rem, 2.5vw, 2.2rem)',
                fontWeight: 400,
                lineHeight: 1.35,
                color: 'var(--color-sand)',
                margin: '0 0 2rem',
                position: 'relative',
                zIndex: 1,
              }}>
                &ldquo;{featured.quote}&rdquo;
              </blockquote>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--color-sand)', marginBottom: '0.45rem', position: 'relative', zIndex: 1 }}>
                {featured.name}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted-light)', position: 'relative', zIndex: 1 }}>
                {featured.event}
              </p>
            </article>
          </div>
        </Reveal>

        <div className="reviews-side-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '1rem',
          marginTop: '1rem',
          marginLeft: 'calc(45% + 0.5rem)',
        }}>
          {secondary.map((r, i) => (
            <Reveal key={r.name} delay={i * 80}>
              <article style={{
                height: '100%',
                padding: '1.75rem',
                background: 'var(--color-charcoal)',
                border: '1px solid var(--color-border-dark)',
                borderLeft: '2px solid var(--color-amber)',
                borderRadius: '8px',
              }}>
                <div style={{ display: 'flex', marginBottom: '1rem', color: 'var(--color-amber-light)', fontSize: '0.75rem', letterSpacing: '0.15em' }} aria-label="5 star rating">
                  ★★★★★
                </div>
                <p className="t-body-dark" style={{
                  color: 'var(--color-sand)',
                  fontStyle: 'italic',
                  marginBottom: '1.5rem',
                }}>
                  &ldquo;{r.quote}&rdquo;
                </p>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--color-sand)', marginBottom: '0.35rem' }}>
                  {r.name}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted-light)' }}>
                  {r.event}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .reviews-cinema,
          .reviews-side-grid {
            grid-template-columns: 1fr !important;
            margin-left: 0 !important;
          }
        }
      `}</style>
    </section>
  )
}

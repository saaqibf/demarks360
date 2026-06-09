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
    <section style={{
      background: 'var(--color-charcoal-2)',
      borderBottom: '1px solid rgba(237,232,223,0.06)',
    }}>
      {/* Large featured quote */}
      <div style={{
        padding: '6rem 3rem',
        borderBottom: '1px solid rgba(237,232,223,0.07)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Oversized amber quote mark */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          fontFamily: 'var(--font-wordmark)',
          fontSize: '14rem',
          fontWeight: 400,
          lineHeight: 1,
          color: 'var(--color-amber)',
          opacity: 0.12,
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-0.04em',
        }}>
          &ldquo;
        </div>

        <Reveal>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(237,232,223,0.28)',
              marginBottom: '3rem',
            }}>
              Reviews
            </p>

            {/* Stars */}
            <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '2.5rem' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: 'var(--color-amber)', fontSize: '1.1rem' }}>★</span>
              ))}
            </div>

            {/* Large quote */}
            <blockquote style={{
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: 'clamp(1.2rem, 2.5vw, 2rem)',
              fontWeight: 400,
              lineHeight: 1.65,
              color: 'rgba(237,232,223,0.85)',
              letterSpacing: '-0.01em',
              maxWidth: '760px',
              margin: '0 0 2.5rem',
            }}>
              &ldquo;{featured.quote}&rdquo;
            </blockquote>

            <div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--color-sand)',
              }}>
                {featured.name}
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                color: 'rgba(237,232,223,0.35)',
                fontWeight: 400,
                marginTop: '0.2rem',
              }}>
                {featured.event}
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Secondary reviews */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderBottom: '1px solid rgba(237,232,223,0.07)',
      }}>
        {secondary.map((r, i) => (
          <Reveal key={r.name} delay={i * 80}>
            <div style={{
              padding: '3rem',
              borderRight: i === 0 ? '1px solid rgba(237,232,223,0.07)' : 'none',
            }}>
              <div style={{ display: 'flex', gap: '0.15rem', marginBottom: '1.5rem' }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} style={{ color: 'var(--color-amber)', fontSize: '0.9rem' }}>★</span>
                ))}
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontStyle: 'italic',
                fontSize: '1rem',
                fontWeight: 400,
                lineHeight: 1.75,
                color: 'rgba(237,232,223,0.7)',
                marginBottom: '1.5rem',
              }}>
                &ldquo;{r.quote}&rdquo;
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--color-sand)',
              }}>
                {r.name}
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.72rem',
                color: 'rgba(237,232,223,0.28)',
                fontWeight: 400,
                marginTop: '0.2rem',
              }}>
                {r.event}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

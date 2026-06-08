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
    <section style={{ background: 'var(--color-sand-3)', borderBottom: '1px solid var(--color-border-light)' }}>
      {/* Large featured quote */}
      <div style={{ padding: '6rem 3rem', borderBottom: '1px solid var(--color-border-light)' }}>
        <Reveal>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-muted-light)',
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
            fontSize: 'clamp(1.2rem, 2.5vw, 2rem)',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'var(--color-charcoal)',
            letterSpacing: '-0.01em',
            maxWidth: '760px',
            margin: '0 0 2.5rem',
          }}>
            &ldquo;{featured.quote}&rdquo;
          </blockquote>

          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
              {featured.name}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 400, marginTop: '0.2rem' }}>
              {featured.event}
            </p>
          </div>
        </Reveal>
      </div>

      {/* Secondary reviews */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--color-border-light)' }}>
        {secondary.map((r, i) => (
          <Reveal key={r.name} delay={i * 80}>
            <div style={{
              padding: '3rem',
              borderRight: i === 0 ? '1px solid var(--color-border-light)' : 'none',
            }}>
              <div style={{ display: 'flex', gap: '0.15rem', marginBottom: '1.5rem' }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} style={{ color: 'var(--color-amber)', fontSize: '0.9rem' }}>★</span>
                ))}
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: 400,
                lineHeight: 1.75,
                color: 'var(--color-charcoal)',
                marginBottom: '1.5rem',
              }}>
                &ldquo;{r.quote}&rdquo;
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                {r.name}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-muted)', fontWeight: 400, marginTop: '0.2rem' }}>
                {r.event}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .testi-secondary { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

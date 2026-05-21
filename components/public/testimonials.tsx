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

function StarRow({ size = '1rem' }: { size?: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.2rem' }} aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true" style={{ color: 'var(--color-amber)', fontSize: size }}>★</span>
      ))}
    </div>
  )
}

export function Testimonials() {
  const featured = reviews[0]
  const rest = reviews.slice(1)

  return (
    <section className="sec-pad" style={{ background: 'var(--color-charcoal)', borderBottom: '1px solid rgba(237,232,223,0.06)' }}>
      <Reveal>
        <p className="section-label section-label-light" style={{ marginBottom: '0.85rem' }}>Reviews</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          lineHeight: 1.0,
          color: 'var(--color-sand)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}>
          Heard From
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
          Our Clients
        </p>
      </Reveal>

      {/* Aggregate rating row */}
      <Reveal delay={80}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          margin: '2.75rem 0 4rem',
          flexWrap: 'wrap',
        }}>
          <StarRow size="1.5rem" />
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.75rem',
            fontWeight: 400,
            color: 'var(--color-sand)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            5.0
          </span>
          <div style={{ height: '28px', width: '1px', background: 'rgba(237,232,223,0.15)', flexShrink: 0 }} />
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'rgba(237,232,223,0.4)',
            letterSpacing: '0.04em',
            lineHeight: 1.55,
          }}>
            Google Rating<br />50+ Calgary events
          </p>
        </div>
      </Reveal>

      {/* Asymmetric layout: featured quote left, two compact quotes right */}
      <div className="testi-asymmetric">

        {/* Featured quote */}
        <Reveal>
          <div>
            <span aria-hidden="true" style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '5rem',
              lineHeight: 0.55,
              color: 'var(--color-amber)',
              opacity: 0.18,
              display: 'block',
              marginBottom: '1.1rem',
              userSelect: 'none',
            }}>&ldquo;</span>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.1rem, 2vw, 1.45rem)',
              fontWeight: 400,
              color: 'var(--color-sand)',
              lineHeight: 1.65,
              letterSpacing: '-0.01em',
              maxWidth: '52ch',
            }}>
              {featured.quote}
            </p>
            <div style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(237,232,223,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--color-sand)',
                }}>{featured.name}</p>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(237,232,223,0.32)',
                  marginTop: '0.25rem',
                  fontWeight: 500,
                }}>{featured.event}</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Two compact quotes stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {rest.map((r, i) => (
            <Reveal key={r.name} delay={(i + 1) * 100}>
              <div>
                <StarRow size="0.9rem" />
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  fontWeight: 400,
                  color: 'rgba(237,232,223,0.65)',
                  lineHeight: 1.75,
                  marginTop: '0.85rem',
                  marginBottom: '1.1rem',
                }}>
                  &ldquo;{r.quote}&rdquo;
                </p>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--color-sand)',
                }}>{r.name}</p>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.61rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(237,232,223,0.28)',
                  marginTop: '0.2rem',
                  fontWeight: 500,
                }}>{r.event}</p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}

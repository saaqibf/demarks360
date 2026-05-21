import { Reveal } from './reveal'

const events = [
  {
    type: 'Birthday',
    tag: 'Milestones & Celebrations',
    bg: 'linear-gradient(160deg, #1a0d1f 0%, #2d1040 50%, #0d0810 100%)',
  },
  {
    type: 'Wedding',
    tag: 'The Most Important Day',
    bg: 'linear-gradient(160deg, #0d1a14 0%, #1a3028 50%, #080d0a 100%)',
  },
  {
    type: 'Corporate',
    tag: 'Brand Moments & Team Events',
    bg: 'linear-gradient(160deg, #0a0f1a 0%, #111e36 50%, #080a10 100%)',
  },
  {
    type: 'Graduation',
    tag: 'Years of Work. One Moment.',
    bg: 'linear-gradient(160deg, #1a1205 0%, #2e1f08 50%, #0d0c08 100%)',
  },
]

export function EventTypes() {
  return (
    <section className="sec-pad sec-light" style={{ borderBottom: '1px solid rgba(28,25,23,0.08)' }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.75rem' }}>What We Do</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.8rem, 5vw, 5.5rem)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          lineHeight: 0.95,
          textTransform: 'uppercase',
          color: 'var(--color-ink-warm)',
        }}>
          The 360 Experience<br />
          <span style={{ color: 'var(--color-crimson)' }}>For Every Occasion</span>
        </h2>
      </Reveal>

      <div className="events-grid">
        {events.map((ev, i) => (
          <Reveal key={ev.type} delay={i * 80}>
            <a
              href="/book"
              style={{
                display: 'block',
                aspectRatio: '3/4',
                background: ev.bg,
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              className="card-hover"
            >
              {/* Crimson corner accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '3px',
                height: '40px',
                background: 'var(--color-crimson)',
              }} />

              {/* Event number */}
              <span style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.55rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.2)',
              }}>
                0{i + 1}
              </span>

              {/* Bottom gradient */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
              }} />

              {/* Text */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1.5rem',
              }}>
                <p style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.5rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--color-crimson)',
                  marginBottom: '0.4rem',
                }}>
                  {ev.tag}
                </p>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#fff',
                  lineHeight: 1,
                }}>
                  {ev.type}
                </p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <p style={{
          marginTop: '1.5rem',
          fontSize: '0.78rem',
          color: 'var(--color-muted-warm)',
          fontWeight: 300,
        }}>
          Not sure which fits? <a href="/book" style={{ color: 'var(--color-crimson)', textDecoration: 'none', fontWeight: 500 }}>Book a consultation →</a>
        </p>
      </Reveal>
    </section>
  )
}

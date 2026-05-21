import { Reveal } from './reveal'

const events = [
  { num: '01', type: 'Birthday', tag: 'Milestones & Celebrations', emoji: '🎉' },
  { num: '02', type: 'Wedding', tag: 'Your Most Important Day', emoji: '💍' },
  { num: '03', type: 'Corporate', tag: 'Brand Moments & Team Events', emoji: '🏢' },
  { num: '04', type: 'Graduation', tag: 'Years of Work. One Moment.', emoji: '🎓' },
]

export function EventTypes() {
  return (
    <section className="sec-pad" style={{ background: 'var(--color-sand)', borderBottom: '1px solid var(--color-border-light)' }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.85rem' }}>What We Do</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          lineHeight: 1.0,
          color: 'var(--color-charcoal)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}>
          The 360 Experience
        </h2>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          fontStyle: 'italic',
          lineHeight: 1.0,
          color: 'var(--color-amber)',
          marginBottom: '3.5rem',
          letterSpacing: '-0.02em',
        }}>
          For Every Occasion
        </p>
      </Reveal>

      <div className="events-grid">
        {events.map((ev, i) => (
          <Reveal key={ev.type} delay={i * 70}>
            <a
              href="/book"
              aria-label={`Book a 360 booth for your ${ev.type.toLowerCase()} event`}
              className="event-card"
              style={{
                display: 'block',
                textDecoration: 'none',
                aspectRatio: '3/4',
                position: 'relative',
                background: 'var(--color-charcoal)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              {/* Warm ambient gradient */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 50% 20%, rgba(168,117,48,0.08) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />

              {/* Bottom gradient */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
                background: 'linear-gradient(to top, rgba(26,23,20,0.96) 0%, rgba(26,23,20,0.5) 50%, transparent 100%)',
                pointerEvents: 'none',
              }} />

              {/* Faded watermark */}
              <div aria-hidden="true" style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -55%)',
                fontFamily: 'var(--font-serif)',
                fontSize: '6rem',
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'var(--color-sand)',
                opacity: 0.04,
                userSelect: 'none',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}>
                360°
              </div>

              {/* Step number */}
              <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.6rem', fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'rgba(237,232,223,0.25)',
                }}>
                  {ev.num}
                </span>
              </div>

              {/* Arrow chip */}
              <div style={{
                position: 'absolute', top: '1.1rem', right: '1.1rem',
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(237,232,223,0.1)',
                border: '1px solid rgba(237,232,223,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', color: 'rgba(237,232,223,0.55)',
                transition: 'background 0.25s ease',
              }}>
                →
              </div>

              {/* Bottom text */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 1.25rem 1.5rem' }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 500,
                  color: 'rgba(237,232,223,0.45)', marginBottom: '0.4rem', lineHeight: 1.4,
                  letterSpacing: '0.01em',
                }}>
                  {ev.tag}
                </p>
                <p style={{
                  fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
                  fontWeight: 400, color: 'var(--color-sand)', lineHeight: 1,
                  letterSpacing: '-0.01em',
                }}>
                  {ev.type}
                </p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>

      <Reveal delay={250}>
        <p style={{ marginTop: '1.75rem', fontSize: '0.82rem', color: 'var(--color-muted)', fontWeight: 400 }}>
          Not sure what fits your event?{' '}
          <a href="/book" style={{ color: 'var(--color-amber)', textDecoration: 'none', fontWeight: 600 }}>
            Book a consultation →
          </a>
        </p>
      </Reveal>
    </section>
  )
}

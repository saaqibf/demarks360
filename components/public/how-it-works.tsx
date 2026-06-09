import { Reveal } from './reveal'

const steps = [
  {
    num: '1',
    title: 'Book Online',
    desc: 'Pick your date, hours, and add-ons. Pay a 30% deposit to lock in your date. The remaining 70% is auto-charged 7 days before your event. No surprises.',
  },
  {
    num: '2',
    title: 'We Show Up',
    desc: 'Our team arrives early, sets up the 360° booth, and runs the whole experience for you. You focus on the party. We handle everything else.',
  },
  {
    num: '3',
    title: 'Keep the Memories',
    desc: 'Every take is captured and saved. Your shareable gallery link is ready the same day so you can download, share, and relive every moment. No login needed.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{
      background: 'var(--color-charcoal)',
      borderBottom: '1px solid rgba(237,232,223,0.06)',
    }}>

      {/* Header strip */}
      <div style={{
        padding: '6rem 3rem 4rem',
        borderBottom: '1px solid rgba(237,232,223,0.07)',
      }}>
        <Reveal>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap',
          }}>
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
                How It Works
              </p>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                fontWeight: 900,
                lineHeight: 0.92,
                color: 'var(--color-sand)',
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                marginBottom: 0,
              }}>
                Three steps.{' '}
                <span style={{ color: 'var(--color-amber)' }}>Zero stress.</span>
              </h2>
            </div>
            <a href="/book" style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#fff',
              background: 'var(--color-amber)',
              padding: '0.9rem 2.25rem',
              borderRadius: '3px',
              textDecoration: 'none',
              flexShrink: 0,
            }}>
              Book Your Experience
            </a>
          </div>
        </Reveal>
      </div>

      {/* Steps */}
      <div className="hiw-steps">
        {steps.map((step, i) => (
          <Reveal key={step.num} delay={i * 80}>
            <div style={{
              position: 'relative',
              padding: '3.5rem 3rem 3.5rem',
              borderRight: i < 2 ? '1px solid rgba(237,232,223,0.07)' : 'none',
              overflow: 'hidden',
              minHeight: '340px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}>
              {/* Oversized ghost step number */}
              <div aria-hidden="true" style={{
                position: 'absolute',
                top: '-1rem',
                left: '1.5rem',
                fontFamily: 'var(--font-wordmark)',
                fontSize: '16rem',
                fontWeight: 400,
                lineHeight: 1,
                color: 'var(--color-sand)',
                opacity: 0.03,
                userSelect: 'none',
                pointerEvents: 'none',
                letterSpacing: '-0.04em',
              }}>
                {step.num}
              </div>

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{
                  display: 'inline-block',
                  width: '24px',
                  height: '1px',
                  background: 'var(--color-amber)',
                  marginBottom: '1.5rem',
                }} />
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
                  fontWeight: 700,
                  lineHeight: 1.05,
                  color: 'var(--color-sand)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  color: 'rgba(237,232,223,0.45)',
                  lineHeight: 1.8,
                  fontWeight: 400,
                  maxWidth: '32ch',
                }}>
                  {step.desc}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div style={{
        padding: '1.75rem 3rem',
        borderTop: '1px solid rgba(237,232,223,0.07)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.78rem',
          color: 'rgba(237,232,223,0.25)',
          fontWeight: 400,
        }}>
          $150/hr · 1.5 hr minimum · Calgary &amp; surrounding area
        </p>
      </div>
    </section>
  )
}

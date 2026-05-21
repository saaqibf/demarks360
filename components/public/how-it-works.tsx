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
    <section id="how-it-works" className="sec-pad" style={{ background: 'var(--color-sand-2)', borderBottom: '1px solid var(--color-border-light)' }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.85rem' }}>How It Works</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          lineHeight: 1.0,
          color: 'var(--color-charcoal)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}>
          Three steps.
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
          Zero stress.
        </p>
      </Reveal>

      <div className="hiw-steps" style={{ marginTop: '4rem', border: '1px solid var(--color-border-light)', borderRadius: '16px', overflow: 'hidden' }}>
        {steps.map((step, i) => (
          <Reveal key={step.num} delay={i * 100}>
            <div
              className="hiw-step-card"
              style={{
                padding: '2.5rem 2rem',
                borderLeft: i > 0 ? '1px solid var(--color-border-light)' : 'none',
                background: 'var(--color-sand-3)',
                height: '100%',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '3.5rem',
                fontWeight: 400,
                fontStyle: 'italic',
                lineHeight: 1,
                color: 'var(--color-amber)',
                marginBottom: '1.5rem',
                opacity: 0.8,
              }}>
                {step.num}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.6rem',
                fontWeight: 400,
                lineHeight: 1.15,
                color: 'var(--color-charcoal)',
                marginBottom: '1rem',
                letterSpacing: '-0.01em',
              }}>
                {step.title}
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: 'var(--color-muted)',
                lineHeight: 1.75,
                fontWeight: 400,
              }}>
                {step.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={300}>
        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <a href="/book" className="btn-primary">
            Book Your Experience
          </a>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)', fontWeight: 400 }}>
            $150/hr · 1.5 hr minimum · Calgary &amp; area
          </span>
        </div>
      </Reveal>
    </section>
  )
}

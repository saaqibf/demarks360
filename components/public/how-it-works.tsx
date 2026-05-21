import { Reveal } from './reveal'

const steps = [
  {
    num: '01',
    title: 'Book Online',
    desc: 'Pick your date, hours, and add-ons. Pay 30% to lock in your date — the remaining 70% is auto-charged 7 days before your event. No surprises.',
  },
  {
    num: '02',
    title: 'We Set Up',
    desc: 'Our team arrives, sets up the 360° booth, and runs the whole experience from start to finish. You focus on the party — we handle everything else.',
  },
  {
    num: '03',
    title: 'Get Your Gallery',
    desc: 'Every take is captured. Your shareable gallery link is ready the same day — download, share, and relive every moment. No login required.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="sec-pad sec-light-2" style={{ borderBottom: '1px solid rgba(28,25,23,0.08)' }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.75rem' }}>Process</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(3rem, 6vw, 6rem)',
          fontWeight: 700,
          fontStyle: 'italic',
          letterSpacing: '0.01em',
          lineHeight: 0.92,
          color: 'var(--color-ink-warm)',
          marginBottom: '3.5rem',
        }}>
          Three Steps.<br />
          <em style={{ fontStyle: 'normal', color: 'var(--color-crimson)', fontFamily: 'var(--font-display)', fontSize: '0.85em', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Zero Stress.
          </em>
        </h2>
      </Reveal>

      <div>
        {steps.map((step, i) => (
          <Reveal key={step.num} delay={i * 100}>
            <div className="hiw-row-editorial">
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.75rem',
                fontWeight: 900,
                lineHeight: 1,
                color: 'var(--color-crimson)',
                letterSpacing: '-0.02em',
                paddingTop: '0.15rem',
              }}>
                {step.num}
              </div>

              <div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.6rem, 2.5vw, 2.25rem)',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  lineHeight: 1.05,
                  color: 'var(--color-ink-warm)',
                }}>
                  {step.title}
                </h3>
              </div>

              <div>
                <p style={{
                  fontSize: '0.88rem',
                  color: 'var(--color-muted-warm)',
                  lineHeight: 1.85,
                  fontWeight: 300,
                }}>
                  {step.desc}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
        <div style={{ borderTop: '1px solid rgba(28,25,23,0.08)' }} />
      </div>

      <Reveal delay={300}>
        <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <a href="/book" className="btn-primary" style={{ padding: '1rem 2.25rem', fontSize: '0.88rem' }}>
            Book Your Experience
          </a>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted-warm)', fontWeight: 300 }}>
            $150/hr · 1.5 hr minimum · Calgary &amp; area
          </span>
        </div>
      </Reveal>
    </section>
  )
}

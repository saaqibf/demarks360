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
    <section id="how-it-works" className="sec-pad sec-light" style={{ borderBottom: '1px solid rgba(28,25,23,0.08)' }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.75rem' }}>Process</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.8rem, 5vw, 5.5rem)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          lineHeight: 0.95,
          textTransform: 'uppercase',
          color: 'var(--color-ink-warm)',
        }}>
          How It Works
        </h2>
      </Reveal>

      <div className="hiw-light-grid">
        {steps.map((step, i) => (
          <Reveal key={step.num} delay={i * 100}>
            <div style={{ background: 'var(--color-cream)', padding: '3rem 2.5rem' }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '4.5rem',
                fontWeight: 900,
                lineHeight: 1,
                color: 'var(--color-crimson)',
                opacity: 0.12,
                marginBottom: '1.5rem',
                userSelect: 'none',
              }}>
                {step.num}
              </p>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                color: 'var(--color-ink-warm)',
                marginBottom: '0.85rem',
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: '0.88rem',
                color: 'var(--color-muted-warm)',
                lineHeight: 1.8,
                fontWeight: 300,
              }}>
                {step.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={300}>
        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
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

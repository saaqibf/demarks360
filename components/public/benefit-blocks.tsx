import { Reveal } from './reveal'

const benefits = [
  {
    number: '01',
    heading: 'Same-day gallery',
    body: 'Your guests leave with a shareable link, not a promise. Videos are delivered the same night your event ends.',
  },
  {
    number: '02',
    heading: 'Unlimited takes',
    body: 'No pressure, no limits. Everyone gets as many rounds as they want until the shots are perfect.',
  },
  {
    number: '03',
    heading: 'Setup fully included',
    body: 'Your attendant arrives early, handles every cable and backdrop, and stays until the last guest is done.',
  },
  {
    number: '04',
    heading: 'Firecrackers available',
    body: 'Add pyro-style sparks for maximum drama. The most talked-about moment at every event we attend.',
  },
]

export function BenefitBlocks() {
  return (
    <section style={{ background: 'var(--color-sand-2)', borderBottom: '1px solid var(--color-border-light)' }}>
      {/* Header */}
      <div style={{ padding: '6rem 3rem 5rem', borderBottom: '1px solid var(--color-border-light)' }}>
        <Reveal>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-muted-light)',
            marginBottom: '1.25rem',
          }}>
            Why Demarks 360
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            fontWeight: 300,
            lineHeight: 1.0,
            color: 'var(--color-charcoal)',
            letterSpacing: '-0.025em',
            maxWidth: '640px',
          }}>
            Worth every moment,{' '}
            <em style={{ color: 'var(--color-amber)' }}>every time.</em>
          </h2>
        </Reveal>
      </div>

      {/* 4-column benefit grid */}
      <div className="benefits-grid">
        {benefits.map((b, i) => (
          <Reveal key={b.number} delay={i * 70}>
            <div style={{
              padding: '3rem 3rem 3.5rem',
              borderRight: i < 3 ? '1px solid var(--color-border-light)' : 'none',
              height: '100%',
            }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '3.5rem',
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1,
                color: 'var(--color-amber)',
                opacity: 0.55,
                display: 'block',
                marginBottom: '2rem',
                letterSpacing: '-0.02em',
              }}>
                {b.number}
              </span>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.4rem, 2vw, 1.9rem)',
                fontWeight: 400,
                lineHeight: 1.15,
                color: 'var(--color-charcoal)',
                letterSpacing: '-0.01em',
                marginBottom: '1rem',
              }}>
                {b.heading}
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                color: 'var(--color-muted)',
                lineHeight: 1.75,
                fontWeight: 400,
              }}>
                {b.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

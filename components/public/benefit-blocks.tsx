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
    <section className="sec-pad" style={{ background: 'var(--color-sand-3)', borderBottom: '1px solid var(--color-border-light)' }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.85rem' }}>Why Demarks 360</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          lineHeight: 1.0,
          color: 'var(--color-charcoal)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}>
          Worth every
        </h2>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          fontStyle: 'italic',
          lineHeight: 1.0,
          color: 'var(--color-amber)',
          marginBottom: '4rem',
          letterSpacing: '-0.02em',
        }}>
          moment.
        </p>
      </Reveal>

      <div className="benefits-grid">
        {benefits.map((b, i) => (
          <Reveal key={b.number} delay={i * 80}>
            <div style={{
              padding: '2.5rem 2rem',
              background: 'var(--color-sand)',
              border: '1px solid var(--color-border-light)',
              borderRadius: '16px',
              height: '100%',
            }}>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '3rem',
                fontWeight: 400,
                fontStyle: 'italic',
                lineHeight: 1,
                color: 'var(--color-amber)',
                opacity: 0.5,
                marginBottom: '1.25rem',
              }}>
                {b.number}
              </p>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                fontWeight: 400,
                lineHeight: 1.15,
                color: 'var(--color-charcoal)',
                letterSpacing: '-0.01em',
                marginBottom: '0.85rem',
              }}>
                {b.heading}
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                color: 'var(--color-muted)',
                lineHeight: 1.75,
                maxWidth: '32ch',
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

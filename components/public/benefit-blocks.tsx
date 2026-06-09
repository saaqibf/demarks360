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
    <section style={{
      background: 'var(--color-sand)',
      borderBottom: '1px solid var(--color-border-light)',
    }}>
      {/* Header */}
      <div style={{
        padding: '6rem 3rem 5rem',
        borderBottom: '1px solid var(--color-border-light)',
      }}>
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
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            fontWeight: 900,
            lineHeight: 0.92,
            color: 'var(--color-charcoal)',
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            maxWidth: '640px',
          }}>
            Worth every moment,{' '}
            <span style={{ color: 'var(--color-amber)' }}>every time.</span>
          </h2>
        </Reveal>
      </div>

      {/* Alternating magazine rows */}
      {benefits.map((b, i) => (
        <Reveal key={b.number} delay={i * 60}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
            borderBottom: '1px solid var(--color-border-light)',
            minHeight: '220px',
          }}>
            {/* Number block — left on even, right on odd */}
            <div style={{
              order: i % 2 === 0 ? 0 : 1,
              background: i % 2 === 0 ? 'var(--color-charcoal)' : 'var(--color-sand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem',
              borderRight: i % 2 === 0 ? '1px solid var(--color-border-light)' : 'none',
              borderLeft: i % 2 === 1 ? '1px solid var(--color-border-light)' : 'none',
            }}>
              <span style={{
                fontFamily: 'var(--font-wordmark)',
                fontSize: 'clamp(4rem, 8vw, 8rem)',
                fontWeight: 400,
                lineHeight: 1,
                color: i % 2 === 0 ? 'var(--color-amber)' : 'var(--color-charcoal)',
                opacity: i % 2 === 0 ? 0.6 : 0.08,
                letterSpacing: '0.04em',
              }}>
                {b.number}
              </span>
            </div>

            {/* Text block */}
            <div style={{
              order: i % 2 === 0 ? 1 : 0,
              padding: '3.5rem 3rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 2.8vw, 2.8rem)',
                fontWeight: 900,
                lineHeight: 0.95,
                color: 'var(--color-charcoal)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}>
                {b.heading}
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                color: 'var(--color-muted)',
                lineHeight: 1.75,
                fontWeight: 400,
                maxWidth: '38ch',
              }}>
                {b.body}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </section>
  )
}

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
    <section className="sec-pad" style={{
      background: 'var(--color-sand)',
      borderBottom: '1px solid var(--color-border-light)',
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <Reveal>
          <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '1.25rem' }}>
            Why Demarks 360
          </p>
          <h2 className="t-heading" style={{
            color: 'var(--color-charcoal)',
            maxWidth: '13ch',
          }}>
            Details that make <em>the night easier.</em>
          </h2>
        </Reveal>

        <div className="benefit-cinema-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          marginTop: '3rem',
          borderTop: '1px solid var(--color-border-light)',
          borderLeft: '1px solid var(--color-border-light)',
        }}>
          {benefits.map((b, i) => (
            <Reveal key={b.number} delay={i * 60}>
              <article style={{
                minHeight: '100%',
                padding: '2rem',
                borderRight: '1px solid var(--color-border-light)',
                borderBottom: '1px solid var(--color-border-light)',
                background: i % 2 === 0 ? 'var(--color-sand)' : 'var(--color-sand-3)',
              }}>
                <span style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: '2rem',
                  lineHeight: 1,
                  color: 'var(--color-amber)',
                  marginBottom: '2.5rem',
                }}>
                  {b.number}
                </span>
                <h3 className="t-subheading" style={{
                  color: 'var(--color-charcoal)',
                  fontSize: 'clamp(1.5rem, 2.4vw, 2.2rem)',
                }}>
                  {b.heading}
                </h3>
                <p className="t-body" style={{
                  color: 'var(--color-muted)',
                  marginTop: '1rem',
                }}>
                  {b.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .benefit-cinema-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 560px) {
          .benefit-cinema-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}

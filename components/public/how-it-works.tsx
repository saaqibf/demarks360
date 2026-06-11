import { Reveal } from './reveal'

const steps = [
  {
    num: '1',
    title: 'Book online',
    desc: 'Pick your date, hours, and add-ons. Pay a 30% deposit to lock in your date. The remaining 70% is auto-charged 7 days before your event. No surprises.',
  },
  {
    num: '2',
    title: 'We show up',
    desc: 'Our team arrives early, sets up the 360° booth, and runs the whole experience for you. You focus on the party. We handle everything else.',
  },
  {
    num: '3',
    title: 'Keep the memories',
    desc: 'Every take is captured and saved. Your shareable gallery link is ready the same day so you can download, share, and relive every moment. No login needed.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="sec-pad" style={{
      background: 'var(--color-charcoal)',
      borderBottom: '1px solid var(--color-border-dark)',
    }}>
      <Reveal>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.9fr) minmax(280px, 1.1fr)',
          gap: 'clamp(2rem, 6vw, 5rem)',
          alignItems: 'start',
        }}>
          <div>
            <p className="t-label" style={{
              color: 'var(--color-amber)',
              marginBottom: '1.25rem',
            }}>
              How it works
            </p>
            <h2 className="t-heading" style={{
              color: 'var(--color-sand)',
              maxWidth: '12ch',
            }}>
              Your event, shot like a <em>film premiere.</em>
            </h2>
            <p className="t-body-dark" style={{
              color: 'var(--color-muted-light)',
              marginTop: '1.5rem',
            }}>
              Three simple steps, one polished guest experience from first spin to final download.
            </p>
            <a href="/book" className="btn-primary" style={{ marginTop: '2.25rem' }}>
              Book your experience
            </a>
          </div>

          <div style={{
            display: 'grid',
            gap: '1rem',
          }}>
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 80}>
                <article style={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: 'auto minmax(0, 1fr)',
                  gap: '1.25rem',
                  padding: '1.5rem 0 1.75rem',
                  borderBottom: i < steps.length - 1 ? '1px solid var(--color-border-dark)' : 'none',
                }}>
                  <span aria-hidden="true" style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: '2rem',
                    lineHeight: 1,
                    color: 'var(--color-amber-light)',
                  }}>
                    {step.num}
                  </span>
                  <div>
                    <h3 className="t-subheading" style={{
                      color: 'var(--color-sand)',
                      fontSize: 'clamp(1.55rem, 2.4vw, 2.25rem)',
                    }}>
                      {step.title}
                    </h3>
                    <p className="t-body-dark" style={{
                      color: 'var(--color-muted-light)',
                      marginTop: '0.8rem',
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      <div style={{
        maxWidth: '1240px',
        margin: '3rem auto 0',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--color-border-dark)',
      }}>
        <p className="t-label" style={{
          color: 'var(--color-muted-light)',
          letterSpacing: '0.24em',
        }}>
          $150/hr · 1.5 hr minimum · Calgary &amp; surrounding area
        </p>
      </div>

      <style>{`
        @media (max-width: 860px) {
          #how-it-works > div:first-child > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}

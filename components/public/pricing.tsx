import { Reveal } from './reveal'

const features = [
  '360° slow-motion video',
  'Unlimited takes',
  'Same-day gallery link',
  'Shareable & downloadable',
  'Professional attendant',
  '1.5 hr minimum',
]

const tiers = [
  { duration: '1.5 hrs', price: '$225', deposit: '$67.50' },
  { duration: '2 hrs',   price: '$300', deposit: '$90',    highlight: true },
  { duration: '3 hrs',   price: '$450', deposit: '$135' },
  { duration: '4+ hrs',  price: 'From $600', deposit: 'From $180' },
]

export function Pricing() {
  return (
    <section id="pricing" className="sec-pad" style={{
      background: 'var(--color-charcoal)',
      borderBottom: '1px solid var(--color-border-dark)',
    }}>
      <Reveal>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto 3rem',
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'space-between',
          gap: '2rem',
          flexWrap: 'wrap',
        }}>
          <div>
            <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '1.25rem' }}>
              Pricing
            </p>
            <h2 className="t-heading" style={{
              color: 'var(--color-sand)',
              maxWidth: '12ch',
            }}>
              Clear pricing. <em>Zero surprises.</em>
            </h2>
          </div>
          <p className="t-body-dark" style={{
            color: 'var(--color-muted-light)',
            maxWidth: '34ch',
          }}>
            $150/hr. Choose your duration below. All packages include everything listed.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem 1.5rem',
          padding: '1.25rem 0',
          borderTop: '1px solid var(--color-border-dark)',
          borderBottom: '1px solid var(--color-border-dark)',
        }}>
          <p className="t-label" style={{
            color: 'var(--color-muted-light)',
            marginRight: '0.5rem',
          }}>
            Every package includes
          </p>
          {features.map(f => (
            <span key={f} className="t-label" style={{
              color: 'var(--color-sand)',
              letterSpacing: '0.16em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span aria-hidden="true" style={{
                width: '4px',
                height: '4px',
                borderRadius: '999px',
                background: 'var(--color-amber)',
                display: 'inline-block',
              }} />
              {f}
            </span>
          ))}
        </div>
      </Reveal>

      <div className="pricing-table" style={{
        maxWidth: '1240px',
        margin: '0 auto',
        gap: '1rem',
      }}>
        {tiers.map((t, i) => (
          <Reveal key={t.duration} delay={i * 60}>
            <article style={{
              minHeight: '100%',
              padding: '2.25rem',
              border: t.highlight ? '1px solid var(--color-amber-light)' : '1px solid var(--color-border-dark)',
              borderRadius: '8px',
              background: t.highlight ? 'color-mix(in srgb, var(--color-charcoal-3) 86%, var(--color-amber) 14%)' : 'var(--color-charcoal-2)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {t.highlight && (
                <span className="t-label" style={{
                  position: 'absolute',
                  top: '-0.85rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'var(--color-charcoal)',
                  background: 'var(--color-amber-light)',
                  borderRadius: '999px',
                  padding: '0.45rem 1rem',
                  whiteSpace: 'nowrap',
                }}>
                  Most booked
                </span>
              )}
              <p className="t-label" style={{
                color: 'var(--color-muted-light)',
                marginBottom: '1.25rem',
              }}>
                {t.duration}
              </p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 'clamp(2.6rem, 5vw, 4rem)',
                fontWeight: 400,
                lineHeight: 1,
                color: 'var(--color-amber-light)',
                marginBottom: '0.6rem',
              }}>
                {t.price}
              </p>
              <p className="t-body-dark" style={{
                color: 'var(--color-muted-light)',
                marginBottom: '2rem',
              }}>
                {t.deposit} deposit today
              </p>
              <a href="/book" className={t.highlight ? 'btn-primary' : 'btn-secondary'} style={{
                marginTop: 'auto',
                textAlign: 'center',
                color: t.highlight ? undefined : 'var(--color-sand)',
                borderColor: t.highlight ? undefined : 'var(--color-border-dark)',
              }}>
                Book this
              </a>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div style={{
          maxWidth: '1240px',
          margin: '2rem auto 0',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border-dark)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <span aria-hidden="true" style={{
            width: '5px',
            height: '5px',
            borderRadius: '999px',
            background: 'var(--color-amber)',
            flexShrink: 0,
          }} />
          <span className="t-body-dark" style={{ color: 'var(--color-muted-light)' }}>
            Add firecrackers (handheld sparkler cannons) for <strong style={{ color: 'var(--color-sand)', fontWeight: 600 }}>$75</strong> flat.
          </span>
          <span className="t-body-dark" style={{ color: 'var(--color-muted-light)' }}>
            Travel fee ($50) applies outside Calgary city limits.
          </span>
        </div>
      </Reveal>
    </section>
  )
}

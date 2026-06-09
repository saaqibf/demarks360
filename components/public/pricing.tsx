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
    <section id="pricing" style={{ background: 'var(--color-charcoal)', borderBottom: '1px solid rgba(237,232,223,0.06)' }}>
      {/* Header */}
      <div style={{ padding: '6rem 3rem 5rem', borderBottom: '1px solid rgba(237,232,223,0.07)' }}>
        <Reveal>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(237,232,223,0.28)',
            marginBottom: '1.25rem',
          }}>
            Pricing
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 5rem)',
              fontWeight: 900,
              lineHeight: 0.92,
              color: 'var(--color-sand)',
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
            }}>
              Simple,{' '}
              <span style={{ color: 'var(--color-amber)' }}>transparent.</span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: 'rgba(237,232,223,0.38)',
              lineHeight: 1.7,
              maxWidth: '280px',
            }}>
              $150/hr. Choose your duration below. All packages include everything listed.
            </p>
          </div>
        </Reveal>
      </div>

      {/* What's included — feature list */}
      <div style={{ padding: '3rem 3rem 0', borderBottom: '1px solid rgba(237,232,223,0.07)' }}>
        <Reveal>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.58rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(237,232,223,0.28)',
            marginBottom: '1.5rem',
          }}>
            Every Package Includes
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem 2rem', paddingBottom: '3rem' }}>
            {features.map(f => (
              <span key={f} style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                color: 'rgba(237,232,223,0.55)',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-amber)', flexShrink: 0 }} />
                {f}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Tier grid */}
      <div className="pricing-table">
        {tiers.map((t, i) => (
          <Reveal key={t.duration} delay={i * 60}>
            <div style={{
              padding: '2.5rem 2.5rem 3rem',
              borderRight: i < 3 ? '1px solid rgba(237,232,223,0.07)' : 'none',
              background: t.highlight ? 'rgba(212,133,106,0.06)' : 'transparent',
              position: 'relative',
              borderTop: t.highlight ? '2px solid var(--color-amber)' : '2px solid transparent',
            }}>
              {t.highlight && (
                <span style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--color-amber)',
                }}>
                  Popular
                </span>
              )}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(237,232,223,0.35)',
                marginBottom: '1.25rem',
              }}>
                {t.duration}
              </p>
              <p style={{
                fontFamily: 'var(--font-wordmark)',
                fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                fontWeight: 400,
                lineHeight: 1,
                color: t.highlight ? 'var(--color-amber)' : 'var(--color-sand)',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}>
                {t.price}
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.72rem',
                color: 'rgba(237,232,223,0.28)',
                fontWeight: 400,
                marginBottom: '2rem',
              }}>
                {t.deposit} deposit today
              </p>
              <a href="/book" style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: t.highlight ? 'var(--color-charcoal)' : 'var(--color-sand)',
                background: t.highlight ? 'var(--color-sand)' : 'transparent',
                border: t.highlight ? 'none' : '1.5px solid rgba(237,232,223,0.25)',
                padding: '0.75rem 1.75rem',
                borderRadius: '3px',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'background 0.2s ease',
              }}>
                Book This
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Add-on row */}
      <Reveal>
        <div style={{
          padding: '2rem 3rem',
          borderTop: '1px solid rgba(237,232,223,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <span style={{
            display: 'inline-block',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'var(--color-amber)',
            flexShrink: 0,
          }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(237,232,223,0.45)', fontWeight: 400 }}>
            Add firecrackers (handheld sparkler cannons) for <strong style={{ color: 'rgba(237,232,223,0.65)', fontWeight: 600 }}>$75</strong> flat.
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(237,232,223,0.25)', fontWeight: 400 }}>
            Travel fee ($50) applies outside Calgary city limits.
          </span>
        </div>
      </Reveal>
    </section>
  )
}

import { Reveal } from './reveal'

const features = [
  '360° slow-motion video',
  'Unlimited takes',
  'Same-day gallery link',
  'Shareable & downloadable',
  'Professional attendant',
  '1.5 hr minimum',
]

export function Pricing() {
  return (
    <section id="pricing" className="sec-pad" style={{ background: 'var(--color-sand)', borderBottom: '1px solid var(--color-border-light)' }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.85rem' }}>Pricing</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          lineHeight: 1.0,
          color: 'var(--color-charcoal)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}>
          Simple,
        </h2>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          fontStyle: 'italic',
          lineHeight: 1.0,
          color: 'var(--color-amber)',
          marginBottom: '3.5rem',
          letterSpacing: '-0.02em',
        }}>
          Transparent Pricing
        </p>
      </Reveal>

      {/* Main pricing card */}
      <Reveal delay={100}>
        <div className="pricing-card" style={{ border: '1px solid var(--color-border-light)', background: 'var(--color-sand-3)' }}>
          {/* Left */}
          <div className="pricing-card-left" style={{
            padding: '2.5rem',
            borderRight: '1px solid var(--color-border-light)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.58rem', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--color-muted)', marginBottom: '0.75rem',
              }}>
                Standard Package
              </p>
              <p style={{
                fontFamily: 'var(--font-serif)', fontSize: '2.25rem', fontWeight: 400,
                lineHeight: 1.05, color: 'var(--color-charcoal)', letterSpacing: '-0.02em',
              }}>
                360<br />
                <em style={{ fontStyle: 'italic', color: 'var(--color-amber)' }}>Booth</em>
              </p>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 400, marginTop: '1rem' }}>
              1.5 hr minimum · no maximum
            </p>
          </div>

          {/* Middle */}
          <div className="pricing-card-mid" style={{
            padding: '2.5rem',
            borderRight: '1px solid var(--color-border-light)',
            display: 'flex', alignItems: 'center',
          }}>
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem 2rem', width: '100%' }}>
              {features.map((feat) => (
                <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--color-text)', lineHeight: 1.4, fontWeight: 500 }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    flexShrink: 0, background: 'var(--color-amber)', display: 'inline-block',
                  }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Right */}
          <div className="pricing-card-right" style={{
            padding: '2.5rem',
            display: 'flex', flexDirection: 'column',
            alignItems: 'flex-end', justifyContent: 'space-between',
            borderLeft: '1px solid var(--color-border-light)',
          }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontFamily: 'var(--font-serif)', fontSize: '3.25rem', fontWeight: 400,
                letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--color-charcoal)',
              }}>
                $150
              </p>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontWeight: 400, marginTop: '0.35rem', lineHeight: 1.6 }}>
                per hour<br />1.5 hr minimum
              </p>
            </div>
            <a href="/book" className="btn-primary" style={{ marginTop: '1.5rem', whiteSpace: 'nowrap' }}>
              Book Now
            </a>
          </div>
        </div>
      </Reveal>

      {/* Add-ons */}
      <Reveal delay={150}>
        <div style={{ marginTop: '1rem', border: '1px solid var(--color-border-light)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{
            padding: '1.25rem 2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--color-sand-3)', gap: '1rem', flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-amber)', marginBottom: '0.3rem' }}>Add-on</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-charcoal)', letterSpacing: '-0.01em' }}>Firecrackers</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 400 }}>Pyro-style sparks for maximum impact</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: 'var(--color-charcoal)', letterSpacing: '-0.02em' }}>$75</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontWeight: 400 }}>flat fee</p>
            </div>
          </div>

          <div style={{
            padding: '1.25rem 2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--color-sand-3)', gap: '1rem', flexWrap: 'wrap',
            borderTop: '1px solid var(--color-border-light)', opacity: 0.45,
          }}>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.3rem' }}>Add-on · Coming Soon</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-charcoal)', letterSpacing: '-0.01em' }}>SmileCam</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 400 }}>AI-powered smile detection camera</p>
            </div>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '0.62rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '0.35rem 0.9rem',
              border: '1px solid var(--color-border-light)',
              borderRadius: '9999px',
              color: 'var(--color-muted)', whiteSpace: 'nowrap',
            }}>
              Coming Soon
            </span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 400 }}>
          Serving Calgary, Airdrie, Cochrane, Chestermere, Okotoks &amp; Rocky View County. $50 travel fee applies outside Calgary city limits.
        </p>
      </Reveal>
    </section>
  )
}

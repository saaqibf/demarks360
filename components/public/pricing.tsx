import { Reveal } from './reveal'

const features = [
  '360° slow-motion video',
  'Unlimited takes',
  'Same-day delivery link',
  'Shareable gallery',
  'Professional attendant',
  '1.5 hr minimum',
]

const D = 'rgba(255,255,255,0.07)'

export function Pricing() {
  return (
    <section id="pricing" style={{ padding: '6rem 3rem', background: 'var(--color-ink)', borderBottom: `1px solid ${D}` }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.75rem' }}>Pricing</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: '0.01em', lineHeight: 0.9, textTransform: 'uppercase', color: 'var(--color-text)', marginBottom: '3.5rem' }}>
          Simple,<br />Transparent Pricing
        </h2>
      </Reveal>

      {/* Main pricing card */}
      <Reveal delay={100}>
        <div style={{ border: `1px solid ${D}`, display: 'grid', gridTemplateColumns: '240px 1fr 200px' }}>
          {/* Left — identity */}
          <div style={{ padding: '2.5rem', borderRight: `1px solid ${D}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
                Standard Package
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 0.85, textTransform: 'uppercase', color: 'var(--color-text)' }}>
                360<br />BOOTH
              </p>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontWeight: 300, marginTop: '0.85rem' }}>
              1.5 hr minimum · no maximum
            </p>
          </div>

          {/* Middle — features */}
          <div style={{ padding: '2.5rem 3rem', display: 'flex', alignItems: 'center' }}>
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem 2rem', width: '100%' }}>
              {features.map((feat) => (
                <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', color: 'rgba(245,240,234,0.65)', lineHeight: 1.3 }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0, background: 'var(--color-crimson)', display: 'inline-block' }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — price + CTA */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', borderLeft: `1px solid ${D}` }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1, color: 'var(--color-text)' }}>$150</p>
              <p style={{ fontSize: '0.62rem', color: 'var(--color-muted)', fontWeight: 300, marginTop: '0.3rem', lineHeight: 1.6 }}>per hour<br />1.5 hr minimum</p>
            </div>
            <a href="/book" className="btn-primary" style={{ marginTop: '1.5rem', whiteSpace: 'nowrap' }}>
              Book Now
            </a>
          </div>
        </div>
      </Reveal>

      {/* Add-ons */}
      <Reveal delay={150}>
        <div>
          <div style={{ border: `1px solid ${D}`, borderTop: 'none', padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-crimson)', marginBottom: '0.25rem' }}>Add-on</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text)' }}>Firecrackers</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 300 }}>Pyro-style sparks effect for maximum impact</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '0.02em', color: 'var(--color-crimson)' }}>$75</p>
              <p style={{ fontSize: '0.62rem', color: 'var(--color-muted)', fontWeight: 300 }}>flat fee</p>
            </div>
          </div>

          <div style={{ border: `1px solid ${D}`, borderTop: 'none', padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.4 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>Add-on · Coming Soon</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text)' }}>SmileCam</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 300 }}>AI-powered smile detection camera</p>
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.35rem 0.85rem', border: `1px solid ${D}`, color: 'var(--color-muted)' }}>Coming Soon</span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <p style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: 'var(--color-muted)', fontWeight: 300 }}>
          Serving Calgary, Airdrie, Cochrane, Chestermere, Okotoks &amp; Rocky View County. $50 travel fee applies outside Calgary city limits.
        </p>
      </Reveal>
    </section>
  )
}

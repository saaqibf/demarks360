import { Reveal } from './reveal'

export function Pricing() {
  const features = [
    '360° slow-motion video',
    'Unlimited takes',
    'Same-day delivery link',
    'Shareable gallery',
    'Professional attendant',
    '1.5 hr minimum',
  ]

  return (
    <section id="pricing" style={{ padding: '6rem 3rem', borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
      <Reveal>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
          Pricing
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '3rem' }}>
          Simple, Transparent Pricing
        </h2>
      </Reveal>

      {/* Main pricing card */}
      <Reveal delay={100}>
        <div style={{ border: '1px solid rgba(15,15,15,0.10)', display: 'grid', gridTemplateColumns: '260px 1fr 220px' }}>
          {/* Left — identity */}
          <div style={{ padding: '2.5rem', borderRight: '1px solid rgba(15,15,15,0.10)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', marginBottom: '0.5rem' }}>
                Standard Package
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '3.8rem', letterSpacing: '0.02em', lineHeight: 0.85, color: '#0F0F0F' }}>
                360<br />BOOTH
              </p>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#888880', fontWeight: 300, marginTop: '0.85rem' }}>
              1.5 hr minimum · no maximum
            </p>
          </div>

          {/* Middle — features */}
          <div style={{ padding: '2.5rem 3rem', display: 'flex', alignItems: 'center' }}>
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem 2.5rem', width: '100%' }}>
              {features.map((feat) => (
                <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.8rem', color: '#3A3A3A', lineHeight: 1.3 }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#EC4899,#8B5CF6)', display: 'inline-block' }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — price + CTA */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', borderLeft: '1px solid rgba(15,15,15,0.10)' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '3.8rem', letterSpacing: '0.02em', lineHeight: 1, color: '#0F0F0F' }}>$150</p>
              <p style={{ fontSize: '0.62rem', color: '#888880', fontWeight: 300, marginTop: '0.3rem', lineHeight: 1.6 }}>per hour<br />1.5 hr minimum</p>
            </div>
            <a
              href="/book"
              style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#fff', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
                padding: '0.85rem 1.5rem', textDecoration: 'none',
                display: 'inline-block', marginTop: '1.5rem',
              }}
            >
              Book Now
            </a>
          </div>
        </div>
      </Reveal>

      {/* Add-ons */}
      <Reveal delay={150}>
        <div style={{ marginTop: '0' }}>
          <div style={{ border: '1px solid rgba(15,15,15,0.10)', borderTop: 'none', padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.4)' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880' }}>Add-on</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', fontWeight: 800, color: '#0F0F0F' }}>Firecrackers</p>
              <p style={{ fontSize: '0.78rem', color: '#888880', fontWeight: 300 }}>Pyro-style sparks effect for maximum impact</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.02em', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>$75</p>
              <p style={{ fontSize: '0.62rem', color: '#888880', fontWeight: 300 }}>flat fee</p>
            </div>
          </div>

          {/* SmileCam — coming soon */}
          <div style={{ border: '1px solid rgba(15,15,15,0.10)', borderTop: 'none', padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.2)', opacity: 0.6 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880' }}>Add-on · Coming Soon</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', fontWeight: 800, color: '#0F0F0F' }}>SmileCam</p>
              <p style={{ fontSize: '0.78rem', color: '#888880', fontWeight: 300 }}>AI-powered smile detection camera</p>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.35rem 0.85rem', border: '1px solid rgba(15,15,15,0.15)', color: '#888880' }}>Coming Soon</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Travel surcharge note */}
      <Reveal delay={200}>
        <p style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: '#888880', fontWeight: 300 }}>
          Serving Calgary, Airdrie, Cochrane, Chestermere, Okotoks &amp; Rocky View County. $50 travel fee applies outside Calgary city limits.
        </p>
      </Reveal>
    </section>
  )
}

import { Reveal } from './reveal'

export function CtaBand() {
  return (
    <section style={{ background: '#0B0908', padding: '8rem 3rem', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient crimson glow */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '50%', left: '30%',
        transform: 'translate(-50%, -50%)',
        width: '80vw',
        height: '80vh',
        background: 'radial-gradient(ellipse at center, rgba(192,41,58,0.09) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Large faded 360° watermark */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '50%', right: '-2%',
        transform: 'translateY(-50%)',
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(10rem, 22vw, 20rem)',
        fontWeight: 900,
        color: '#fff',
        opacity: 0.022,
        userSelect: 'none',
        pointerEvents: 'none',
        lineHeight: 1,
        letterSpacing: '-0.04em',
      }}>
        360°
      </div>

      <div style={{ position: 'relative', maxWidth: '820px' }}>
        <Reveal>
          <p className="section-label" style={{ marginBottom: '1.5rem' }}>Ready?</p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(3.5rem, 8vw, 8rem)',
            fontWeight: 700,
            fontStyle: 'italic',
            letterSpacing: '0.01em',
            lineHeight: 0.9,
            color: '#F5F0EA',
            marginBottom: '2rem',
          }}>
            Make Your Event<br />
            <span
              className="crimson-glow"
              style={{ color: 'var(--color-crimson)', fontStyle: 'italic' }}
            >
              Unforgettable.
            </span>
          </h2>

          <p style={{
            fontSize: '0.92rem',
            color: 'rgba(245,240,234,0.4)',
            fontWeight: 300,
            lineHeight: 1.8,
            maxWidth: '460px',
            marginBottom: '3rem',
          }}>
            $150/hr · 1.5-hour minimum · Same-day gallery delivery.
            Serving Calgary, Airdrie, and surrounding areas.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="/book" className="btn-primary" style={{ padding: '1.15rem 3rem', fontSize: '0.95rem' }}>
              Book Your Experience
            </a>
            <a href="#pricing" className="btn-ghost">
              View Pricing →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

import { Reveal } from './reveal'

export function CtaBand() {
  return (
    <section style={{
      background: 'var(--color-charcoal)',
      padding: '8rem 3rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Warm ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '50%', left: '25%',
        transform: 'translate(-50%, -50%)',
        width: '80vw', height: '80vh',
        background: 'radial-gradient(ellipse at center, rgba(168,117,48,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Large faded watermark */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '50%', right: '-2%',
        transform: 'translateY(-50%)',
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(10rem, 22vw, 20rem)',
        fontWeight: 400,
        fontStyle: 'italic',
        color: 'var(--color-sand)',
        opacity: 0.03,
        userSelect: 'none',
        pointerEvents: 'none',
        lineHeight: 1,
        letterSpacing: '-0.04em',
      }}>
        360°
      </div>

      <div style={{ position: 'relative', maxWidth: '820px' }}>
        <Reveal>
          <p className="section-label section-label-light" style={{ marginBottom: '1.5rem' }}>Ready?</p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(3rem, 8vw, 7.5rem)',
            fontWeight: 400,
            lineHeight: 0.95,
            color: 'var(--color-sand)',
            marginBottom: '2rem',
            letterSpacing: '-0.02em',
          }}>
            Make Your Event<br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-amber)' }}>
              Unforgettable.
            </em>
          </h2>

          <p style={{
            fontSize: '0.95rem',
            color: 'rgba(237,232,223,0.45)',
            fontWeight: 400,
            lineHeight: 1.8,
            maxWidth: '440px',
            marginBottom: '3rem',
            fontFamily: 'var(--font-body)',
          }}>
            $150/hr, 1.5-hour minimum. Gallery delivered the same day.
            Serving Calgary, Airdrie, and surrounding areas.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="/book" style={{
              fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700,
              color: 'var(--color-charcoal)', background: 'var(--color-sand)',
              padding: '1rem 2.5rem', borderRadius: '9999px',
              textDecoration: 'none', display: 'inline-block',
              transition: 'background 0.2s ease',
              whiteSpace: 'nowrap',
            }}>
              Book Your Experience
            </a>
            <a href="#pricing" style={{
              fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 500,
              color: 'rgba(237,232,223,0.5)', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              transition: 'color 0.2s ease',
            }}>
              View Pricing →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

import { Reveal } from './reveal'

export function CtaBand() {
  return (
    <section style={{
      background: 'var(--color-charcoal)',
      padding: '8rem 3rem',
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid rgba(237,232,223,0.06)',
    }}>
      {/* Amber radial glow */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        bottom: 0, right: 0,
        width: '50vw', height: '70%',
        background: 'radial-gradient(ellipse at 100% 100%, rgba(212,133,106,0.12) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle CSS grid overlay */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(237,232,223,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(237,232,223,0.025) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: '900px' }}>
        <Reveal>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(237,232,223,0.28)',
            marginBottom: '2.5rem',
          }}>
            Ready to Book
          </p>

          <h2 style={{
            fontFamily: 'var(--font-wordmark)',
            fontSize: 'clamp(4rem, 10vw, 10rem)',
            fontWeight: 400,
            lineHeight: 0.88,
            color: 'var(--color-sand)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0',
          }}>
            Make Your Event
          </h2>
          <h2 style={{
            fontFamily: 'var(--font-wordmark)',
            fontSize: 'clamp(4rem, 10vw, 10rem)',
            fontWeight: 400,
            lineHeight: 0.88,
            color: 'var(--color-amber)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '3rem',
          }}>
            Unforgettable.
          </h2>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            color: 'rgba(237,232,223,0.38)',
            lineHeight: 1.75,
            maxWidth: '400px',
            marginBottom: '3rem',
            fontWeight: 400,
          }}>
            $150/hr, 1.5-hour minimum. Gallery delivered the same day. Serving Calgary, Airdrie, and surrounding areas.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <a href="/book" style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-charcoal)',
              background: 'var(--color-sand)',
              padding: '1.1rem 3rem',
              borderRadius: '3px',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background 0.2s ease',
              whiteSpace: 'nowrap',
            }}>
              Book Your Experience
            </a>
            <a href="#pricing" style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(237,232,223,0.38)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'color 0.2s ease',
            }}>
              View Pricing
              <span style={{ display: 'inline-block', width: '18px', height: '1px', background: 'currentColor' }} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

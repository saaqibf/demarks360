export function Hero() {
  return (
    <section aria-label="Hero" style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      background: 'var(--color-charcoal)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Background video */}
      <video
        autoPlay loop muted playsInline preload="auto"
        className="hero-video"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0,
        }}
      >
        <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(160deg, rgba(26,23,20,0.85) 0%, rgba(26,23,20,0.40) 45%, rgba(26,23,20,0.78) 100%)',
      }} />

      {/* Amber corner wash */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: '50%', height: '55%', zIndex: 2,
        background: 'radial-gradient(ellipse at 0% 100%, rgba(168,117,48,0.14) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Content — centered vertically */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="hero-body" style={{ paddingBottom: '8rem', paddingTop: '10rem' }}>
          {/* Kicker */}
          <p className="hero-label" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.62rem',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(237,232,223,0.50)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span style={{ display: 'inline-block', width: '28px', height: '1px', background: 'var(--color-amber)', flexShrink: 0 }} />
            Calgary &amp; Area · 360 Video Booth
          </p>

          {/* Main heading */}
          <h1 className="hero-headline" style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(3.8rem, 9vw, 9.5rem)',
            fontWeight: 300,
            lineHeight: 0.95,
            color: 'var(--color-sand)',
            letterSpacing: '-0.02em',
            marginBottom: '0',
            maxWidth: '820px',
          }}>
            Every Moment,
            <br />
            <em style={{
              fontStyle: 'italic',
              color: 'var(--color-amber)',
              fontWeight: 300,
            }}>
              Captured.
            </em>
          </h1>

          {/* Sub */}
          <p className="hero-sub" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            fontWeight: 400,
            color: 'rgba(237,232,223,0.50)',
            lineHeight: 1.7,
            maxWidth: '380px',
            marginTop: '2.25rem',
          }}>
            360° slow-motion video booth, same-day gallery delivery. Serving Calgary and surrounding areas.
          </p>

          {/* CTAs */}
          <div className="hero-ctas" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <a href="/book" style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-charcoal)',
              background: 'var(--color-sand)',
              padding: '1rem 2.75rem',
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
              color: 'rgba(237,232,223,0.45)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap',
            }}>
              See Pricing
              <span style={{ display: 'inline-block', width: '18px', height: '1px', background: 'currentColor' }} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom stat bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        borderTop: '1px solid rgba(237,232,223,0.08)',
        background: 'rgba(26,23,20,0.6)',
        backdropFilter: 'blur(10px)',
      }}>
        <div className="hero-body" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            {[
              { val: '150+', label: 'Events Captured' },
              { val: '5.0★', label: 'Client Rating' },
              { val: 'Same Day', label: 'Gallery Delivery' },
              { val: 'YYC', label: 'Calgary & Area' },
            ].map(({ val, label }) => (
              <div key={val}>
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.1rem',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: 'var(--color-sand)',
                  display: 'block',
                  lineHeight: 1,
                }}>
                  {val}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(237,232,223,0.35)',
                  display: 'block',
                  marginTop: '0.25rem',
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

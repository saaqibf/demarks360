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

      {/* Overlay — darker at edges, golden-hour center */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 45%, rgba(20,16,9,0.30) 0%, rgba(20,16,9,0.78) 90%), linear-gradient(rgba(20,16,9,0.55), rgba(20,16,9,0.35) 40%, rgba(20,16,9,0.7))',
      }} />

      {/* Amber light wash */}
      <div style={{
        position: 'absolute', bottom: 0, left: '15%', width: '70%', height: '60%', zIndex: 2,
        background: 'radial-gradient(ellipse at 50% 100%, rgba(201,145,63,0.22) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Letterbox bars */}
      <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 'clamp(18px, 4vh, 42px)', background: 'color-mix(in srgb, var(--color-charcoal) 60%, black)', zIndex: 5 }} />
      <div aria-hidden style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 'clamp(18px, 4vh, 42px)', background: 'color-mix(in srgb, var(--color-charcoal) 60%, black)', zIndex: 5 }} />

      {/* Content — centered like a title card */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div className="hero-body" style={{ paddingBottom: '9rem', paddingTop: '8rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Kicker */}
          <p className="hero-label" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.62rem',
            fontWeight: 500,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            color: 'var(--color-amber-light)',
            marginBottom: '1.8rem',
          }}>
            Calgary&apos;s 360° slow-motion video booth
          </p>

          {/* Main heading */}
          <h1 className="hero-headline" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 9vw, 8rem)',
            fontWeight: 400,
            lineHeight: 0.98,
            color: 'var(--color-text-light)',
            letterSpacing: '-0.02em',
            marginBottom: '0',
            maxWidth: '1000px',
          }}>
            Every angle
            <br />
            of <em style={{ fontStyle: 'italic', color: 'var(--color-amber-light)' }}>the moment.</em>
          </h1>

          {/* Sub */}
          <p className="hero-sub" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            fontWeight: 300,
            color: 'var(--color-muted-light)',
            lineHeight: 1.7,
            maxWidth: '36ch',
            marginTop: '2.2rem',
          }}>
            Cinematic slow-motion video of your guests, captured in one spin and delivered the same day.
          </p>

          {/* CTAs */}
          <div className="hero-ctas" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.1rem', marginTop: '2.6rem', flexWrap: 'wrap' }}>
            <a href="/book" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Check your date
            </a>
            <a href="#pricing" className="hero-ghost-cta" style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              fontWeight: 400,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: 'var(--color-text-light)',
              border: '1px solid rgba(243,234,217,0.35)',
              padding: '0.95rem 2.5rem',
              borderRadius: '999px',
              textDecoration: 'none',
              display: 'inline-block',
              whiteSpace: 'nowrap',
            }}>
              See pricing
            </a>
          </div>
        </div>
      </div>

      {/* Bottom stat bar */}
      <div className="hero-statbar" style={{
        position: 'absolute', bottom: 'clamp(18px, 4vh, 42px)', left: 0, right: 0, zIndex: 10,
        borderTop: '1px solid rgba(243,234,217,0.08)',
        background: 'rgba(20,16,9,0.55)',
        backdropFilter: 'blur(10px)',
      }}>
        <div className="hero-body" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { val: '150+', label: 'Events captured' },
              { val: '5.0★', label: 'Client rating' },
              { val: 'Same day', label: 'Gallery delivery' },
              { val: 'YYC', label: 'Calgary & area' },
            ].map(({ val, label }) => (
              <div key={val} style={{ textAlign: 'center' }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: '1.15rem',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  color: 'var(--color-amber-light)',
                  display: 'block',
                  lineHeight: 1,
                }}>
                  {val}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.55rem',
                  fontWeight: 500,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted-light)',
                  display: 'block',
                  marginTop: '0.3rem',
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

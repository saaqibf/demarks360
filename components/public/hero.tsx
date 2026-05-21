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
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
      </video>

      {/* Warm dark overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to bottom, rgba(26,23,20,0.72) 0%, rgba(26,23,20,0.3) 35%, rgba(26,23,20,0.3) 55%, rgba(26,23,20,0.9) 80%, rgba(26,23,20,0.97) 100%)',
      }} />

      {/* Warm ambient light */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', zIndex: 2,
        background: 'radial-gradient(ellipse at 10% 100%, rgba(168,117,48,0.12) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="hero-body" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingTop: '8rem',
        }}>
          {/* Label badge */}
          <div className="hero-label" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(237,232,223,0.08)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(237,232,223,0.12)',
            borderRadius: '9999px',
            padding: '0.4rem 1rem 0.4rem 0.65rem',
            width: 'fit-content', marginBottom: '1.5rem',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: 'var(--color-amber)', display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '0.62rem', fontWeight: 600,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(237,232,223,0.7)',
            }}>
              Calgary &amp; Area · 360 Video Booth
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-headline" style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(3.8rem, 10vw, 9.5rem)',
            fontWeight: 400,
            lineHeight: 0.95,
            color: 'var(--color-sand)',
            maxWidth: '820px',
            letterSpacing: '-0.02em',
          }}>
            Every Moment,<br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-amber)' }}>Captured</em><br />
            in 360°
          </h1>

          {/* Subtext */}
          <p className="hero-sub" style={{
            fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 400,
            color: 'rgba(237,232,223,0.55)', lineHeight: 1.8, maxWidth: '400px', marginTop: '1.5rem',
          }}>
            Calgary&apos;s premier slow-motion 360 booth.
            Unforgettable memories delivered the same day. Birthdays, weddings, corporate events and more.
          </p>

          {/* CTAs */}
          <div className="hero-ctas" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
            <a href="/book" style={{
              fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700,
              color: 'var(--color-charcoal)',
              background: 'var(--color-sand)',
              padding: '0.9rem 2.25rem', borderRadius: '9999px',
              textDecoration: 'none', display: 'inline-block',
              transition: 'background 0.2s ease',
              whiteSpace: 'nowrap',
            }}>
              Book Your Experience
            </a>
            <a href="#how-it-works" style={{
              fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 500,
              color: 'rgba(237,232,223,0.6)', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              transition: 'color 0.2s ease',
            }}>
              How It Works →
            </a>
          </div>

          {/* Stats */}
          <div className="hero-stats" style={{
            display: 'flex', gap: 0,
            marginTop: '3.5rem', paddingTop: '2rem', paddingBottom: '3rem',
            borderTop: '1px solid rgba(237,232,223,0.08)',
          }}>
            {[
              { val: '150+', label: 'Events Booked' },
              { val: '5.0 ★', label: 'Average Rating' },
              { val: 'Same Day', label: 'Gallery Delivery' },
            ].map(({ val, label }, i) => (
              <div key={val} style={{
                paddingRight: i < 2 ? '2.5rem' : 0,
                marginRight: i < 2 ? '2.5rem' : 0,
                borderRight: i < 2 ? '1px solid rgba(237,232,223,0.08)' : 'none',
              }}>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400,
                  lineHeight: 1, color: 'var(--color-sand)',
                }}>
                  {val}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.58rem', fontWeight: 600,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: 'rgba(237,232,223,0.35)', marginTop: '0.3rem',
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

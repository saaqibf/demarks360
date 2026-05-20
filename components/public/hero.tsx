import { SiteNav } from './site-nav'

export function Hero() {
  return (
    /* Outer frame — dark bg with padding, creates the "framed" look */
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#080808',
      padding: '0.75rem',
    }}>
      {/* Hero container — rounded, clips video + content + bleeding cards */}
      <section style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 1.5rem)',
        minHeight: '600px',
        overflow: 'hidden',
        borderRadius: '1.5rem',
        background: '#0d0d0d',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
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

        {/* Dark gradient overlay — heavy bottom, light top */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(8,8,8,0.6) 0%, rgba(8,8,8,0.1) 30%, rgba(8,8,8,0.1) 50%, rgba(8,8,8,0.88) 78%, rgba(8,8,8,0.97) 100%)',
        }} />

        {/* Crimson atmospheric glow */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          zIndex: 2,
          background: 'radial-gradient(ellipse at 15% 100%, rgba(192,41,58,0.14) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Foreground content */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Floating pill nav */}
          <SiteNav />

          {/* Hero text content */}
          <div className="hero-body" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
            {/* Badge */}
            <div className="hero-label" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9999px',
              padding: '0.35rem 0.9rem 0.35rem 0.5rem',
              width: 'fit-content',
              marginBottom: '1.25rem',
            }}>
              <span style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: 'var(--color-crimson)',
                display: 'inline-block',
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.58rem',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(245,240,234,0.75)',
              }}>
                Calgary &amp; Area · 360 Video Booth Rental
              </span>
            </div>

            {/* Headline */}
            <h1
              className="hero-headline"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(4.5rem, 12vw, 11rem)',
                fontWeight: 900,
                letterSpacing: '-0.01em',
                lineHeight: 0.9,
                textTransform: 'uppercase',
                color: '#fff',
                maxWidth: '800px',
              }}
            >
              CAPTURE<br />
              <span style={{ color: 'var(--color-crimson)' }}>EVERY</span><br />
              ANGLE
            </h1>

            {/* Subheadline */}
            <p
              className="hero-sub"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                fontWeight: 300,
                color: 'rgba(245,240,234,0.6)',
                lineHeight: 1.75,
                maxWidth: '380px',
                marginTop: '1.25rem',
              }}
            >
              Calgary&apos;s premier 360 video booth —{' '}
              <strong style={{ fontWeight: 500, color: 'rgba(245,240,234,0.85)' }}>
                unforgettable moments, captured from every angle.
              </strong>{' '}
              Birthdays, weddings, graduations, and corporate events.
            </p>

            {/* CTAs */}
            <div className="hero-ctas" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.75rem' }}>
              <a
                href="/book"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  background: '#080808',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '0.75rem 1.75rem 0.75rem 1.75rem',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                Book Your Experience
                <span style={{
                  width: '24px', height: '24px',
                  borderRadius: '50%',
                  background: 'var(--color-crimson)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem',
                  flexShrink: 0,
                }}>→</span>
              </a>
              <a href="#how-it-works" className="btn-ghost">
                How It Works →
              </a>
            </div>

            {/* Stats strip — bleeds slightly into the bottom */}
            <div
              className="hero-stats"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, auto)',
                width: 'fit-content',
                gap: 0,
                marginTop: '3rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                paddingBottom: '2.75rem',
              }}
            >
              {[
                { val: '150+', label: 'Events Booked' },
                { val: 'YYC', label: 'Calgary & Area' },
                { val: '100%', label: 'Satisfaction' },
              ].map(({ val, label }, i) => (
                <div
                  key={val}
                  style={{
                    paddingRight: i < 2 ? '2.75rem' : 0,
                    marginRight: i < 2 ? '2.75rem' : 0,
                    borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: 'var(--color-crimson)',
                  }}>
                    {val}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.5rem',
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,240,234,0.35)',
                    marginTop: '0.25rem',
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

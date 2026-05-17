export function Hero() {
  return (
    <section style={{
      minHeight: 'calc(100vh - 66px)',
      display: 'grid',
      gridTemplateColumns: '1fr 42%',
      gridTemplateRows: 'auto 1fr',
      borderBottom: '1px solid rgba(15,15,15,0.10)',
      overflow: 'hidden',
    }}>
      {/* Headline block — full width */}
      <div style={{
        gridColumn: '1 / -1',
        padding: '3.5rem 3rem 0',
        borderBottom: '1px solid rgba(15,15,15,0.10)',
      }}>
        <p style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
          letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880',
          display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem',
        }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', flexShrink: 0 }} />
          Calgary &amp; Area · 360 Video Booth Rental
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(5.5rem, 12vw, 11.5rem)',
          letterSpacing: '0.01em',
          lineHeight: 0.85,
          color: '#0F0F0F',
        }}>
          DEMARKS{' '}
          <span style={{
            background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            position: 'relative',
            display: 'inline-block',
          }}>
            360
          </span>
        </h1>
      </div>

      {/* Left — description + stats */}
      <div style={{
        padding: '2.5rem 3rem 3rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderRight: '1px solid rgba(15,15,15,0.10)',
      }}>
        <div>
          <p style={{ fontSize: '0.9rem', color: '#3A3A3A', lineHeight: 1.75, maxWidth: '380px', fontWeight: 300 }}>
            Calgary&apos;s premier 360 video booth — <strong style={{ fontWeight: 500, color: '#0F0F0F' }}>unforgettable moments, captured from every angle.</strong>{' '}
            Birthdays, weddings, graduations, and corporate events across Calgary and surrounding areas.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2rem' }}>
            <a
              href="/book"
              style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#fff', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
                padding: '1rem 2.25rem', textDecoration: 'none', display: 'inline-block',
              }}
            >
              Book Your Experience
            </a>
            <a
              href="#how-it-works"
              style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#0F0F0F', textDecoration: 'none',
              }}
            >
              How It Works →
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid rgba(15,15,15,0.10)', marginTop: 'auto', paddingTop: '0' }}>
          {[
            { val: '150+', label: 'Events Booked' },
            { val: 'YYC', label: 'Calgary & Area' },
            { val: '100%', label: 'Satisfaction' },
          ].map(({ val, label }, i) => (
            <div key={val} style={{
              padding: '1.25rem 0',
              borderRight: i < 2 ? '1px solid rgba(15,15,15,0.10)' : undefined,
              paddingLeft: i > 0 ? '1.5rem' : undefined,
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', letterSpacing: '0.02em', lineHeight: 1 }}>
                <span style={{ background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {val}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginTop: '0.2rem' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — video panel */}
      <div style={{
        gridColumn: 2, gridRow: 2,
        background: '#0F0F0F',
        position: 'relative', overflow: 'hidden',
        minHeight: '400px',
      }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        >
          <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to top, rgba(15,15,15,0.6) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 2 }}>
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            padding: '0.4rem 0.75rem',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(4px)',
          }}>
            360° Experience
          </span>
        </div>
      </div>
    </section>
  )
}

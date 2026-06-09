export function MidCta() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      borderTop: '1px solid rgba(237,232,223,0.06)',
      borderBottom: '1px solid rgba(237,232,223,0.06)',
    }}>
      {/* Left — dark */}
      <div style={{
        background: 'var(--color-charcoal)',
        padding: '5rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRight: '1px solid rgba(237,232,223,0.06)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(237,232,223,0.28)',
          marginBottom: '1.5rem',
        }}>
          Ready?
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 4.5vw, 5rem)',
          fontWeight: 900,
          lineHeight: 0.92,
          color: 'var(--color-sand)',
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          marginBottom: '0.35rem',
        }}>
          Seen enough?
        </h2>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 4.5vw, 5rem)',
          fontWeight: 900,
          lineHeight: 0.92,
          color: 'var(--color-amber)',
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          marginBottom: 0,
        }}>
          Pick your date.
        </p>
      </div>

      {/* Right — amber wash */}
      <div style={{
        background: 'rgba(212,133,106,0.08)',
        padding: '5rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '1.5rem',
      }}>
        <a href="/book" style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#fff',
          background: 'var(--color-amber)',
          padding: '1rem 2.5rem',
          borderRadius: '3px',
          textDecoration: 'none',
          display: 'inline-block',
        }}>
          Book Now
        </a>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.78rem',
          color: 'rgba(237,232,223,0.3)',
          fontWeight: 400,
        }}>
          From $225 · Same-day gallery included
        </span>
      </div>

      <style>{`
        @media (max-width: 640px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

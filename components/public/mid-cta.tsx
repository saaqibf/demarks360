export function MidCta() {
  return (
    <div style={{
      background: 'var(--color-charcoal)',
      borderTop: '1px solid rgba(237,232,223,0.06)',
      padding: '3.5rem 3rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2rem',
        flexWrap: 'wrap',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.6rem, 3vw, 2.5rem)',
            fontWeight: 400,
            lineHeight: 1.1,
            color: 'var(--color-sand)',
            letterSpacing: '-0.02em',
            marginBottom: '0.35rem',
          }}>
            Seen enough?
          </p>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.6rem, 3vw, 2.5rem)',
            fontWeight: 400,
            fontStyle: 'italic',
            lineHeight: 1.1,
            color: 'var(--color-amber)',
            letterSpacing: '-0.02em',
          }}>
            Pick your date.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.78rem',
            color: 'rgba(237,232,223,0.35)',
            fontWeight: 400,
            lineHeight: 1.6,
          }}>
            From $150/hr<br />Same-day gallery
          </p>
          <a href="/book" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--color-charcoal)',
            background: 'var(--color-sand)',
            padding: '0.9rem 2.25rem',
            borderRadius: '9999px',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'background 0.2s ease',
            whiteSpace: 'nowrap',
          }}>
            Book Now
          </a>
        </div>
      </div>
    </div>
  )
}

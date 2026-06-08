export function MidCta() {
  return (
    <div style={{
      background: 'var(--color-sand)',
      borderTop: '1px solid var(--color-border-light)',
      borderBottom: '1px solid var(--color-border-light)',
      padding: '5rem 3rem',
      textAlign: 'center',
    }}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.6rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'var(--color-muted-light)',
        marginBottom: '1.5rem',
      }}>
        Ready?
      </p>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(3rem, 6vw, 6.5rem)',
        fontWeight: 900,
        lineHeight: 0.92,
        color: 'var(--color-charcoal)',
        letterSpacing: '-0.01em',
        textTransform: 'uppercase',
        marginBottom: '0.35rem',
      }}>
        Seen enough?
      </h2>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(3rem, 6vw, 6.5rem)',
        fontWeight: 900,
        lineHeight: 0.92,
        color: 'var(--color-amber)',
        letterSpacing: '-0.01em',
        textTransform: 'uppercase',
        marginBottom: '2.5rem',
      }}>
        Pick your date.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <a href="/book" className="btn-primary">Book Now</a>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-muted-light)', fontWeight: 400 }}>
          From $225 · Same-day gallery included
        </span>
      </div>
    </div>
  )
}

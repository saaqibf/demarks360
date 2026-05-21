export function TrustStrip() {
  const items = [
    { val: '150+', label: 'Events Captured' },
    { val: '5.0 ★', label: 'Client Rating' },
    { val: 'Same Day', label: 'Gallery Delivery' },
    { val: 'YYC', label: 'Calgary & Area' },
  ]

  return (
    <div style={{ background: 'var(--color-sand-2)', borderBottom: '1px solid var(--color-border-light)', padding: '0' }}>
      <div className="trust-strip">
        {items.map(({ val, label }) => (
          <div key={val} className="trust-item">
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 400,
              color: 'var(--color-charcoal)',
              lineHeight: 1,
              display: 'block',
              letterSpacing: '-0.02em',
            }}>
              {val}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
              display: 'block',
              marginTop: '0.3rem',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TrustStrip() {
  const items = [
    { val: '150+', label: 'Events Captured' },
    { val: '5.0 ★', label: 'Client Rating' },
    { val: 'Same Day', label: 'Gallery Delivery' },
    { val: 'YYC', label: 'Calgary & Area' },
  ]

  return (
    <div style={{ background: 'var(--color-charcoal-2)', borderBottom: '1px solid rgba(237,232,223,0.06)' }}>
      <div className="trust-strip">
        {items.map(({ val, label }, i) => (
          <div
            key={val}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.25rem 1.5rem',
              textAlign: 'center',
              borderRight: i < items.length - 1 ? '1px solid rgba(237,232,223,0.06)' : 'none',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-sand)',
              lineHeight: 1,
              display: 'block',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}>
              {val}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.58rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(237,232,223,0.28)',
              display: 'block',
              marginTop: '0.4rem',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

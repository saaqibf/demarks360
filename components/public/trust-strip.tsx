export function TrustStrip() {
  const items = [
    { val: '150+', label: 'Events Captured' },
    { val: '★ 5.0', label: 'Client Rating' },
    { val: 'Same Day', label: 'Gallery Delivery' },
    { val: 'YYC', label: 'Calgary & Area' },
  ]

  return (
    <div style={{ background: 'var(--color-ink)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.75rem 1rem' }}>
      <div className="trust-strip">
        {items.map(({ val, label }) => (
          <div key={val} className="trust-item">
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--color-crimson)',
              lineHeight: 1,
              display: 'block',
            }}>
              {val}
            </span>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.5rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(245,240,234,0.35)',
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

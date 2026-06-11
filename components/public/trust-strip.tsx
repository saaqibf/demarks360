const items = [
  { val: '150+', label: 'Events Captured' },
  { val: '5.0 ★', label: 'Client Rating' },
  { val: 'Same Day', label: 'Gallery Delivery' },
  { val: 'YYC', label: 'Calgary & Area' },
  { val: '$150/hr', label: 'Starting Rate' },
  { val: 'Unlimited', label: 'Takes Per Session' },
  { val: '150+', label: 'Events Captured' },
  { val: '5.0 ★', label: 'Client Rating' },
  { val: 'Same Day', label: 'Gallery Delivery' },
  { val: 'YYC', label: 'Calgary & Area' },
  { val: '$150/hr', label: 'Starting Rate' },
  { val: 'Unlimited', label: 'Takes Per Session' },
]

export function TrustStrip() {
  return (
    <div style={{
      background: 'var(--color-charcoal-2)',
      borderTop: '1px solid var(--color-border-dark)',
      borderBottom: '1px solid var(--color-border-dark)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '80px',
        background: 'linear-gradient(to right, var(--color-charcoal-2), transparent)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '80px',
        background: 'linear-gradient(to left, var(--color-charcoal-2), transparent)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      <div className="marquee-track" style={{ width: 'max-content' }}>
        {items.map(({ val, label }, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.85rem',
              padding: '1.35rem 3rem',
              flexShrink: 0,
              borderRight: '1px solid var(--color-border-dark)',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'var(--color-amber-light)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}>
              {val}
            </span>
            <span className="t-label" style={{
              color: 'var(--color-muted-light)',
              whiteSpace: 'nowrap',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

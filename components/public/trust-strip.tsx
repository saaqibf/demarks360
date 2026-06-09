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
      borderTop: '1px solid var(--color-amber)',
      borderBottom: '1px solid rgba(237,232,223,0.06)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Fade edges */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: '80px',
        background: 'linear-gradient(to right, var(--color-charcoal-2), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: '80px',
        background: 'linear-gradient(to left, var(--color-charcoal-2), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        animation: 'marquee 28s linear infinite',
        width: 'max-content',
      }}>
        {items.map(({ val, label }, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1.5rem 3rem',
              flexShrink: 0,
              borderRight: '1px solid rgba(237,232,223,0.06)',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--color-sand)',
              lineHeight: 1,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              {val}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.58rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(237,232,223,0.25)',
              whiteSpace: 'nowrap',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="marquee"] { animation: none; }
        }
      `}</style>
    </div>
  )
}

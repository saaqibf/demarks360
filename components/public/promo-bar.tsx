export function PromoBar() {
  return (
    <div style={{
      background: 'var(--color-charcoal)',
      color: 'rgba(237,232,223,0.7)',
      fontFamily: 'var(--font-body)',
      fontSize: '0.68rem',
      fontWeight: 500,
      letterSpacing: '0.12em',
      textAlign: 'center',
      padding: '0.55rem 1rem',
      textTransform: 'uppercase',
    }}>
      Calgary&apos;s premier 360 video booth.{' '}
      <strong style={{ fontWeight: 700, color: 'var(--color-sand)', letterSpacing: '0.08em' }}>
        Same-day gallery delivery.
      </strong>
    </div>
  )
}

export function PromoBar() {
  return (
    <div className="t-label" style={{
      background: 'var(--color-charcoal)',
      color: 'var(--color-muted-light)',
      textAlign: 'center',
      padding: '0.65rem 1rem',
      borderBottom: '1px solid var(--color-border-dark)',
    }}>
      Calgary&apos;s premier 360 video booth.{' '}
      <strong style={{ fontWeight: 600, color: 'var(--color-amber-light)' }}>
        Same-day gallery delivery.
      </strong>
    </div>
  )
}

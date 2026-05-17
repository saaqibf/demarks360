export function PromoBar() {
  return (
    <div style={{
      background: 'var(--color-crimson)',
      color: 'rgba(255,255,255,0.9)',
      fontFamily: 'var(--font-ui)',
      fontSize: '0.6rem',
      fontWeight: 600,
      letterSpacing: '0.18em',
      textAlign: 'center',
      padding: '0.6rem 1rem',
      textTransform: 'uppercase',
    }}>
      Calgary&apos;s premier 360 video booth —{' '}
      <strong style={{ fontWeight: 800, color: '#fff' }}>
        book your experience
      </strong>
    </div>
  )
}

export function PromoBar() {
  return (
    <div style={{
      background: '#0F0F0F',
      color: 'rgba(255,255,255,0.55)',
      fontFamily: 'var(--font-ui)',
      fontSize: '0.62rem',
      fontWeight: 600,
      letterSpacing: '0.14em',
      textAlign: 'center',
      padding: '0.6rem 1rem',
      textTransform: 'uppercase',
    }}>
      Calgary&apos;s premier 360 video booth —{' '}
      <strong style={{
        fontWeight: 700,
        background: 'linear-gradient(90deg, #EC4899, #8B5CF6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        book your experience
      </strong>
    </div>
  )
}

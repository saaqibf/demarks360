import Link from 'next/link'

export function SiteNav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(239,236,231,0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(15,15,15,0.10)',
      height: '66px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 3rem',
    }}>
      <Link href="/" style={{ display: 'flex', flexDirection: 'column', gap: '1px', textDecoration: 'none' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', letterSpacing: '0.04em', color: '#0F0F0F' }}>
          DEMARKS{' '}
          <span style={{ background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>360</span>
        </span>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.47rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9B9590' }}>
          Calgary 360 Video Booth
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2.25rem' }}>
        {['How It Works', 'Pricing', 'Gallery', 'FAQ'].map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
            style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#3A3A3A', textDecoration: 'none',
            }}
          >
            {label}
          </a>
        ))}
      </div>

      <Link
        href="/book"
        style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#fff', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
          padding: '0.62rem 1.5rem', textDecoration: 'none', display: 'inline-block',
        }}
      >
        Book Now
      </Link>
    </nav>
  )
}

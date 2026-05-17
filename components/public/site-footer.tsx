import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer style={{ background: '#0F0F0F', padding: '3rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.04em', color: '#fff' }}>
            DEMARKS{' '}
            <span style={{ color: 'var(--color-crimson)' }}>360</span>
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: '0.25rem' }}>
            Calgary 360 Video Booth
          </p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: '1rem', fontWeight: 300 }}>
            Serving Calgary, Airdrie, Cochrane,<br />Chestermere, Okotoks & Rocky View County
          </p>
        </div>

        <div style={{ display: 'flex', gap: '3rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem' }}>Navigation</p>
            {['How It Works', 'Pricing', 'Gallery', 'FAQ'].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`} style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '0.4rem', fontWeight: 300 }}>{l}</a>
            ))}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem' }}>Legal</p>
            <Link href="/privacy" style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '0.4rem', fontWeight: 300 }}>Privacy Policy</Link>
            <Link href="/terms" style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 300 }}>Terms of Service</Link>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem' }}>Follow</p>
            <a href="https://instagram.com/demarks360" target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 300 }}>@demarks360</a>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>
          © {new Date().getFullYear()} Demarks 360. All rights reserved.
        </p>
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>
          Calgary, Alberta, Canada
        </p>
      </div>
    </footer>
  )
}

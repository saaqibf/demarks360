import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer style={{ background: 'var(--color-charcoal-2)', padding: '3.5rem 3rem 2.5rem', borderTop: '1px solid rgba(237,232,223,0.06)' }}>
      <div className="footer-inner">
        <div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-sand)', letterSpacing: '-0.01em' }}>
            Demarks{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--color-amber)' }}>360</em>
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(237,232,223,0.25)', marginTop: '0.3rem', fontWeight: 500 }}>
            Calgary 360 Video Booth
          </p>
          <p style={{ fontSize: '0.78rem', color: 'rgba(237,232,223,0.3)', marginTop: '1.25rem', fontWeight: 400, lineHeight: 1.75, fontFamily: 'var(--font-body)' }}>
            Serving Calgary, Airdrie, Cochrane,<br />Chestermere, Okotoks &amp; Rocky View County
          </p>
        </div>

        <div className="footer-links">
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(237,232,223,0.25)', marginBottom: '0.85rem' }}>
              Navigate
            </p>
            {['How It Works', 'Pricing', 'Gallery', 'FAQ'].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
                style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(237,232,223,0.45)', textDecoration: 'none', marginBottom: '0.45rem', fontWeight: 400, fontFamily: 'var(--font-body)', transition: 'color 0.2s ease' }}
              >
                {l}
              </a>
            ))}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(237,232,223,0.25)', marginBottom: '0.85rem' }}>
              Legal
            </p>
            <Link href="/privacy" style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(237,232,223,0.45)', textDecoration: 'none', marginBottom: '0.45rem', fontWeight: 400, fontFamily: 'var(--font-body)' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(237,232,223,0.45)', textDecoration: 'none', fontWeight: 400, fontFamily: 'var(--font-body)', marginBottom: '0.45rem' }}>
              Terms of Service
            </Link>
            <Link href="/admin-login" style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(237,232,223,0.18)', textDecoration: 'none', fontWeight: 400, fontFamily: 'var(--font-body)', marginTop: '1rem' }}>
              Admin
            </Link>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(237,232,223,0.25)', marginBottom: '0.85rem' }}>
              Follow
            </p>
            <a
              href="https://instagram.com/demarks360"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(237,232,223,0.45)', textDecoration: 'none', fontWeight: 400, fontFamily: 'var(--font-body)' }}
            >
              @demarks360
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom" style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(237,232,223,0.06)' }}>
        <p style={{ fontSize: '0.68rem', color: 'rgba(237,232,223,0.22)', fontWeight: 400, fontFamily: 'var(--font-body)' }}>
          &copy; {new Date().getFullYear()} Demarks 360. All rights reserved.
        </p>
        <p style={{ fontSize: '0.68rem', color: 'rgba(237,232,223,0.22)', fontWeight: 400, fontFamily: 'var(--font-body)' }}>
          Calgary, Alberta, Canada
        </p>
      </div>
    </footer>
  )
}

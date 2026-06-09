import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer style={{
      background: 'var(--color-charcoal-2)',
      borderTop: '1px solid var(--color-amber)',
      padding: '4rem 3rem 2.5rem',
    }}>
      <div className="footer-inner">
        <div>
          <p style={{
            fontFamily: 'var(--font-wordmark)',
            fontSize: '1.5rem',
            fontWeight: 400,
            color: 'var(--color-sand)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            DEMARKS<span style={{ color: 'var(--color-amber)' }}>360</span>
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(237,232,223,0.22)',
            marginTop: '0.4rem',
            fontWeight: 500,
          }}>
            Calgary 360 Video Booth
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.78rem',
            color: 'rgba(237,232,223,0.28)',
            marginTop: '1.5rem',
            fontWeight: 400,
            lineHeight: 1.75,
          }}>
            Serving Calgary, Airdrie, Cochrane,<br />
            Chestermere, Okotoks &amp; Rocky View County
          </p>
        </div>

        <div className="footer-links">
          <div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.58rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(237,232,223,0.22)',
              marginBottom: '1rem',
            }}>
              Navigate
            </p>
            {['How It Works', 'Pricing', 'Gallery', 'FAQ'].map(l => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  color: 'rgba(237,232,223,0.40)',
                  textDecoration: 'none',
                  marginBottom: '0.45rem',
                  fontWeight: 400,
                  transition: 'color 0.18s ease',
                }}
              >
                {l}
              </a>
            ))}
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.58rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(237,232,223,0.22)',
              marginBottom: '1rem',
            }}>
              Legal
            </p>
            <Link href="/privacy" style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(237,232,223,0.40)', textDecoration: 'none', marginBottom: '0.45rem', fontWeight: 400 }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(237,232,223,0.40)', textDecoration: 'none', fontWeight: 400, marginBottom: '0.45rem' }}>
              Terms of Service
            </Link>
            <Link href="/admin-login" style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(237,232,223,0.15)', textDecoration: 'none', fontWeight: 400, marginTop: '1rem' }}>
              Admin
            </Link>
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.58rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(237,232,223,0.22)',
              marginBottom: '1rem',
            }}>
              Follow
            </p>
            <a
              href="https://instagram.com/demarks360"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(237,232,223,0.40)', textDecoration: 'none', fontWeight: 400 }}
            >
              @demarks360
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom" style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(237,232,223,0.06)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'rgba(237,232,223,0.18)', fontWeight: 400 }}>
          &copy; {new Date().getFullYear()} Demarks 360. All rights reserved.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'rgba(237,232,223,0.18)', fontWeight: 400 }}>
          Calgary, Alberta, Canada
        </p>
      </div>
    </footer>
  )
}

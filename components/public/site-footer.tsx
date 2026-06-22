import Link from 'next/link'

const bookLinks = [
  { label: 'Check your date', href: '/book' },
  { label: 'Book now', href: '/book' },
  { label: 'Packages', href: '/#dm-packages' },
  { label: 'FAQ', href: '/#dm-faq' },
]

const eventLinks = [
  { label: 'How it works', href: '/#dm-experience' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Birthdays', href: '/book?eventType=Birthday' },
  { label: 'Weddings', href: '/book?eventType=Wedding' },
]

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: 'var(--color-charcoal-2)',
      borderTop: '1px solid var(--color-border-dark)',
    }}>
      <div className="footer-cinema-grid" style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '4.5rem 3rem 3rem',
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
        gap: '3rem',
      }}>
        <div>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--font-wordmark)',
              fontSize: '1.5rem',
              fontWeight: 400,
              color: 'var(--color-sand)',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}>
              Demarks<em style={{ color: 'var(--color-amber-light)', fontStyle: 'italic' }}>360</em>
            </span>
          </Link>
          <p className="t-body-dark" style={{
            color: 'var(--color-muted-light)',
            marginTop: '1.25rem',
            maxWidth: '30ch',
          }}>
            Calgary&apos;s 360 video booth for cinematic slow-motion moments, same-day galleries, and guest-ready clips.
          </p>
        </div>

        <FooterColumn title="Book" links={bookLinks} />
        <FooterColumn title="Events" links={eventLinks} />
        <div>
          <p className="t-label" style={{
            color: 'var(--color-amber)',
            marginBottom: '1rem',
          }}>
            Contact
          </p>
          <FooterAnchor href="mailto:hello@demarks360.com">
            hello@demarks360.com
          </FooterAnchor>
          <FooterAnchor href="https://instagram.com/demarks360" external>
            @demarks360
          </FooterAnchor>
          <FooterAnchor href="/privacy">Privacy policy</FooterAnchor>
          <FooterAnchor href="/terms">Terms of service</FooterAnchor>
          <FooterAnchor href="/admin-login" muted>Admin</FooterAnchor>
        </div>
      </div>

      <div className="footer-cinema-base" style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '1.5rem 3rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        borderTop: '1px solid var(--color-border-dark)',
      }}>
        <p className="t-label" style={{ color: 'var(--color-muted-light)' }}>
          &copy; {year} Demarks 360. All rights reserved.
        </p>
        <p className="t-label" style={{ color: 'var(--color-muted-light)' }}>
          Calgary, Alberta, Canada
        </p>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .footer-cinema-grid {
            grid-template-columns: 1fr 1fr !important;
            padding: 3.5rem 1.5rem 2rem !important;
          }
          .footer-cinema-base {
            padding: 1.5rem !important;
          }
        }
        @media (max-width: 560px) {
          .footer-cinema-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="t-label" style={{
        color: 'var(--color-amber)',
        marginBottom: '1rem',
      }}>
        {title}
      </p>
      {links.map(link => (
        <FooterAnchor key={link.label} href={link.href}>
          {link.label}
        </FooterAnchor>
      ))}
    </div>
  )
}

function FooterAnchor({
  href,
  children,
  external = false,
  muted = false,
}: {
  href: string
  children: React.ReactNode
  external?: boolean
  muted?: boolean
}) {
  const style = {
    display: 'block',
    fontFamily: 'var(--font-body)',
    fontSize: '0.92rem',
    color: muted ? 'var(--color-muted)' : 'var(--color-muted-light)',
    textDecoration: 'none',
    padding: '0.28rem 0',
    fontWeight: 400,
    transition: 'color 0.2s ease',
  }

  if (href.startsWith('/')) {
    return <Link href={href} style={style}>{children}</Link>
  }

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={style}
    >
      {children}
    </a>
  )
}

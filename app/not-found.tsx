import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-charcoal)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.6rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'var(--color-amber)',
        marginBottom: '1.5rem',
      }}>
        404
      </p>
      <h1 style={{
        fontFamily: 'var(--font-wordmark)',
        fontSize: 'clamp(3rem, 8vw, 7rem)',
        fontWeight: 400,
        color: 'var(--color-sand)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        lineHeight: 0.9,
        marginBottom: '1.5rem',
      }}>
        Page Not Found
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.95rem',
        color: 'rgba(237,232,223,0.38)',
        marginBottom: '2.5rem',
        maxWidth: '380px',
        lineHeight: 1.75,
        fontWeight: 400,
      }}>
        This page doesn&apos;t exist or has been moved. Let&apos;s get you back.
      </p>
      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  )
}

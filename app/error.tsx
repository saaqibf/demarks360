'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

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
        Something went wrong
      </p>
      <h1 style={{
        fontFamily: 'var(--font-wordmark)',
        fontSize: 'clamp(2rem, 5vw, 4rem)',
        fontWeight: 400,
        color: 'var(--color-sand)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        lineHeight: 0.9,
        marginBottom: '1.5rem',
      }}>
        Unexpected Error
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.9rem',
        color: 'rgba(237,232,223,0.62)',
        marginBottom: '2.5rem',
        maxWidth: '360px',
        lineHeight: 1.75,
        fontWeight: 400,
      }}>
        Something went wrong on our end. Try again, or head back home.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={reset} className="btn-primary">
          Try Again
        </button>
        <a href="/" className="btn-secondary btn-secondary--dark">
          Back to Home
        </a>
      </div>
    </div>
  )
}

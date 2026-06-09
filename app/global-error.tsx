'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <main style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
          background: 'var(--color-ink, #0a0a0a)',
          color: 'var(--color-text, #f5f0ea)',
          fontFamily: 'var(--font-ui, system-ui, sans-serif)',
        }}>
          <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
            <p style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-crimson, #c0293a)',
              marginBottom: '0.75rem',
            }}>
              Something went wrong
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display, Georgia, serif)',
              fontSize: '2rem',
              fontWeight: 400,
              marginBottom: '1rem',
            }}>
              We could not load this page.
            </h1>
            <button
              onClick={reset}
              style={{
                background: 'var(--color-crimson, #c0293a)',
                color: '#fff',
                border: 'none',
                padding: '0.7rem 1.4rem',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}

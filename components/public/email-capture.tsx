'use client'

import { useState } from 'react'

export function EmailCapture() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Something went wrong. Try again.')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{
      background: 'var(--color-charcoal-3)',
      borderTop: '1px solid var(--color-border-dark)',
      borderBottom: '1px solid var(--color-border-dark)',
    }}>
      <div className="email-capture-inner" style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '4rem 3rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: '3rem',
      }}>
        <div>
          <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '0.9rem' }}>
            Stay in the loop
          </p>
          <h3 className="t-subheading" style={{ color: 'var(--color-sand)' }}>
            Not ready? <em>Stay in the loop.</em>
          </h3>
          <p className="t-body-dark" style={{
            color: 'var(--color-muted-light)',
            marginTop: '0.75rem',
          }}>
            Get notified when new dates open up and hear about seasonal promotions.
          </p>
        </div>

        {submitted ? (
          <p className="t-subheading" aria-live="polite" style={{
            color: 'var(--color-sand)',
            fontSize: 'clamp(1.35rem, 2vw, 1.8rem)',
          }}>
            You&apos;re on the list.
          </p>
        ) : (
          <div>
            <form onSubmit={handleSubmit} className="email-capture-form" style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                aria-label="Email address"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  fontWeight: 400,
                  color: 'var(--color-sand)',
                  background: 'color-mix(in srgb, var(--color-charcoal) 74%, transparent)',
                  border: '1px solid var(--color-border-dark)',
                  padding: '0.95rem 1.25rem',
                  width: 'min(100%, 280px)',
                  borderRadius: '999px',
                  minHeight: '44px',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  opacity: loading ? 0.65 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? '...' : 'Notify me'}
              </button>
            </form>
            {error && (
              <p className="t-body-dark" aria-live="polite" style={{
                color: 'var(--color-amber-light)',
                marginTop: '0.75rem',
              }}>
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 820px) {
          .email-capture-inner {
            grid-template-columns: 1fr !important;
            padding: 3.5rem 1.5rem !important;
          }
          .email-capture-form input,
          .email-capture-form button {
            width: 100%;
          }
        }
      `}</style>
    </section>
  )
}

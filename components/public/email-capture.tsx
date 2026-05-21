'use client'

import { useState } from 'react'

export function EmailCapture() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 600)
  }

  return (
    <div style={{
      background: 'var(--color-sand-2)',
      borderTop: '1px solid var(--color-border-light)',
      borderBottom: '1px solid var(--color-border-light)',
      padding: '3.5rem 3rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2.5rem',
        flexWrap: 'wrap',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{ maxWidth: '420px' }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)',
            fontWeight: 400,
            lineHeight: 1.2,
            color: 'var(--color-charcoal)',
            letterSpacing: '-0.01em',
            marginBottom: '0.4rem',
          }}>
            Not ready to book yet?
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--color-muted)',
            lineHeight: 1.65,
          }}>
            Be first to hear when dates open up and when we run early-booking offers.
          </p>
        </div>

        {submitted ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.9rem 1.75rem',
            background: 'var(--color-sand-3)',
            border: '1px solid var(--color-border-light)',
            borderRadius: '9999px',
          }}>
            <span style={{ color: 'var(--color-amber)', fontSize: '1rem' }}>✓</span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--color-charcoal)',
            }}>
              You&apos;re on the list.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                fontWeight: 400,
                color: 'var(--color-charcoal)',
                background: 'var(--color-sand-3)',
                border: '1.5px solid rgba(26,23,20,0.2)',
                borderRadius: '9999px',
                padding: '0.85rem 1.5rem',
                outline: 'none',
                minWidth: '220px',
                minHeight: '44px',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--color-sand)',
                background: loading ? 'var(--color-muted)' : 'var(--color-charcoal)',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.85rem 1.75rem',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'background 0.2s ease',
                whiteSpace: 'nowrap',
                minHeight: '44px',
              }}
            >
              {loading ? 'Saving…' : 'Notify Me'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

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
      background: 'var(--color-charcoal-3)',
      borderTop: '1px solid rgba(237,232,223,0.06)',
      borderBottom: '1px solid rgba(237,232,223,0.06)',
      padding: '4rem 3rem',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '3rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(237,232,223,0.25)',
            marginBottom: '0.75rem',
          }}>
            Stay in the Loop
          </p>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            color: 'var(--color-sand)',
            letterSpacing: '0.01em',
            textTransform: 'uppercase',
          }}>
            Not ready to book yet?
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'rgba(237,232,223,0.38)',
            lineHeight: 1.7,
            fontWeight: 400,
            marginTop: '0.5rem',
          }}>
            Get notified when new dates open up and hear about seasonal promotions.
          </p>
        </div>

        {submitted ? (
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--color-sand)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            You&apos;re on the list.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0', flexShrink: 0 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 400,
                color: 'var(--color-sand)',
                background: 'rgba(237,232,223,0.07)',
                border: '1.5px solid rgba(237,232,223,0.15)',
                borderRight: 'none',
                padding: '0.9rem 1.25rem',
                outline: 'none',
                width: '260px',
                borderRadius: '3px 0 0 3px',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-charcoal)',
                background: 'var(--color-sand)',
                border: 'none',
                padding: '0.9rem 1.75rem',
                borderRadius: '0 3px 3px 0',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'opacity 0.2s ease',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '...' : 'Notify Me'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

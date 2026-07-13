'use client'
import { useState, useEffect } from 'react'
import { Cookie } from 'lucide-react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) {
      setVisible(true)
      const id = requestAnimationFrame(() => setEntered(true))
      return () => cancelAnimationFrame(id)
    }
  }, [])

  function accept() {
    setEntered(false)
    localStorage.setItem('cookie-consent', 'true')
    setTimeout(() => setVisible(false), 260)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      style={{
        position: 'fixed', bottom: '1.15rem', left: '1.15rem', zIndex: 1000,
        width: 'min(320px, calc(100vw - 2.3rem))',
        background: 'color-mix(in srgb, var(--color-charcoal-2) 94%, transparent)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid color-mix(in srgb, var(--color-amber) 24%, transparent)',
        borderRadius: '15px',
        boxShadow: '0 24px 54px -24px rgba(0,0,0,0.78), inset 0 1px 0 rgba(255,240,215,0.05)',
        overflow: 'hidden',
        transform: entered ? 'translateY(0)' : 'translateY(16px)',
        opacity: entered ? 1 : 0,
        transition: 'transform 0.45s cubic-bezier(.2,.7,.2,1), opacity 0.45s ease',
      }}
    >
      {/* Header: a small film-slate style label with the cookie mark */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.85rem 1.05rem 0.7rem',
        borderBottom: '1px solid color-mix(in srgb, var(--color-amber) 12%, transparent)',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: 'color-mix(in srgb, var(--color-amber) 18%, transparent)',
          color: 'var(--color-amber-light)',
        }}>
          <Cookie size={15} strokeWidth={1.9} />
        </span>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: '0.58rem', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-amber-light)',
        }}>
          A quick note
        </span>
      </div>

      <div style={{ padding: '0.85rem 1.05rem 1rem' }}>
        <p style={{
          margin: '0 0 0.9rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem',
          lineHeight: 1.55, color: 'var(--color-sand)',
        }}>
          A couple of cookies keep your booking and same-day gallery running. That is the whole reel.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={accept}
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(180deg, var(--color-amber-light) 0%, var(--color-amber) 100%)',
              color: 'var(--color-charcoal)',
              border: 'none', padding: '0.62rem 1rem', borderRadius: '999px', lineHeight: 1,
              fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: 'inset 0 1px 0 rgba(255,248,235,0.55), 0 8px 20px -8px rgba(201,145,63,0.55)',
              transition: 'transform 0.3s cubic-bezier(.2,.7,.2,1), box-shadow 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,248,235,0.65), 0 12px 26px -8px rgba(232,178,92,0.65)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,248,235,0.55), 0 8px 20px -8px rgba(201,145,63,0.55)' }}
          >
            Roll with it
          </button>
          <a
            href="/privacy"
            style={{
              flexShrink: 0, fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-muted-light)',
              textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.3s ease, color 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-amber-light)'; e.currentTarget.style.borderBottomColor = 'var(--color-amber-light)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted-light)'; e.currentTarget.style.borderBottomColor = 'transparent' }}
          >
            Privacy
          </a>
        </div>
      </div>
    </div>
  )
}

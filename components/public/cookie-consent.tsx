'use client'
import { useState, useEffect } from 'react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) {
      setVisible(true)
      // next frame so the entrance transition actually plays
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
        position: 'fixed', bottom: '1.25rem', left: '1.25rem', zIndex: 1000,
        width: 'min(320px, calc(100vw - 2.5rem))',
        background: 'color-mix(in srgb, var(--color-charcoal-2) 90%, transparent)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid color-mix(in srgb, var(--color-amber) 22%, transparent)',
        borderRadius: '14px',
        boxShadow: '0 18px 50px -20px rgba(0,0,0,0.7)',
        padding: '1rem 1.15rem 1.05rem',
        color: 'var(--color-muted-light)',
        transform: entered ? 'translateY(0)' : 'translateY(14px)',
        opacity: entered ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(.2,.7,.2,1), opacity 0.4s ease',
      }}
    >
      <p style={{
        margin: 0, fontFamily: 'var(--font-body)', fontSize: '0.8rem', lineHeight: 1.55,
        color: 'var(--color-sand)',
      }}>
        We use a few cookies to keep bookings and the site working. That is it.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.85rem' }}>
        <button
          onClick={accept}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(180deg, var(--color-amber-light) 0%, var(--color-amber) 100%)',
            color: 'var(--color-charcoal)',
            border: 'none', padding: '0.62rem 1.5rem', borderRadius: '999px', lineHeight: 1,
            fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
            boxShadow: 'inset 0 1px 0 rgba(255,248,235,0.55), 0 8px 20px -8px rgba(201,145,63,0.55)',
            transition: 'transform 0.3s cubic-bezier(.2,.7,.2,1), box-shadow 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,248,235,0.6), 0 12px 28px -8px rgba(232,178,92,0.6)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,248,235,0.55), 0 8px 20px -8px rgba(201,145,63,0.55)' }}
        >
          Sounds good
        </button>
        <a
          href="/privacy"
          style={{
            fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-muted-light)',
            textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.3s ease, color 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-amber-light)'; e.currentTarget.style.borderBottomColor = 'var(--color-amber-light)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted-light)'; e.currentTarget.style.borderBottomColor = 'transparent' }}
        >
          Privacy
        </a>
      </div>
    </div>
  )
}

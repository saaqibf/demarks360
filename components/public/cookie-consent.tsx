'use client'
import { useState, useEffect } from 'react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      style={{
        position: 'fixed', bottom: '1rem', left: '1rem',
        zIndex: 1000, background: 'color-mix(in srgb, var(--color-charcoal-2) 92%, transparent)',
        backdropFilter: 'blur(6px)', color: 'var(--color-muted-light)',
        fontFamily: 'var(--font-ui)', fontSize: '0.6rem', letterSpacing: '0.05em',
        padding: '0.4rem 0.5rem 0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
        borderRadius: '999px', whiteSpace: 'nowrap', border: '1px solid var(--color-border-dark)',
        maxWidth: 'calc(100vw - 2rem)',
      }}
    >
      <span>We use cookies to make this site work.</span>
      <button
        onClick={accept}
        aria-label="Accept cookies"
        style={{
          background: 'var(--color-amber-light)',
          color: 'var(--color-charcoal)', border: 'none', padding: '0.3rem 0.75rem',
          borderRadius: '999px', flexShrink: 0,
          fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
        }}
      >
        OK
      </button>
    </div>
  )
}

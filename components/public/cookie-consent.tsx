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
        position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, background: '#0F0F0F', color: 'rgba(255,255,255,0.65)',
        fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.06em',
        padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
        borderRadius: '2px', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span>We use cookies to make this site work.</span>
      <button
        onClick={accept}
        aria-label="Accept cookies"
        style={{
          background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
          color: '#fff', border: 'none', padding: '0.4rem 1rem',
          fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
        }}
      >
        OK
      </button>
    </div>
  )
}

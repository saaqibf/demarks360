'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(true) // hero at top is always dark
  const [active, setActive] = useState('')

  // Sample the background color of whatever section sits just below the nav.
  // getComputedStyle().backgroundColor always returns a solid rgba — gradients
  // appear as rgba(0,0,0,0) so we skip them and find the first opaque element.
  const detectTheme = useCallback(() => {
    try {
      const els = document.elementsFromPoint(window.innerWidth / 2, 80)
      for (const el of els) {
        const s = window.getComputedStyle(el)
        if (s.position === 'fixed') continue
        const bg = s.backgroundColor
        if (!bg || bg === 'rgba(0, 0, 0, 0)') continue
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (m) {
          const lum = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255
          setIsDark(lum < 0.55)
          return
        }
      }
    } catch { /* ssr safety */ }
  }, [])

  useEffect(() => {
    const t = setTimeout(detectTheme, 120)
    window.addEventListener('scroll', detectTheme, { passive: true })
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', detectTheme)
    }
  }, [detectTheme])

  useEffect(() => {
    const ids = ['how-it-works', 'pricing', 'gallery', 'faq']
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-20% 0px -60% 0px' }
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  const links = ['How It Works', 'Pricing', 'Gallery', 'FAQ']

  const logoColor   = isDark ? '#EDE8DF' : 'var(--color-charcoal)'
  const linkColor   = isDark ? 'rgba(237,232,223,0.55)' : 'rgba(26,23,20,0.45)'
  const activeColor = isDark ? '#EDE8DF' : 'var(--color-charcoal)'
  const barColor    = isDark ? '#EDE8DF' : 'var(--color-charcoal)'

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 1000,
      pointerEvents: 'none', // transparent to clicks; restored on interactive children
    }}>
      <nav style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        padding: '0 3rem',
        gap: '2rem',
        pointerEvents: 'auto',
      }}>

        {/* Wordmark */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-wordmark)',
            fontSize: '1.55rem',
            fontWeight: 400,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: logoColor,
            lineHeight: 1,
            transition: 'color 0.4s ease',
          }}>
            DEMARKS<span style={{ color: 'var(--color-amber)' }}>360</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2.25rem' }}>
          {links.map(label => {
            const id = label.toLowerCase().replace(/\s+/g, '-')
            const isActive = active === id
            return (
              <a
                key={label}
                href={`#${id}`}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.68rem',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: isActive ? activeColor : linkColor,
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  paddingBottom: '3px',
                }}
              >
                {label}
                {isActive && (
                  <span style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '1.5px', background: 'var(--color-amber)',
                    borderRadius: '1px',
                  }} />
                )}
              </a>
            )
          })}

          <Link href="/admin-login" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.68rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: linkColor,
            textDecoration: 'none',
            transition: 'color 0.3s ease',
            opacity: 0.6,
            whiteSpace: 'nowrap',
          }}>
            Admin
          </Link>
        </div>

        {/* Book Now + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <Link
            href="/book"
            className="nav-book-btn"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'inline-block',
              padding: '0.65rem 1.75rem',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
              transition: 'background 0.4s ease, color 0.4s ease, border-color 0.4s ease',
              background: isDark ? 'transparent' : 'var(--color-charcoal)',
              color: isDark ? '#EDE8DF' : 'var(--color-sand)',
              border: `1.5px solid ${isDark ? 'rgba(237,232,223,0.38)' : 'transparent'}`,
            }}
          >
            Book Now
          </Link>

          <button
            onClick={() => setOpen(o => !o)}
            className="nav-hamburger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', padding: '0.5rem',
              display: 'none', minHeight: '44px',
              alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '5px',
            }}
          >
            <span style={{ display: 'block', width: '22px', height: '1.5px', background: barColor, transition: 'background 0.4s ease' }} />
            <span style={{ display: 'block', width: '16px', height: '1.5px', background: barColor, transition: 'background 0.4s ease' }} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer — always cream, independent of section theme */}
      {open && (
        <div style={{
          background: 'rgba(247,244,239,0.99)',
          borderBottom: '1px solid rgba(26,23,20,0.1)',
          backdropFilter: 'blur(16px)',
          pointerEvents: 'auto',
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.5rem 1.5rem 1rem' }}>
            {links.map(label => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-charcoal)',
                  textDecoration: 'none',
                  padding: '0.85rem 0',
                  borderBottom: '1px solid rgba(26,23,20,0.07)',
                }}
              >
                {label}
              </a>
            ))}
            <Link
              href="/admin-login"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-charcoal)',
                textDecoration: 'none',
                padding: '0.85rem 0',
                borderBottom: '1px solid rgba(26,23,20,0.07)',
                opacity: 0.45,
              }}
            >
              Admin
            </Link>
            <div style={{ paddingTop: '1rem' }}>
              <Link href="/book" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                Book Now
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-book-btn { display: none !important; }
        }
      `}</style>
    </header>
  )
}

'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

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

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 1000,
      pointerEvents: 'none',
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
        background: 'rgba(12,8,8,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(237,232,223,0.06)',
      }}>

        {/* Wordmark */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-wordmark)',
            fontSize: '1.55rem',
            fontWeight: 400,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#EDE8DF',
            lineHeight: 1,
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
                  color: isActive ? '#EDE8DF' : 'rgba(237,232,223,0.45)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
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
            color: 'rgba(237,232,223,0.25)',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
            whiteSpace: 'nowrap',
          }}>
            Admin
          </Link>
        </div>

        {/* Book CTA + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <Link
            href="/book"
            className="nav-book-btn"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'inline-block',
              padding: '0.65rem 1.75rem',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s ease, color 0.2s ease',
              background: 'var(--color-amber)',
              color: '#fff',
              border: 'none',
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
            <span style={{ display: 'block', width: '22px', height: '1.5px', background: '#EDE8DF' }} />
            <span style={{ display: 'block', width: '16px', height: '1.5px', background: '#EDE8DF' }} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div style={{
          background: 'rgba(12,8,8,0.97)',
          borderBottom: '1px solid rgba(237,232,223,0.08)',
          backdropFilter: 'blur(20px)',
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
                  color: 'rgba(237,232,223,0.7)',
                  textDecoration: 'none',
                  padding: '0.85rem 0',
                  borderBottom: '1px solid rgba(237,232,223,0.07)',
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
                color: 'rgba(237,232,223,0.25)',
                textDecoration: 'none',
                padding: '0.85rem 0',
                borderBottom: '1px solid rgba(237,232,223,0.07)',
              }}
            >
              Admin
            </Link>
            <div style={{ paddingTop: '1rem' }}>
              <Link href="/book" style={{
                display: 'block',
                textAlign: 'center',
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#fff',
                background: 'var(--color-amber)',
                padding: '0.85rem',
                borderRadius: '3px',
                textDecoration: 'none',
              }}>
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

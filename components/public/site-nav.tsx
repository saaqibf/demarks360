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
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
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
        background: 'color-mix(in srgb, var(--color-charcoal) 82%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border-dark)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-wordmark)',
            fontSize: '1.45rem',
            fontWeight: 400,
            letterSpacing: '0.04em',
            color: 'var(--color-sand)',
            lineHeight: 1,
          }}>
            Demarks<em style={{ color: 'var(--color-amber-light)', fontStyle: 'italic' }}>360</em>
          </span>
        </Link>

        <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2.25rem' }}>
          {links.map(label => {
            const id = label.toLowerCase().replace(/\s+/g, '-')
            const isActive = active === id
            return (
              <a
                key={label}
                href={`#${id}`}
                className="nav-link"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.68rem',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--color-sand)' : 'var(--color-muted-light)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  paddingBottom: '3px',
                }}
              >
                {label}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'var(--color-amber-light)',
                  }} />
                )}
              </a>
            )
          })}

          <Link href="/admin-login" className="nav-link" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.68rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-muted-light)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            opacity: 0.55,
          }}>
            Admin
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <Link href="/book" className="btn-primary nav-book-btn" style={{
            padding: '0.75rem 1.75rem',
          }}>
            Book now
          </Link>

          <button
            onClick={() => setOpen(o => !o)}
            className="nav-hamburger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'none',
              minHeight: '44px',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            <span style={{ display: 'block', width: '22px', height: '1.5px', background: 'var(--color-sand)' }} />
            <span style={{ display: 'block', width: '16px', height: '1.5px', background: 'var(--color-sand)' }} />
          </button>
        </div>
      </nav>

      {open && (
        <div style={{
          background: 'color-mix(in srgb, var(--color-charcoal) 96%, transparent)',
          borderBottom: '1px solid var(--color-border-dark)',
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
                  color: 'var(--color-sand)',
                  textDecoration: 'none',
                  padding: '0.85rem 0',
                  borderBottom: '1px solid var(--color-border-dark)',
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
                color: 'var(--color-muted-light)',
                textDecoration: 'none',
                padding: '0.85rem 0',
                borderBottom: '1px solid var(--color-border-dark)',
              }}
            >
              Admin
            </Link>
            <div style={{ paddingTop: '1rem' }}>
              <Link href="/book" className="btn-primary" onClick={() => setOpen(false)} style={{
                display: 'block',
                textAlign: 'center',
              }}>
                Book now
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nav-link:hover {
          color: var(--color-sand) !important;
        }
        @media (max-width: 768px) {
          nav {
            padding: 0 1.5rem !important;
          }
          .nav-links-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-book-btn { display: none !important; }
        }
      `}</style>
    </header>
  )
}

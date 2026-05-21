'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const { isSignedIn } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = ['how-it-works', 'pricing', 'gallery', 'faq']
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }) },
      { rootMargin: '-20% 0px -60% 0px' }
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 1000,
    }}>
      {/* Promo bar — always visible at top of fixed header */}
      <div style={{
        background: 'var(--color-charcoal)',
        color: 'rgba(237,232,223,0.7)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.68rem',
        fontWeight: 500,
        letterSpacing: '0.12em',
        textAlign: 'center',
        padding: '0.5rem 1rem',
        textTransform: 'uppercase',
      }}>
        Calgary&apos;s premier 360 video booth.{' '}
        <strong style={{ fontWeight: 700, color: 'var(--color-sand)', letterSpacing: '0.08em' }}>
          Same-day gallery delivery.
        </strong>
      </div>

      {/* Nav bar */}
      <div style={{
        background: scrolled ? 'rgba(247,244,239,0.97)' : 'rgba(247,244,239,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(26,23,20,0.1)' : '1px solid transparent',
        transition: 'background 0.3s ease, border-bottom-color 0.3s ease',
        padding: '0.9rem 1.5rem',
      }}>
        <nav className="nav-grid" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '1rem',
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.55rem',
              fontWeight: 400,
              color: 'var(--color-charcoal)',
              letterSpacing: '-0.01em',
            }}>
              Demarks{' '}
              <span style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>360</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2.25rem' }}>
            {['How It Works', 'Pricing', 'Gallery', 'FAQ'].map((label) => {
              const id = label.toLowerCase().replace(/\s+/g, '-')
              return (
                <a
                  key={label}
                  href={`#${id}`}
                  className={`nav-link${active === id ? ' nav-link-active' : ''}`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.82rem',
                    fontWeight: active === id ? 700 : 500,
                    color: active === id ? 'var(--color-charcoal)' : 'var(--color-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </a>
              )
            })}
            <Link
                href="/admin-login"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: 'var(--color-muted)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Admin
              </Link>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}>

            <button
              onClick={() => setOpen(!open)}
              className="nav-hamburger"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-charcoal)',
                cursor: 'pointer',
                padding: '0.4rem',
                display: 'none',
                minHeight: '44px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link href="/book" className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.6rem 1.5rem' }}>
              Book Now
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div style={{
          background: 'rgba(247,244,239,0.98)',
          borderBottom: '1px solid rgba(26,23,20,0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.5rem 1.5rem 0.75rem' }}>
            {['How It Works', 'Pricing', 'Gallery', 'FAQ'].map((label) => {
              const id = label.toLowerCase().replace(/\s+/g, '-')
              return (
                <a
                  key={label}
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--color-charcoal)',
                    textDecoration: 'none',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid rgba(26,23,20,0.07)',
                  }}
                >
                  {label}
                </a>
              )
            })}
            <div style={{ paddingTop: '0.75rem' }}>
              <Link href="/book" className="btn-primary" style={{ display: 'block', textAlign: 'center', fontSize: '0.9rem' }}>
                Book Now
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-grid { grid-template-columns: auto 1fr !important; }
        }
      `}</style>
    </header>
  )
}

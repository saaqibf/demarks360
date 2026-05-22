'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <div style={{
        background: scrolled ? 'rgba(247,244,239,0.97)' : 'rgba(247,244,239,0.80)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(26,23,20,0.12)' : 'transparent'}`,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        <nav style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
          padding: '0 3rem',
          gap: '2rem',
        }}>
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.45rem',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--color-charcoal)',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}>
              Demarks <span style={{ color: 'var(--color-amber)' }}>360</span>
            </span>
          </Link>

          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            {links.map(label => {
              const id = label.toLowerCase().replace(/\s+/g, '-')
              return (
                <a
                  key={label}
                  href={`#${id}`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.68rem',
                    fontWeight: active === id ? 700 : 500,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: active === id ? 'var(--color-charcoal)' : 'var(--color-muted)',
                    textDecoration: 'none',
                    transition: 'color 0.18s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </a>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
            <Link href="/book" className="btn-primary nav-book-btn" style={{ padding: '0.65rem 1.75rem', fontSize: '0.68rem' }}>
              Book Now
            </Link>
            <button
              onClick={() => setOpen(o => !o)}
              className="nav-hamburger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              style={{
                background: 'none', border: 'none',
                color: 'var(--color-charcoal)', cursor: 'pointer',
                padding: '0.5rem', display: 'none',
                minHeight: '44px', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '5px',
              }}
            >
              <span style={{ display: 'block', width: '22px', height: '1.5px', background: 'var(--color-charcoal)' }} />
              <span style={{ display: 'block', width: '16px', height: '1.5px', background: 'var(--color-charcoal)' }} />
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <div style={{
          background: 'rgba(247,244,239,0.99)',
          borderBottom: '1px solid rgba(26,23,20,0.1)',
          backdropFilter: 'blur(16px)',
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

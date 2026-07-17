'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const onBookPage = pathname === '/book'

  // The bar stays pinned at all times so navigation is always one tap away; it
  // only shifts from transparent to a light frosted state once you leave the top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = ['dm-experience', 'dm-packages', 'dm-gallery', 'dm-faq']
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-20% 0px -60% 0px' }
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  const links = [
    { label: 'Experience', id: 'dm-experience' },
    { label: 'Packages', id: 'dm-packages' },
    { label: 'Gallery', id: 'dm-gallery' },
    { label: 'FAQ', id: 'dm-faq' },
  ]

  return (
    <header
      className={[
        'dm-nav-header',
        scrolled ? 'dm-nav--scrolled' : '',
      ].filter(Boolean).join(' ')}
      style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      pointerEvents: 'none',
      // The bar itself is invisible: no panel, no blur, no border. Only a soft
      // top-down scrim keeps the floating nav legible over whatever is behind
      // it, applied the whole way down (a touch lighter once you have scrolled).
      background: scrolled
        ? 'linear-gradient(180deg, rgba(16,12,6,0.5) 0%, rgba(16,12,6,0.15) 55%, rgba(16,12,6,0) 100%)'
        : 'linear-gradient(180deg, rgba(16,12,6,0.66) 0%, rgba(16,12,6,0.28) 44%, rgba(16,12,6,0) 100%)',
      paddingBottom: '2.4rem',
      transition: 'background 0.5s ease',
    }}>
      <nav className="dm-nav-bar" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        padding: '0 3rem',
        gap: '2rem',
        pointerEvents: 'auto',
        background: 'transparent',
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
          {links.map(({ label, id }) => {
            const isActive = active === id
            return (
              <a
                key={id}
                href={`/#${id}`}
                className="dm-nav-link"
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

        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          {!onBookPage && (
            <Link href="/book" className="btn-primary nav-book-btn" style={{
              padding: '0.75rem 1.75rem',
            }}>
              Request a quote
            </Link>
          )}

          <button
            onClick={() => setOpen(o => !o)}
            className="dm-nav-hamburger"
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
            {links.map(({ label, id }) => (
              <a
                key={id}
                href={`/#${id}`}
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
            {!onBookPage && (
              <div style={{ paddingTop: '1rem' }}>
                <Link href="/book" className="btn-primary" onClick={() => setOpen(false)} style={{
                  display: 'block',
                  textAlign: 'center',
                }}>
                  Request a quote
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  )
}

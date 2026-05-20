'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const { sessionClaims } = useAuth()
  const isAdmin = (sessionClaims?.metadata as { role?: string } | undefined)?.role === 'admin'

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
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1.25rem', paddingLeft: '1rem', paddingRight: '1rem', position: 'relative', zIndex: 100 }}>
      <nav style={{
        background: 'rgba(8,8,8,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '9999px',
        padding: '0.45rem 0.45rem 0.45rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '760px',
        position: 'relative',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.15rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#fff',
          }}>
            DEMARKS <span style={{ color: 'var(--color-crimson)' }}>360</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginLeft: '2.5rem' }} className="nav-links-desktop">
          {['How It Works', 'Pricing', 'Gallery', 'FAQ'].map((label) => {
            const id = label.toLowerCase().replace(/\s+/g, '-')
            return (
              <a
                key={label}
                href={`#${id}`}
                className={`nav-link${active === id ? ' nav-link-active' : ''}`}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: active === id ? 'var(--color-crimson)' : 'rgba(245,240,234,0.55)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </a>
            )
          })}
        </div>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Admin shortcut — only visible when signed in as admin */}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-crimson)',
                textDecoration: 'none',
                padding: '0.35rem 0.75rem',
                border: '1px solid rgba(192,41,58,0.35)',
                borderRadius: '9999px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              Admin ⟶
            </Link>
          )}
          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="nav-hamburger"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(245,240,234,0.7)',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'none',
            }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link
            href="/book"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#fff',
              background: 'var(--color-crimson)',
              padding: '0.55rem 1.35rem',
              borderRadius: '9999px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Book Now
            <span style={{
              width: '20px', height: '20px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem',
            }}>→</span>
          </Link>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'rgba(14,14,14,0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1rem',
            padding: '0.75rem',
            zIndex: 200,
          }}>
            {['How It Works', 'Pricing', 'Gallery', 'FAQ'].map((label) => {
              const id = label.toLowerCase().replace(/\s+/g, '-')
              return (
                <a
                  key={label}
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className="nav-link"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: active === id ? 'var(--color-crimson)' : 'rgba(245,240,234,0.7)',
                    textDecoration: 'none',
                    padding: '0.65rem 1rem',
                    borderRadius: '0.5rem',
                  }}
                >
                  {label}
                </a>
              )
            })}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

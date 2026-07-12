'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { LayoutDashboard, CalendarDays, BookOpen } from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/admin/availability', label: 'Availability', icon: CalendarDays },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Admin' : ''

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      background: 'var(--color-ink)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-text-light)' }}>
          DEMARKS <span style={{ color: 'var(--color-amber)' }}>360</span>
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.25)', marginTop: '0.2rem' }}>
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                marginBottom: '4px',
                textDecoration: 'none',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                fontWeight: active ? 700 : 500,
                letterSpacing: '0.04em',
                color: active ? 'var(--color-text-light)' : 'rgba(245,240,234,0.45)',
                background: active
                  ? 'color-mix(in srgb, var(--color-amber) 12%, transparent)'
                  : 'transparent',
                border: active
                  ? '1px solid color-mix(in srgb, var(--color-amber) 24%, transparent)'
                  : '1px solid transparent',
                transition: 'color 0.25s ease, background 0.25s ease, border-color 0.25s ease',
              }}
            >
              <Icon size={15} style={{ flexShrink: 0, color: active ? 'var(--color-amber)' : 'rgba(245,240,234,0.3)' }} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <UserButton />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.55)', fontWeight: 500 }}>{displayName}</span>
      </div>
    </aside>
  )
}

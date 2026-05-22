import Link from 'next/link'
import { LayoutDashboard, CalendarDays, BookOpen } from 'lucide-react'

const NAV = [
  { href: '/preview/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/preview/bookings/detail', label: 'Booking Detail', icon: BookOpen },
  { href: '/preview/availability', label: 'Availability', icon: CalendarDays },
]

function PreviewSidebar() {
  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      background: 'var(--color-sand-2)',
      borderRight: '1px solid var(--color-border-light)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--color-border-light)' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-charcoal)' }}>
          DEMARKS <span style={{ color: 'var(--color-crimson)' }}>360</span>
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
          Admin Panel
        </p>
      </div>

      <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 0.75rem',
              borderRadius: '6px',
              marginBottom: '2px',
              textDecoration: 'none',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: 'var(--color-muted)',
              transition: 'all 0.15s',
            }}
          >
            <Icon size={14} style={{ flexShrink: 0, color: 'var(--color-muted-light)' }} />
            {label}
          </Link>
        ))}
      </nav>

      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border-light)' }}>
        <span style={{
          display: 'inline-block',
          padding: '0.25rem 0.65rem',
          background: 'rgba(192,41,58,0.08)',
          border: '1px solid rgba(192,41,58,0.25)',
          borderRadius: '4px',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.5rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-crimson)',
        }}>
          Preview Mode
        </span>
      </div>
    </aside>
  )
}

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-sand)' }}>
      <PreviewSidebar />
      <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}

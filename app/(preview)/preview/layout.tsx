import Link from 'next/link'
import { LayoutDashboard, CalendarDays, BookOpen } from 'lucide-react'

const NAV = [
  { href: '/preview/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/preview/bookings/detail', label: 'Booking Detail', icon: BookOpen },
  { href: '/preview/availability', label: 'Availability', icon: CalendarDays },
]

function PreviewSidebar() {
  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar-head">
        <p className="adm-sidebar-brand">DEMARKS <span>360</span></p>
        <p className="adm-sidebar-sub">Admin Panel</p>
      </div>

      <nav className="adm-sidebar-nav">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="adm-navlink">
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="adm-sidebar-foot">
        <span style={{
          display: 'inline-block',
          padding: '0.25rem 0.65rem',
          background: 'color-mix(in srgb, var(--adm-accent-2) 15%, transparent)',
          border: '1px solid color-mix(in srgb, var(--adm-accent-2) 40%, transparent)',
          borderRadius: '999px',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.5rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--adm-accent)',
        }}>
          Preview Mode
        </span>
      </div>
    </aside>
  )
}

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-shell" style={{ display: 'flex', minHeight: '100vh' }}>
      <PreviewSidebar />
      <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}

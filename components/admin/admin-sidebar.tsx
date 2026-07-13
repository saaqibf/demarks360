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
    <aside className="adm-sidebar">
      {/* Logo */}
      <div className="adm-sidebar-head">
        <p className="adm-sidebar-brand">DEMARKS <span>360</span></p>
        <p className="adm-sidebar-sub">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="adm-sidebar-nav">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={active ? 'adm-navlink adm-navlink--active' : 'adm-navlink'}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="adm-sidebar-foot">
        <UserButton />
        <span className="adm-sidebar-username">{displayName}</span>
      </div>
    </aside>
  )
}

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') redirect('/')
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-ink)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}

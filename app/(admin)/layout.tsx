import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims, userId } = await auth()

  if (!userId) redirect('/admin-login')

  // Check 1: Clerk publicMetadata role
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') {
    // Check 2: ADMIN_EMAIL env var fallback (set this in Vercel project settings)
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      const user = await currentUser()
      const userEmail = user?.primaryEmailAddress?.emailAddress
      if (userEmail !== adminEmail) redirect('/admin-login?error=unauthorized')
    } else {
      redirect('/admin-login?error=unauthorized')
    }
  }

  return (
    <div className="adm-shell" style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}

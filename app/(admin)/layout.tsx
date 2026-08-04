import { auth, currentUser } from '@clerk/nextjs/server'
import { ClerkProvider } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { ADMIN_EMAILS, isAdminEmail } from '@/lib/admin-emails'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims, userId } = await auth()

  if (!userId) redirect('/admin-login')

  // Check 1: Clerk publicMetadata role
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') {
    // Check 2: ADMIN_EMAIL allow-list fallback (one or more comma-separated
    // addresses, set in Vercel project settings).
    if (!process.env.ADMIN_EMAIL || ADMIN_EMAILS.length === 0) {
      redirect('/admin-login?error=unauthorized')
    }
    const user = await currentUser()
    if (!isAdminEmail(user?.primaryEmailAddress?.emailAddress)) {
      redirect('/admin-login?error=unauthorized')
    }
  }

  return (
    <ClerkProvider>
      <div className="adm-shell" style={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
          {children}
        </main>
      </div>
    </ClerkProvider>
  )
}

import { auth, currentUser } from '@clerk/nextjs/server'

import { isAdminEmail } from '@/lib/admin-emails'

type ClerkRoleSource = {
  publicMetadata?: { role?: unknown }
  privateMetadata?: { role?: unknown }
  metadata?: { role?: unknown }
  org_role?: unknown
  orgRole?: unknown
  role?: unknown
}

function isAdminValue(value: unknown): boolean {
  return value === 'admin' || value === 'org:admin'
}

export function hasAdminRole(source: ClerkRoleSource | null | undefined): boolean {
  if (!source) return false
  return [
    source.publicMetadata?.role,
    source.privateMetadata?.role,
    source.metadata?.role,
    source.org_role,
    source.orgRole,
    source.role,
  ].some(isAdminValue)
}

// Same policy as proxy.ts and the (admin) layout: a Clerk admin role OR a primary
// email on the ADMIN_EMAIL allow-list. The API routes must agree with the pages,
// or an allow-listed operator can see requests but every action 403s.
export function isAdminUser(
  user: (ClerkRoleSource & { primaryEmailAddress?: { emailAddress: string } | null }) | null | undefined,
): boolean {
  if (!user) return false
  return hasAdminRole(user) || isAdminEmail(user.primaryEmailAddress?.emailAddress)
}

export async function getRole(): Promise<string | undefined> {
  const { sessionClaims, orgRole } = await auth()
  if (hasAdminRole({ ...sessionClaims, orgRole })) return 'admin'

  if (isAdminUser(await currentUser())) return 'admin'

  return undefined
}

export async function isAdmin(): Promise<boolean> {
  return (await getRole()) === 'admin'
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error('Unauthorized: admin role required')
}

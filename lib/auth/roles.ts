import { auth, currentUser } from '@clerk/nextjs/server'

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

export async function getRole(): Promise<string | undefined> {
  const { sessionClaims, orgRole } = await auth()
  if (hasAdminRole({ ...sessionClaims, orgRole })) return 'admin'

  const user = await currentUser()
  if (hasAdminRole(user)) return 'admin'

  return undefined
}

export async function isAdmin(): Promise<boolean> {
  return (await getRole()) === 'admin'
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error('Unauthorized: admin role required')
}

import { auth } from '@clerk/nextjs/server'

export async function getRole(): Promise<string | undefined> {
  const { sessionClaims } = await auth()
  return (sessionClaims?.metadata as { role?: string } | undefined)?.role
}

export async function isAdmin(): Promise<boolean> {
  return (await getRole()) === 'admin'
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error('Unauthorized: admin role required')
}

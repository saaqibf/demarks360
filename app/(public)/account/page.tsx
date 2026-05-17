import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  return (
    <main className="min-h-screen p-8">
      <h1 className="font-display text-4xl">My Account</h1>
      <p className="mt-2 text-muted-foreground">Welcome, {user.firstName}</p>
    </main>
  )
}

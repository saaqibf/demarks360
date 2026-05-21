import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SignOutButton } from './sign-out-button'

export default async function AccountPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-sand)', padding: '7rem 3rem 3rem' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ display: 'inline-block', width: '24px', height: '1.5px', background: 'var(--color-amber)' }} />
        Account
      </p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 0.9, color: 'var(--color-charcoal)', marginBottom: '0.75rem' }}>
        My Account
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', fontWeight: 400 }}>
        Welcome back, {user.firstName}
      </p>
      <SignOutButton />
    </main>
  )
}

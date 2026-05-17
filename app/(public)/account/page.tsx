import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-ink)', padding: '3rem' }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-crimson)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ display: 'inline-block', width: '24px', height: '1.5px', background: 'var(--color-crimson)' }} />
        Account
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, letterSpacing: '0.01em', lineHeight: 0.9, textTransform: 'uppercase', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
        My Account
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'rgba(245,240,234,0.45)', fontWeight: 300 }}>
        Welcome back, {user.firstName}
      </p>
    </main>
  )
}

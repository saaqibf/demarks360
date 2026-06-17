import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SiteFooter } from '@/components/public/site-footer'
import { SiteNav } from '@/components/public/site-nav'
import { SignOutButton } from './sign-out-button'

export default async function AccountPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  return (
    <>
      <SiteNav />
      <main style={{ minHeight: '100vh', background: 'var(--color-ink)', padding: '7rem 3rem 4rem' }}>
        <section style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p className="t-label" style={{ color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ display: 'inline-block', width: '24px', height: '1.5px', background: 'var(--color-amber)' }} />
            Account
          </p>
          <h1 className="t-heading" style={{ color: 'var(--color-text-light)', marginBottom: '0.75rem' }}>
            My account
          </h1>
          <p className="t-body-dark" style={{ color: 'var(--color-muted-light)', fontWeight: 400 }}>
            Welcome back, {user.firstName ?? 'there'}.
          </p>

          <div style={{
            marginTop: '2.5rem',
            border: '1px solid var(--color-border-dark)',
            background: 'var(--color-surface)',
            padding: '2rem',
          }}>
            <p className="t-subheading" style={{ color: 'var(--color-text-light)', marginBottom: '0.75rem' }}>
              Bookings
            </p>
            <p className="t-body-dark" style={{ color: 'var(--color-muted-light)', marginBottom: '1.5rem' }}>
              Your upcoming and past booking details will appear here once your event is confirmed.
            </p>
            <a href="/book" className="btn-primary">Book again</a>
          </div>

          <SignOutButton />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

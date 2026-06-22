'use client'
import { useUser, useClerk, SignInButton } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function AdminLoginInner() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const params = useSearchParams()
  const unauthorized = params.get('error') === 'unauthorized'

  // Once signed in, try the dashboard — admin layout gates by email/role
  useEffect(() => {
    if (isLoaded && isSignedIn && !unauthorized) {
      router.replace('/admin/dashboard')
    }
  }, [isLoaded, isSignedIn, unauthorized, router])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-ink)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: 'var(--font-body)',
    }}>
      <p style={{
        fontFamily: 'var(--font-wordmark)',
        fontSize: '1.45rem',
        fontWeight: 400,
        letterSpacing: '0.04em',
        color: 'var(--color-sand)',
        lineHeight: 1,
        marginBottom: '3rem',
      }}>
        Demarks<em style={{ color: 'var(--color-amber-light)', fontStyle: 'italic' }}>360</em>
      </p>

      <div style={{
        width: '100%', maxWidth: '340px',
        background: 'var(--color-surface)', border: '1px solid var(--color-border-dark)',
        borderRadius: '8px', padding: '2.5rem 2rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '0.5rem' }}>
            Admin Access
          </p>
          <h1 className="t-subheading" style={{ color: 'var(--color-text-light)', lineHeight: 1, margin: 0 }}>
            Dashboard
          </h1>
        </div>

        {!isLoaded && (
          <div style={{
            width: '100%', background: 'var(--color-surface-2)',
            borderRadius: '8px', padding: '0.9rem', textAlign: 'center',
            color: 'var(--color-muted-light)', fontSize: '0.75rem', letterSpacing: '0.1em',
          }}>
            Loading…
          </div>
        )}

        {isLoaded && !isSignedIn && (
          <SignInButton mode="modal" forceRedirectUrl="/admin/dashboard">
            <button className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              Sign in as Admin
            </button>
          </SignInButton>
        )}

        {isLoaded && isSignedIn && unauthorized && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-muted-light)', lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: 'var(--color-text-light)' }}>
                {user?.primaryEmailAddress?.emailAddress}
              </strong>
              {' '}does not have admin access.
            </p>
            <button
              onClick={() => signOut()}
              className="btn-secondary"
              style={{ width: '100%', color: 'var(--color-text-light)', borderColor: 'var(--color-amber)' }}
            >
              Sign out & try again
            </button>
          </div>
        )}

        {isLoaded && isSignedIn && !unauthorized && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-light)', margin: 0 }}>
            Redirecting to dashboard…
          </p>
        )}
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginInner />
    </Suspense>
  )
}

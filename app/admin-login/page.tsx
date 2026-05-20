'use client'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLoginPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { openSignIn, signOut } = useClerk()
  const router = useRouter()

  const isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === 'admin'

  useEffect(() => {
    if (isLoaded && isSignedIn && isAdmin) {
      router.replace('/admin/dashboard')
    }
  }, [isLoaded, isSignedIn, isAdmin, router])

  if (!isLoaded) return null

  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Logo */}
      <p style={{
        fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900,
        letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff',
        marginBottom: '3rem',
      }}>
        DEMARKS <span style={{ color: '#C0293A' }}>360</span>
      </p>

      <div style={{
        width: '100%', maxWidth: '360px',
        background: '#111111', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '4px', padding: '2.5rem 2rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C0293A',
            marginBottom: '0.5rem',
          }}>
            Admin Access
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900,
            letterSpacing: '0.02em', textTransform: 'uppercase', color: '#F5F0EA',
            lineHeight: 1,
          }}>
            Dashboard
          </h1>
        </div>

        {/* Not signed in */}
        {!isSignedIn && (
          <button
            onClick={() => openSignIn({ afterSignInUrl: '/admin/dashboard' } as Parameters<typeof openSignIn>[0])}
            style={{
              width: '100%', background: '#C0293A', border: 'none', borderRadius: '2px',
              padding: '0.9rem', cursor: 'pointer',
              fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff',
            }}
          >
            Sign in as Admin
          </button>
        )}

        {/* Signed in but not admin */}
        {isSignedIn && !isAdmin && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.72rem',
              color: 'rgba(245,240,234,0.45)', lineHeight: 1.6,
            }}>
              <strong style={{ color: '#F5F0EA' }}>{user.primaryEmailAddress?.emailAddress}</strong>
              {' '}does not have admin access.
            </p>
            <button
              onClick={() => signOut()}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '2px', padding: '0.6rem 1.25rem', cursor: 'pointer',
                fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'rgba(245,240,234,0.45)',
              }}
            >
              Sign out
            </button>
          </div>
        )}

        {/* Admin — redirecting */}
        {isSignedIn && isAdmin && (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'rgba(245,240,234,0.4)' }}>
            Redirecting to dashboard…
          </p>
        )}
      </div>
    </div>
  )
}

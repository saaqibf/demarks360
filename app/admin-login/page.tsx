'use client'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === 'admin'

  useEffect(() => {
    if (isLoaded && isSignedIn && isAdmin) {
      router.replace('/admin/dashboard')
    }
  }, [isLoaded, isSignedIn, isAdmin, router])

  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: 'sans-serif',
    }}>
      {/* Logo */}
      <p style={{
        fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#fff', marginBottom: '3rem',
      }}>
        DEMARKS <span style={{ color: '#C0293A' }}>360</span>
      </p>

      <div style={{
        width: '100%', maxWidth: '340px',
        background: '#111111', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '6px', padding: '2.5rem 2rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#C0293A', marginBottom: '0.5rem',
          }}>
            Admin Access
          </p>
          <h1 style={{
            fontSize: '2rem', fontWeight: 900, letterSpacing: '0.02em',
            textTransform: 'uppercase', color: '#F5F0EA', lineHeight: 1, margin: 0,
          }}>
            Dashboard
          </h1>
        </div>

        {/* Loading */}
        {!isLoaded && (
          <div style={{
            width: '100%', background: 'rgba(255,255,255,0.06)',
            borderRadius: '2px', padding: '0.9rem', textAlign: 'center',
            color: 'rgba(245,240,234,0.3)', fontSize: '0.65rem', letterSpacing: '0.1em',
          }}>
            Loading…
          </div>
        )}

        {/* Not signed in */}
        {isLoaded && !isSignedIn && (
          <Link
            href="/sign-in?redirect_url=/admin/dashboard"
            style={{
              display: 'block', width: '100%', background: '#C0293A',
              borderRadius: '2px', padding: '0.9rem', textAlign: 'center',
              textDecoration: 'none', fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff',
              boxSizing: 'border-box',
            }}
          >
            Sign in as Admin
          </Link>
        )}

        {/* Signed in, redirecting */}
        {isLoaded && isSignedIn && isAdmin && (
          <p style={{ fontSize: '0.7rem', color: 'rgba(245,240,234,0.4)', margin: 0 }}>
            Redirecting to dashboard…
          </p>
        )}

        {/* Signed in but wrong account */}
        {isLoaded && isSignedIn && !isAdmin && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(245,240,234,0.45)', lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: '#F5F0EA' }}>
                {user.primaryEmailAddress?.emailAddress}
              </strong>
              {' '}does not have admin access.
            </p>
            <button
              onClick={() => signOut()}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '2px', padding: '0.6rem 1.25rem', cursor: 'pointer',
                fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'rgba(245,240,234,0.45)',
                width: '100%',
              }}
            >
              Sign out & try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  return (
    <button
      onClick={() => signOut(() => router.push('/'))}
      style={{
        marginTop: '2rem',
        background: 'none',
        border: '1px solid rgba(26,23,20,0.2)',
        padding: '0.6rem 1.5rem',
        fontFamily: 'var(--font-body)',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: 'var(--color-muted)',
        cursor: 'pointer',
        letterSpacing: '0.04em',
      }}
    >
      Sign out
    </button>
  )
}

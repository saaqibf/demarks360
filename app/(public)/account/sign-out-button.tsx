'use client'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  return (
    <button
      onClick={() => signOut(() => router.push('/'))}
      className="btn-secondary"
      style={{
        marginTop: '2rem',
        color: 'var(--color-text-light)',
        borderColor: 'var(--color-amber)',
      }}
    >
      Sign out
    </button>
  )
}

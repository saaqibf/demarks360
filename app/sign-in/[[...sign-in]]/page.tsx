'use client'
import { SignIn, useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const params = new URLSearchParams(window.location.search)
      const redirectUrl = params.get('redirect_url') || '/account'
      router.replace(redirectUrl)
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <SignIn appearance={{ variables: { colorPrimary: '#C0293A', fontFamily: 'Nunito, sans-serif' } }} />
    </div>
  )
}

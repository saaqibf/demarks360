'use client'
import { SignIn, useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiteFooter } from '@/components/public/site-footer'
import { SiteNav } from '@/components/public/site-nav'

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
    <>
      <SiteNav />
      <main style={{
        minHeight: '100vh',
        background: 'var(--color-ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '7rem 1.5rem 4rem',
      }}>
        <SignIn />
      </main>
      <SiteFooter />
    </>
  )
}

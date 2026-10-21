import { SignUp } from '@clerk/nextjs'
import { SiteFooter } from '@/components/public/site-footer'
import { SiteNav } from '@/components/public/site-nav'

export default function SignUpPage() {
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
        <SignUp />
      </main>
      <SiteFooter />
    </>
  )
}

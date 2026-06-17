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
        <SignUp appearance={{ variables: {
          colorPrimary: 'var(--color-amber-light)',
          colorBackground: 'var(--color-surface)',
          colorText: 'var(--color-text-light)',
          colorInputBackground: 'var(--color-ink)',
          colorInputText: 'var(--color-text-light)',
          colorNeutral: 'var(--color-muted-light)',
          fontFamily: 'var(--font-body)',
        } }} />
      </main>
      <SiteFooter />
    </>
  )
}

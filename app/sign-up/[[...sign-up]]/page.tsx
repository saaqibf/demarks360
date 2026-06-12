import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-ink)' }}>
      <SignUp appearance={{ variables: { colorPrimary: 'var(--color-amber-light)', colorBackground: 'var(--color-ink)', colorText: 'var(--color-text-light)', colorInputBackground: 'var(--color-surface)', colorInputText: 'var(--color-text-light)', colorNeutral: 'var(--color-text-light)' } }} />
    </div>
  )
}

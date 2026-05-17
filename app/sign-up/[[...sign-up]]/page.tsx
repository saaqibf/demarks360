import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-ink)' }}>
      <SignUp appearance={{ variables: { colorPrimary: '#C0293A', colorBackground: '#111111', colorText: '#F5F0EA', colorInputBackground: '#1a1a1a', colorInputText: '#F5F0EA', colorNeutral: '#F5F0EA' } }} />
    </div>
  )
}

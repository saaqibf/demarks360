import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
      <SignIn />
    </div>
  )
}

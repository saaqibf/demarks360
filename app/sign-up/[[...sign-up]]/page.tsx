import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
      <SignUp />
    </div>
  )
}

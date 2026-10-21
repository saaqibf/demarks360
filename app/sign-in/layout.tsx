import { ClerkProvider } from '@clerk/nextjs'

import { darkAuthAppearance } from '@/lib/clerk-appearance'

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider appearance={darkAuthAppearance}>{children}</ClerkProvider>
}

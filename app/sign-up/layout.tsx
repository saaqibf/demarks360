import { ClerkProvider } from '@clerk/nextjs'

import { darkAuthAppearance } from '@/lib/clerk-appearance'

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider appearance={darkAuthAppearance}>{children}</ClerkProvider>
}

import { ClerkProvider } from '@clerk/nextjs'

import { darkAuthAppearance } from '@/lib/clerk-appearance'

// Admin sign-in uses Clerk client components, so it carries its own provider now
// that the root layout no longer wraps every (public) marketing page in Clerk.
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider appearance={darkAuthAppearance}>{children}</ClerkProvider>
}

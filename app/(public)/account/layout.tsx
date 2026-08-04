import { ClerkProvider } from '@clerk/nextjs'

// The account page's sign-out control is a Clerk client component, so it needs a
// provider even though the rest of the (public) group no longer loads Clerk.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>
}

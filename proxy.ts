import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)'])
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/admin-login',
  '/book(.*)',
  '/gallery(.*)',
  '/g/(.*)',
  '/privacy',
  '/terms',
  '/api/availability(.*)',
  '/api/bookings(.*)',
  '/api/webhooks/(.*)',
])

function hasAdminRole(source: {
  publicMetadata?: { role?: unknown }
  metadata?: { role?: unknown }
  org_role?: unknown
  orgRole?: unknown
  role?: unknown
} | null | undefined): boolean {
  if (!source) return false
  return [
    source.publicMetadata?.role,
    source.metadata?.role,
    source.org_role,
    source.orgRole,
    source.role,
  ].some(role => role === 'admin' || role === 'org:admin')
}

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const authResult = await auth()
    const { userId, redirectToSignIn } = authResult
    if (!userId) return redirectToSignIn({ returnBackUrl: req.url })

    if (hasAdminRole(authResult)) return

    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    if (!hasAdminRole(user)) return redirectToSignIn({ returnBackUrl: req.url })
  } else if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|mov|m4v)).*)',
    '/(api|trpc)(.*)',
  ],
}

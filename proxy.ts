import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { isAdminEmail } from '@/lib/admin-emails'

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)'])
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/admin-login',
  '/book(.*)',
  '/gallery(.*)',
  '/g/(.*)',
  '/pay(.*)',
  '/privacy',
  '/terms',
  // Crawlers are signed out; without these, Clerk 404s robots and the sitemap
  '/robots.txt',
  '/sitemap.xml',
  '/api/availability(.*)',
  '/api/bookings(.*)',
  '/api/clip-download(.*)',
  '/api/cron(.*)',
  '/api/overlay-preview(.*)',
  '/api/pay(.*)',
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

    // Same policy as the (admin) layout: a Clerk admin role OR an email on the
    // ADMIN_EMAIL allow-list. Without this second check the allow-list is dead —
    // the middleware would bounce every non-role user before the layout runs.
    const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
    if (!hasAdminRole(user) && !isAdminEmail(email)) return redirectToSignIn({ returnBackUrl: req.url })
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

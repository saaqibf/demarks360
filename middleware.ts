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
  '/api/webhooks/(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { userId, redirectToSignIn } = await auth()
    if (!userId) return redirectToSignIn({ returnBackUrl: req.url })

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = (user.publicMetadata as { role?: string })?.role

    if (role !== 'admin') return redirectToSignIn({ returnBackUrl: req.url })
  } else if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

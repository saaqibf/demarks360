# Performance Engineer Report: Demarks360

Audit date: 2026-07-08. Read-only audit. Build verified: `pnpm build` exit 0 (Next.js 16.2.6, webpack, 28 pages, landing prerendered with 5m revalidate).

---

## 1. Performance issue breakdown (ranked by user impact)

### P0-1. Full three.js ships in the landing bundle to draw one decorative ring
- `app/(public)/_components/demarks-landing-fx.tsx:7` does `import * as THREE from 'three'` at module scope, in a `'use client'` component rendered on the landing page.
- It is used only for the torus ring hero ornament (`demarks-landing-fx.tsx:74-158`): two toruses, a sphere, three lights.
- Build evidence: `.next/static/chunks/e8b8ea12-396c3293813019cd.js` (340 KB) and `.next/static/chunks/e31cea27-c1585d15089b6bf5.js` (180 KB) contain three.js code and load with the landing page, on top of gsap + Lenis + Sentry.

This is roughly 150 KB gzipped of parse/compile cost on the most visited page, for a visual that could be a dynamic import (or a 2D canvas/CSS effect). It also conflicts with the repo's own rule in `.claude/rules/frontend.md`: "never import a whole library for one function."

### P0-2. The database has zero indexes beyond primary keys
`lib/db/schema.ts` defines no `index()` or `uniqueIndex()` anywhere. Every hot query is a sequential scan once the tables grow:

- `bookings.eventDate`: hit on every calendar render and every time-slot check (`lib/db/queries/availability.ts:26` exact match, `:53` range). This is the hottest public query in the app (the /book flow calls it per month view and per selected date).
- `bookings.stripePaymentIntentId`: `confirmBooking` in `lib/db/queries/bookings.ts:96-102` runs an UPDATE ... WHERE on it from the Stripe webhook. Slow webhooks risk Stripe retries.
- `bookings.galleryToken`: `getGalleryByToken` (`lib/db/queries/gallery.ts:6-10`) scans bookings for every client gallery visit. Should also be UNIQUE (it is a lookup credential).
- `galleryItems.bookingId` and the pair `(published, isPublicShowcase)`: gallery page and showcase query (`gallery.ts:14-17,21-27`).
- `availabilityBlocks.blockedDate`: both availability queries (`availability.ts:34,57`).
- `bookings.customerId`: FK with no index; any per-customer view scans.

Impact today is masked by tiny tables; at a few thousand bookings the /book calendar and Stripe webhook latency degrade linearly.

### P0-3. Render-blocking Google Fonts import
- `app/globals.css:2`: `@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:...&family=Figtree:...&display=swap')`.

Same chain as any CSS-import fonts setup: HTML, app CSS, googleapis CSS, gstatic woff2. Three round trips of blocking/late font work per cold visit, plus a FOUT. `.claude/rules/frontend.md` asks for `font-display: swap` and fast fonts; `next/font/google` gives self-hosted files and zero extra origins.

### P1-4. Clerk middleware makes a backend API call per admin request
- `proxy.ts:44-47`: when the session token lacks a role claim, the middleware calls `clerkClient().users.getUser(userId)` on every `/admin(.*)` and `/api/admin(.*)` request.
- Clerk session claims do not include `publicMetadata.role` unless the session token template is customized, so in practice this fallback fires on every admin navigation and every admin API call, adding a 100-300 ms network hop inside middleware, before the page even starts rendering.

### P1-5. Landing media: 3.2 MB hero video with default preload, raw `<img>` everywhere
- `app/(public)/page.tsx:131`: `<video src="/media/hero-loop.mp4" autoPlay ...>` with no `preload` hint and no poster; `public/media/hero-loop.mp4` is 3.2 MB and downloads in full on every first visit (revalidate output confirms `/` is static, so HTML is fast; the video is the payload).
- `page.tsx:165-198,290-306`: step and gallery images (`step-2.jpg` 372 KB, `gallery-1.jpg` 324 KB, etc.) are raw `<img>` tags. No `next/image`, no srcset, no WebP/AVIF, no explicit width/height (the `dm-frame-ph` wrappers protect some layout, but images still ship desktop-size to phones). Roughly 2.1 MB of JPEG on the landing page before the video.
- Good: the IntersectionObserver pause for offscreen videos (`demarks-landing-fx.tsx:58-72`) and `preload="metadata"` on the step/gallery videos are the right instincts. The hero video lacks both.

### P1-6. /gallery is force-dynamic and eagerly mounts a Mux player per item
- `app/gallery/page.tsx:7`: `export const dynamic = 'force-dynamic'` means every visitor hits Neon for showcase items that change only when an admin toggles them.
- `getPublicShowcaseItems` (`lib/db/queries/gallery.ts:21-27`) is unbounded (`select().from(galleryItems)` with no limit).
- `app/gallery/page.tsx:69` renders `<ShowcasePlayer>` per item; `components/public/showcase-player.tsx:2` statically imports `@mux/mux-player-react`. Build evidence: `.next/static/chunks/6670-c9ec8f0d051dd9fc.js` is 524 KB (mux-player/media-chrome). Every player web component initializes at page load even for items far below the fold.

### P1-7. Booking wizard loads all five steps plus Stripe.js at step 1
- `app/(public)/book/page.tsx:1-9` is a single client page statically importing `DatePicker`, `TimePicker`, `AddonsStep`, `DetailsForm`, and `CheckoutStep`.
- `components/public/book/checkout-step.tsx:8`: `const stripePromise = loadStripe(...)` at module scope. Because the import is static, Stripe.js (~60 KB gz plus its iframe bootstrapping) starts downloading the moment a user lands on step 1 (date selection), before they have picked anything.
- The step 1 calendar then waterfalls: page JS, hydration, `useEffect` fetch to `/api/availability?month=...` (`date-picker.tsx:35-37`). Nothing is server-prefetched.

### P2-8. Admin bookings list is unbounded
- `getAllBookings` (`lib/db/queries/bookings.ts:76-82`) selects every booking joined to customers with no limit or pagination. Admin dashboard payload and render time grow without bound.

### P2-9. In-memory rate limiter is per-instance
- `app/api/availability/route.ts:7` uses `checkRateLimit` from `lib/rate-limit.ts`, which keeps counters in module memory. On Vercel each lambda instance has its own map, so the effective limit is `10 x instance count` and resets on cold start. Fine as a speed bump, not real protection for the DB.

### P2-10. Sentry client weight
- `next.config.ts:38-52` wraps with `withSentryConfig` and `instrumentation-client.ts` initializes browser Sentry. Chunks `e217e3ef` (500 KB) and `7224` (448 KB) carry Sentry client code into first load. Worth auditing which integrations are enabled (Replay in particular) and using `@sentry/nextjs` tree-shaking flags.

---

## 2. Optimization strategies

1. **Isolate the WebGL ring (P0-1).** Move the three.js scene into its own client component loaded with a dynamic import after first paint (or on `requestIdleCallback`), and import only the classes you use from `three` so webpack can tree-shake. Alternative worth considering: this ring is achievable with a 2D canvas or an SVG + CSS 3D transform at near-zero bundle cost.
2. **Add the missing indexes in one migration (P0-2).** Follow the repo's own DB rule (indexes in their own migration). Sketch below. Make `galleryToken` unique at the same time.
3. **Move fonts to next/font (P0-3).** `Bodoni_Moda` and `Figtree` via `next/font/google` in `app/layout.tsx`, exposed as `--font-display` / `--font-body` variables so `globals.css` tokens keep working. Delete the `@import` line.
4. **Put the admin role in the session token (P1-4).** In Clerk dashboard, customize the session token to include `{"role": "{{user.public_metadata.role}}"}`. The existing `hasAdminRole(authResult)` check (`proxy.ts:42`) then short-circuits and the `users.getUser` fallback becomes cold-path only.
5. **Landing media (P1-5).** Compress `hero-loop.mp4` toward 1-1.5 MB (720p, no audio track), add `preload="metadata"` plus a lightweight poster, and let the existing IntersectionObserver trigger `.play()`. Convert step/gallery `<img>` to `next/image` with `sizes` (they render at most ~50vw): the 2.1 MB of JPEG becomes ~300 KB of AVIF.
6. **Cache the gallery (P1-6).** Replace `force-dynamic` with `export const revalidate = 300` plus `revalidateTag('showcase')` (or `updateTag`) called from `setShowcaseStatus` / `addGalleryItem` API routes. Lazy-mount Mux players: render the Mux poster image (`https://image.mux.com/{playbackId}/thumbnail.webp`) and swap in the player on click or when scrolled into view, so one 524 KB player bundle loads once and instantiates only for visible items.
7. **Split the booking wizard (P1-7).** Dynamic-import `CheckoutStep` (and `DetailsForm`) so step 1 ships only calendar code; call `loadStripe` inside the component on mount (module-scope singleton via a lazy getter) so Stripe.js loads when the user reaches checkout. Server-render the first month's `unavailableDates` into the page (the route is static today; pass it via a small server component wrapper with `revalidate = 60`) to kill the first fetch waterfall.
8. **Paginate admin bookings (P2-8)** with a `limit`/`offset` or cursor on `eventDate`, defaulting to the next 50.
9. **Durable rate limiting (P2-9)**: Upstash Redis (`@upstash/ratelimit`) or Vercel WAF rules for `/api/availability` and `/api/bookings`.

---

## 3. Improved production-ready code sketches

### 3a. Index migration (drizzle)

```ts
// lib/db/schema.ts additions
import { index, uniqueIndex } from 'drizzle-orm/pg-core'

export const bookings = pgTable('bookings', {
  /* ...existing columns... */
}, (t) => [
  index('bookings_event_date_idx').on(t.eventDate),
  index('bookings_customer_id_idx').on(t.customerId),
  index('bookings_stripe_pi_idx').on(t.stripePaymentIntentId),
  uniqueIndex('bookings_gallery_token_idx').on(t.galleryToken),
])

export const galleryItems = pgTable('gallery_items', {
  /* ...existing columns... */
}, (t) => [
  index('gallery_items_booking_id_idx').on(t.bookingId),
  index('gallery_items_showcase_idx').on(t.isPublicShowcase, t.published),
])

export const availabilityBlocks = pgTable('availability_blocks', {
  /* ...existing columns... */
}, (t) => [
  index('availability_blocks_date_idx').on(t.blockedDate),
])
```

Then `pnpm drizzle-kit generate` produces the standalone migration (per `.claude/rules/database.md`, keep it index-only).

### 3b. Deferred three.js ring

```tsx
// app/(public)/_components/ring-scene.tsx  ('use client')
// Contains ONLY the WebGL code from demarks-landing-fx.tsx:74-158,
// with named imports: WebGLRenderer, Scene, PerspectiveCamera, Group,
// Mesh, TorusGeometry, SphereGeometry, MeshStandardMaterial,
// MeshBasicMaterial, PointLight, AmbientLight, DirectionalLight.

// app/(public)/_components/demarks-landing-fx.tsx
import dynamic from 'next/dynamic'
const RingScene = dynamic(() => import('./ring-scene').then(m => m.RingScene), {
  ssr: false,
  loading: () => null, // the canvas is decorative; nothing to show while loading
})
```

The gsap/Lenis choreography stays where it is; only the ring pays for three.js, and only after the main bundle is interactive.

### 3c. next/font (replace `app/globals.css:2`)

```tsx
// app/layout.tsx
import { Bodoni_Moda, Figtree } from 'next/font/google'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})
const figtree = Figtree({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})
// <html lang="en" className={`${bodoni.variable} ${figtree.variable}`}>
```

### 3d. Cached showcase with tag invalidation

```tsx
// app/gallery/page.tsx
export const revalidate = 300 // replaces force-dynamic

// app/api/admin/gallery/route.ts (wherever setShowcaseStatus is called)
import { revalidateTag, revalidatePath } from 'next/cache'
await setShowcaseStatus(id, isPublicShowcase)
revalidatePath('/gallery')
```

### 3e. Click-to-load Mux player

```tsx
// components/public/showcase-player.tsx
'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), { ssr: false })

export function ShowcasePlayer({ playbackId, title }: Props) {
  const [active, setActive] = useState(false)
  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        aria-label={`Play ${title ?? 'showcase video'}`}
        style={{ width: '100%', height: '100%', position: 'relative', padding: 0, border: 0, cursor: 'pointer' }}
      >
        <img
          src={`https://image.mux.com/${playbackId}/thumbnail.webp?time=1&width=640`}
          alt=""
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <span className="dm-play-badge" aria-hidden>&#9654;</span>
      </button>
    )
  }
  return <MuxPlayer playbackId={playbackId} streamType="on-demand" autoPlay style={{ width: '100%', height: '100%' }} accentColor="var(--color-amber-light)" />
}
```

### 3f. Booking wizard code-splitting and lazy Stripe

```tsx
// app/(public)/book/page.tsx
import dynamic from 'next/dynamic'
const CheckoutStep = dynamic(
  () => import('@/components/public/book/checkout-step').then(m => m.CheckoutStep),
  { loading: () => <p className="t-body">Loading secure checkout...</p> },
)

// components/public/book/checkout-step.tsx
import { loadStripe, type Stripe } from '@stripe/stripe-js'
let stripePromise: Promise<Stripe | null> | undefined
function getStripe() {
  stripePromise ??= loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')
  return stripePromise
}
// pass getStripe() to <Elements stripe={...}> instead of the module-scope constant
```

### 3g. Session-claim admin check (removes the per-request Clerk API call)

```ts
// proxy.ts inside clerkMiddleware, after auth()
const claims = authResult.sessionClaims as { role?: string } | undefined
if (claims?.role === 'admin') return
// keep the users.getUser fallback for tokens minted before the
// session token template change; it becomes cold-path only
```

(Requires adding `"role": "{{user.public_metadata.role}}"` to the Clerk session token template.)

---

## 4. Scalability recommendations

1. **Neon HTTP driver fits this workload** (`lib/db/index.ts` uses `drizzle-orm/neon-http`): each query is a stateless fetch, ideal for serverless. Two caveats: (a) no transactions, so the booking create + Stripe confirm flow relies on webhook idempotency; keep `confirmBooking`'s WHERE on `stripePaymentIntentId` idempotent (it is) and add the index from 3a so retries stay fast. (b) Multi-query flows pay one HTTP round trip each; the `Promise.all` pattern already used in `availability.ts:18,49` is right, keep it for new queries.
2. **Webhook resilience.** Stripe webhook work should stay under ~2s to avoid retries; after indexing, move any email/notification sends inside webhook handlers behind `after()` or a queue so the 200 response returns immediately.
3. **Booking contention.** `MAX_BOOKINGS_PER_DAY` is enforced read-then-write (`lib/availability/index.ts:59` then insert in `createBookingRecord`). Two simultaneous checkouts on the last slot can both pass. At current volume this is acceptable; when volume grows, enforce it in SQL (insert guarded by a `WHERE (SELECT count(*) ...) < max` CTE) or a partial unique constraint on (eventDate, startTime).
4. **Growth-proof the gallery.** Add `limit`/pagination to `getPublicShowcaseItems` and gallery-by-token items; a client gallery with 50+ Mux assets should page, and the showcase should cap at a curated dozen.
5. **CDN discipline for /media.** Ship a `headers()` rule for `/media/:path*` with `Cache-Control: public, max-age=31536000, immutable` and use content-hashed filenames when replacing assets (the middleware matcher in `proxy.ts:55` already excludes media extensions, per the known Clerk/video gotcha).
6. **Measure.** Sentry is already wired; enable its Web Vitals or add Vercel Speed Insights so the three.js and font fixes can be verified against field LCP/INP, and set a bundle budget check (`next build` size output or `@next/bundle-analyzer`) in CI to catch the next accidental 500 KB import.

## Verification performed

- `pnpm build` exit code 0; route table captured (28 pages; `/` static with 5m revalidate; `/gallery` dynamic).
- Chunk attribution by content grep: three.js in `e8b8ea12` (340 KB) and `e31cea27` (180 KB); Mux player in `6670` (524 KB); Sentry in `e217e3ef` (500 KB) and `7224` (448 KB).
- Asset sizes via `du`: `hero-loop.mp4` 3.2 MB; landing JPEGs 220-372 KB each (~2.1 MB total).
- Confirmed `lib/db/schema.ts` contains no index definitions and `getGalleryByToken` / `confirmBooking` / availability queries all filter on unindexed columns.

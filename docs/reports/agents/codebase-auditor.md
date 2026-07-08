# Codebase Audit: Demarks360

Auditor: codebase-auditor agent, 2026-07-08. Read-only pass over the full repo. No source files were changed. CLAUDE.md, SESSION-STATE.md, DESIGN.md, PRODUCT.md, and .claude/rules/* were read first; documented decisions (preview routes with mock data, the Clerk video-extension matcher fix, the retired components/public landing iteration) are respected, not re-litigated.

---

## 1. Architecture breakdown (how it actually works today)

**Stack**: Next.js App Router at repo root (`app/`), pnpm, TypeScript. Clerk auth via `proxy.ts` middleware. Drizzle + Neon (`lib/db/`, migrations checked in). Stripe (deposit PaymentIntent with saved card for the balance), Resend email, Mux + Google Drive import for galleries, Cloudinary legacy. Tailwind v4 tokens in `app/globals.css`. Vitest.

**Route groups**:
- `(public)`: the landing (`app/(public)/page.tsx`, a deliberate 467-line monolith ported from the approved mockup, styled by `_components/demarks-landing.css` and animated by `_components/demarks-landing-fx.tsx` with GSAP + Lenis + a Three.js torus ring), plus `/book` (5-step client wizard), `/book/confirmation`, `/book/manage`, `/account`, `/privacy`, `/terms`. Note: `components/public/site-nav.tsx` and `site-footer.tsx` are used by the book/gallery/legal pages, NOT by the landing, which carries its own nav and footer markup.
- `(admin)`: Clerk-protected dashboard, bookings list/detail (with Drive import + device upload), availability manager.
- `(preview)`: auth-free admin UI previews on hardcoded mock data. Documented decision in CLAUDE.md so the admin UI can be reviewed without a custom domain; expected to drift, do not "unify" it away.
- `app/gallery/[token]`: token-gated customer galleries via `lib/gallery-access/`.
- `app/api/*`: public `availability`, `bookings`, `bookings/manage`, `notify`, webhooks (Stripe, Clerk); admin `api/admin/*` guarded by `isAdmin()` from `lib/auth/roles.ts`.

**Booking data flow** (the money path):
1. `/book` (`app/(public)/book/page.tsx`) holds all wizard state in one `BookingState` in a client component; steps are `components/public/book/{date-picker,time-picker,addons-step,details-form,checkout-step}.tsx`.
2. `date-picker`/`time-picker` read `GET /api/availability` (month endpoint, 1 request per month) and filter slots client-side against booked slots and admin blocks.
3. On reaching step 5, `checkout-step.tsx` POSTs `/api/bookings`.
4. `app/api/bookings/route.ts` runs, in order: rate limit, zod validation (`lib/validations/booking.ts`), `checkBookingAvailability` (`lib/availability/index.ts`: lead time, admin blocks, `MAX_BOOKINGS_PER_DAY`), duration minimum, `calculateBookingCost` (`lib/pricing/calculate.ts` from `lib/pricing/config.ts`), `createBookingIntent` (`lib/stripe/booking-intent.ts`: Stripe customer + deposit PaymentIntent with `setup_future_usage`), `getOrCreateCustomer` + `createBookingRecord` (`lib/db/queries/bookings.ts`, status `pending`).
5. Stripe confirms payment in the browser; `app/api/webhooks/stripe/route.ts` verifies the signature, `confirmBooking(paymentIntentId)` flips status to `confirmed`, then sends the confirmation email (Resend, failure logged and swallowed).
6. Availability counts `confirmed` AND `pending` bookings against the 2-per-day cap (`lib/availability/index.ts:35`).

**Pricing source of truth**: `lib/pricing/config.ts` ($150/hr, 90-min minimum, 30% deposit, $50 travel surcharge outside Calgary, balance charged 7 days before the event). Pure and unit-tested.

---

## 2. Critical problem areas, ranked

### P1. Abandoned checkouts permanently eat availability, and step 5 re-entry multiplies them
Three compounding facts:
- `components/public/book/checkout-step.tsx:110-147`: a `useEffect` with `[]` deps fires `POST /api/bookings` every time step 5 mounts. Go back to fix a typo and forward again, and a second pending booking plus a second PaymentIntent is created. Nothing deduplicates.
- `lib/db/queries/bookings.ts:42`: every booking is inserted with status `pending`, and nothing anywhere expires pendings. Grep confirms no cleanup, cron, or TTL exists.
- `lib/availability/index.ts:35`: `pending` counts toward `MAX_BOOKINGS_PER_DAY` (2).
Net effect: one indecisive visitor who reaches checkout twice and never pays blocks a whole date for every real customer, forever, and the admin has no UI signal that these are ghosts. This is the single highest-impact defect in the repo because it silently turns lookers into lost revenue.

### P2. "Other" event types cannot actually be booked
- `components/public/book/details-form.tsx:152-158`: choosing "Other" stores the sentinel `' '` (a single space) into `eventType`, then line 165-173 lets the user type free text ("Family reunion").
- `components/public/book/checkout-step.tsx:125` submits that raw text.
- `lib/validations/booking.ts:14-23`: `eventType` is `z.enum([...8 canonical values])`, where the only escape hatch is the literal string `'Other'`.
Result: any custom event type fails server validation with 422 and the user sees "Validation failed" at the very end of the funnel, after entering name, phone, address, and design preferences. The same break is reachable from marketing URLs: `app/(public)/book/page.tsx:73-77` `normalizeEventType` passes unknown query values straight through (`/book?eventType=Anniversary` prefills a value the server will reject). Also, the `' '` sentinel itself would pass `min`-less trim-free checks oddly; it is a fragile encoding regardless. This is a checkout-killing contract mismatch between client and server.

### P3. Prices and FAQ are hand-copied across the landing, metadata, and the pricing engine
- `app/(public)/page.tsx:225, 238, 251`: package prices $300 / $450 / From $600 are hardcoded in JSX.
- `app/(public)/page.tsx:10` (metadata): "From $225", which is `HOURLY_RATE * 1.5h` from `lib/pricing/config.ts`, a different anchor than the $300 2-hour package shown 200 lines later.
- `components/public/book/time-picker.tsx:159`: the live estimate hardcodes `* 150` instead of `PRICING.HOURLY_RATE`.
- The FAQ exists twice in the same file: `faqSchema` JSON-LD (page.tsx:39-84) and the visible `<details>` markup (page.tsx:359-416), and the copies have already drifted ("Can the booth run outdoors?" vs "Can it run outdoors?... This is Calgary after all.").
SESSION-STATE says the founder still has to confirm final pricing. When that number changes, today it must be changed in at least four places, and the JSON-LD Google reads can disagree with the page.

### P4. No server-side time-slot overlap check, and the availability check races the insert
`app/api/bookings/route.ts:29-41` validates date-level availability (count < 2, not blocked, lead time) and minimum duration, but never compares `input.startTime/endTime` against the `bookedSlots` that `checkBookingAvailability` already returned. Overlap prevention lives only in the client (`components/public/book/time-picker.tsx:60-75`). Anyone replaying the POST can double-book the same hours, and even two honest users can, because check-then-insert is not atomic (no transaction, no unique constraint on date+slot). With `MAX_BOOKINGS_PER_DAY = 2` the blast radius is capped, but the business promise "we physically have one booth" is not enforced anywhere on the server. Per `.claude/rules/security.md`, validation belongs at the boundary.

### P5. Admin role logic is duplicated and has already diverged
`proxy.ts:19-34` `hasAdminRole` checks `publicMetadata/metadata/org_role/orgRole/role`. `lib/auth/roles.ts:12-26` is the same function plus `privateMetadata`. A user whose admin flag lives only in `privateMetadata` passes API-route checks but middleware behavior differs. Two copies of an auth predicate is exactly the kind of duplication that becomes a security inconsistency; one must import from the other.

### P6. The in-memory rate limiter does not survive serverless
`lib/rate-limit.ts` is a per-instance `Map` (same design as Harmony Living minus the sweep interval, so entries also accumulate until instance recycle). On Vercel, `limit: 5` on `/api/bookings` is per warm lambda, and every cold start resets it. Combined with P1 (each request creates a Stripe customer + PaymentIntent + DB row), an abuser can cheaply manufacture pending bookings that block dates.

### P7. The booking wizard ignores the repo's own design-token and styling rules
`.claude/rules/frontend.md` mandates tokens and semantic classes, yet `details-form.tsx` (451 lines), `checkout-step.tsx` (284), `book/page.tsx` (196), and `time-picker.tsx` are built almost entirely from repeated inline style objects. The "Step N" amber eyebrow blob alone is pasted at `details-form.tsx:69`, `checkout-step.tsx:160` and `197`, and its siblings in the other steps; the pill back-button style appears four times (`details-form.tsx:445`, `checkout-step.tsx:82`, `168`, and in time-picker). The landing got the semantic-class treatment; the money flow did not. Every restyle of the booking flow is currently a multi-file find-and-paste.

### P8. Small duplications and naming hazards
- `timeToMinutes` is defined three times: `lib/pricing/calculate.ts:3` (exported via `lib/pricing/index.ts`), `components/public/book/time-picker.tsx:21`, `components/public/book/checkout-step.tsx:15`. Both components already import from `@/lib/pricing`.
- `lib/db/queries/bookings.ts:105` `getOrCreateCustomer(clerkUserId, ...)`: the first parameter is actually the Stripe customer id (see the call at `app/api/bookings/route.ts:59`), and it becomes `customers.id`. The name is a lie that will bite whoever wires Clerk accounts to bookings for `/account`.
- `lib/email/templates/gallery-ready.ts:36-39` still renders the retired crimson/black brand (`#C0293A`, `#080808`, "DEMARKS 360" in Arial Black) while `booking-confirmation.ts` and DESIGN.md are Golden Hour amber; `fmtDate` and the whole table shell are duplicated between the two templates.
- Orphaned Stripe objects: in `app/api/bookings/route.ts:49-79`, if `createBookingRecord` throws after `createBookingIntent` succeeded, the PaymentIntent and customer are never cancelled. Low frequency, worth a try/catch cancel.
- Error shape drifts from `.claude/rules/error-handling.md` (`{ error: string }` in `api/bookings` vs the mandated `{ error: { code, message } }`). Cosmetic, fix opportunistically.

---

## 3. Refactoring strategies (concrete, minimal)

### R1. Make pending bookings expire and stop re-creating them (fixes P1)
Three small changes, no schema migration needed beyond one nullable column if desired:
1. **Idempotent checkout init.** In `components/public/book/checkout-step.tsx`, cache the created booking in the wizard state so remounting step 5 reuses it:
```ts
// BookingState gains: pendingBookingId?: string; pendingClientSecret?: string
useEffect(() => {
  if (state.pendingClientSecret) { setClientSecret(state.pendingClientSecret); setBookingId(state.pendingBookingId!); setLoading(false); return }
  // ... existing fetch, then onChange({ pendingBookingId: data.bookingId, pendingClientSecret: data.clientSecret })
}, [])
```
(If details changed since the intent was created, send the id and let the server update amount + row instead of inserting.)
2. **Time-box pendings.** In `lib/db/queries/availability.ts`, only count young pendings:
```ts
// before (lib/availability/index.ts:35 via availability query)
b.status === 'confirmed' || b.status === 'pending'
// after
b.status === 'confirmed' || (b.status === 'pending' && b.createdAt > thirtyMinutesAgo)
```
(bookings already has `createdAt`; expose it in the availability select.)
3. **Sweep.** A tiny admin-triggered or cron route (`app/api/admin/bookings/expire/route.ts` or a Vercel cron) that cancels pending bookings older than 24h and cancels their PaymentIntents. Even with 2., the sweep keeps the admin list honest.

### R2. Close the eventType contract (fixes P2)
Server side, `lib/validations/booking.ts`: accept what the UI collects.
```ts
// before
eventType: z.enum(['Birthday Party', ..., 'Other']),
// after
eventType: z.string().trim().min(2).max(100),
```
(or keep the enum plus `customEventType: z.string().max(100).optional()` if the enum matters for reporting, and map "Other" + text on the client). Client side, `details-form.tsx`: replace the `' '` sentinel with an explicit `isOtherEventType: boolean` in `BookingState`, and make `normalizeEventType` in `book/page.tsx` fall back to `''` for unknown query values instead of passing them through. Add one vitest case in `lib/validations/booking.test.ts` for a custom event type so this cannot regress.

### R3. Single source for prices and FAQ (fixes P3)
Create `lib/content/landing.ts` (content, not a premature abstraction: the data already exists in three shapes):
```ts
import { PRICING } from '@/lib/pricing'
export const PACKAGES = [
  { tier: 'Essential', hours: 2, price: 2 * PRICING.HOURLY_RATE, features: [...] },
  { tier: 'Celebration', hours: 3, price: 3 * PRICING.HOURLY_RATE, starred: true, features: [...] },
  { tier: 'All-night', hours: 4, priceLabel: `From $${4 * PRICING.HOURLY_RATE}`, features: [...] },
]
export const FAQS = [{ q: 'How much space does the booth need?', a: '...' }, ...]
export const FROM_PRICE = PRICING.HOURLY_RATE * (PRICING.MIN_DURATION_MINUTES / 60)
```
Then `app/(public)/page.tsx` maps `PACKAGES` into the existing `.dm-pack` markup, builds `faqSchema` from `FAQS`, and interpolates `FROM_PRICE` into the metadata description; `time-picker.tsx:159` switches `150` to `PRICING.HOURLY_RATE`. Rendered HTML stays byte-identical today; the founder's future price change becomes a one-line edit that updates the page, the JSON-LD, the estimate, and checkout together.

### R4. Enforce slot integrity on the server (fixes P4)
In `app/api/bookings/route.ts`, after the availability check (the data is already in hand):
```ts
const overlaps = availability.bookedSlots.some(s =>
  timeToMinutes(input.startTime) < timeToMinutes(s.endTime) &&
  timeToMinutes(input.endTime) > timeToMinutes(s.startTime))
if (overlaps) return NextResponse.json({ error: 'That time slot was just taken. Please pick another time.' }, { status: 409 })
```
Also validate `endTime > startTime` explicitly. For the remaining race window, either wrap count-check + insert in a Drizzle transaction with `SELECT ... FOR UPDATE` on the date's rows, or accept the tiny window and let the admin resolve rare ties manually (defensible at current volume; document the choice).

### R5. One admin predicate (fixes P5)
Move `hasAdminRole` to `lib/auth/roles.ts` only (it already lives there with the superset behavior) and import it in `proxy.ts`; the function is pure and safe for middleware. Delete the copy at `proxy.ts:19-34`.

### R6. Durable rate limiting (fixes P6, same recipe as Harmony Living)
Keep the `checkRateLimit` signature in `lib/rate-limit.ts`, back it with Upstash Redis (INCR + PEXPIRE) when `UPSTASH_REDIS_REST_URL` is set, fall back to the Map locally. Callers (`api/bookings`, `api/notify`, `api/availability` if limited) just gain `await`.

### R7. Booking-flow style dedup, smallest useful step (fixes P7)
Do not rewrite the wizard. Extract only the three blobs that repeat across files into `components/public/book/ui.ts` (or classes in `globals.css` per the frontend rules):
```ts
export const eyebrowStyle: React.CSSProperties = { /* the Step N blob */ }
export const inputStyle: React.CSSProperties = { ... }   // already exists in details-form; export it
export const pillButton = (variant: 'primary' | 'ghost'): React.CSSProperties => ({ ... })
```
and a `<StepHeading step={4} title="Your details" />` used by details-form, checkout-step, addons-step, and time-picker. That alone removes most of the pasted styling while leaving each step's real content untouched.

### R8. Small fixes (fixes P8)
- Delete the local `timeToMinutes` in `time-picker.tsx:21` and `checkout-step.tsx:15`; import from `@/lib/pricing`.
- Rename the `getOrCreateCustomer` parameter to `stripeCustomerId` (and consider renaming the column concept in a comment; no migration needed since it is just an id string).
- Re-skin `lib/email/templates/gallery-ready.ts` to the Golden Hour palette and extract the shared table shell + `fmtDate` into `lib/email/templates/layout.ts` used by both templates.
- In `api/bookings/route.ts`, wrap `getOrCreateCustomer` + `createBookingRecord` in try/catch and cancel the PaymentIntent on failure.

Suggested order: R2 first (checkout-killing bug, tiny diff), then R1 and R4 (booking integrity), R5 and R6 (auth + abuse), then R3, R7, R8.

---

## 4. What is already clean and must not be touched

- **`lib/pricing/`**: pure functions, config-driven, unit-tested (`calculate.test.ts`). This is the model the rest of the repo should converge toward. Extend it; never fork its numbers.
- **`app/api/bookings/route.ts` layering**: validate, check availability, price, create intent, persist. The order and separation are right; the fixes above slot into it without restructuring.
- **`lib/availability/` + the month endpoint**: the 1-request-per-month availability design was a deliberate fix for the old 30-requests-vs-rate-limit problem (SESSION-STATE 2026-06-11). Keep the API shape.
- **`proxy.ts` route matchers**: the public-route list and especially the static-file matcher including `mp4|webm|mov|m4v` fixed a real production 404 bug (memory: demarks video middleware). Do not regenerate this matcher from a template.
- **Stripe webhook** (`app/api/webhooks/stripe/route.ts`): signature verification first, idempotent `confirmBooking`, email failure contained. Correct and small.
- **`lib/db/queries/*`**: thin, typed, single-purpose query modules; the right size for this app. Do not wrap them in a repository layer.
- **`(preview)` routes with hardcoded mock data**: documented decision in CLAUDE.md (admin UI review without auth or a custom domain). They will drift from the real admin screens; that is accepted. Do not try to share components between preview and admin.
- **The landing monolith as a structure**: `app/(public)/page.tsx` being one file with `dm-` scoped CSS is a faithful port of the founder-approved mockup, and the media plumbing (every slot renders `/media/*` with graceful fallback, `public/media/README.md` contract) is a genuinely good design that lets the founder ship footage with zero code changes. R3 deduplicates its data, not its structure or its visuals.
- **`components/public/site-nav.tsx` / `site-footer.tsx` on the inner pages**: used and consistent; the old unused landing-section components (hero/pricing/testimonials iteration) have already been removed from `components/public/`, so no dead-code sweep is needed there.
- **`.claude/rules/*` and the Vitest setup**: the rules are good; several findings above are just the code catching up to them.

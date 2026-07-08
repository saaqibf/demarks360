# Demarks360 — Security Audit

Auditor: security-auditor (senior security engineer, read-only pass)
Scope: `~/demarks360` — Clerk auth via `proxy.ts`, all API routes, admin `(admin)` group + `(preview)` mock routes, Drizzle/Neon, Stripe + Mux webhooks, Cloudinary/Mux media, Google Drive import, rate limiting, gallery token access.
Method: every claim below is verified against the actual source and cited by `file:line`. No source was modified.

Severity counts: Critical 0 · High 0 · Medium 4 · Low 4

---

## 1. What is already solid (verified)

- **Admin authorization is enforced twice, and correctly.** The Clerk proxy gates `/admin(.*)` and `/api/admin(.*)`: it requires a signed-in user, checks the role from the session, and then re-fetches the full Clerk user to re-check the role before allowing through. `proxy.ts:35-49`. Independently, **every** `/api/admin/*` handler calls `isAdmin()` at the top and returns 403 otherwise. `app/api/admin/availability/route.ts:14,21`, `app/api/admin/bookings/route.ts:6`, `app/api/admin/bookings/[id]/route.ts:14`, `app/api/admin/drive-import/route.ts:17,28`, `app/api/admin/gallery/route.ts:8`. This defense-in-depth means an admin route stays protected even if the middleware matcher regresses.
- **Role resolution is robust.** `hasAdminRole()` checks public/private/generic metadata plus org-role claims, only accepting `'admin'`/`'org:admin'`, and `getRole()` falls back from session claims to a fresh `currentUser()` fetch. `lib/auth/roles.ts:16-40`. Unit-tested for both accept and reject cases. `lib/auth/roles.test.ts`.
- **Non-public routes default to authenticated.** Anything not on the explicit public allowlist hits `auth.protect()`. `proxy.ts:50-52`. Public list is intentional and scoped. `proxy.ts:4-17`.
- **Payment amounts are computed server-side, never trusted from the client.** The booking route recomputes duration and calls `calculateBookingCost()` on the server, then creates the Stripe PaymentIntent from the server-derived `depositCents`. `app/api/bookings/route.ts:38-58`, `lib/stripe/booking-intent.ts:29-45`. The client cannot set its own price.
- **Stripe webhook signature is verified** with `constructEvent` against `STRIPE_WEBHOOK_SECRET`, rejecting unconfigured/invalid signatures with 400. `app/api/webhooks/stripe/route.ts:9-19`.
- **Zod / strict validation on public inputs.** Booking creation is fully schema-validated including a server-city enum and `agreedToTerms` literal. `lib/validations/booking.ts:4-38`. Availability and notify validate date/month regex and email. `app/api/availability/route.ts:14-30`, `app/api/notify/route.ts:6-24`. Admin availability validates date/time formats and status enums. `app/api/admin/availability/route.ts:5-11`, `app/api/admin/bookings/[id]/route.ts:5-11`.
- **No SQL injection surface.** All DB access is Drizzle with parameterized `eq()/and()` builders; no raw SQL string concatenation found. e.g. `lib/gallery-access/index.ts:16-31`, `lib/db/queries/bookings.ts:88-92`.
- **Gallery access uses a high-entropy unguessable token** (`cuid2` via `createId()`), and gallery resolution refuses cancelled/unpublished galleries. `lib/db/schema.ts:43`, `lib/gallery-access/index.ts:19-31`.
- **Rate limiting present on public write/enumeration paths** (booking 5/min, availability 10/min, notify 3/min). `app/api/bookings/route.ts:10-17`, `app/api/availability/route.ts:6-9`, `app/api/notify/route.ts:11-18`.
- **Security headers + CSP configured**, plus Sentry wrapper. `next.config.ts:4-24`.
- **Secrets are server-side and gitignored.** Only `NEXT_PUBLIC_*` keys (Clerk publishable, Stripe publishable, Sentry DSN, app URL) are client-exposed by design; `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `MUX_TOKEN_SECRET`, `TWILIO_AUTH_TOKEN`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `RESEND_API_KEY` are server-only. `.gitignore:33-36`.

---

## 2. Vulnerability report (severity, attack scenario)

### MEDIUM-1 — `/api/bookings/manage` GET: unauthenticated object access (BOLA/IDOR) leaking PII + gallery token
`app/api/bookings/manage/route.ts` GET takes `?id=<bookingId>` with **no authentication and no rate limit**, and returns booking details **including customer name and the private `galleryToken`**. The route is on the public allowlist (`proxy.ts:15` covers `/api/bookings(.*)`). The `id` is the customer's "booking reference" — displayed to the user and embedded in the manage URL (`app/(public)/book/manage/page.tsx:50,141`).

Attack scenario: anyone who obtains a booking id (shared confirmation link, referrer leak, shoulder-surf, a leaked email) can fetch that booking's customer name, event details, status, **and the gallery access token** — which then unlocks the customer's private gallery at `/gallery/<token>`. The booking id is a `cuid2` so blind enumeration is impractical, but the endpoint grants full read access to whoever holds the id with no additional authorization, which is textbook broken object-level authorization. It should not return the `galleryToken` at all, and should be treated as a capability that requires possession of a secret, not the guessable-in-principle booking reference.

### MEDIUM-2 — `/api/bookings/manage` POST: unauthenticated email trigger + HTML injection into admin inbox
`app/api/bookings/manage/route.ts` POST is unauthenticated, **not rate-limited**, and sends an email to the admin for any valid `bookingId`. The user-supplied `reason` is inserted into the email HTML via `reason.replace(/\n/g, '<br>')` with **no HTML escaping**. `app/api/bookings/manage/route.ts` (POST body → email template).

Attack scenario: (a) an attacker who has (or guesses via a leaked link) a booking id can flood the admin mailbox with cancel/change emails — an unauthenticated spam/abuse amplifier with no throttle. (b) The unescaped `reason` lets an attacker inject arbitrary HTML/links into the email the admin reads (phishing links, spoofed content, tracking pixels) — email HTML injection. Escape all interpolated fields and rate-limit the endpoint.

### MEDIUM-3 — In-memory rate limiter is ineffective on serverless
`lib/rate-limit.ts:6` uses a module-level `Map` with a `setInterval` sweeper. On Vercel each function instance has its own memory and cold starts reset it, so the nominal limits (booking 5/min, notify 3/min, availability 10/min) do not hold across horizontally-scaled instances. Keys are derived from the first `x-forwarded-for` token (`app/api/bookings/route.ts:10`), which is client-spoofable if a request ever reaches the function without traversing the trusted edge.

Attack scenario: an attacker parallelizing across instances (or rotating `x-forwarded-for`) exceeds the intended limits, enabling booking spam, Stripe PaymentIntent churn, and notify-email flooding beyond design.

### MEDIUM-4 — CSP allows `'unsafe-inline'` and `'unsafe-eval'` in `script-src`
`next.config.ts:16` — `script-src 'self' 'unsafe-inline' 'unsafe-eval' ...`. This removes CSP as an XSS backstop. Any injected markup (e.g. via a future stored field rendered as HTML) could execute inline script. Given the app already builds HTML emails from user input (MEDIUM-2), a strict CSP for the rendered site is worth keeping tight.

### LOW-1 — `/api/notify` and confirmation emails interpolate user input into HTML unescaped
`app/api/notify/route.ts:35` inserts the submitted `email` into HTML unescaped. The value is Zod-validated as an email so exploitability is low, but the pattern (string-template HTML with raw user values) is the same class as MEDIUM-2 and should be escaped uniformly.

### LOW-2 — `(preview)` mock admin panel is behind generic auth, not admin-only
The `(preview)/preview/*` routes render an "Admin Panel" UI. They are **not** on the public allowlist and **not** matched by `isAdminRoute`, so they fall through to `auth.protect()` — any signed-in Clerk user (not just admins) can view them. `app/(preview)/preview/layout.tsx`, `dashboard/page.tsx`. Content is entirely hardcoded mock data (`MOCK_BOOKINGS`, `app/(preview)/preview/dashboard/page.tsx:10-17`), so there is no real data exposure today. Risk: it advertises admin surface area to non-admins and could later be wired to live data by mistake. Gate it behind `isAdmin()` or remove before production.

### LOW-3 — Sentry captures full traces + session replays; verify PII scrubbing
`instrumentation.ts:7` and `instrumentation-client.ts:5` set `tracesSampleRate: 1.0`, and `instrumentation-client.ts:8` enables `replaysSessionSampleRate: 0.1`. Booking flows carry customer name, email, phone, and address. Without a `beforeSend`/`maskAllText`/replay privacy config, this can ship customer PII to Sentry. `next.config.ts` also sets `sourcemaps.disable: false` (source maps uploaded — acceptable, they are hidden from the client). Confirm replay masking and PII scrubbing are on before launch.

### LOW-4 — Drive import performs server-side fetches from admin-supplied ids (bounded SSRF)
`app/api/admin/drive-import/route.ts` streams `fileId`/`folderId` through the Google Drive API and PUTs to Mux. This is admin-gated (`isAdmin()` at `:17,28`) and scoped to the Drive service account, so it is low risk, but it is a server-side request driven by request input — keep it admin-only and never widen the allowlist. `cors_origin: '*'` on Mux uploads (`:59,101`) is acceptable for direct-upload URLs but worth noting.

---

## 3. Secure implementation fixes (exact code, exact paths)

### Fix MEDIUM-1 — stop returning the gallery token; require a possession secret
Do not expose `galleryToken` from a lookup keyed on the booking id. Two options:

Minimal (stop the token leak), `app/api/bookings/manage/route.ts` GET — drop the field:
```ts
return NextResponse.json({
  id: b.id,
  eventDate: b.eventDate,
  startTime: b.startTime,
  endTime: b.endTime,
  eventType: b.eventType,
  locationCity: b.locationCity,
  status: b.status,
  // galleryToken removed — never hand the gallery capability out from an id lookup
  customerName: c?.name ?? null,
});
```
Stronger (bind manage access to a secret the customer received by email): add a `manageToken` (separate `cuid2`) column, email it with the confirmation, and require `?id=<id>&t=<manageToken>`; compare with `crypto.timingSafeEqual`. Reserve the `galleryToken` solely for `/gallery/<token>`.

### Fix MEDIUM-2 — escape email fields and rate-limit the POST
`app/api/bookings/manage/route.ts` POST:
```ts
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit'

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!
  ))
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(`manage:${ip}`, { limit: 3, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(0, rl.resetAt) })
  }
  // ...existing validation...
  // then in the template, escape every interpolated value:
  //   ${escapeHtml(c?.name ?? 'Unknown')}, ${escapeHtml(c?.email ?? 'Unknown')},
  //   and for the reason: ${escapeHtml(reason).replace(/\n/g, '<br>')}
}
```
Apply the same `escapeHtml()` to `/api/notify` (LOW-1).

### Fix MEDIUM-3 — shared, durable rate limiting + trusted IP
Replace `lib/rate-limit.ts`'s in-memory `Map` with `@upstash/ratelimit` + `@upstash/redis` (sliding window) so limits are global. Derive IP from the Vercel-set header / `ipAddress(request)` from `@vercel/functions` rather than raw `x-forwarded-for`.

### Fix MEDIUM-4 — nonce-based CSP
In `next.config.ts` (or a proxy-level header), emit a per-request nonce and use `script-src 'self' 'nonce-<value>' https://*.stripe.com https://*.clerk.com https://*.clerk.accounts.dev https://*.sentry.io`, dropping `'unsafe-inline'`/`'unsafe-eval'`. Verify Clerk/Stripe/Sentry loaders accept the nonce.

### Fix LOW-2 — gate the preview panel
Either add `/preview(.*)` to `isAdminRoute` in `proxy.ts:2`, or add a top-of-page `if (!(await isAdmin())) notFound()` guard in `app/(preview)/preview/layout.tsx`, or delete the route group before production.

### Fix LOW-3 — Sentry PII controls
In `instrumentation-client.ts`, configure `Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })` and a `beforeSend` that strips `email`/`phone`/`address` from event payloads; consider lowering `tracesSampleRate` in production.

---

## 4. Production-grade recommendations checklist (ordered)

1. [ ] **Remove `galleryToken` from `/api/bookings/manage` and bind manage access to an emailed secret** (MEDIUM-1). Highest priority — it currently leaks a gallery capability.
2. [ ] **Rate-limit and HTML-escape `/api/bookings/manage` POST** (MEDIUM-2); apply the same escaping to `/api/notify` (LOW-1).
3. [ ] **Move rate limiting to a shared store and use a trusted client-IP source** (MEDIUM-3).
4. [ ] **Harden CSP** to nonce-based `script-src`, drop `unsafe-inline`/`unsafe-eval` (MEDIUM-4).
5. [ ] **Gate or remove the `(preview)` admin panel** so non-admins cannot reach it (LOW-2).
6. [ ] **Turn on Sentry replay masking + PII scrubbing** before launch (LOW-3).
7. [ ] Add a Vercel Firewall/WAF rule in front of `/api/bookings*` and `/api/notify` as defense-in-depth against the serverless rate-limit gap.
8. [ ] Keep `/api/admin/drive-import` admin-only; never broaden its input allowlist (LOW-4).
9. [ ] Add regression tests: 403 on `/api/admin/*` without admin role, 404/403 on preview without admin, and an assertion that `/api/bookings/manage` never returns `galleryToken`.
10. [ ] Confirm all server secrets (`CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `MUX_TOKEN_SECRET`, `TWILIO_AUTH_TOKEN`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `RESEND_API_KEY`) are set only in Vercel server env and never prefixed `NEXT_PUBLIC_` — verified none are today.

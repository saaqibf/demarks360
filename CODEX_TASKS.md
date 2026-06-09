# Demarks360 — Codex Tasks

## Context
Next.js App Router, TypeScript, pnpm, Drizzle ORM with Neon PostgreSQL, Clerk auth, Stripe (PaymentElement + webhooks), Sentry, Resend email.

## ✅ Completed (do NOT redo these)
- Security headers (CSP, HSTS, X-Frame-Options, etc.) in next.config.ts
- Rate limiting on `app/api/bookings/route.ts` — 5 req/60s per IP
- Sentry instrumentation (instrumentation.ts, instrumentation-client.ts, global-error.tsx)
- Proxy.ts (route protection migrated from middleware.ts)
- CSP updated to include Mux video domains (stream.mux.com, image.mux.com)
- Email capture wired to real Resend API (app/api/notify/route.ts)
- Sitemap, robots.txt, full OG metadata, LocalBusiness + FAQ JSON-LD added
- 404 not-found.tsx and error.tsx added
- DateChecker widget added to homepage (uses existing /api/availability)

## 🔴 High Priority — Security

### 1. Rate limit the notify endpoint
`app/api/notify/route.ts` accepts email submissions. Add rate limiting (3 req/min per IP) to prevent inbox spam abuse. Use the same pattern as `app/api/bookings/route.ts`.

### 2. Validate admin route auth on all admin API routes
Audit each route — confirm it checks Clerk org role or custom metadata before processing:
- `app/api/admin/availability/[id]/route.ts`
- `app/api/admin/availability/route.ts`
- `app/api/admin/bookings/[id]/route.ts`
- `app/api/admin/bookings/route.ts`
- `app/api/admin/drive-import/route.ts`
- `app/api/admin/gallery/route.ts`

If any are missing auth checks, add them using the same pattern as existing protected routes.

### 3. Stripe webhook secret validation
Verify `app/api/webhooks/stripe/route.ts` validates `STRIPE_WEBHOOK_SECRET` and rejects unsigned requests. Should return 400 for missing/invalid signature, not 500.

### 4. Rate limit availability check route
`app/api/availability/route.ts` is public (no auth). Add rate limit (10 req/min per IP) to prevent date enumeration attacks.

## 🟡 Medium Priority — Build Quality

### 5. Fix incomplete code
- `app/(admin)/admin/availability/availability-manager.tsx` — resolve any TODOs
- `app/(admin)/admin/bookings/[id]/booking-actions.tsx` — resolve any TODOs
- `lib/stripe/index.ts` — resolve hardcoded values

### 6. TypeScript + build clean
```bash
cd ~/demarks360
pnpm exec tsc --noEmit 2>&1
pnpm build 2>&1 | grep -E "error|Error" | grep -v node_modules
```
Fix any errors found.

## 🟢 Low Priority — Ops

### 7. Drive import feature
`app/(admin)/admin/bookings/[id]/drive-import.tsx` — if stub, note what credentials are needed. Do NOT implement OAuth (requires user secrets).

### 8. Stripe webhook URL verification
Production endpoint: `https://demarks360.com/api/webhooks/stripe`
Verify it matches what's registered in Stripe dashboard.

## How to build & deploy
```bash
cd ~/demarks360
pnpm build
vercel --prod
```

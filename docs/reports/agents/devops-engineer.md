# DevOps Engineer Report: Demarks360

Audit date: 2026-07-08. Read-only audit. No source, config, or git changes were made.

## 1. Current state (verified)

**Stack and build**
- Next.js 16.2.6 App Router (`app/` at repo root), React 19.2.4, TypeScript 5, pnpm (`pnpm-lock.yaml`, local pnpm 11.1.2, no `packageManager` field in package.json).
- `pnpm build` runs `next build --webpack`. Drizzle ORM + `@neondatabase/serverless` (neon-http driver) against Neon Postgres. Clerk auth via `proxy.ts` middleware. Stripe, Mux, Resend, Google Drive import.
- Vercel project `demarks360` (team `team_NNTl5qVH8OFDR94ccjdIF9Rb`), repo `github.com/saaqibf/demarks360`, prod domain `demarks360.vercel.app`.

**Deploy path today**
- No `.github/` directory. Zero CI. No `vercel.json` (no crons, no config-as-code).
- Ships via `~/.claude/skills/ship-verify/scripts/ship.sh demarks "msg"`: local `pnpm build`, commit + push `main`, poll `npx vercel ls` for Ready, manual `vercel alias set <deploy> demarks360.vercel.app`, curl probe. Prod domain moves only by manual alias.

**Sentry (verified in code)**
- `@sentry/nextjs` 10.53.1 installed and genuinely wired, not just referenced:
  - `instrumentation.ts`: `Sentry.init` for nodejs and edge runtimes, `tracesSampleRate: 1.0`, plus `export const onRequestError = Sentry.captureRequestError`.
  - `instrumentation-client.ts`: client init with `tracesSampleRate: 1.0`, `replaysOnErrorSampleRate: 1.0`, `replaysSessionSampleRate: 0.1`, router transition capture.
  - `next.config.ts`: wrapped in `withSentryConfig` (org `demarks360`, project `demarks360`, source maps enabled, `automaticVercelMonitors: true`). CSP allows `https://*.sentry.io`.
- Everything keys off `NEXT_PUBLIC_SENTRY_DSN`. If that var is empty in Vercel, Sentry silently no-ops. `SENTRY_AUTH_TOKEN` is blank in `.env.example`; without it in the Vercel build env, source maps never upload and prod stack traces are minified garbage. Both need verification in the Vercel dashboard; the code side is done.

**Environment variables**
- No central env validation (nothing like HL's `src/lib/env.ts`). Each module reads `process.env` directly.
- Module-load crashes (confirmed): `lib/db/index.ts` calls `neon(process.env.DATABASE_URL!)` at import time, and `lib/stripe/index.ts` throws at import if `STRIPE_SECRET_KEY` is unset. Any route importing either crashes `next build` during static page collection when the var is missing. CLAUDE.md already documents the neon() one.
- Lazy/guarded (good patterns to copy): `lib/email/resend.ts` (`getResend()` throws only when called), `lib/mux.ts` (lazy `new Mux`), `lib/google-drive.ts` (checked at call time with a clear error).
- Required in production: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (build only), `GOOGLE_SERVICE_ACCOUNT_JSON` (Drive import), `ADMIN_EMAIL`, `RESEND_FROM_EMAIL`.
- Documentation drift found:
  - `.env.example` documents Twilio vars (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`) that are used NOWHERE in `app/` or `lib/`. Stale.
  - `ADMIN_EMAIL` and `RESEND_FROM_EMAIL` are used in code but missing from `.env.example`. `ADMIN_EMAIL` falls back to a hardcoded personal Gmail in `app/api/notify/route.ts:32` and `hello@demarks360.com` in `app/api/bookings/manage/route.ts:58`. `RESEND_FROM_EMAIL` falls back to `onboarding@resend.dev`, which will land in spam.
  - Several links fall back to `https://demarks360.vercel.app` when `NEXT_PUBLIC_APP_URL` is unset; harmless now, wrong the day a custom domain arrives.

**Auth**
- Clerk middleware in `proxy.ts` protects `/admin(.*)` and `/api/admin(.*)`; public matcher covers booking, gallery, webhooks. Matcher excludes video/static extensions (the /media mp4 fix).
- CLAUDE.md confirms: `pk_test_*` keys only work on localhost; production needs a custom domain plus `pk_live_*`. So live admin auth on `demarks360.vercel.app` is running on test-mode Clerk. `(preview)` routes are deliberately auth-free with mock data.

**Database migrations**
- drizzle-kit 0.31.10. `drizzle.config.ts` points at `lib/db/schema.ts`, out dir `lib/db/migrations` (2 migration files + `meta/` journal exist).
- Workflow per CLAUDE.md: `pnpm drizzle-kit generate` then `pnpm drizzle-kit migrate`, run manually from a laptop with `.env.local`. Nothing runs migrations in the deploy path. Same ordering risk as any manual scheme: code can go live before its schema.

**Testing**
- Vitest 4 with jsdom + Testing Library. 5 real test files (google-drive, roles, booking validation, pricing, schema). `pnpm test:run` is CI-ready. No typecheck script; CLAUDE.md says `npx tsc --noEmit`.

**Email / webhook behavior**
- Stripe webhook (`app/api/webhooks/stripe/route.ts`) verifies signatures, confirms booking on `payment_intent.succeeded`, then tries the Resend confirmation email in try/catch with `console.error` only. A failed email still returns 200, so Stripe never retries and the customer silently gets no confirmation.

## 2. Risks, ranked

1. **No CI.** Nothing gates pushes to `main`. Local ship.sh builds are the only check, and only for pushes that go through it.
2. **Sentry possibly a no-op in prod.** The wiring is complete in code, but if `NEXT_PUBLIC_SENTRY_DSN` or `SENTRY_AUTH_TOKEN` are missing in Vercel, there is zero error visibility and the team believes otherwise. Verify in the dashboard and in Sentry itself (send a test event).
3. **Module-load env crashes.** `lib/db/index.ts` (neon) and `lib/stripe/index.ts` (throw) make builds and cold starts fail hard when an env var is missing, including in CI and preview environments. There is no schema telling anyone what the full required set is.
4. **Clerk test keys in production.** Admin auth on the live vercel.app domain runs `pk_test_*`. Test-mode Clerk instances have relaxed guarantees and shared-domain cookies; the real fix (custom domain + `pk_live_*`) is a launch blocker.
5. **Silent email failure after payment.** Booking confirmed in DB, email fails, Stripe gets 200, nobody is told. Console.error in a serverless function is effectively /dev/null.
6. **Manual migrations with no deploy-order guarantee.** drizzle-kit migrate from a laptop; a shipped build can reference columns that do not exist yet.
7. **Sentry sample rates are cost bombs.** `tracesSampleRate: 1.0` on server, edge, and client plus session replay will burn the free quota fast once traffic arrives, after which real errors get dropped.
8. **ship.sh deployment race.** `vercel ls | head -1` can grab a different deployment than the one just pushed and alias it to prod.
9. **No uptime monitoring or alerting.** Outages are found by humans.
10. **Env documentation drift.** Stale Twilio vars, undocumented `ADMIN_EMAIL`/`RESEND_FROM_EMAIL`, personal Gmail hardcoded as a fallback recipient.
11. **Preview deployments and `(preview)` routes.** Vercel preview URLs should have Deployment Protection on; the auth-free `/preview/*` mock routes on the prod domain should be noindexed so they never rank.

## 3. CI/CD workflow (ready for `.github/workflows/ci.yml`)

Design notes: pnpm via `pnpm/action-setup` pinned to major 11 (matches the lockfile's generator). Build needs placeholder env because of the module-load reads: `DATABASE_URL` must be a syntactically valid postgres URL for `neon()`, `STRIPE_SECRET_KEY` must exist for `lib/stripe`, and Clerk needs a well-formed publishable key (the value below is the standard Clerk CI dummy, base64 of `clerk.example.com$`). With `SENTRY_AUTH_TOKEN` unset, the Sentry plugin skips source map upload with a warning, which is correct for CI.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      # Placeholders that satisfy module-load env reads at build time. Not real secrets.
      DATABASE_URL: postgresql://ci:ci@ep-placeholder.us-east-2.aws.neon.tech/neondb?sslmode=require
      STRIPE_SECRET_KEY: sk_test_ciplaceholder
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_ciplaceholder
      STRIPE_WEBHOOK_SECRET: whsec_ciplaceholder
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_test_Y2xlcmsuZXhhbXBsZS5jb20k
      CLERK_SECRET_KEY: sk_test_ciplaceholder
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      RESEND_API_KEY: re_ciplaceholder

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 11

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm exec tsc --noEmit

      - name: Lint
        run: pnpm lint

      - name: Unit tests
        run: pnpm test:run

      - name: Build
        run: pnpm build
```

Recommended companions (add when GitHub secrets exist):
- `.github/workflows/migrate.yml`: `workflow_dispatch` job running `pnpm exec drizzle-kit migrate` with the prod `DATABASE_URL` secret, so schema changes stop depending on a laptop and are run BEFORE the deploy is aliased.
- Add `"packageManager": "pnpm@11.1.2"` to package.json (one line, prevents CI/local pnpm skew via corepack). Not done in this audit.
- GitHub branch protection on `main` requiring the `verify` check.

## 4. Monitoring strategy

**Finish Sentry (code is done; ops is not)**
1. In Vercel Project Settings, confirm `NEXT_PUBLIC_SENTRY_DSN` is set for Production and Preview, and `SENTRY_AUTH_TOKEN` is set (build env) so source maps upload.
2. Send a verification event (throw in a scratch route on a preview, or `npx sentry-cli send-event`) and confirm it arrives in the `demarks360` Sentry project with readable stacks.
3. Lower sample rates before launch: server/edge `tracesSampleRate: 0.1`, client `0.1`, keep `replaysOnErrorSampleRate: 1.0`, drop `replaysSessionSampleRate` to `0.01`. (Code change for a future session; flagged only.)
4. Alert rules: new issue in prod -> email; any event on the Stripe webhook route -> email (payments are the money path).
5. `automaticVercelMonitors: true` is already set, so any future Vercel Cron gets check-in monitoring for free.

**Uptime and alerting**
- External 60s check on `https://demarks360.vercel.app/` expecting 200 (UptimeRobot or Better Stack free tier), alert to founder email.
- Second check on a booking-critical page (`/book`) since it is the revenue path.
- Enable Vercel deployment-failure notifications for the project.
- Later: a `/api/health` route doing `select 1` through drizzle to separate DB from app outages.

**Payment email gap (webhook)**
- Short term: replace the `console.error` in `app/api/webhooks/stripe/route.ts` with `Sentry.captureException` (plus keep console). One line once Sentry is verified; a paying customer with no confirmation becomes an alert instead of silence.
- Medium term: record failed sends in a table and add a Vercel Cron retry route in `vercel.json` (every 5 minutes, resend pending). Stripe webhook retries are NOT a substitute: the handler returns 200 after a failed email, deliberately, so the booking is not double-confirmed.

**Logs**
- Add a Vercel Log Drain (Axiom free tier) when convenient; function logs currently expire quickly and `console.error` is the only trail for email and Drive-import failures.

## 5. Database migration safety

- Today: manual `pnpm drizzle-kit generate` + `pnpm drizzle-kit migrate` with `.env.local` credentials. Two migrations exist with an intact `meta/` journal, so the repo is on the journaled-migration path (good; never mix in `drizzle-kit push` against prod, it bypasses the journal and creates drift).
- Rules to adopt:
  1. Prod schema changes only via generated SQL migrations, applied with `drizzle-kit migrate`, ideally from the `migrate.yml` workflow above.
  2. Order: migrate BEFORE aliasing the deploy that needs the schema. Expand first, contract in a later release. Never drop or rename a column in the same release that stops using it.
  3. Review every generated SQL file before applying; drizzle-kit can emit destructive statements (column drops) when a rename is not annotated.
  4. Neon safety net: create a Neon branch before risky migrations; use point-in-time restore as the backstop. Give Preview deployments a Neon branch `DATABASE_URL`, not prod (verify current Vercel Preview env; sharing prod DB with previews is the biggest hidden risk here).

## 6. Rollback procedure

Prod is a manual alias, so rollback is one command:

1. Find the last good deployment URL (`npx vercel ls`, or the previous "SHIP OK" output).
2. `npx vercel alias set <previous-deployment-url> demarks360.vercel.app`
3. Probe: `curl -s -o /dev/null -w '%{http_code}' https://demarks360.vercel.app` expecting 200, then a browser check of `/` and `/book`.
4. Database: schema rolls forward only. Expand-style migrations keep old code working; if a migration itself is bad, restore the Neon branch or point-in-time state.
5. Stripe: if rolling back past a webhook-handler change, check the Stripe dashboard for failed webhook deliveries during the incident window and replay them.

Improvements: have ship.sh log every "SHIP OK" URL to a history file, and select the deployment by commit SHA rather than `vercel ls | head -1`.

## 7. Preview deployment protection

- Turn ON Deployment Protection (Vercel Authentication) for Preview deployments in project settings. Previews run with whatever env Preview has; they should not be world-readable.
- Preview env vars: Stripe TEST keys, Neon branch DB, Clerk test instance. Never prod values.
- The `(preview)` route group (`/preview/*`) is intentionally auth-free mock UI and ships on the prod domain. Acceptable for the current review workflow, but add `robots: noindex` metadata to that layout before launch, and plan to delete the group once the custom domain + `pk_live_*` Clerk instance exist.

## 8. Production deployment checklist

Before every ship:
- [ ] CI green (typecheck, lint, vitest, build) once the workflow above is added
- [ ] If `lib/db/schema.ts` changed: migration generated, SQL reviewed, `drizzle-kit migrate` run against prod BEFORE aliasing
- [ ] New env vars added to Vercel (Production AND Preview) and to `.env.example`
- [ ] New public assets (video especially) explicitly `git add`-ed and covered by the proxy matcher exclusions
- [ ] `bash ~/.claude/skills/ship-verify/scripts/ship.sh demarks "message"` returns SHIP OK
- [ ] Visual check of `/`, `/book`, and one admin page on prod

One-time hardening (priority order):
- [ ] Add `.github/workflows/ci.yml` from section 3
- [ ] Verify Sentry live in prod: DSN + auth token in Vercel, test event received, source maps readable
- [ ] Add Sentry capture to the Stripe webhook email failure path
- [ ] Lower Sentry sample rates for launch traffic
- [ ] Set `ADMIN_EMAIL`, `RESEND_FROM_EMAIL` (verified domain sender, not resend.dev), and `NEXT_PUBLIC_APP_URL` in Vercel; add them to `.env.example`; remove stale Twilio block
- [ ] External uptime checks on `/` and `/book` with email alerts; Vercel deployment-failure notifications on
- [ ] Deployment Protection ON for previews; Preview env split from prod (Neon branch, Stripe test, Clerk test)
- [ ] Custom domain + Clerk `pk_live_*` before real launch (test keys on vercel.app is a blocker)
- [ ] `packageManager` field pinned in package.json; branch protection on `main`
- [ ] Migration workflow (`migrate.yml`) with prod `DATABASE_URL` as a GitHub secret
- [ ] noindex the `/preview/*` route group

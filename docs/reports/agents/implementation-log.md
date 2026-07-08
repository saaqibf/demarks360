# Implementation Log: Audit Remediation

Date: 2026-07-08. Implements the prioritized fixes from the five audit reports in `docs/reports/agents/`. Money path first. All ten items implemented; none skipped. `pnpm build` was run after every numbered item (exit 0 each time), and `npx tsc --noEmit` plus `pnpm test:run` pass at the end (65 tests, 6 files).

---

## 1. Availability fail-open, now fail-closed

Booked dates and slots can no longer render as free when the availability fetch fails.

- `app/api/availability/route.ts`: both the month and date paths used to fabricate a successful empty response on a DB error (which made client-side fail-closed impossible). They now log and return 503 so the client can react.
- `components/public/book/date-picker.tsx`: added an `availStatus` (`loading | ready | error`) state. Every date is disabled unless status is `ready`. A loading row and an error row (with a Retry button, `role="alert"`) render inside the calendar card. Fetch is cancellation-safe and re-runs on retry.
- `components/public/book/time-picker.tsx`: removed the fabricated-empty-availability fallback. On fetch failure the step renders an explicit error state with Retry and Back buttons; no slot is ever selectable from a failed fetch.

## 2. Checkout idempotency, pending-booking expiry, server slot-overlap check

Remounting step 5 no longer creates duplicate pending bookings or PaymentIntents, abandoned checkouts stop eating availability, and slot overlap is enforced at the API boundary.

Client:
- `app/(public)/book/page.tsx`: `BookingState` gains `pendingBookingId`, `pendingClientSecret`, `pendingPayloadSig`.
- `components/public/book/checkout-step.tsx`: the init effect builds the POST payload once (`buildBookingPayload`) and uses its JSON string as a signature. If the wizard already holds a booking whose signature matches, checkout reuses the cached bookingId and clientSecret with no POST at all. If details changed, it POSTs with the existing `bookingId` so the server updates in place. New prop `onChange` writes the result back into wizard state.

Server:
- `lib/validations/booking.ts`: optional `bookingId` field on `createBookingSchema`.
- `lib/db/queries/availability.ts`: new `PENDING_BOOKING_TTL_MINUTES = 30` and `isActiveBooking()`. Pending bookings older than 30 minutes no longer count toward the 2-per-day cap or appear in `bookedSlots` (confirmed bookings always count). `getAvailabilityForDate` accepts `excludeBookingId` so the booking being updated does not conflict with itself.
- `lib/availability/index.ts`: month counting uses `isActiveBooking`; `checkBookingAvailability` threads `excludeBookingId` through.
- `lib/db/queries/bookings.ts`: new `updatePendingBooking()` updates the row and bumps `createdAt` so the expiry window restarts with the refreshed intent.
- `app/api/bookings/route.ts`:
  - Server-side slot-overlap check (strict interval overlap against `bookedSlots`) returns 409 "That time slot was just taken" (codebase report R4).
  - Reuse path: when a valid pending booking id arrives, the existing Stripe PaymentIntent amount is updated (`stripe.paymentIntents.update`) and the row updated in place; on any Stripe failure it falls through to creating a fresh booking, so the funnel never dead-ends.

Note: expired pendings are excluded from availability rather than hard-cancelled; an admin sweep route (report R1 step 3) is left as future work since exclusion alone removes the customer-facing harm.

## 3. "Other" event type no longer 422s at the end of the funnel

- `lib/validations/booking.ts`: `eventType` changed from a closed enum to sanitized free text: control characters stripped in a preprocess step, then trimmed, min 2 / max 100. The funnel can no longer 422 on a custom event type.
- `components/public/book/details-form.tsx`: the fragile `' '` (single space) sentinel is gone. `BookingState` gains an explicit `isOtherEventType` boolean; picking "Other" clears `eventType` and sets the flag; the free-text input has `maxLength={100}` and an `aria-label`; validation requires at least 2 characters with a specific message for the Other case.
- `app/(public)/book/page.tsx`: `normalizeEventType` now returns `{ eventType, isOtherEventType }`. Known aliases map to canonical values; unknown marketing query values become a custom event type (capped at 100 chars) instead of a value the server would reject.
- `lib/email/escape-html.ts` (new): shared `escapeHtml()`. Because eventType is now free text, `lib/email/templates/booking-confirmation.ts` escapes the customer first name, event type, and location before interpolation into email HTML.
- `lib/validations/booking.test.ts`: replaced the "rejects unknown eventType" case with: accepts custom free text, rejects under 2 chars, rejects over 100 chars, strips control characters, rejects control-characters-only input.

## 4. /api/bookings/manage secured

- `app/api/bookings/manage/route.ts` (rewritten):
  - GET now requires `email` alongside `id` and only returns booking details (including `galleryToken`) when the email matches the booking's customer email (case-insensitive). Unknown id and wrong email return the identical 404 so the endpoint is not an existence oracle. GET is rate limited (10/min per IP).
  - POST is rate limited (3/min per IP), requires the same email proof, validates `requestType` against the two allowed values, caps `reason` at 2000 chars, and HTML-escapes every interpolated field (name, email, phone, event type, status, reason) via `escapeHtml()` before building the admin email. The reason's newlines become `<br>` only after escaping.
- `app/(public)/book/manage/page.tsx`: added an email-confirmation gate. The page no longer auto-fetches on mount; the visitor first enters the email they booked with ("Confirm your email" form with error and rate-limit messaging), and the verified email is sent with the cancel/change POST. Existing `manage?id=...` links from confirmation emails keep working; they now just ask for the email first.

## 5. Pricing and FAQ single source of truth

- `lib/content/landing.ts` (new): `PACKAGES` (all prices computed from `PRICING.HOURLY_RATE`), `FAQS` (canonical copy, taken from the founder-approved visible markup), and `FROM_PRICE` (`HOURLY_RATE x MIN_DURATION`, currently $225).
- `app/(public)/page.tsx`: metadata description interpolates `FROM_PRICE`; the packages section maps `PACKAGES` into the existing `.dm-pack` markup (identical classes, badge, starred CTA variant, compact price style for All-night); the FAQ JSON-LD and the visible `<details>` list are both generated from the same `FAQS` array, ending the drift ("Can the booth run outdoors?" vs "Can it run outdoors?" is resolved in favor of the visible copy).
- `components/public/book/time-picker.tsx`: the live estimate uses `PRICING.HOURLY_RATE` instead of a hardcoded 150.
- Verified in the prerendered HTML: $300, $450, From $600, From $225 all present and derived; the old JSON-LD-only FAQ phrasing is gone.

## 6. Database indexes

- `lib/db/schema.ts`: added per the performance report sketch:
  - `bookings`: `bookings_event_date_idx`, `bookings_customer_id_idx`, `bookings_stripe_pi_idx`, unique `bookings_gallery_token_idx`.
  - `gallery_items`: `gallery_items_booking_id_idx`, `gallery_items_showcase_idx` (isPublicShowcase, published).
  - `availability_blocks`: `availability_blocks_date_idx`.
- Generated `lib/db/migrations/0002_colorful_bromley.sql` via `pnpm drizzle-kit generate`. The file is index-only (per `.claude/rules/database.md`). Migration was NOT run against the database, per instructions. Note for whoever applies it: the unique index on `gallery_token` assumes no duplicate tokens exist (tokens are cuid2, so collisions are not expected).

## 7. Focus visibility on booking inputs

- `components/public/book/details-form.tsx`: removed `outline: 'none'` from the shared `inputStyle` (used by every text input and select in the details step).
- `app/(public)/book/manage/page.tsx`: removed `outline: 'none'` from the reason textarea.
- The existing global rule in `app/globals.css` (`:focus-visible { outline: 2px solid var(--color-amber); outline-offset: 3px; }`) now applies to every input in the money path, consistent with the amber design. Admin and preview-route inputs with the same pattern were left untouched (out of scope for the booking money path).

## 8. Booking wizard sessionStorage persistence

- `components/public/book/wizard-storage.ts` (new): shared `BOOKING_WIZARD_STORAGE_KEY` (pages may not export arbitrary consts).
- `app/(public)/book/page.tsx`: wizard state persists to sessionStorage on every change and rehydrates after mount (not in the initializer, to avoid SSR hydration mismatches). Rehydration is defensive: `rehydrateStoredState()` rebuilds the state field by field from untrusted JSON with type checks per field, validates `step` is 1-5, and clamps the step if prerequisites are missing (no date forces step 1, missing times force step 2). Snapshots expire after 30 minutes, matching the server's pending-booking TTL so a restored session never reuses a stale PaymentIntent. Persist failures are swallowed (wizard still works without storage).
- `app/(public)/book/confirmation/clear-wizard-storage.tsx` (new) + `app/(public)/book/confirmation/page.tsx`: after a successful payment the confirmation page clears the snapshot so a return visit to /book starts fresh instead of restoring a consumed PaymentIntent.
- Synergy with item 2: the persisted `pendingBookingId`/`pendingClientSecret` mean a refresh at step 5 reuses the same booking and intent.

## 9. three.js out of the critical bundle

- `app/(public)/_components/ring-scene.tsx` (new): the entire WebGL torus scene moved here verbatim (same geometry, materials, lights, pointer parallax, resize handling, gsap ticker, and the two ScrollTrigger tweens), with named `three` imports instead of `import * as THREE`. Proper cleanup on unmount (ticker removed, triggers killed, listeners removed, renderer disposed).
- `app/(public)/_components/demarks-landing-fx.tsx`: loads it with `next/dynamic` (`ssr: false`, null loading state) and renders `<RingScene />`; the `three` import is gone from this module.
- Verified in the build output: the three.js chunk (`e31cea27`, 180 KB) is no longer referenced by any script tag in the prerendered landing HTML; it is only in the webpack runtime's async chunk map, so it loads on demand after the main bundle. The second 340 KB three-related chunk from the audit no longer ships with the page. Visuals are identical.

## 10. CI workflow

- `.github/workflows/ci.yml` (new): from the devops report's YAML. pnpm 11 via `pnpm/action-setup`, Node 22 with pnpm cache, frozen-lockfile install, typecheck (`pnpm exec tsc --noEmit`), unit tests (`pnpm test:run`), and build with the report's placeholder env (valid-shape Neon URL, Stripe test placeholders, standard Clerk CI dummy key) to satisfy the module-load env reads. Concurrency cancellation per ref, 20-minute timeout.
- Deviation from the report YAML: the Lint step is omitted. `pnpm lint` currently fails on pre-existing issues unrelated to this work (admin dashboard `Date.now` purity errors, `@ts-ignore` in drive-import, `<a href="/">` on the founder-approved landing markup and error page, and eslint scanning a stale `.claude/worktrees/` copy). Shipping a guaranteed-red CI would be useless; a comment in the workflow says to add lint back once that debt is cleared. The task's own scope line for this item ("pnpm, typecheck, vitest, build") does not include lint.

---

## Known pre-existing issues intentionally not touched

- `pnpm lint` failures listed above (pre-date this work; fixing the landing anchors would touch founder-approved markup).
- In-memory rate limiter is per-instance on serverless (security MEDIUM-3); the new manage-route limits use the same primitive. A durable store (Upstash) is a separate infra decision.
- No cron sweep for expired pendings and their PaymentIntents (they are excluded from availability, which removes the customer harm; Stripe PaymentIntents in `requires_payment_method` expire on Stripe's side).
- Admin/preview inputs still set `outline: 'none'` (outside the booking money path).

## Verification

- `pnpm build`: exit 0 after every numbered item and at the end (exit codes checked directly, no grep pipes).
- `npx tsc --noEmit`: exit 0.
- `pnpm test:run`: exit 0, 65 tests passed across 6 files (including the new eventType free-text cases).
- Prerendered landing HTML inspected: prices and FAQ copy derive from `lib/content/landing.ts`; three.js absent from initial scripts.
- No git commit, push, or deploy commands were run. `pnpm drizzle-kit migrate` was NOT run.

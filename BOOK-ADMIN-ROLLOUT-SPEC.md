# Golden Hour Cinema — Booking Flow, Admin, and Gallery Rollout Spec

The public marketing site is fully rolled out (see committed `components/public/` and `app/globals.css`). This spec covers everything that still uses the LEGACY token meanings: the /book flow, admin, preview, gallery, and auth pages.

## The problem you are fixing

These files were written for an older dark design where `--color-text` resolved to a LIGHT color and `--color-crimson` (#C0293A red) was the accent. The committed token system changed the meanings:

- `--color-text` is now DARK (#1C1610, for light backgrounds). On the dark /book and admin pages this renders text invisible (dark on dark). Use `--color-text-light` (#F3EAD9) on dark surfaces.
- `--color-crimson` is a legacy red alias that must stop being used. The accent is `--color-amber` (#C9913F) and `--color-amber-light` (#E8B25C).
- `--color-ink` (= charcoal #141009), `--color-surface` (#1A140B), `--color-surface-2` (#221A0F) are valid dark surface aliases and may stay.

## Files to fix (every file that references --color-crimson, or uses --color-text / --color-muted on a dark background)

Booking flow (dark stage pages, customer-facing, must look premium):
- app/(public)/book/page.tsx
- app/(public)/book/confirmation/page.tsx
- components/public/book/date-picker.tsx
- components/public/book/time-picker.tsx
- components/public/book/addons-step.tsx
- components/public/book/details-form.tsx
- components/public/book/checkout-step.tsx

Gallery + auth + error:
- app/gallery/[token]/page.tsx
- app/gallery/[token]/gallery-player.tsx
- app/sign-up/[[...sign-up]]/page.tsx
- app/global-error.tsx

Admin + preview (internal, calm and functional, same tokens):
- components/admin/admin-sidebar.tsx
- app/(admin)/layout.tsx
- app/(admin)/admin/dashboard/page.tsx
- app/(admin)/admin/availability/page.tsx
- app/(admin)/admin/availability/availability-manager.tsx
- app/(admin)/admin/bookings/[id]/page.tsx
- app/(admin)/admin/bookings/[id]/booking-actions.tsx
- app/(admin)/admin/bookings/[id]/device-upload.tsx
- app/(admin)/admin/bookings/[id]/drive-import.tsx
- app/(preview)/preview/layout.tsx
- app/(preview)/preview/dashboard/page.tsx
- app/(preview)/preview/availability/page.tsx
- app/(preview)/preview/bookings/detail/page.tsx

## Conversion rules

1. `var(--color-crimson)` → `var(--color-amber)` for rules/eyebrows/icons/dots, `var(--color-amber-light)` for selected/filled states. Text ON an amber fill is `var(--color-charcoal)`, never #fff.
2. On dark surfaces: text colors `var(--color-text)` → `var(--color-text-light)`; secondary text `rgba(245,240,234,X)` patterns may stay but prefer `var(--color-muted-light)` where the opacity is 0.5-0.7.
3. Headings: serif sentence case, weight 400-500, no textTransform uppercase, no fontWeight 700+. "Pick a Date" → "Pick a date", "Choose Your Time" → "Choose your time", etc. Step eyebrows ("Step 1") stay small uppercase labels with 0.22em letter spacing in amber.
4. Buttons: primary actions become `.btn-primary` (amber pill); secondary become `.btn-secondary` where the surrounding layout allows. Form submit buttons that span full width may keep their width but adopt amber-light fill + charcoal text + 999px radius.
5. The booking flow is a CALM interior: no new animations, no letterbox bars, no em-italic phrases required in headings (allowed where natural). Calm, premium, legible.
6. Admin/preview: functional dark UI, amber accents, sentence-case headings. Preview pages must visually match their admin counterparts (they are the same UI with mock data).
7. NO em dashes in any copy. NO hardcoded new hex values: tokens only. Border radius on cards 10-14px, buttons 999px.
8. Do NOT change any business logic, props, state, fetch calls, validation, Stripe/Clerk integration, schema markup, or copy meaning. Restyle only.
9. Keep all accessibility attributes, focus styles, disabled states, 44px touch targets.
10. Calendar day cells in date-picker: available days `var(--color-text-light)`, fully-booked days `var(--color-amber)` with the title tooltip kept, disabled days `rgba(243,234,217,0.18)`, selected day amber-light fill with charcoal text.

## Verify before finishing

- `pnpm exec tsc --noEmit` passes
- `pnpm build` passes
- `pnpm test:run` passes
- `grep -rn "color-crimson" components/ app/ --include="*.tsx"` returns NOTHING
- Do NOT commit. Print the list of files changed and anything you intentionally skipped with the reason.

# Demarks360 — Vision, UI Gap Audit & Competitive Edge
_Written for Codex. This is the full picture on where we are, what's broken, what needs building, and what will make this the best 360 booth site on the internet._

---

## 1. Current State Summary

Stack: Next.js App Router, TypeScript, pnpm, Drizzle + Neon, Clerk, Stripe (PaymentElement), Sentry, Resend. Design: Golden Hour Cinema — Bodoni Moda serif, Figtree sans, amber accent (#C9913F/#E8B25C), stage charcoal (#141009), cream (#F5EFE2). Pill buttons (999px radius). Dark booking flow, sand-background light pages for legal docs.

The homepage landing page (ported from `~/design-directions/demarks-d-cinema-website.html`) is fully styled. The 5-step booking flow exists. The admin dashboard exists. Most pages are done. What is NOT done is listed below.

---

## 2. UI Gap Audit — Fix These

### 2a. Buttons that go nowhere / dead ends

| Location | Current state | What it should do |
|---|---|---|
| Homepage — "HOW IT WORKS" nav link | Scrolls to section (works) | OK |
| Homepage — "GALLERY" nav link | Scrolls to section (works) | OK |
| Homepage — Event type links in footer (Birthdays, Weddings) | `/book` (works) | Better: `/book?eventType=Birthday` prefill |
| Homepage — "PRICING" nav link | Scrolls to section (works) | OK |
| Homepage — "FAQ" nav link | Scrolls to section (works) | OK |
| Sign-up / sign-in pages | Exist via Clerk | Verify they have SiteNav + branded layout |
| Account page (`/account`) | Unknown state | Needs full audit — should show past bookings |
| Gallery page (`/gallery`) | Unknown state | Full audit needed |
| Admin-login page | Unknown state | Should be minimal, dark, branded |

### 2b. Pages that exist but look disconnected

These were fixed in the 2026-06-17 session. Confirm they look right after the fix:
- `/privacy` — now has SiteNav + SiteFooter, uses CSS tokens (was using raw hex and had no nav)
- `/terms` — same fix
- `/book/confirmation` — now has SiteNav + SiteFooter

### 2c. Missing pages (build them)

**1. `/book/confirmation` error state (Booking not found)**
Status: Fixed — now has SiteNav + proper amber CTA button instead of plain text link.

**2. Gallery page `/gallery` — full audit needed**
The footer and nav link to `/gallery` but it may be an empty shell. Build or verify it renders properly with the Golden Hour Cinema design. Gallery should show real 360 clips with a cinematic filmstrip or masonry grid, dark background, amber accent on hover, Mux video embed with custom controls.

**3. Account page `/account`**
Probably a Clerk-generated blank. Should be a dark-theme authenticated page showing:
- Past bookings list (date, event type, status)
- Gallery links per booking
- Payment history summary
- "Book again" CTA

**4. `/book?eventType=Birthday` pre-fill**
Allow event type to be pre-filled via URL param so footer/marketing links can send users to booking with their event type already set.

**5. 404 page**
Already exists (`not-found.tsx`) and is properly branded. No action needed.

---

## 3. Light vs Dark — Decision Per Section

This is the rule going forward. When in doubt, use this table.

| Section / Page | Theme | Reason |
|---|---|---|
| Homepage — hero | Dark (charcoal) | Cinema night, leads with mood |
| Homepage — "How It Works" | Dark (charcoal-2) | Continue immersion |
| Homepage — Pricing | Light (sand) | Easier to scan numbers on light |
| Homepage — Gallery | Dark (charcoal) | Videos pop on black/dark |
| Homepage — Reviews | Dark (charcoal-2) | Continuity with gallery |
| Homepage — FAQ | Light (sand) | Text-heavy, light is easier to read |
| Homepage — Final CTA | Dark (charcoal) | End on cinematic close |
| Booking flow (`/book`) | Dark throughout | Full commitment to the cinema experience |
| Confirmation (`/book/confirmation`) | Dark | Same as booking flow, emotional continuity |
| Privacy / Terms | Light (sand) | Document pages — always light for readability |
| Gallery page (`/gallery`) | Dark | Videos are the content |
| Account page (`/account`) | Dark | Authenticated, functional, app-like |
| Admin panel | Dark | Operator tool, not marketing |
| 404 | Dark (charcoal) | Already correct |
| Sign-in / Sign-up | Dark | Already dark per Clerk config |

**Rule:** If a section is marketing/storytelling — lean dark to feel cinematic. If it is a document, form, or text-heavy read — lean light for readability. Never mix raw hex values — always use CSS variables from `globals.css`.

---

## 4. What Would Make Demarks360 Better Than Any Other 360 Event Hub Site

Most 360 booth sites have: a home page with embedded video, a "packages" table, a contact form, and an Instagram link. That is the entire internet's approach. Here is what we build instead.

### 4a. Things no competitor has built

**1. Same-day instant gallery delivery**
After the event, video clips go to Mux automatically and the guest gets a personal gallery link by text/email within hours. Most competitors mail a USB drive weeks later or upload to Google Drive. We build a `/gallery/[id]` page that is: dark, cinematic, client's name in Bodoni Moda, every clip playable with a custom amber scrubber, one-tap download per clip, and a "Share to Stories" button pre-sized for Instagram.

**2. Real-time date availability on the homepage**
The `DateChecker` widget on the homepage already links to `/book`. But it should: show months as a mini calendar on hover, confirm "June 28 is open — book it now" in real time, and link directly to `/book?date=2026-06-28`. This removes the "will they accept me?" friction completely.

**3. Booking flow that feels like a luxury concierge, not a Google Form**
The current 5-step booking is already better than most. We add:
- Step 1 (Date): After the user picks a date, show a subtle animation (date card flips in, amber glow) confirming selection
- Step 3 (Add-ons): Show a 3-second autoplay preview video of Firecrackers sparks effect — not a still image — so the user knows exactly what they're adding
- Step 5 (Checkout): Show a real-time booking cost breakdown that updates as they scroll the order summary

**4. Event type intelligence**
When the user selects their event type in the Details form, the confirmation email, gallery page, and any future comms automatically use the right tone: "Your birthday booth is confirmed" vs "Your wedding booth is confirmed." This is a 5-minute implementation that makes every touchpoint feel personal.

**5. Review capture flow (post-event email)**
7 days after the event, auto-send an email with: the gallery link, a thank-you note, and a single big CTA button to leave a Google review. Most competitors never ask. We make it the natural last step.

**6. Social proof that is real**
The reviews section on the homepage uses real, human-voice testimonials (no em dashes, no AI slop). As soon as we have 3+ Google reviews, import them via Google Places API and display them as a live feed.

**7. A "What will my video look like?" explainer**
Most users have never seen a 360 video booth in real life. Add a "How your video looks" section or modal that plays a 15-second example clip at 240fps, shows the sharing workflow, and explains the gallery delivery timeline. Remove the "but what exactly do I get?" doubt before they hit the booking CTA.

**8. Event-specific landing pages (SEO play)**
Build `/birthday-photo-booth-calgary`, `/wedding-photo-booth-calgary`, `/corporate-event-booth-calgary`. Each page is fully designed for that event type: different copy, different example clips, different testimonials. This drives organic search from people who would never think to search "360 booth."

---

## 5. Immediate Codex Tasks (UI Consistency Pass)

Run these in order. Each task is self-contained.

### Task A: Audit and fix sign-in, sign-up, account pages

**Files:** `app/sign-in/`, `app/sign-up/`, `app/(public)/account/`

Check each page:
1. Does it have a `<SiteNav />`?
2. Does it have a `<SiteFooter />`?
3. Does it use CSS variables only (no raw hex)?
4. Does the background use `var(--color-ink)` or `var(--color-sand)` (never bare white)?
5. Are buttons styled to the design system (amber pill for primary, amber-bordered ghost for secondary)?

Fix any violations. Do NOT change the Clerk component itself, only the page wrapper and any custom styling around it.

### Task B: Audit and fix admin-login page

**File:** `app/admin-login/`

Should be: dark background (`var(--color-ink)`), Demarks360 wordmark at top, minimal centered Clerk sign-in block, NO SiteFooter (it's an ops page), no public nav links.

### Task C: Gallery page full audit

**File:** `app/gallery/` and `app/(public)/page.tsx` gallery section

The homepage gallery section scrolls horizontally. The `/gallery` route should be a standalone dark-background page with:
- SiteNav
- Large serif heading: "The gallery"
- Grid or masonry of Mux video embeds (pull from DB)
- Empty state if no clips yet (amber text: "First bookings dropping soon")
- SiteFooter

### Task D: Booking flow — add Firecrackers preview video

**File:** `components/public/book/addons-step.tsx`

The Firecrackers add-on card currently shows just text. Add a short autoplay muted looping video element (use a Cloudinary or Mux short clip of the firecrackers effect). Style it as a small 16:9 thumbnail inside the card, above the name/price/description row. If no video asset is available yet, leave a placeholder `div` with amber border and the text "Preview coming soon" at the same dimensions.

### Task E: Event type URL pre-fill

**File:** `components/public/book/details-form.tsx`, `app/(public)/book/page.tsx`

Add `eventType` as a URL search param (alongside `date`). In `BookPageInner`, read `params.get('eventType')` and pass it into `initialState.eventType`. Update the details form so if `eventType` is pre-filled, the select shows it already selected.

This lets footer/nav links like `/book?eventType=Wedding` send users to the booking flow with their event type pre-filled.

---

## 6. Backend Gaps

### Gap 1: Post-event review email
**Not yet built.** 7 days after `eventDate`, trigger a Resend email to the customer with:
- Their gallery link
- A "Leave us a Google review" button
- Thank-you copy

The cron trigger can be a Vercel cron job that runs daily and checks for bookings where `eventDate = today - 7` and `reviewEmailSent = false`. Add a `reviewEmailSent` boolean column to the bookings table.

### Gap 2: Gallery delivery email
**Not yet built.** After a Mux video is uploaded to a booking's gallery, send the customer an email: "Your 360 gallery is ready." Include the gallery link. This requires a webhook from Mux or a manual admin trigger in the booking detail page.

### Gap 3: Rescheduling flow
**Not yet built.** Terms say free rescheduling if requested 7+ days before. Admin currently has no UI to reschedule a booking to a new date. Add a "Reschedule" button in the admin booking detail page that changes the `eventDate`, recalculates `balanceChargeDate`, and sends a confirmation email.

---

## 7. How to Use This Spec

Tasks A-E in Section 5 can be executed by Codex independently. Each is scoped to specific files. Do NOT attempt Sections 3 (backend gaps) until Sections 5 tasks are complete, verified, and committed.

Before any commit:
- `pnpm exec tsc --noEmit` must pass (zero errors)
- `pnpm build` must pass
- Visual spot-check on localhost via Playwright `shoot-live.mjs` for any page that changed

Commits: short messages, no AI attribution, no Co-Authored-By. Author: Saaqib Fagbenro <saaqibf.ayodimeji@gmail.com>.

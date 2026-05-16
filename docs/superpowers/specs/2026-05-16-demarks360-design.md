# Demarks 360 — Full Platform Design Spec
**Date:** 2026-05-16  
**Status:** Approved  
**Owner:** Saaqib Fagbenro

---

## 1. Product Overview

Demarks 360 is a production-ready booking and marketing platform for a 360 video booth rental business serving Calgary and surrounding areas in Alberta, Canada. Customers visit the public marketing site, browse the package, pick a date and time slot, pay a 30% deposit to hold their booking, then have the remaining 70% auto-charged 7 days before their event. After the event, videos are hosted in a shareable gallery.

**Core value:** A polished, trustworthy site that converts event planners into paying customers with minimal friction — clear pricing, a live calendar showing real availability, and automated payment collection.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router, PPR) | Streaming, edge middleware, Vercel-native |
| Language | TypeScript | End-to-end type safety |
| Styling | Tailwind v4 + shadcn/ui | Utility-first, accessible components |
| Auth | Clerk | Email + password for customers, 2FA for admin, role-based middleware |
| Database | Neon Postgres + Drizzle ORM | Serverless Postgres, type-safe queries |
| Payments | Stripe | Deposit PaymentIntent (30%) + SetupIntent (save card) + balance charge via Cron |
| Email | Resend | Transactional — confirmations, reminders, receipts |
| SMS | Twilio | Customer reminders + admin alerts |
| Video | Mux | Adaptive streaming, bulk direct upload, download URLs, shareable gallery links |
| Hosting | Vercel | Edge functions, image optimization, WAF, Cron jobs |
| DNS | Cloudflare | DNS management, email routing |
| Monitoring | Sentry + UptimeRobot | Error tracking, uptime checks |
| Calendar sync | Google Calendar MCP | Auto-create calendar event after confirmed booking |

---

## 3. Business Rules

### Geography
- Service area: Calgary, Airdrie, Cochrane, Chestermere, Okotoks, Rocky View County
- Gate: City name whitelist validated server-side on booking submission (replaces the "T" postal code check — too broad)
- Travel surcharge: $50 flat fee added automatically at checkout for any address outside Calgary city limits
- No bookings accepted outside the approved city list

### Booking Rules
- Minimum lead time: 7 days (enforced client-side + server-side)
- Minimum duration: 1 hour 30 minutes
- No maximum duration
- Duration selected via start time + end time on day-view timeline
- Time slot increments: 30 minutes
- Earliest start: 10:00 AM — Latest start: 11:00 PM
- Maximum 2 bookings per day (one booth)
- Minimum 1.5-hour travel buffer enforced between two same-day bookings
- One booking per time slot (no overlapping events)

### Pricing
- **Rate:** $150/hour
- **Minimum charge:** $225 (1.5hr × $150)
- No tiers — one standard package, pricing scales with hours booked

### Add-ons
- **Firecrackers:** $75 flat fee (active at launch)
- **SmileCam:** Coming Soon placeholder (equipment not yet purchased)
- Additional add-ons: placeholder slots built in for future items

### Payment Flow
1. Customer selects date, time, duration, and add-ons
2. **Deposit:** 30% of subtotal (hours × $150 + add-ons, before GST) charged immediately via Stripe PaymentIntent
3. **Card save:** SetupIntent saves card — customer notified their card is saved for the balance charge
4. **Balance charge:** Remaining 70% of subtotal + GST in full auto-charged via Vercel Cron 7 days before the event
5. **Card deletion:** Saved card auto-deleted from Stripe 7 days after the event

### Failed Balance Charge
- Retry automatically after 24 hours
- If retry fails: urgent email + SMS to customer with link to update card
- Customer has 48 hours to resolve
- Admin alerted immediately on first failure and again if unresolved after 48 hours
- Admin decides manually whether to cancel or accommodate — no automatic cancellation

### Cancellation & Refund Policy
- **Deposit is non-refundable in all cases**
- **Free reschedule** if requested 7+ days before the event (subject to availability) — no money moves, booking date updates, customer gets confirmation email
- **Cancel before 7-day mark:** deposit forfeited, balance never charged
- **Cancel within 7 days:** deposit forfeited, balance also charged (Cron has already fired or is imminent)
- **You cancel:** full deposit refund issued via one-click in admin panel; customer gets email + SMS apology

### Refund Process (Admin)
- Customer cancels: handled automatically per policy above
- You cancel: one-click full deposit refund from admin booking detail page
- Reschedule: date update only, no payment movement

### Tax
- GST (5%): **not collected at launch** (owner not yet GST registered)
- GST toggle in admin settings — flip on when registration number is obtained
- GST number field in settings: pending

### Stripe
- Charge descriptor: `DEMARKS360 CALGARY`
- Test mode during development; live mode requires explicit approval from Saaqib

---

## 4. Architecture

### Application Structure
```
demarks360/
├── app/
│   ├── (public)/
│   │   ├── page.tsx             # Homepage
│   │   ├── book/                # Booking flow
│   │   ├── gallery/             # Public showcase gallery
│   │   ├── g/[token]/           # Shareable event gallery (no login required)
│   │   ├── account/             # Customer account (Clerk-gated)
│   │   ├── privacy/             # PIPEDA privacy policy
│   │   └── terms/               # Terms of Service
│   ├── (admin)/
│   │   ├── dashboard/
│   │   ├── bookings/
│   │   ├── calendar/
│   │   ├── customers/
│   │   ├── payments/
│   │   └── gallery/
│   └── api/
│       ├── webhooks/stripe/
│       ├── webhooks/clerk/
│       ├── bookings/
│       └── availability/
├── components/
│   ├── public/
│   └── admin/
├── lib/
│   ├── db/                      # Drizzle schema + queries
│   ├── stripe/                  # PaymentIntent, SetupIntent, charge, delete card
│   ├── resend/                  # Email templates
│   ├── twilio/                  # SMS helpers
│   └── mux/                     # Bulk direct upload, download URLs, playback tokens
└── middleware.ts                 # Clerk route protection
```

### Data Model (key tables)
```
bookings
  id, customer_id, event_date, start_time, end_time,
  duration_minutes, add_ons (jsonb), status, event_type,
  location_address, location_city, travel_surcharge,
  stripe_payment_intent_id, stripe_setup_intent_id, stripe_customer_id,
  deposit_amount, balance_amount, balance_charge_date,
  balance_charged_at, card_deleted_at, gst_amount,
  gallery_token, gallery_published_at, created_at

customers
  id (Clerk user_id), name, email, phone, created_at

add_ons
  id, name, price, active, coming_soon

gallery_items
  id, booking_id, mux_asset_id, mux_playback_id, thumbnail_url,
  title, published, is_public_showcase, created_at

availability_blocks
  id, blocked_date, start_time, end_time, reason, created_by_admin
```

---

## 5. Public Site Sections

### 5.1 Navigation
Sticky frosted-glass nav — logo left, links center (How It Works, Pricing, Gallery, FAQ), "Book Now" gradient CTA right. Collapses to hamburger on mobile.

### 5.2 Hero
Full-viewport — "DEMARKS 360" in Bebas Neue with spinning gradient ring on "360". Video panel right showing booth footage. 3 stats below (Events Booked, Cities Served, Satisfaction). Grain texture overlay, scroll-triggered reveal.

### 5.3 Pricing
Single pricing card — $150/hour, 1.5hr minimum. Add-ons below: Firecrackers ($75), SmileCam (Coming Soon). Clean, no tier confusion.

### 5.4 How It Works
4 steps on cream background — horizontal rows with large gradient step number (fades from 15% → 100% opacity on hover). Steps: Browse & Pick Your Hours → Choose Your Date & Time → Secure With a Deposit → We Show Up & Shoot.

### 5.5 Gallery
Public showcase — Mux video grid of clips admin has marked as public. Signed playback URLs.

### 5.6 Testimonials
Customer quote cards with avatar, name, event type.

### 5.7 FAQ
Accordion — pricing, cancellation, service area, what's included, how the deposit works.

### 5.8 Footer
Logo, nav links, Instagram (@demarks360), PIPEDA privacy policy link, Terms of Service link, cookie consent banner, GST note (shown once registered).

---

## 6. Booking Flow (Customer)

1. **Landing** — "Book Now" CTA anywhere on the site
2. **Date picker** — Month view calendar; days with existing bookings show availability indicators; days within 7-day lead time disabled; max 2 bookings per day enforced
3. **Time slot picker** — Day-view timeline in 30-minute increments; booked slots + 1.5hr travel buffers labeled "Unavailable"; customer picks start and end time (minimum 1.5hr)
4. **Add-ons** — Firecrackers ($75), SmileCam (Coming Soon)
5. **Details form** — Name, email, phone, event address (city whitelist validated), event type (Birthday Party / Wedding / Graduation / Corporate Event / Engagement Party / Baby Shower & Gender Reveal / Holiday Party / Other)
6. **Checkout** — Stripe Elements embedded; deposit amount shown clearly; card-save consent displayed; customer agrees to Terms of Service checkbox before paying
7. **Confirmation page** — Booking reference, event date/time/duration, add-ons, deposit paid, balance due date, card-save notice, "Add to Calendar" button, link to account

---

## 7. Customer Account

Clerk-powered (email + password). Customers can:
- View upcoming and past bookings with payment status
- Download receipts
- Access their shareable gallery link after the event
- Stream and download their event videos

---

## 8. Gallery

### Event Gallery (Shareable)
- Each booking gets a unique unguessable token: `demarks360.ca/g/[token]`
- Anyone with the link can view and download videos — no login required
- Link generated when admin publishes the gallery
- Customer receives the link in "gallery ready" email + SMS and shares it with guests
- Videos served via Mux signed playback URLs

### Upload Workflow
- Admin bulk drag-and-drop upload in admin panel (100+ videos supported)
- Mux Direct Upload — files go straight to Mux from browser, no server bottleneck
- Mux transcodes async; videos appear in panel as they finish processing
- Admin reviews batch → "Publish All" → customer notified via email + SMS

### Public Showcase
- Admin separately marks select clips as public showcase for the homepage gallery

---

## 9. Admin Dashboard

Protected by Clerk admin role + 2FA mandatory.

### Pages
- **Dashboard** — Revenue stats, bookings table, mini calendar, upcoming events panel, balance charges due panel, 12-month revenue chart
- **Bookings** — Full table with filters; row → detail page (event info, customer contact, payment timeline, Stripe receipts, reschedule, cancel, one-click refund, Google Calendar sync)
- **Calendar** — Month/week view of all booked dates with time slot detail on day click
- **Customers** — List with booking history per customer
- **Payments** — All charges, upcoming auto-charges, manual charge trigger or cancellation before Cron fires
- **Gallery** — Bulk upload, link to booking, publish/unpublish, mark as public showcase, manage thumbnails
- **Settings** — Pricing editor, add-on management, availability blocking, GST toggle + registration number field, notification preferences
- **Manual Booking** — Create booking for phone/DM/in-person customers; send Stripe payment link via email or mark as paid externally (cash/e-transfer)

### Admin Notifications
- SMS + email to 403-402-0816 and 587-917-9272 when new booking created
- Email 24h before each auto balance charge fires
- Email + SMS immediately if a balance charge fails
- Email + SMS if charge still unresolved 48 hours after failure

---

## 10. Communications

### Customer Emails & SMS (from bookings@demarks360.ca → forwards to mariamfagbenro@yahoo.com)
| Trigger | Channel |
|---|---|
| Deposit paid (booking confirmed) | Email + SMS |
| Balance charged (7 days before event) | Email + SMS |
| 48 hours before event | Email only |
| Day of event | SMS only |
| Gallery published | Email + SMS |
| Balance charge failed | Email + SMS (urgent, link to update card) |
| You cancel the booking | Email + SMS (apology + full refund notice) |
| Reschedule confirmed | Email |

---

## 11. Design System

| Token | Value |
|---|---|
| Primary gradient | `#EC4899 → #8B5CF6` (Deep Pink → Violet) |
| Ink (dark) | `#0F0F0F` |
| Cream (light base) | `#FAF8F4` |
| Border | `#E8E4DC` |
| Muted text | `#9B9590` |
| Display font | Bebas Neue |
| UI label font | Syne |
| Body font | DM Sans |
| Texture | Grain overlay (SVG noise filter) |
| Motion | Scroll-triggered reveals, staggered animation-delay, hover opacity transitions |

---

## 12. Infrastructure & Compliance

- **Domain:** demarks360.ca (Cloudflare DNS + email routing)
- **Environments:** Development → Preview (Vercel preview URLs) → Production
- **Secrets:** All API keys as Vercel environment variables. No keys in code. `.env*` gitignored.
- **Stripe mode:** Test during development. Live requires explicit approval from Saaqib.
- **Production deploy:** Requires explicit "go live" from Saaqib.
- **Destructive commands** (`DROP TABLE`, `gh repo delete`, `vercel project rm`): Always confirm first.
- **PIPEDA:** Privacy policy at `/privacy`. Terms of Service at `/terms`. Cookie consent banner (simple one-line, "OK" button). Card auto-deleted 7 days post-event.
- **GST:** Not collected at launch. Toggle in admin settings when GST number obtained.
- **Alberta gate:** City whitelist (Calgary, Airdrie, Cochrane, Chestermere, Okotoks, Rocky View County). $50 travel surcharge auto-applied for non-Calgary addresses.

---

## 13. Pre-Build Setup Required

1. Install `gh` (GitHub CLI)
2. Install `vercel` (Vercel CLI)
3. Install `pnpm`
4. Register for GST at canada.ca/cra-business-registration before go-live
5. Set up Cloudflare email routing: bookings@demarks360.ca → mariamfagbenro@yahoo.com

---

## 14. Open Items (resolve before go-live, not before build)

1. **GST number** — register at CRA before launch
2. **Package pricing content** — final feature descriptions for the pricing section copy
3. **Booth photos/videos** — needed for hero section and gallery before launch

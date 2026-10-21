# Demarks 360

Booking platform for a Calgary 360 video booth rental business. Live at **[demarks360.ca](https://demarks360.ca)**.

Customers browse packages and add-ons, check open dates, and send a booking request. The owner reviews each request from an admin dashboard, and once it's approved the customer gets a link to pay a 50% deposit. The balance is collected automatically on the event day, and guests get their videos in a private online gallery.

## Features

**For customers**
- Multi-step booking flow: date and time, package, add-ons, event details, review
- Live availability, so customers can only request dates that are actually open
- Pricing calculated from the package, add-ons, and a travel surcharge outside Calgary
- Overlay preview, so customers can see the frame their videos will be delivered with
- Secure deposit payment through Stripe, plus a page to view or manage an existing booking
- Private, token-protected video gallery after the event

**For the owner**
- Admin dashboard behind Clerk sign-in with role checks
- Approve or decline booking requests, which sends the customer a deposit link
- Block out or open dates in an availability manager
- Upload event videos from a device or import them from Google Drive

**Behind the scenes**
- Stripe webhooks confirm payments and update booking status
- A daily cron job charges event-day balances to the saved card, emails a payment link if a charge fails, and expires approved requests that were never paid
- Transactional emails (confirmation, balance due, receipt, gallery ready) sent through Resend
- Rate limiting and Zod validation on public API routes
- Error monitoring with Sentry

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Radix UI, GSAP and Lenis for motion |
| Database | PostgreSQL on Neon, Drizzle ORM with versioned migrations |
| Auth | Clerk |
| Payments | Stripe (Payment Intents, Checkout, webhooks) |
| Email | Resend |
| Video | Mux |
| Testing | Vitest, Testing Library |
| CI/CD | GitHub Actions (type check, tests, build), deployed on Vercel |

## Booking lifecycle

```
requested -> approved -> confirmed (deposit paid) -> completed (balance paid)
         \-> declined     \-> expired (deposit not paid in time)
```

## Project structure

```
app/
  (public)/     marketing site, booking flow, payment and account pages
  (admin)/      Clerk-protected dashboard: bookings, availability, uploads
  api/          bookings, availability, payments, webhooks, daily cron
  gallery/      private video galleries
components/     public site and admin UI components
lib/
  db/           Drizzle schema, migrations, queries
  pricing/      price calculation and config
  stripe/       Stripe client
  email/        Resend client and email templates
  validations/  Zod schemas for booking input
```

## Running locally

Requires Node 22 and pnpm.

```bash
pnpm install
cp .env.example .env.local   # fill in your own keys
pnpm drizzle-kit migrate     # create the database tables
pnpm dev
```

Then open http://localhost:3000.

## Tests and checks

```bash
pnpm test:run          # run the test suite once
npx tsc --noEmit       # type check
pnpm build             # production build
```

The same three checks run on every push and pull request through GitHub Actions.

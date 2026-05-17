# Demarks 360 — Plan 3: Booking Flow + Payments

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete end-to-end booking flow — 5-step wizard (date → time → add-ons → details → checkout), availability API with travel buffer enforcement, Stripe PaymentIntent for deposit + card save for balance charge, webhook to confirm bookings, and confirmation page.

**Architecture:** Single-page client wizard at `/book` — a `'use client'` component managing step state. Availability queries run through a Next.js API route. Booking creation is a POST API route (not a server action, to avoid Clerk auth requirement on booking creation for guests before sign-up). Stripe uses `setup_future_usage: 'off_session'` on the PaymentIntent — this both charges the 30% deposit AND saves the card for the 7-days-before balance charge in one step.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Drizzle ORM (Neon), Stripe (stripe + @stripe/react-stripe-js + @stripe/stripe-js), Zod v4, shadcn/ui (select, input, label), Tailwind v4

**⚠️ Before testing the payment step:** Add Stripe test keys to `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
Get them from https://dashboard.stripe.com/test/apikeys and https://dashboard.stripe.com/test/webhooks.

---

## File Map

```
app/(public)/book/
├── page.tsx                          # Multi-step wizard (client component)
└── confirmation/
    └── page.tsx                      # /book/confirmation?id=[bookingId]

app/api/
├── availability/route.ts             # GET ?date=YYYY-MM-DD → booked slots
├── bookings/route.ts                 # POST → create booking + PaymentIntent
└── webhooks/
    └── stripe/route.ts               # Stripe webhook handler

lib/
├── stripe/index.ts                   # Stripe server client
├── db/queries/
│   ├── availability.ts               # getBookedSlotsForDate, isDateAvailable
│   └── bookings.ts                   # createBooking, getBookingById
└── validations/
    ├── cities.ts                     # city whitelist + travel surcharge check
    └── booking.ts                    # Zod schema for booking POST body

components/public/book/
├── date-picker.tsx                   # Step 1: Month calendar
├── time-picker.tsx                   # Step 2: Day-view 30min slot picker
├── addons-step.tsx                   # Step 3: Add-ons selection
├── details-form.tsx                  # Step 4: Customer details form
└── checkout-step.tsx                 # Step 5: Stripe Elements checkout
```

---

## Task 1: Install Dependencies + Stripe Library + Validators

**Files:**
- Modify: `package.json` (via pnpm install)
- Create: `lib/stripe/index.ts`
- Create: `lib/validations/cities.ts`
- Create: `lib/validations/booking.ts`
- Create: `lib/db/queries/availability.ts`
- Create: `lib/db/queries/bookings.ts`

- [ ] **Step 1: Install Stripe packages**

```bash
cd /Users/saaqibfagbenro/demarks360 && pnpm add stripe @stripe/react-stripe-js @stripe/stripe-js
```

- [ ] **Step 2: Create Stripe server client**

`lib/stripe/index.ts`:
```ts
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY not set — payment features will fail')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2025-04-30.basil',
  typescript: true,
})
```

- [ ] **Step 3: Create city validator**

`lib/validations/cities.ts`:
```ts
export const CALGARY_CITY = 'Calgary'

export const SERVICE_CITIES = [
  'Calgary',
  'Airdrie',
  'Cochrane',
  'Chestermere',
  'Okotoks',
  'Rocky View County',
] as const

export type ServiceCity = typeof SERVICE_CITIES[number]

export function isValidServiceCity(city: string): city is ServiceCity {
  return SERVICE_CITIES.includes(city as ServiceCity)
}

export function getTravelSurcharge(city: string): number {
  return city === CALGARY_CITY ? 0 : 50
}
```

- [ ] **Step 4: Create booking Zod schema**

`lib/validations/booking.ts`:
```ts
import { z } from 'zod'
import { SERVICE_CITIES } from './cities'

export const createBookingSchema = z.object({
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  addOnIds: z.array(z.string()),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10).max(20),
  locationAddress: z.string().min(5).max(200),
  locationCity: z.enum(SERVICE_CITIES as unknown as [string, ...string[]]),
  eventType: z.enum([
    'Birthday Party',
    'Wedding',
    'Graduation',
    'Corporate Event',
    'Engagement Party',
    'Baby Shower & Gender Reveal',
    'Holiday Party',
    'Other',
  ]),
  agreedToTerms: z.literal(true),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
```

- [ ] **Step 5: Create availability DB queries**

`lib/db/queries/availability.ts`:
```ts
import { db } from '@/lib/db'
import { bookings, availabilityBlocks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export interface BookedSlot {
  startTime: string
  endTime: string
  status: string
}

export interface AvailabilityResult {
  bookedSlots: BookedSlot[]
  adminBlocks: { startTime: string | null; endTime: string | null; reason: string | null }[]
  bookingCount: number
  isDateFull: boolean
}

export async function getAvailabilityForDate(date: string): Promise<AvailabilityResult> {
  const [dayBookings, adminBlocks] = await Promise.all([
    db
      .select({
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.eventDate, date),
          // Only confirmed and pending bookings block availability
        )
      ),
    db
      .select({
        startTime: availabilityBlocks.startTime,
        endTime: availabilityBlocks.endTime,
        reason: availabilityBlocks.reason,
      })
      .from(availabilityBlocks)
      .where(eq(availabilityBlocks.blockedDate, date)),
  ])

  const activeBookings = dayBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  )

  return {
    bookedSlots: activeBookings,
    adminBlocks,
    bookingCount: activeBookings.length,
    isDateFull: activeBookings.length >= 2,
  }
}
```

- [ ] **Step 6: Create booking DB query**

`lib/db/queries/bookings.ts`:
```ts
import { db } from '@/lib/db'
import { bookings, customers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface CreateBookingParams {
  customerId: string
  eventDate: string
  startTime: string
  endTime: string
  durationMinutes: number
  addOns: string[]
  eventType: string
  locationAddress: string
  locationCity: string
  travelSurcharge: number
  depositAmount: number
  balanceAmount: number
  balanceChargeDate: string
  stripePaymentIntentId: string
  stripeCustomerId: string
}

export async function createBookingRecord(params: CreateBookingParams) {
  const [booking] = await db
    .insert(bookings)
    .values({
      customerId: params.customerId,
      eventDate: params.eventDate,
      startTime: params.startTime,
      endTime: params.endTime,
      durationMinutes: params.durationMinutes,
      addOns: params.addOns,
      status: 'pending',
      eventType: params.eventType,
      locationAddress: params.locationAddress,
      locationCity: params.locationCity,
      travelSurcharge: String(params.travelSurcharge),
      depositAmount: String(params.depositAmount),
      balanceAmount: String(params.balanceAmount),
      balanceChargeDate: params.balanceChargeDate,
      stripePaymentIntentId: params.stripePaymentIntentId,
      stripeCustomerId: params.stripeCustomerId,
    })
    .returning()
  return booking
}

export async function getBookingById(id: string) {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
  return booking ?? null
}

export async function confirmBooking(stripePaymentIntentId: string, stripePaymentMethodId: string) {
  await db
    .update(bookings)
    .set({ status: 'confirmed' })
    .where(eq(bookings.stripePaymentIntentId, stripePaymentIntentId))
}

export async function getOrCreateCustomer(clerkUserId: string, name: string, email: string, phone: string) {
  const existing = await db
    .select()
    .from(customers)
    .where(eq(customers.id, clerkUserId))
  if (existing.length > 0) return existing[0]
  const [created] = await db
    .insert(customers)
    .values({ id: clerkUserId, name, email, phone })
    .returning()
  return created
}
```

- [ ] **Step 7: Build check**

```bash
cd /Users/saaqibfagbenro/demarks360 && pnpm build 2>&1 | tail -10
```
Expected: clean build (no type errors in new files).

- [ ] **Step 8: Commit**

```bash
cd /Users/saaqibfagbenro/demarks360 && git add lib/ && git commit -m "feat: stripe client, city validator, booking schema, availability queries"
```

---

## Task 2: Availability API Route

**Files:**
- Create: `app/api/availability/route.ts`

- [ ] **Step 1: Write availability endpoint**

`app/api/availability/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { getAvailabilityForDate } from '@/lib/db/queries/availability'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  // Enforce 7-day minimum lead time
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const requestedDate = new Date(date + 'T00:00:00')
  const diffDays = Math.floor((requestedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 7) {
    return NextResponse.json({
      bookedSlots: [],
      adminBlocks: [],
      bookingCount: 0,
      isDateFull: true, // treat as full to disable in calendar
      tooSoon: true,
    })
  }

  const availability = await getAvailabilityForDate(date)
  return NextResponse.json(availability)
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/saaqibfagbenro/demarks360 && pnpm build 2>&1 | tail -6
```

- [ ] **Step 3: Commit**

```bash
cd /Users/saaqibfagbenro/demarks360 && git add app/api/availability/ && git commit -m "feat: availability API route with 7-day lead time enforcement"
```

---

## Task 3: Book Page Shell + Date Picker (Step 1)

**Files:**
- Create: `app/(public)/book/page.tsx`
- Create: `components/public/book/date-picker.tsx`

The wizard manages state in a single client component. The `BookingState` type tracks all selections across all 5 steps.

- [ ] **Step 1: Write the booking state type and page shell**

`app/(public)/book/page.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { DatePicker } from '@/components/public/book/date-picker'
import { TimePicker } from '@/components/public/book/time-picker'
import { AddonsStep } from '@/components/public/book/addons-step'
import { DetailsForm } from '@/components/public/book/details-form'
import { CheckoutStep } from '@/components/public/book/checkout-step'

export type BookingState = {
  step: 1 | 2 | 3 | 4 | 5
  date: string | null         // 'YYYY-MM-DD'
  startTime: string | null    // 'HH:MM'
  endTime: string | null      // 'HH:MM'
  addOnIds: string[]
  customerName: string
  customerEmail: string
  customerPhone: string
  locationAddress: string
  locationCity: string
  eventType: string
  agreedToTerms: boolean
}

const initialState: BookingState = {
  step: 1,
  date: null,
  startTime: null,
  endTime: null,
  addOnIds: [],
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  locationAddress: '',
  locationCity: 'Calgary',
  eventType: '',
  agreedToTerms: false,
}

const STEP_LABELS = ['Date', 'Time', 'Add-ons', 'Details', 'Checkout']

export default function BookPage() {
  const [state, setState] = useState<BookingState>(initialState)

  function update(patch: Partial<BookingState>) {
    setState((s) => ({ ...s, ...patch }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', paddingTop: '66px' }}>
      {/* Step indicator */}
      <div style={{ borderBottom: '1px solid rgba(15,15,15,0.10)', background: '#FAF8F4', position: 'sticky', top: '66px', zIndex: 100 }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 3rem', display: 'flex', alignItems: 'center', gap: '0' }}>
          {STEP_LABELS.map((label, i) => {
            const stepNum = (i + 1) as 1 | 2 | 3 | 4 | 5
            const active = stepNum === state.step
            const done = stepNum < state.step
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: done ? 'linear-gradient(135deg,#EC4899,#8B5CF6)' : active ? '#0F0F0F' : 'transparent',
                    border: active || done ? 'none' : '1.5px solid rgba(15,15,15,0.25)',
                    color: active || done ? '#fff' : '#888880',
                    fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
                  }}>
                    {done ? '✓' : stepNum}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: active ? '#0F0F0F' : '#888880',
                  }}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div style={{ flex: 1, height: '1px', background: 'rgba(15,15,15,0.12)', margin: '0 0.75rem' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem' }}>
        {state.step === 1 && (
          <DatePicker
            selectedDate={state.date}
            onSelect={(date) => update({ date, step: 2 })}
          />
        )}
        {state.step === 2 && state.date && (
          <TimePicker
            date={state.date}
            startTime={state.startTime}
            endTime={state.endTime}
            onSelect={(startTime, endTime) => update({ startTime, endTime, step: 3 })}
            onBack={() => update({ step: 1 })}
          />
        )}
        {state.step === 3 && (
          <AddonsStep
            selectedIds={state.addOnIds}
            onNext={(addOnIds) => update({ addOnIds, step: 4 })}
            onBack={() => update({ step: 2 })}
          />
        )}
        {state.step === 4 && (
          <DetailsForm
            state={state}
            onChange={update}
            onNext={() => update({ step: 5 })}
            onBack={() => update({ step: 3 })}
          />
        )}
        {state.step === 5 && (
          <CheckoutStep
            state={state}
            onBack={() => update({ step: 4 })}
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write the date picker component**

`components/public/book/date-picker.tsx`:
```tsx
'use client'
import { useState, useEffect } from 'react'

interface DatePickerProps {
  selectedDate: string | null
  onSelect: (date: string) => void
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minDate = new Date(today)
  minDate.setDate(minDate.getDate() + 7)

  const [viewYear, setViewYear] = useState(() => minDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => minDate.getMonth())
  const [fullDates, setFullDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Fetch which dates are fully booked in the current view month
    const year = viewYear
    const month = viewMonth
    const daysInMonth = getDaysInMonth(year, month)
    const fetches = Array.from({ length: daysInMonth }, (_, i) => {
      const d = toDateStr(year, month, i + 1)
      return fetch(`/api/availability?date=${d}`)
        .then((r) => r.json())
        .then((data) => data.isDateFull ? d : null)
    })
    Promise.all(fetches).then((results) => {
      setFullDates(new Set(results.filter(Boolean) as string[]))
    })
  }, [viewYear, viewMonth])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function isDisabled(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d < minDate || fullDates.has(dateStr)
  }

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
        Step 1
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '2.5rem' }}>
        Pick a Date
      </h2>

      <div style={{ maxWidth: '480px', border: '1px solid rgba(15,15,15,0.10)', background: '#fff' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
          <button
            onClick={prevMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '1rem', color: '#3A3A3A', padding: '0.25rem 0.5rem' }}
          >
            ←
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.04em', color: '#0F0F0F' }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '1rem', color: '#3A3A3A', padding: '0.25rem 0.5rem' }}
          >
            →
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ padding: '0.6rem 0', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888880' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0.75rem' }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = toDateStr(viewYear, viewMonth, day)
            const disabled = isDisabled(dateStr)
            const selected = selectedDate === dateStr
            const isFull = fullDates.has(dateStr)
            return (
              <button
                key={day}
                onClick={() => !disabled && onSelect(dateStr)}
                disabled={disabled}
                style={{
                  border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                  padding: '0.6rem 0', margin: '2px', borderRadius: '2px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: selected ? 700 : 400,
                  background: selected ? 'linear-gradient(135deg,#EC4899,#8B5CF6)' : 'transparent',
                  color: selected ? '#fff' : disabled ? 'rgba(15,15,15,0.2)' : isFull ? '#EC4899' : '#0F0F0F',
                  transition: 'background 0.15s',
                }}
                title={isFull ? 'Fully booked' : undefined}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ padding: '0.75rem 1.5rem 1.25rem', borderTop: '1px solid rgba(15,15,15,0.10)', display: 'flex', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: '#888880' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#EC4899' }} />
            Fully booked
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: '#888880' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(15,15,15,0.15)' }} />
            Unavailable (7-day lead time)
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create stubs for remaining book components (so the build passes)**

Create these stubs in `components/public/book/`:

`time-picker.tsx`:
```tsx
'use client'
interface TimePickerProps {
  date: string
  startTime: string | null
  endTime: string | null
  onSelect: (start: string, end: string) => void
  onBack: () => void
}
export function TimePicker(_: TimePickerProps) { return null }
```

`addons-step.tsx`:
```tsx
'use client'
interface AddonsStepProps {
  selectedIds: string[]
  onNext: (ids: string[]) => void
  onBack: () => void
}
export function AddonsStep(_: AddonsStepProps) { return null }
```

`details-form.tsx`:
```tsx
'use client'
import type { BookingState } from '@/app/(public)/book/page'
interface DetailsFormProps {
  state: BookingState
  onChange: (patch: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
}
export function DetailsForm(_: DetailsFormProps) { return null }
```

`checkout-step.tsx`:
```tsx
'use client'
import type { BookingState } from '@/app/(public)/book/page'
interface CheckoutStepProps {
  state: BookingState
  onBack: () => void
}
export function CheckoutStep(_: CheckoutStepProps) { return null }
```

- [ ] **Step 4: Create confirmation page stub**

`app/(public)/book/confirmation/page.tsx`:
```tsx
export default function ConfirmationPage() {
  return <div>Booking confirmed.</div>
}
```

- [ ] **Step 5: Build check**

```bash
cd /Users/saaqibfagbenro/demarks360 && pnpm build 2>&1 | tail -10
```

- [ ] **Step 6: Commit**

```bash
cd /Users/saaqibfagbenro/demarks360 && git add "app/(public)/book/" components/public/book/ && git commit -m "feat: book page wizard shell and date picker"
```

---

## Task 4: Time Picker (Step 2)

**Files:**
- Modify: `components/public/book/time-picker.tsx`

The time picker shows a list of 30-minute slots from 10:00 AM to 11:00 PM. Phase 1: customer picks start time. Phase 2: customer picks end time (minimum 1.5hr later than start). Slots taken by existing bookings + 1.5hr travel buffers on either side are marked unavailable.

- [ ] **Step 1: Write time picker**

`components/public/book/time-picker.tsx` — replace stub with:
```tsx
'use client'
import { useState, useEffect } from 'react'

interface TimePickerProps {
  date: string
  startTime: string | null
  endTime: string | null
  onSelect: (start: string, end: string) => void
  onBack: () => void
}

// Generate slots: '10:00', '10:30', ..., '23:00'
function generateSlots(): string[] {
  const slots: string[] = []
  for (let h = 10; h <= 23; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 23) slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

const ALL_SLOTS = generateSlots()
const MIN_DURATION_MINUTES = 90 // 1.5 hours
const TRAVEL_BUFFER_MINUTES = 90

interface AvailabilityData {
  bookedSlots: { startTime: string; endTime: string }[]
  adminBlocks: { startTime: string | null; endTime: string | null }[]
  isDateFull: boolean
}

export function TimePicker({ date, startTime, endTime, onSelect, onBack }: TimePickerProps) {
  const [phase, setPhase] = useState<'start' | 'end'>('start')
  const [selectedStart, setSelectedStart] = useState<string | null>(startTime)
  const [selectedEnd, setSelectedEnd] = useState<string | null>(endTime)
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/availability?date=${date}`)
      .then(r => r.json())
      .then(data => { setAvailability(data); setLoading(false) })
  }, [date])

  function isSlotBlocked(slot: string, avail: AvailabilityData): boolean {
    const slotMin = timeToMinutes(slot)
    for (const b of avail.bookedSlots) {
      const bStart = timeToMinutes(b.startTime)
      const bEnd = timeToMinutes(b.endTime)
      // Block the booked window + 1.5hr travel buffer on each side
      if (slotMin >= bStart - TRAVEL_BUFFER_MINUTES && slotMin < bEnd + TRAVEL_BUFFER_MINUTES) {
        return true
      }
    }
    for (const block of avail.adminBlocks) {
      if (block.startTime && block.endTime) {
        const bStart = timeToMinutes(block.startTime)
        const bEnd = timeToMinutes(block.endTime)
        if (slotMin >= bStart && slotMin < bEnd) return true
      }
    }
    return false
  }

  function isEndSlotValid(slot: string): boolean {
    if (!selectedStart) return false
    const startMin = timeToMinutes(selectedStart)
    const slotMin = timeToMinutes(slot)
    return slotMin >= startMin + MIN_DURATION_MINUTES
  }

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: '#888880' }}>
        Loading availability…
      </div>
    )
  }

  if (!availability) return null

  const slotsWithStatus = ALL_SLOTS.map(slot => ({
    slot,
    blocked: isSlotBlocked(slot, availability),
  }))

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
        Step 2
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '0.75rem' }}>
        {phase === 'start' ? 'Pick a Start Time' : 'Pick an End Time'}
      </h2>
      <p style={{ fontSize: '0.82rem', color: '#888880', fontWeight: 300, marginBottom: '2.5rem' }}>
        {phase === 'start'
          ? `${date} · Select when your event starts`
          : `Started at ${selectedStart ? formatTime(selectedStart) : ''} · Minimum 1.5 hours`}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '560px' }}>
        {slotsWithStatus.map(({ slot, blocked }) => {
          const isSelected = phase === 'start' ? slot === selectedStart : slot === selectedEnd
          const isDisabled = phase === 'end' ? !isEndSlotValid(slot) || blocked : blocked
          return (
            <button
              key={slot}
              disabled={isDisabled}
              onClick={() => {
                if (phase === 'start') {
                  setSelectedStart(slot)
                  setSelectedEnd(null)
                  setPhase('end')
                } else {
                  setSelectedEnd(slot)
                }
              }}
              style={{
                padding: '0.75rem 0.5rem', border: '1px solid',
                borderColor: isSelected ? 'transparent' : blocked ? 'rgba(15,15,15,0.05)' : 'rgba(15,15,15,0.12)',
                background: isSelected
                  ? 'linear-gradient(135deg,#EC4899,#8B5CF6)'
                  : blocked ? '#F5F3EF' : '#fff',
                color: isSelected ? '#fff' : blocked ? 'rgba(15,15,15,0.2)' : '#0F0F0F',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              {formatTime(slot)}
            </button>
          )
        })}
      </div>

      {phase === 'end' && selectedStart && selectedEnd && (
        <div style={{ marginTop: '2rem', padding: '1.25rem', border: '1px solid rgba(15,15,15,0.10)', background: '#fff', maxWidth: '560px' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: '#0F0F0F' }}>
            <strong>{formatTime(selectedStart)}</strong> → <strong>{formatTime(selectedEnd)}</strong>
            {' · '}
            {Math.round((timeToMinutes(selectedEnd) - timeToMinutes(selectedStart)) / 60 * 10) / 10} hrs
            {' · '}
            ${Math.ceil((timeToMinutes(selectedEnd) - timeToMinutes(selectedStart)) / 60 * 150).toFixed(0)}/hr estimate
          </p>
          <button
            onClick={() => onSelect(selectedStart, selectedEnd)}
            style={{
              marginTop: '1rem', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
              color: '#fff', border: 'none', padding: '0.85rem 2rem',
              fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Continue →
          </button>
        </div>
      )}

      <button
        onClick={() => { if (phase === 'end') { setPhase('start'); setSelectedEnd(null) } else { onBack() } }}
        style={{ marginTop: '1.5rem', display: 'block', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#888880', textDecoration: 'underline' }}
      >
        ← Back
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/saaqibfagbenro/demarks360 && pnpm build 2>&1 | tail -6
```

- [ ] **Step 3: Commit**

```bash
cd /Users/saaqibfagbenro/demarks360 && git add components/public/book/time-picker.tsx && git commit -m "feat: time slot picker with travel buffer blocking"
```

---

## Task 5: Add-ons (Step 3) + Details Form (Step 4)

**Files:**
- Modify: `components/public/book/addons-step.tsx`
- Modify: `components/public/book/details-form.tsx`

- [ ] **Step 1: Write add-ons step**

`components/public/book/addons-step.tsx` — replace stub with:
```tsx
'use client'
import { useState } from 'react'

interface AddonsStepProps {
  selectedIds: string[]
  onNext: (ids: string[]) => void
  onBack: () => void
}

const ADDONS = [
  { id: 'firecrackers', name: 'Firecrackers', price: 75, desc: 'Pyro-style sparks effect — maximum visual impact', active: true },
  { id: 'smilecam', name: 'SmileCam', price: 0, desc: 'AI-powered smile detection camera', active: false, comingSoon: true },
]

export function AddonsStep({ selectedIds, onNext, onBack }: AddonsStepProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds))

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
        Step 3
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '2.5rem' }}>
        Add-ons
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(15,15,15,0.10)', maxWidth: '560px' }}>
        {ADDONS.map((addon) => {
          const isSelected = selected.has(addon.id)
          const disabled = !addon.active
          return (
            <button
              key={addon.id}
              onClick={() => !disabled && toggle(addon.id)}
              disabled={disabled}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.5rem', background: isSelected ? '#0F0F0F' : '#fff',
                border: 'none', cursor: disabled ? 'default' : 'pointer',
                textAlign: 'left', opacity: disabled ? 0.5 : 1,
                transition: 'background 0.2s',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '2px', flexShrink: 0,
                    border: `1.5px solid ${isSelected ? 'transparent' : 'rgba(15,15,15,0.25)'}`,
                    background: isSelected ? 'linear-gradient(135deg,#EC4899,#8B5CF6)' : 'transparent',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.7rem',
                  }}>
                    {isSelected ? '✓' : ''}
                  </span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', fontWeight: 700, color: isSelected ? '#fff' : '#0F0F0F' }}>
                    {addon.name}
                  </span>
                  {addon.comingSoon && (
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.5rem', border: '1px solid rgba(15,15,15,0.2)', color: '#888880' }}>
                      Coming Soon
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: isSelected ? 'rgba(255,255,255,0.55)' : '#888880', fontWeight: 300, paddingLeft: '1.6rem' }}>
                  {addon.desc}
                </p>
              </div>
              {addon.active && (
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: isSelected ? '#fff' : '#0F0F0F', marginLeft: '2rem', flexShrink: 0 }}>
                  +${addon.price}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          onClick={() => onNext(Array.from(selected))}
          style={{
            background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', color: '#fff', border: 'none',
            padding: '0.85rem 2rem', fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Continue →
        </button>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#888880', textDecoration: 'underline' }}>
          ← Back
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write details form**

`components/public/book/details-form.tsx` — replace stub with:
```tsx
'use client'
import type { BookingState } from '@/app/(public)/book/page'
import { SERVICE_CITIES } from '@/lib/validations/cities'

interface DetailsFormProps {
  state: BookingState
  onChange: (patch: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
}

const EVENT_TYPES = [
  'Birthday Party', 'Wedding', 'Graduation', 'Corporate Event',
  'Engagement Party', 'Baby Shower & Gender Reveal', 'Holiday Party', 'Other',
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.85rem 1rem',
  border: '1px solid rgba(15,15,15,0.15)', background: '#fff',
  fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#0F0F0F',
  outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888880',
  display: 'block', marginBottom: '0.4rem',
}

export function DetailsForm({ state, onChange, onNext, onBack }: DetailsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!state.customerName.trim()) e.customerName = 'Name is required'
    if (!state.customerEmail.includes('@')) e.customerEmail = 'Valid email required'
    if (state.customerPhone.replace(/\D/g, '').length < 10) e.customerPhone = 'Valid phone required'
    if (!state.locationAddress.trim()) e.locationAddress = 'Address is required'
    if (!state.eventType) e.eventType = 'Event type is required'
    if (!state.agreedToTerms) e.agreedToTerms = 'You must agree to the Terms of Service'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (validate()) onNext()
  }

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
        Step 4
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '2.5rem' }}>
        Your Details
      </h2>

      <div style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            style={inputStyle}
            value={state.customerName}
            onChange={e => onChange({ customerName: e.target.value })}
            placeholder="Jane Smith"
          />
          {errors.customerName && <p style={{ color: '#EC4899', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.customerName}</p>}
        </div>

        <div>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            style={inputStyle}
            value={state.customerEmail}
            onChange={e => onChange({ customerEmail: e.target.value })}
            placeholder="jane@example.com"
          />
          {errors.customerEmail && <p style={{ color: '#EC4899', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.customerEmail}</p>}
        </div>

        <div>
          <label style={labelStyle}>Phone Number</label>
          <input
            type="tel"
            style={inputStyle}
            value={state.customerPhone}
            onChange={e => onChange({ customerPhone: e.target.value })}
            placeholder="(403) 555-0123"
          />
          {errors.customerPhone && <p style={{ color: '#EC4899', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.customerPhone}</p>}
        </div>

        <div>
          <label style={labelStyle}>Event Address</label>
          <input
            style={inputStyle}
            value={state.locationAddress}
            onChange={e => onChange({ locationAddress: e.target.value })}
            placeholder="123 Main Street NW"
          />
          {errors.locationAddress && <p style={{ color: '#EC4899', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.locationAddress}</p>}
        </div>

        <div>
          <label style={labelStyle}>City</label>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={state.locationCity}
            onChange={e => onChange({ locationCity: e.target.value })}
          >
            {SERVICE_CITIES.map(city => (
              <option key={city} value={city}>{city}{city !== 'Calgary' ? ' (+$50 travel fee)' : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Event Type</label>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={state.eventType}
            onChange={e => onChange({ eventType: e.target.value })}
          >
            <option value="">Select event type…</option>
            {EVENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.eventType && <p style={{ color: '#EC4899', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.eventType}</p>}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem' }}>
          <input
            type="checkbox"
            id="tos"
            checked={state.agreedToTerms}
            onChange={e => onChange({ agreedToTerms: e.target.checked })}
            style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#8B5CF6', flexShrink: 0, cursor: 'pointer' }}
          />
          <label htmlFor="tos" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: '#3A3A3A', lineHeight: 1.6, cursor: 'pointer' }}>
            I have read and agree to the{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#8B5CF6', textDecoration: 'underline' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#8B5CF6', textDecoration: 'underline' }}>Privacy Policy</a>.
            I understand my 30% deposit is non-refundable.
          </label>
        </div>
        {errors.agreedToTerms && <p style={{ color: '#EC4899', fontSize: '0.72rem', marginTop: '-0.75rem' }}>{errors.agreedToTerms}</p>}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          onClick={handleSubmit}
          style={{
            background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', color: '#fff', border: 'none',
            padding: '0.85rem 2rem', fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Continue to Payment →
        </button>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#888880', textDecoration: 'underline' }}>
          ← Back
        </button>
      </div>
    </div>
  )
}
```

**Note:** The `useState` import is missing from `details-form.tsx` — add `import { useState } from 'react'` at the top.

- [ ] **Step 3: Build check**

```bash
cd /Users/saaqibfagbenro/demarks360 && pnpm build 2>&1 | tail -10
```

Fix any TypeScript errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/saaqibfagbenro/demarks360 && git add components/public/book/addons-step.tsx components/public/book/details-form.tsx && git commit -m "feat: add-ons selector and customer details form"
```

---

## Task 6: Checkout Step (Step 5) with Stripe Elements

**Files:**
- Modify: `components/public/book/checkout-step.tsx`

This step:
1. Calculates the pricing summary (hours × $150 + add-ons + travel surcharge)
2. Shows the 30% deposit amount
3. POSTs to `/api/bookings` to create the PaymentIntent
4. Renders Stripe `Elements` and `PaymentElement`
5. Handles payment confirmation and redirects to `/book/confirmation?id=[bookingId]`

- [ ] **Step 1: Write the checkout step**

`components/public/book/checkout-step.tsx` — replace stub with:
```tsx
'use client'
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { BookingState } from '@/app/(public)/book/page'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')

interface CheckoutStepProps {
  state: BookingState
  onBack: () => void
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

const ADDON_PRICES: Record<string, number> = { firecrackers: 75 }
const ADDON_NAMES: Record<string, string> = { firecrackers: 'Firecrackers' }

// Inner component that uses stripe hooks (must be inside <Elements>)
function PaymentForm({ bookingId, onBack }: { bookingId: string; onBack: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/book/confirmation?id=${bookingId}`,
      },
    })

    if (submitError) {
      setError(submitError.message ?? 'Payment failed. Please try again.')
      setSubmitting(false)
    }
    // On success, Stripe redirects to return_url automatically
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <p style={{ color: '#EC4899', fontSize: '0.78rem', marginTop: '1rem' }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        style={{
          marginTop: '1.5rem', width: '100%',
          background: submitting ? '#ccc' : 'linear-gradient(90deg,#EC4899,#8B5CF6)',
          color: '#fff', border: 'none', padding: '1rem 2rem',
          fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Processing…' : 'Pay Deposit & Confirm Booking'}
      </button>
      <button
        type="button"
        onClick={onBack}
        style={{ marginTop: '0.75rem', display: 'block', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#888880', textDecoration: 'underline' }}
      >
        ← Back
      </button>
    </form>
  )
}

export function CheckoutStep({ state, onBack }: CheckoutStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  const durationMinutes = state.startTime && state.endTime
    ? timeToMinutes(state.endTime) - timeToMinutes(state.startTime)
    : 0
  const durationHours = durationMinutes / 60
  const hourlySubtotal = durationHours * 150
  const addOnSubtotal = state.addOnIds.reduce((sum, id) => sum + (ADDON_PRICES[id] ?? 0), 0)
  const travelSurcharge = state.locationCity !== 'Calgary' ? 50 : 0
  const subtotal = hourlySubtotal + addOnSubtotal + travelSurcharge
  const deposit = Math.round(subtotal * 0.30 * 100) / 100
  const balance = Math.round(subtotal * 0.70 * 100) / 100

  const balanceChargeDate = (() => {
    if (!state.date) return ''
    const d = new Date(state.date + 'T00:00:00')
    d.setDate(d.getDate() - 7)
    return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  })()

  useEffect(() => {
    if (!state.date || !state.startTime || !state.endTime) return
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventDate: state.date,
        startTime: state.startTime,
        endTime: state.endTime,
        addOnIds: state.addOnIds,
        customerName: state.customerName,
        customerEmail: state.customerEmail,
        customerPhone: state.customerPhone,
        locationAddress: state.locationAddress,
        locationCity: state.locationCity,
        eventType: state.eventType,
        agreedToTerms: state.agreedToTerms,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setInitError(data.error); setLoading(false); return }
        setClientSecret(data.clientSecret)
        setBookingId(data.bookingId)
        setLoading(false)
      })
      .catch(() => { setInitError('Failed to initialize checkout. Please try again.'); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: '#888880' }}>
        Preparing your checkout…
      </div>
    )
  }

  if (initError) {
    return (
      <div>
        <p style={{ color: '#EC4899', fontSize: '0.85rem', marginBottom: '1rem' }}>{initError}</p>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#888880', textDecoration: 'underline' }}>
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
      {/* Order summary */}
      <div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
          Step 5
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '2rem' }}>
          Checkout
        </h2>

        <div style={{ border: '1px solid rgba(15,15,15,0.10)', background: '#fff' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginBottom: '0.5rem' }}>Booking Summary</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.04em', color: '#0F0F0F' }}>
              {state.date ? new Date(state.date + 'T00:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#3A3A3A', marginTop: '0.25rem' }}>
              {state.startTime && formatTime(state.startTime)} → {state.endTime && formatTime(state.endTime)}
              {' · '}{(durationMinutes / 60).toFixed(1).replace('.0', '')} hours
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: '#888880', marginTop: '0.15rem' }}>
              {state.locationAddress}, {state.locationCity}
            </p>
          </div>

          {/* Line items */}
          {[
            { label: `${durationHours.toFixed(1).replace('.0', '')} hrs × $150/hr`, amount: hourlySubtotal },
            ...state.addOnIds.map(id => ({ label: ADDON_NAMES[id] ?? id, amount: ADDON_PRICES[id] ?? 0 })),
            ...(travelSurcharge > 0 ? [{ label: 'Travel surcharge', amount: travelSurcharge }] : []),
          ].map(({ label, amount }) => (
            <div key={label} style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(15,15,15,0.06)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#3A3A3A' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#0F0F0F', fontWeight: 600 }}>${amount.toFixed(2)}</span>
            </div>
          ))}

          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(15,15,15,0.10)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: '#888880' }}>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#0F0F0F' }}>${subtotal.toFixed(2)}</span>
          </div>

          <div style={{ padding: '1.25rem 1.5rem', background: '#0F0F0F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Deposit Due Today (30%)</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>
                Balance of ${balance.toFixed(2)} auto-charged on {balanceChargeDate}
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ${deposit.toFixed(2)}
            </span>
          </div>

          <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.5)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#888880', lineHeight: 1.6 }}>
              Your card will be saved for the balance charge. It will be automatically deleted 7 days after your event. Your deposit is non-refundable.
            </p>
          </div>
        </div>
      </div>

      {/* Payment form */}
      <div style={{ position: 'sticky', top: '140px' }}>
        <div style={{ border: '1px solid rgba(15,15,15,0.10)', background: '#fff', padding: '2rem' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginBottom: '1.25rem' }}>
            Payment Details
          </p>
          {clientSecret && bookingId ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: { fontFamily: 'DM Sans, sans-serif', colorPrimary: '#8B5CF6' },
                },
              }}
            >
              <PaymentForm bookingId={bookingId} onBack={onBack} />
            </Elements>
          ) : (
            <p style={{ color: '#888880', fontSize: '0.78rem' }}>Payment unavailable — Stripe not configured.</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/saaqibfagbenro/demarks360 && pnpm build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
cd /Users/saaqibfagbenro/demarks360 && git add components/public/book/checkout-step.tsx && git commit -m "feat: Stripe Elements checkout step with deposit calculation"
```

---

## Task 7: POST /api/bookings

**Files:**
- Create: `app/api/bookings/route.ts`

This route:
1. Validates the request body with Zod
2. Checks availability (race condition guard — re-checks max 2 bookings)
3. Creates or finds the Stripe customer
4. Creates a Stripe PaymentIntent for the deposit (with `setup_future_usage: 'off_session'` to save the card)
5. Inserts the booking as `'pending'`
6. Returns `{ clientSecret, bookingId }`

- [ ] **Step 1: Write the bookings POST route**

`app/api/bookings/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { createBookingSchema } from '@/lib/validations/booking'
import { getTravelSurcharge } from '@/lib/validations/cities'
import { getAvailabilityForDate } from '@/lib/db/queries/availability'
import { createBookingRecord, getOrCreateCustomer } from '@/lib/db/queries/bookings'
import { stripe } from '@/lib/stripe'

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// Flat add-on prices — this matches the DB seed data
const ADDON_PRICES: Record<string, number> = { firecrackers: 75 }

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = createBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const input = parsed.data

  // Re-check availability to prevent races
  const availability = await getAvailabilityForDate(input.eventDate)
  if (availability.isDateFull) {
    return NextResponse.json({ error: 'This date is fully booked. Please choose another date.' }, { status: 409 })
  }

  // Calculate pricing
  const durationMinutes = timeToMinutes(input.endTime) - timeToMinutes(input.startTime)
  if (durationMinutes < 90) {
    return NextResponse.json({ error: 'Minimum booking duration is 1.5 hours.' }, { status: 422 })
  }

  const durationHours = durationMinutes / 60
  const hourlySubtotal = durationHours * 150
  const addOnSubtotal = input.addOnIds.reduce((sum, id) => sum + (ADDON_PRICES[id] ?? 0), 0)
  const travelSurcharge = getTravelSurcharge(input.locationCity)
  const subtotal = hourlySubtotal + addOnSubtotal + travelSurcharge
  const depositAmount = Math.round(subtotal * 0.30 * 100) / 100
  const balanceAmount = Math.round(subtotal * 0.70 * 100) / 100
  const depositCents = Math.round(depositAmount * 100)
  const balanceChargeDate = addDays(input.eventDate, -7)

  // Create or find Stripe customer
  let stripeCustomer: { id: string }
  const existingStripeCustomers = await stripe.customers.list({ email: input.customerEmail, limit: 1 })
  if (existingStripeCustomers.data.length > 0) {
    stripeCustomer = existingStripeCustomers.data[0]
  } else {
    stripeCustomer = await stripe.customers.create({
      name: input.customerName,
      email: input.customerEmail,
      phone: input.customerPhone,
    })
  }

  // Create PaymentIntent — setup_future_usage saves the card for balance charge
  const paymentIntent = await stripe.paymentIntents.create({
    amount: depositCents,
    currency: 'cad',
    customer: stripeCustomer.id,
    setup_future_usage: 'off_session',
    statement_descriptor_suffix: 'DEMARKS360',
    metadata: {
      eventDate: input.eventDate,
      startTime: input.startTime,
      endTime: input.endTime,
      customerEmail: input.customerEmail,
    },
  })

  // Create customer record in our DB (using Stripe customer ID as stand-in since no Clerk auth here yet)
  // We use the Stripe customer ID as the "customer ID" for now — Plan 5 will wire Clerk user IDs
  const customer = await getOrCreateCustomer(
    stripeCustomer.id, // temporary: using stripe ID until Clerk auth is wired
    input.customerName,
    input.customerEmail,
    input.customerPhone,
  )

  // Insert booking
  const booking = await createBookingRecord({
    customerId: customer.id,
    eventDate: input.eventDate,
    startTime: input.startTime,
    endTime: input.endTime,
    durationMinutes,
    addOns: input.addOnIds,
    eventType: input.eventType,
    locationAddress: input.locationAddress,
    locationCity: input.locationCity,
    travelSurcharge,
    depositAmount,
    balanceAmount,
    balanceChargeDate,
    stripePaymentIntentId: paymentIntent.id,
    stripeCustomerId: stripeCustomer.id,
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    bookingId: booking.id,
  })
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/saaqibfagbenro/demarks360 && pnpm build 2>&1 | tail -10
```

Fix any TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/saaqibfagbenro/demarks360 && git add app/api/bookings/ && git commit -m "feat: bookings POST API — PaymentIntent creation and booking record"
```

---

## Task 8: Stripe Webhook Handler

**Files:**
- Create: `app/api/webhooks/stripe/route.ts`

Handles `payment_intent.succeeded` → updates booking status to `'confirmed'`. Uses raw body verification with `STRIPE_WEBHOOK_SECRET`.

- [ ] **Step 1: Write webhook route**

`app/api/webhooks/stripe/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { bookings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    await db
      .update(bookings)
      .set({ status: 'confirmed' })
      .where(eq(bookings.stripePaymentIntentId, pi.id))
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/saaqibfagbenro/demarks360 && pnpm build 2>&1 | tail -6
```

- [ ] **Step 3: Commit**

```bash
cd /Users/saaqibfagbenro/demarks360 && git add app/api/webhooks/ && git commit -m "feat: Stripe webhook — confirm booking on payment_intent.succeeded"
```

---

## Task 9: Confirmation Page

**Files:**
- Modify: `app/(public)/book/confirmation/page.tsx`

Fetches booking from DB by ID and shows the confirmed booking details. Falls back gracefully if booking not found.

- [ ] **Step 1: Write confirmation page**

`app/(public)/book/confirmation/page.tsx` — replace stub with:
```tsx
import Link from 'next/link'
import { getBookingById } from '@/lib/db/queries/bookings'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function googleCalendarUrl(booking: { eventDate: string; startTime: string; endTime: string; eventType: string; locationAddress: string; locationCity: string }): string {
  const dateStr = booking.eventDate.replace(/-/g, '')
  const startStr = `${dateStr}T${booking.startTime.replace(':', '')}00`
  const endStr = `${dateStr}T${booking.endTime.replace(':', '')}00`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Demarks 360 — ${booking.eventType}`,
    dates: `${startStr}/${endStr}`,
    location: `${booking.locationAddress}, ${booking.locationCity}, Alberta`,
    details: 'Your Demarks 360 360-degree video booth is confirmed for this event.',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { id } = await searchParams
  const booking = id ? await getBookingById(id) : null

  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F4', paddingTop: '66px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#0F0F0F', marginBottom: '1rem' }}>Booking Not Found</h1>
          <Link href="/" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: '#8B5CF6', textDecoration: 'underline' }}>Return to Home</Link>
        </div>
      </div>
    )
  }

  const eventDate = new Date(booking.eventDate + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const balanceDate = booking.balanceChargeDate
    ? new Date(booking.balanceChargeDate + 'T00:00:00').toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', paddingTop: '66px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 3rem' }}>
        {/* Success header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#EC4899,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: '#fff', fontSize: '1.25rem' }}>✓</span>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', marginBottom: '0.5rem' }}>
            Booking Confirmed
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F' }}>
            You&apos;re Booked!
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#3A3A3A', lineHeight: 1.75, fontWeight: 300, marginTop: '1rem' }}>
            A confirmation email has been sent. Check your inbox for the receipt and event details.
          </p>
        </div>

        {/* Booking details card */}
        <div style={{ border: '1px solid rgba(15,15,15,0.10)', background: '#fff', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginBottom: '0.5rem' }}>Event Details</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.04em', color: '#0F0F0F' }}>{eventDate}</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: '#3A3A3A', marginTop: '0.25rem' }}>
              {formatTime(booking.startTime)} → {formatTime(booking.endTime)}
              {' · '}{booking.eventType}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: '#888880', marginTop: '0.15rem' }}>
              {booking.locationAddress}, {booking.locationCity}
            </p>
          </div>

          {[
            { label: 'Deposit Paid', value: `$${Number(booking.depositAmount).toFixed(2)}` },
            { label: 'Balance Due', value: `$${Number(booking.balanceAmount).toFixed(2)}` },
            { label: 'Balance Charge Date', value: balanceDate ?? '—' },
            { label: 'Booking Reference', value: booking.id.slice(0, 12).toUpperCase() },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(15,15,15,0.06)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: '#888880' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#0F0F0F', fontWeight: 600 }}>{value}</span>
            </div>
          ))}

          <div style={{ padding: '1rem 1.5rem', background: 'rgba(15,15,15,0.02)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#888880', lineHeight: 1.6 }}>
              Your card is saved for the balance charge on {balanceDate}. It will be automatically deleted 7 days after your event.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href={googleCalendarUrl(booking)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#fff', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
              padding: '0.85rem 1.5rem', textDecoration: 'none', display: 'inline-block',
            }}
          >
            Add to Google Calendar
          </a>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#0F0F0F', border: '1px solid rgba(15,15,15,0.2)',
              padding: '0.85rem 1.5rem', textDecoration: 'none', display: 'inline-block',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/saaqibfagbenro/demarks360 && pnpm build 2>&1 | tail -10
```

Expected: all routes compile cleanly including `/book/confirmation`.

- [ ] **Step 3: Commit**

```bash
cd /Users/saaqibfagbenro/demarks360 && git add "app/(public)/book/confirmation/" && git commit -m "feat: booking confirmation page with Google Calendar link"
```

---

## Task 10: Deploy

- [ ] **Step 1: Push to GitHub**

```bash
cd /Users/saaqibfagbenro/demarks360 && git push origin main
```

- [ ] **Step 2: Deploy to Vercel production**

```bash
source ~/.zshrc && cd /Users/saaqibfagbenro/demarks360 && vercel deploy --prod 2>&1 | tail -5
```

- [ ] **Step 3: Verify routes in build output**

Confirm the following routes compiled:
- `/book`
- `/book/confirmation`
- `/api/availability` (dynamic)
- `/api/bookings` (dynamic)
- `/api/webhooks/stripe` (dynamic)

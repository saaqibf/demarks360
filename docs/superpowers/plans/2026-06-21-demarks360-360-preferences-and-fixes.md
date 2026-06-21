# Demarks360 360-Preferences, Site Fixes & Video Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all broken navigation/link bugs, add 360 event design preferences to the booking flow (video type/duration/boomerang/color/theme/song), and update copy to reflect WhatsApp/SMS as the primary video delivery method.

**Architecture:** Three independent sub-projects run in parallel (A=bugs, B=new booking fields, C=copy). Sub-project B flows backend-first (schema → validation → API) before the frontend booking form UI is built, so the TypeScript types exist before the React component references them.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM + Neon Postgres, Zod validation, Stripe Elements, Clerk auth, pnpm, TypeScript.

## Global Constraints

- No em dashes anywhere in user-facing copy
- Short git commit messages, no AI tool mentions, no Co-Authored-By trailers
- Author always: `Saaqib Fagbenro <saaqibf.ayodimeji@gmail.com>`
- Run `pnpm build` + `npx tsc --noEmit` before any commit — both must pass
- After schema changes: `pnpm drizzle-kit generate && pnpm drizzle-kit migrate` (requires DATABASE_URL in env)
- Working directory: `/Users/saaqibfagbenro/demarks360`
- Design system: Golden Hour Cinema (Bodoni Moda display, Figtree UI, amber `#C9913F`/`#E8B25C`, charcoal `#141009`, cream `#F5EFE2`)

---

## Sub-Project A: Site Bug Fixes

### Task A1: Fix SiteNav anchor links for non-homepage pages

**Bug:** `SiteNav` renders anchor hrefs as `#how-it-works`, `#pricing`, `#gallery`, `#faq`. These IDs only exist on the homepage. On `/book`, `/gallery`, `/account`, etc., clicking them scrolls nowhere. The homepage uses its own built-in nav (not SiteNav), so the fix is safe.

**Files:**
- Modify: `components/public/site-nav.tsx`

**Interfaces:**
- Produces: SiteNav with working cross-page anchor nav

- [ ] **Step 1: Open the file and find the links array**

`components/public/site-nav.tsx` around line 12:
```typescript
const links = ['How It Works', 'Pricing', 'Gallery', 'FAQ']
```
The desktop nav generates `href={`#${id}`}` where `id = label.toLowerCase().replace(/\s+/g, '-')`.

- [ ] **Step 2: Change anchor generation to absolute paths**

In the desktop nav map (around line 55-80), change:
```typescript
href={`#${id}`}
```
to:
```typescript
href={`/#${id}`}
```

Do the same in the mobile menu map (around line 88-105):
```typescript
href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
```
becomes:
```typescript
href={`/#${label.toLowerCase().replace(/\s+/g, '-')}`}
```

The `a` tags also need to become `Link` or keep as `a` — since these are hash links to another page, using `a` with absolute `/#section` is fine. The intersection observer stays for homepage use.

- [ ] **Step 3: Verify build passes**

```bash
cd /Users/saaqibfagbenro/demarks360
npx tsc --noEmit
pnpm build
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/public/site-nav.tsx
git commit -m "fix: site nav anchor links work from non-homepage pages"
```

---

### Task A2: Fix eventName/notes data integrity bug

**Bug:** `createBookingRecord` stores `eventName` in the `notes` column (`notes: params.eventName ?? null`). The admin has an "Update Notes" feature that overwrites `notes`. This silently destroys the event name whenever the admin adds booking notes.

**Fix:** Add a dedicated `event_name` column to bookings. This task is superseded if Task B1 (schema changes) runs first — B1 adds the column as part of the larger schema migration. If B1 runs first, skip A2.

**Files:**
- Modify: `lib/db/schema.ts`
- Modify: `lib/db/queries/bookings.ts`

- [ ] **Step 1: Add eventName column to schema**

In `lib/db/schema.ts`, inside the `bookings` table definition, add after the `notes` field:
```typescript
eventName: text('event_name'),
```

- [ ] **Step 2: Generate and run migration**

```bash
cd /Users/saaqibfagbenro/demarks360
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```
Expected: new migration file created and applied.

- [ ] **Step 3: Update createBookingRecord to use eventName column**

In `lib/db/queries/bookings.ts`, `CreateBookingParams` already has `eventName?: string`. In the `.values({...})` call, change:
```typescript
notes: params.eventName ?? null,
```
to:
```typescript
eventName: params.eventName ?? null,
notes: null,
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema.ts lib/db/queries/bookings.ts lib/db/migrations/
git commit -m "fix: separate eventName from admin notes column"
```

---

## Sub-Project B: 360 Event Preferences (Backend → Frontend)

### Task B1: Schema — add eventName column and eventPreferences JSONB

**Note:** If Task A2 already added `eventName`, skip the eventName part here and only add `eventPreferences`.

**Files:**
- Modify: `lib/db/schema.ts`

**Interfaces:**
- Produces: `bookings.eventName: text`, `bookings.eventPreferences: jsonb<EventPreferences>`

```typescript
// EventPreferences shape (for reference in later tasks):
type EventPreferences = {
  backgroundColorTheme?: string    // e.g. "Gold and Black"
  designThemeTags?: string[]       // e.g. ["Birthday (Adult)", "Glam"]
  songPreference?: string          // e.g. "Davido - Champion Sound"
  videoType?: 'video' | 'slomo'   // default 'video' if not set
  videoDuration?: number           // seconds, 1-20 for video, 1-12 for slomo
  slomoBoomerang?: boolean         // only relevant when videoType === 'slomo'
}
```

- [ ] **Step 1: Add columns to bookings table**

In `lib/db/schema.ts`, inside the `bookings` pgTable definition, add these two columns after the existing `notes` field:

```typescript
eventName: text('event_name'),
eventPreferences: jsonb('event_preferences').$type<{
  backgroundColorTheme?: string
  designThemeTags?: string[]
  songPreference?: string
  videoType?: 'video' | 'slomo'
  videoDuration?: number
  slomoBoomerang?: boolean
}>(),
```

- [ ] **Step 2: Generate and run migration**

```bash
cd /Users/saaqibfagbenro/demarks360
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```
Expected: migration file created with `ALTER TABLE bookings ADD COLUMN event_name text, ADD COLUMN event_preferences jsonb`.

- [ ] **Step 3: Verify no type errors**

```bash
npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema.ts lib/db/migrations/
git commit -m "feat: add eventName and eventPreferences columns to bookings"
```

---

### Task B2: Validation schema — add eventPreferences fields

**Files:**
- Modify: `lib/validations/booking.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: `createBookingSchema` now accepts optional `eventPreferences` object

- [ ] **Step 1: Add eventPreferences to createBookingSchema**

In `lib/validations/booking.ts`, add after the existing `eventName` field:

```typescript
eventPreferences: z.object({
  backgroundColorTheme: z.string().max(200).optional(),
  designThemeTags: z.array(z.string().max(100)).max(5).optional(),
  songPreference: z.string().max(200).optional(),
  videoType: z.enum(['video', 'slomo']).optional(),
  videoDuration: z.number().int().min(1).max(120).optional(),
  slomoBoomerang: z.boolean().optional(),
}).optional(),
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/validations/booking.ts
git commit -m "feat: add 360 preferences to booking validation schema"
```

---

### Task B3: Queries and API route — pass eventPreferences through

**Files:**
- Modify: `lib/db/queries/bookings.ts`
- Modify: `app/api/bookings/route.ts`

**Interfaces:**
- Consumes: `createBookingSchema` from Task B2, `bookings.eventPreferences` from Task B1
- Produces: booking records with `eventPreferences` persisted

- [ ] **Step 1: Update CreateBookingParams type**

In `lib/db/queries/bookings.ts`, add to the `CreateBookingParams` interface:
```typescript
eventName?: string
eventPreferences?: {
  backgroundColorTheme?: string
  designThemeTags?: string[]
  songPreference?: string
  videoType?: 'video' | 'slomo'
  videoDuration?: number
  slomoBoomerang?: boolean
}
```
Also add to the `.values({...})` in `createBookingRecord`:
```typescript
eventName: params.eventName ?? null,
eventPreferences: params.eventPreferences ?? null,
notes: null,   // no longer used for eventName
```
And remove the old line: `notes: params.eventName ?? null,`

- [ ] **Step 2: Pass fields in API route**

In `app/api/bookings/route.ts`, in the `createBookingRecord` call, add:
```typescript
eventName: input.eventName,
eventPreferences: input.eventPreferences,
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/queries/bookings.ts app/api/bookings/route.ts
git commit -m "feat: persist 360 event preferences through API to DB"
```

---

### Task B4: BookingState type — add new fields

**Files:**
- Modify: `app/(public)/book/page.tsx`

**Interfaces:**
- Produces: `BookingState` extended with 360 preference fields, consumed by `DetailsForm` in Task B5

- [ ] **Step 1: Extend BookingState type**

In `app/(public)/book/page.tsx`, add these fields to the `BookingState` type:
```typescript
videoType: 'video' | 'slomo'
videoDuration: number | null
slomoBoomerang: boolean
backgroundColorTheme: string
designThemeTags: string[]
songPreference: string
```

- [ ] **Step 2: Add defaults to initialState**

```typescript
videoType: 'video',
videoDuration: null,
slomoBoomerang: false,
backgroundColorTheme: '',
designThemeTags: [],
songPreference: '',
```

- [ ] **Step 3: Pass eventPreferences in CheckoutStep**

The `CheckoutStep` calls the API. In `components/public/book/checkout-step.tsx`, find where it constructs the POST body and add:
```typescript
eventPreferences: {
  backgroundColorTheme: state.backgroundColorTheme || undefined,
  designThemeTags: state.designThemeTags.length > 0 ? state.designThemeTags : undefined,
  songPreference: state.songPreference || undefined,
  videoType: state.videoType,
  videoDuration: state.videoDuration ?? undefined,
  slomoBoomerang: state.slomoBoomerang || undefined,
},
```

- [ ] **Step 4: Verify types**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/book/page.tsx" components/public/book/checkout-step.tsx
git commit -m "feat: add 360 preferences fields to booking state"
```

---

### Task B5: Booking form UI — "Your 360 Experience" section

This is the most complex UI task. Add a new section to `DetailsForm` (Step 4) after the existing event detail fields, before the Terms checkbox.

**Files:**
- Modify: `components/public/book/details-form.tsx`

**Design Direction:** Cinema configurator. The section header feels like a VIP backstage briefing form — dark surface, amber accent rules, tactile pill toggles. Matches the Golden Hour Cinema system already in use.

**Video type/duration rules:**
- **Video** (default): recommended 15-20s, max 20s. Show duration selector: 5 / 10 / 15 / **20 (recommended)** seconds
- **Slow Motion**: max 12s. Show duration: 4 / 6 / 8 / 10 / 12 seconds. When 12s is selected, warn that output may exceed expected length.
- **Boomerang toggle**: only visible when `videoType === 'slomo'`. Copy: "Loop it back — your slomo plays forward, then reverses. Doubles your final clip length."

**Design theme tags (TouchPix-mapped categories — pick any that fit their vibe):**
```
Birthday (Adult) | Birthday (Kids) | Baby Shower | Bachelorette
Wedding | Graduation | Corporate | Holiday / Christmas
Carnival / Tropical | Casino Night | Sports | Custom / Other
```

**Interfaces:**
- Consumes: `BookingState` with fields from Task B4
- `onChange: (patch: Partial<BookingState>) => void`

- [ ] **Step 1: Add section divider + heading**

Inside `DetailsForm` return, after the Event Name field group and before the Terms checkbox div, add:

```tsx
{/* 360 Design & Format */}
<div style={{ borderTop: '1px solid var(--color-border-dark)', paddingTop: '2rem', marginTop: '0.75rem' }}>
  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
    <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'var(--color-amber)' }} />
    Your 360 Experience
  </p>
  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 400, color: 'var(--color-text-light)', marginBottom: '0.6rem', lineHeight: 0.95 }}>
    Design your moment
  </h3>
  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(245,240,234,0.4)', marginBottom: '2rem', maxWidth: '48ch' }}>
    All fields optional. The more you share, the more we can tailor your booth to the night.
  </p>
  {/* ... fields below ... */}
</div>
```

- [ ] **Step 2: Add video type toggle (Video vs Slow Motion)**

Add inside the section div, as the first field group:
```tsx
<div>
  <label style={labelStyle}>Video Format</label>
  <div style={{ display: 'flex', gap: '0.75rem' }}>
    {(['video', 'slomo'] as const).map(type => (
      <button
        key={type}
        type="button"
        onClick={() => onChange({ videoType: type, videoDuration: null, slomoBoomerang: false })}
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: '999px',
          border: `1.5px solid ${state.videoType === type ? 'var(--color-amber-light)' : 'var(--color-border-dark)'}`,
          background: state.videoType === type ? 'rgba(201,145,63,0.12)' : 'transparent',
          color: state.videoType === type ? 'var(--color-amber-light)' : 'var(--color-muted-light)',
          fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {type === 'video' ? 'Video' : 'Slow Motion'}
      </button>
    ))}
  </div>
  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.32)', marginTop: '0.45rem' }}>
    {state.videoType === 'video'
      ? 'Standard video — recommended 15-20 seconds for best results.'
      : 'Cinematic slow motion — up to 12 seconds. Looks incredible.'}
  </p>
</div>
```

- [ ] **Step 3: Add duration selector (conditional)**

After the video type toggle:
```tsx
<div>
  <label style={labelStyle}>
    Clip Duration
    {state.videoType === 'video' && <span style={{ fontWeight: 400, opacity: 0.5, marginLeft: '0.4rem' }}>(optional)</span>}
  </label>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
    {(state.videoType === 'slomo' ? [4, 6, 8, 10, 12] : [5, 10, 15, 20]).map(s => {
      const isRecommended = state.videoType === 'video' && s === 20
      const selected = state.videoDuration === s
      return (
        <button
          key={s}
          type="button"
          onClick={() => onChange({ videoDuration: s })}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '6px',
            border: `1.5px solid ${selected ? 'var(--color-amber-light)' : 'var(--color-border-dark)'}`,
            background: selected ? 'rgba(201,145,63,0.1)' : 'transparent',
            color: selected ? 'var(--color-amber-light)' : 'var(--color-muted-light)',
            fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
          }}
        >
          {s}s{isRecommended ? ' ★' : ''}
        </button>
      )
    })}
  </div>
  {state.videoType === 'slomo' && state.videoDuration === 12 && (
    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'var(--color-amber)', marginTop: '0.4rem' }}>
      At 12s with higher frame rates, your output may run slightly longer than expected.
    </p>
  )}
  {state.videoType === 'video' && (
    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.32)', marginTop: '0.4rem' }}>
      20s marked ★ is our recommended length for the smoothest crowd moment.
    </p>
  )}
</div>
```

- [ ] **Step 4: Add boomerang toggle (slomo only)**

After the duration selector, add:
```tsx
{state.videoType === 'slomo' && (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-dark)', padding: '1.25rem', borderRadius: '6px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <button
        type="button"
        role="switch"
        aria-checked={state.slomoBoomerang}
        onClick={() => onChange({ slomoBoomerang: !state.slomoBoomerang })}
        style={{
          width: '44px', height: '24px', borderRadius: '999px', border: 'none', cursor: 'pointer', flexShrink: 0,
          background: state.slomoBoomerang ? 'var(--color-amber)' : 'rgba(255,255,255,0.12)',
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: '3px',
          left: state.slomoBoomerang ? '23px' : '3px',
          width: '18px', height: '18px', borderRadius: '50%',
          background: 'white', transition: 'left 0.2s',
        }} />
      </button>
      <div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>
          Add Boomerang Loop
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.4)', lineHeight: 1.55 }}>
          Plays your slomo forward, then reverses. Doubles your final clip length.
          {state.videoDuration ? ` Your ${state.videoDuration}s clip becomes ~${state.videoDuration * 2}s total.` : ''}
        </p>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 5: Add background color theme input**

```tsx
<div>
  <label style={labelStyle}>
    Color Theme <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span>
  </label>
  <input
    style={inputStyle}
    value={state.backgroundColorTheme}
    onChange={e => onChange({ backgroundColorTheme: e.target.value })}
    placeholder="e.g. Gold and Black, Hot Pink, Navy and Silver, Rose Gold"
    maxLength={200}
  />
  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.32)', marginTop: '0.35rem' }}>
    The colors we design your 360 overlay around.
  </p>
</div>
```

- [ ] **Step 6: Add design theme tag picker**

```tsx
<div>
  <label style={labelStyle}>
    Vibe / Theme <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional — pick any that fit)</span>
  </label>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
    {[
      'Birthday (Adult)', 'Birthday (Kids)', 'Baby Shower', 'Bachelorette',
      'Wedding', 'Graduation', 'Corporate', 'Holiday / Christmas',
      'Carnival / Tropical', 'Casino Night', 'Sports', 'Custom / Other',
    ].map(tag => {
      const selected = state.designThemeTags.includes(tag)
      return (
        <button
          key={tag}
          type="button"
          onClick={() => {
            const next = selected
              ? state.designThemeTags.filter(t => t !== tag)
              : [...state.designThemeTags, tag]
            onChange({ designThemeTags: next })
          }}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '4px',
            border: `1px solid ${selected ? 'var(--color-amber-light)' : 'var(--color-border-dark)'}`,
            background: selected ? 'rgba(201,145,63,0.12)' : 'transparent',
            color: selected ? 'var(--color-amber-light)' : 'rgba(245,240,234,0.45)',
            fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 600,
            letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {tag}
        </button>
      )
    })}
  </div>
  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.32)', marginTop: '0.45rem' }}>
    Helps us pick from the right design library section for your overlay.
  </p>
</div>
```

- [ ] **Step 7: Add song preference input**

```tsx
<div>
  <label style={labelStyle}>
    Song for the Booth <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span>
  </label>
  <input
    style={inputStyle}
    value={state.songPreference}
    onChange={e => onChange({ songPreference: e.target.value })}
    placeholder="Artist – Song title, or describe the vibe (e.g. afrobeats energy)"
    maxLength={200}
  />
  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.32)', marginTop: '0.35rem' }}>
    We cue this up while the booth is running at your event.
  </p>
</div>
```

- [ ] **Step 8: Build and verify**

```bash
cd /Users/saaqibfagbenro/demarks360
npx tsc --noEmit
pnpm build
```
Expected: 0 errors.

- [ ] **Step 9: Commit**

```bash
git add components/public/book/details-form.tsx
git commit -m "feat: 360 experience preferences section in booking form"
```

---

### Task B6: Admin booking detail page — show 360 preferences

**Files:**
- Modify: `app/(admin)/admin/bookings/[id]/page.tsx`

**Interfaces:**
- Consumes: `booking.eventName` (text), `booking.eventPreferences` (JSONB) from B1

- [ ] **Step 1: Add Event Name to the event info panel**

In `app/(admin)/admin/bookings/[id]/page.tsx`, find the array of rows in the "Event" panel (around line 82):
```typescript
{ label: 'Date', value: fmtDate(b.eventDate) },
{ label: 'Time', value: `${fmt(b.startTime)} → ${fmt(b.endTime)}` },
{ label: 'Type', value: b.eventType },
...
```
Add `eventName` after type:
```typescript
...(b.eventName ? [{ label: 'Event Name', value: b.eventName }] : []),
```

- [ ] **Step 2: Add 360 Preferences panel**

After the existing two-column grid (after the payment panel), add a third info block:
```tsx
{b.eventPreferences && (() => {
  const p = b.eventPreferences as {
    backgroundColorTheme?: string
    designThemeTags?: string[]
    songPreference?: string
    videoType?: string
    videoDuration?: number
    slomoBoomerang?: boolean
  }
  const rows = [
    p.videoType && { label: 'Video Format', value: p.videoType === 'slomo' ? 'Slow Motion' : 'Video' },
    p.videoDuration && { label: 'Clip Duration', value: `${p.videoDuration}s${p.slomoBoomerang ? ' + boomerang loop' : ''}` },
    p.backgroundColorTheme && { label: 'Color Theme', value: p.backgroundColorTheme },
    p.designThemeTags?.length && { label: 'Vibe / Theme', value: p.designThemeTags.join(', ') },
    p.songPreference && { label: 'Song', value: p.songPreference },
  ].filter(Boolean) as { label: string; value: string }[]

  if (!rows.length) return null
  return (
    <div style={{ background: 'var(--color-surface)', padding: '1.5rem', marginTop: '1px' }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', marginBottom: '1rem' }}>360 Design Preferences</p>
      {rows.map(({ label, value }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(245,240,234,0.35)' }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-amber-light)', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
        </div>
      ))}
    </div>
  )
})()}
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit && pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add "app/(admin)/admin/bookings/[id]/page.tsx"
git commit -m "feat: show 360 preferences and event name in admin booking detail"
```

---

## Sub-Project C: Video Delivery Copy Update

### Task C1: Update homepage FAQ + how-it-works copy for WhatsApp/SMS delivery

**Context:** TouchPix supports Email and SMS sending from the device (Device Sharing Methods) and WhatsApp + Email from the web gallery (Web Gallery Sharing Methods). The recommended flow for non-tech-savvy guests is SMS or WhatsApp — the video arrives in their messages app and saves directly to Photos when tapped, completely bypassing the QR code + web gallery + Files-not-Photos problem.

**Files:**
- Modify: `app/(public)/page.tsx` (FAQ section, around line 351-415)

**Current FAQ answer for "How do guests get their videos?":**
```
"Instantly by QR code at the booth, and the full gallery link is sent the same day. Every video is ready to post."
```

**New answer:**
```
"Right at the booth. We text or WhatsApp your video directly to your phone — tap to save, done. No QR code hunting, no waiting for a gallery link, no downloading to Files. It goes straight to your photos."
```

- [ ] **Step 1: Find and update the FAQ answer**

In `app/(public)/page.tsx`, search for the FAQ section. Find the `<details>` element for "How do guests get their videos?" and update the `<div class="dm-faq-ans">` content to the new answer above.

- [ ] **Step 2: Find "How it works" / experience section and update the sharing step**

In the `#dm-experience` section (around line 154-207), find the step that describes how guests receive videos. Update the description to match the WhatsApp/SMS delivery story.

Look for text like "gallery" or "QR" in that section and update to reflect direct SMS/WhatsApp delivery.

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit && pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/page.tsx"
git commit -m "fix: update video delivery copy to reflect WhatsApp and SMS sharing"
```

---

## Final Verification

- [ ] **Run full build one last time**

```bash
cd /Users/saaqibfagbenro/demarks360
npx tsc --noEmit
pnpm build
```
Expected: BUILD SUCCESSFUL, 0 type errors.

- [ ] **Deploy to Vercel preview**

```bash
vercel deploy
```
Check the preview URL and click through:
1. Homepage — nav links in desktop + mobile
2. Click "How It Works", "Pricing", "Gallery", "FAQ" from the nav on `/book` — should navigate to `/#section`
3. Book flow — step through to Step 4, verify "Your 360 Experience" section renders
4. Pick Slow Motion → verify Boomerang toggle appears
5. Pick 12s → verify warning text
6. Admin booking detail — verify 360 preferences panel shows (will be empty for old bookings)

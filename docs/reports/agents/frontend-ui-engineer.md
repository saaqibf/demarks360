# Frontend UI Engineer Audit: Demarks360

Date: 2026-07-08
Scope: `components/`, `app/(public)/`, `app/gallery/`, booking money path `app/(public)/book`. Read-only audit, no source edits.

---

## 1. Component architecture as-is

### Layers

| Layer | Location | Contents | Health |
|---|---|---|---|
| Public chrome | `components/public/` | site-nav, site-footer, cookie-consent, showcase-player, timecode | OK |
| Booking flow | `components/public/book/` | date-picker, time-picker, addons-step, details-form, checkout-step | Functional, zero reuse |
| Admin | `components/admin/` + `app/(admin)/` | admin-sidebar, booking actions, uploads | Out of scope (internal) |
| Primitives | none | **There is no primitives layer** | The core gap |

### What works

- The booking wizard's state model is clean: one `BookingState` in `app/(public)/book/page.tsx:11-54`, step components are controlled and stateless-ish, patches flow through `update()`.
- `details-form.tsx` is the best file in the flow: `label htmlFor` + `id` on every core field (`79-174`), `autoComplete` hints (`86,100,114,127`), `role="alert"` on every error (`88,102,116,129,174,431`), a real `role="switch"` with `aria-checked` for the boomerang toggle (`278-296`).
- Global `:focus-visible` outline in `app/globals.css:467-471` and thorough `prefers-reduced-motion` coverage (`globals.css:161,192,204,455,496`).
- Checkout has explicit loading, error, and Stripe-unconfigured states (`checkout-step.tsx:149-173, 277-279`), and the pay button shows a spinner and disables while submitting (`58-78`).
- `.btn-primary` / `.btn-secondary` semantic classes exist (`globals.css:209-246`) and manage/nav pages use them.

### The core architectural problem: no primitives, style objects copy-pasted per file

The booking flow ignores both Tailwind and the repo's own `frontend.md` rules ("never hardcode raw hex values", "use `.t-label` semantic classes"). Everything is inline `style={{...}}`:

- The amber eyebrow ("Step N" with the 20px rule) is copy-pasted 7 times: `date-picker.tsx:64-67`, `time-picker.tsx:102-105`, `addons-step.tsx:29-32`, `details-form.tsx:69-72, 193-196`, `checkout-step.tsx:160-163, 197-200`.
- The pill CTA button style object is copy-pasted 9 times across the five step files instead of using `.btn-primary` (for example `time-picker.tsx:161-171`, `addons-step.tsx:110-119`, `details-form.tsx:435-444`, `checkout-step.tsx:58-78`).
- The outline back button style is copy-pasted 6 times (`time-picker.tsx:175-180`, `addons-step.tsx:120-122`, `details-form.tsx:445-447`, `checkout-step.tsx:79-85, 168-170`).
- `formatTime`/`timeToMinutes` helpers are duplicated in 4 files: `time-picker.tsx:21-31`, `checkout-step.tsx:15-25`, `book/confirmation/page.tsx:10-15`, `book/manage/page.tsx:25-30`, plus `gallery/[token]/page.tsx:15-20` (5th copy). One drift and receipts disagree with pickers.
- The time picker hardcodes `$150`/hr for its estimate (`time-picker.tsx:159`) instead of deriving from `lib/pricing` like checkout does. When pricing changes, step 2 will quote a different number than step 5. Same class of bug as the duplicated formatters, but this one shows the customer two different prices.
- Raw hex/rgba literals everywhere (`rgba(255,255,255,0.07)` appears in nearly every booking file; `#34D399`/`#FBB724` status colors in `manage/page.tsx:134-135`), violating the token rule.

There are no `loading.tsx` files anywhere in `app/`, and only the root `app/error.tsx` / `app/global-error.tsx` boundaries exist.

---

## 2. Gap matrix, booking flow first

Legend: OK = present and correct, PART = partial, MISS = missing.

| Screen / step | Loading | Empty | Error | Edge cases | A11y |
|---|---|---|---|---|---|
| `/book` shell (`app/(public)/book/page.tsx`) | PART, Suspense fallback is nav over a blank ink page `186-195`, content flashes in | n/a | MISS, no route error boundary; a throw inside any step lands on the generic root boundary | **MISS, the entire wizard lives in `useState` `83-88`. A refresh, accidental swipe-back, or tab discard at step 4 or 5 loses everything.** No sessionStorage persistence, no beforeunload guard | PART, step indicator `106-141` is purely visual: done steps are not clickable to jump back, no `aria-current="step"`, no `<ol>`/list semantics; sticky offset hardcoded to `top: 72px` |
| Step 1 date (`date-picker.tsx`) | **MISS, availability fetch `35-43` has no pending state.** Days render enabled, then flip to full/booked when the fetch lands. On slow networks users can tap a date that is actually full | n/a | **MISS, fetch failure silently swallowed `.catch(() => {})` line 42, so an API outage shows every date as available.** The server presumably re-validates, but the user finds out five steps later | PART, lead-time and full dates disabled `57-60`; `prevMonth` `48-51` is unclamped, users can page back to 1998; "today" outlined but never selectable, which reads as a broken button | MISS, day buttons expose only a bare number ("14"), no `aria-label` with month/year, no `aria-pressed`/`aria-selected` `112-129`; month prev/next are bare arrow glyphs with no `aria-label` `75-89`; grid is divs, not a `grid`/`table` structure; full dates flagged by amber color plus `title` only, color-alone signal `123-126`; day cells ~34px tall, below 44px |
| Step 2 time (`time-picker.tsx`) | PART, text-only "Loading availability…" `85-91`, no skeleton, layout shifts from 1 line to a 56-slot grid | n/a | **MISS, on fetch failure it fabricates an empty availability `51-56`, rendering every slot bookable.** Money-path correctness risk, invites double-bookings the backend then has to reject | PART, min duration and travel buffer enforced `59-83`; raw ISO date shown to users ("2026-07-08 · Select when…") `111` while every other page formats dates; start/end two-phase flow has no visible "now pick an end time" scroll cue on mobile | MISS, slot buttons have no `aria-pressed`; blocked slots at `rgba(245,240,234,0.15)` on `#141009` is roughly 1.4:1 contrast, invisible to low-vision users `138-140`; phase change (start to end) not announced |
| Step 3 add-ons (`addons-step.tsx`) | OK, static data | OK, hardcoded list | n/a | PART, "coming soon" SmileCam handled `89-93`; the whole row is one `<button>` containing a fake checkbox `42-104`, fine, but no `aria-pressed` so state is invisible to AT | PART, fake checkbox span `77-84` carries no semantics; price-only signal for selection is color change |
| Step 4 details (`details-form.tsx`) | n/a | n/a | PART, per-field `role="alert"` errors on submit `88-431`, but no scroll/focus to the first invalid field, on a 390px screen the error can be off-viewport with no feedback near the CTA | PART, "Other" event type round-trips as the string `' '` (single space) `152-158`, fragile sentinel that will leak into the DB if the user never types; email check is `includes('@')` `54`; phone strips to 10 digits `55`; optional Event Name has no `maxLength` while color theme and song do (`320,406`) | PART, best a11y in the repo (labels, autocomplete, switch); **but `inputStyle` sets `outline: 'none'` `37`, and inline styles beat the global `:focus-visible` rule, so keyboard focus is invisible on every text input in the money path**; theme cards `336-388` and video-format pills `210-225` lack `aria-pressed`; terms checkbox is 16px `421`, below the 44px target; helper text `rgba(245,240,234,0.32)` at 0.62rem `227,263` fails AA |
| Step 5 checkout (`checkout-step.tsx`) | PART, "Preparing your checkout…" text `149-155`, no skeleton of the order summary it is about to render | n/a | PART, init error state with Back `157-173` (good); Stripe `confirmPayment` error shown `55-57` but the `<p>` has no `role="alert"`/`aria-live`, and "Payment unavailable, Stripe not configured." `278` leaks internal state to a customer | **MISS, the POST to `/api/bookings` fires on every mount with `[]` deps `110-147`. Back to step 4 then Continue mounts it again: a second pending booking and PaymentIntent are created and the first is orphaned.** No idempotency key, no reuse of the existing bookingId | PART, submit button disables while processing `60`; summary is plain text, fine; sticky payment column handled at 768px via inline `<style>` `179-194` |
| Confirmation (`book/confirmation/page.tsx`) | MISS, server component with no `loading.tsx`, blank during DB fetch after Stripe redirect, the single most anxious moment in the funnel | OK, booking-not-found state with helpful copy `42-58` | PART, not-found handled; a DB error throws to root boundary | PART, `booking.eventName` shown on manage/checkout but not echoed here; long addresses wrap fine; Google Calendar link correct `17-36` | PART, check icon is a text glyph in a div, harmless; no `main` landmark; padding `6rem 3rem` `70` leaves ~294px of content at 390px, cramped but working |
| Manage (`book/manage/page.tsx`) | PART, text "Loading…" `81-88` | OK, not-found state `90-103` | OK, submit failure shows fallback email copy `72-74` | PART, `canManage` gating by status `107`, cancelled state handled `241-247`; no confirm step before sending a cancellation request | PART, textarea has placeholder but no `<label>`/`aria-label` `194-206` and sets `outline: 'none'` `203`; status badge colors are raw hex `134-135`; error `<p>` not `role="alert"` `207` |
| Gallery (`gallery/[token]/page.tsx`) | MISS, no `loading.tsx` for a Mux-backed page | OK, strong "videos being prepared" state `91-107` | PART, invalid/cancelled tokens 404 `26`, fine; no boundary for Mux fetch failures | PART, "right-click to download" instruction `78` is meaningless on the phones most guests will use, no download button; count display fine | PART, no `<main>`/heading order issues minor; labels at `0.52rem` `57-69` with `rgba(245,240,234,0.3)` fail AA badly |
| Landing + nav (`components/public/site-nav.tsx`) | n/a | n/a | n/a | OK | OK-PART, hamburger has `aria-label` + `aria-expanded` `134-154` and 44px min height (good); mobile menu is a plain div, no focus trap or Escape handling `158-199`; anchor links fine |

### Responsive behavior (390 / 768 / 1440)

- 390px: step labels hide and paddings shrink via the inline `<style>` block `book/page.tsx:99-105` (works); time grid fixed `repeat(4, 1fr)` `time-picker.tsx:115` gives ~80px slots, acceptable; theme cards `minmax(130px, 1fr)` wrap to 2-up (fine); confirmation and gallery keep desktop-scale side padding (`3rem`), cramped at 390.
- 768px: checkout collapses to one column and un-stickies `checkout-step.tsx:185-193` (correct); everything else single-column already.
- 1440px: `maxWidth: 960px` wizard shell and `1200px` gallery hold up; checkout summary + 380px payment rail reads well.
- Pattern-level issue: responsive behavior depends on per-page inline `<style>` tags with media queries (`book/page.tsx:99-105`, `checkout-step.tsx:179-194`) instead of Tailwind breakpoints, so every new page re-invents its own breakpoints.

---

## 3. Proposed reusable components

A small `components/public/ui/` primitives layer removes most duplication and fixes the systemic a11y gaps in one move. All examples use existing tokens and the existing `.btn-primary` class where possible.

### 3.1 `StepHeading` (`components/public/ui/step-heading.tsx`)

Replaces the 7 copy-pasted eyebrow + display-heading blocks.

```tsx
interface StepHeadingProps {
  eyebrow: string;            // "Step 1", "Your 360 Experience"
  title: React.ReactNode;     // allows the italic amber <em>
  subtitle?: string;
  id?: string;                // anchor for aria-labelledby on the step region
}

export function StepHeading({ eyebrow, title, subtitle, id }: StepHeadingProps) {
  return (
    <header style={{ marginBottom: subtitle ? '0.75rem' : '2.5rem' }}>
      <p className="t-label" style={{ color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span aria-hidden style={{ width: '20px', height: '1.5px', background: 'var(--color-amber)' }} />
        {eyebrow}
      </p>
      <h2 id={id} className="t-heading" style={{ color: 'var(--color-text-light)' }}>{title}</h2>
      {subtitle && (
        <p className="t-body" style={{ color: 'var(--color-muted-light)', marginTop: '0.75rem', marginBottom: '2.5rem' }}>{subtitle}</p>
      )}
    </header>
  );
}
```

### 3.2 `WizardNav` (`components/public/ui/wizard-nav.tsx`)

Replaces the 9 continue-pill and 6 back-pill copies; guarantees 44px targets and consistent disabled/pending states.

```tsx
interface WizardNavProps {
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextPending?: boolean;      // shows spinner, disables, sets aria-busy
  onBack?: () => void;
  backLabel?: string;
}

export function WizardNav({ onNext, nextLabel = 'Continue →', nextDisabled, nextPending, onBack, backLabel = '← Back' }: WizardNavProps) {
  return (
    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {onNext && (
        <button className="btn-primary" onClick={onNext} disabled={nextDisabled || nextPending} aria-busy={nextPending}
          style={{ minHeight: '44px' }}>
          {nextPending ? 'One moment…' : nextLabel}
        </button>
      )}
      {onBack && (
        <button className="btn-secondary" onClick={onBack} style={{ minHeight: '44px' }}>
          {backLabel}
        </button>
      )}
    </div>
  );
}
```

### 3.3 `Field` (`components/public/ui/field.tsx`)

Wraps label + control + error. Restores visible focus (the current `outline: 'none'` on `details-form.tsx:37` defeats the global `:focus-visible`), and standardizes error announcement.

```tsx
interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => React.ReactNode;
}

export function Field({ id, label, optional, error, hint, children }: FieldProps) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="t-label" style={{ display: 'block', color: 'var(--color-muted-light)', marginBottom: '0.4rem' }}>
        {label}{optional && <span style={{ fontWeight: 400, opacity: 0.5 }}> (optional)</span>}
      </label>
      {children({ id, 'aria-invalid': !!error || undefined, 'aria-describedby': describedBy })}
      {hint && !error && <p id={`${id}-hint`} className="t-ui" style={{ color: 'var(--color-muted-light)', fontSize: '0.72rem', marginTop: '0.35rem' }}>{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}
```

Companion CSS (add once to `globals.css`, then delete `outline: 'none'` from all input style objects):

```css
.dm-input {
  width: 100%; padding: 0.85rem 1rem; box-sizing: border-box;
  border: 1px solid var(--color-border-dark); background: var(--color-surface);
  font-family: var(--font-body); font-size: 0.9rem; color: var(--color-text-light);
}
.dm-input:focus-visible { outline: 2px solid var(--color-amber); outline-offset: 2px; }
```

### 3.4 `ChoicePill` (`components/public/ui/choice-pill.tsx`)

One toggle primitive for time slots, video format, durations, theme cards, and add-on rows. Fixes the missing `aria-pressed` on every selectable control in the flow.

```tsx
interface ChoicePillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
  children: React.ReactNode;
}

export function ChoicePill({ selected, children, style, ...rest }: ChoicePillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      style={{
        minHeight: '44px', padding: '0.6rem 1.1rem', borderRadius: '6px', cursor: 'pointer',
        border: `1.5px solid ${selected ? 'var(--color-amber-light)' : 'var(--color-border-dark)'}`,
        background: selected ? 'rgba(201,145,63,0.1)' : 'transparent',
        color: selected ? 'var(--color-amber-light)' : 'var(--color-muted-light)',
        fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 600, transition: 'all 0.15s',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
```

### 3.5 Behavior fixes that ride along (not new components)

- **Persist the wizard**: serialize `BookingState` to `sessionStorage` on every `update()` and hydrate in `useState`'s initializer (`book/page.tsx:83-90`). Ten lines, saves the whole funnel from a refresh.
- **Idempotent checkout init**: in `checkout-step.tsx:110-147`, store `bookingId` in the parent `BookingState` (or a ref surviving remounts) and send it with the POST so the API updates the pending booking instead of inserting a new one; alternatively pass an idempotency key derived from date + time + email.
- **Fail closed on availability**: on fetch failure in `date-picker.tsx:42` and `time-picker.tsx:56`, show an inline retry state ("We could not load availability") instead of rendering everything bookable.
- **Route files**: `app/(public)/book/loading.tsx` (step-bar skeleton), `app/(public)/book/error.tsx`, `app/(public)/book/confirmation/loading.tsx` ("Confirming your booking…" holding state after the Stripe redirect), `app/gallery/[token]/loading.tsx`.
- **Step indicator**: render completed steps as `<button>` (jump back is safe, state is preserved), add `aria-current="step"`, wrap in `<ol>`.
- **Gallery downloads**: replace "right-click to download" (`gallery/[token]/page.tsx:78`) with a per-clip download button; guests are on phones.

---

## 4. Priority order

1. **Availability failures fail open** (`date-picker.tsx:42`, `time-picker.tsx:51-56`). An API blip makes booked dates and blocked slots look free. Fail closed with a retry message. This is the money path lying to customers.
2. **Duplicate booking + PaymentIntent creation on checkout remount** (`checkout-step.tsx:110-147`). Back-then-Continue creates orphan pending bookings; if pending bookings block availability, this also poisons the calendar.
3. **Wizard state lost on refresh** (`book/page.tsx:83-88`). sessionStorage persistence is ten lines and rescues the highest-intent users at step 5.
4. **Invisible keyboard focus on all booking inputs** (`details-form.tsx:37`, `manage/page.tsx:203`). Inline `outline: 'none'` overrides the global `:focus-visible`. WCAG failure on the revenue form.
5. **Price drift between step 2 and step 5** (`time-picker.tsx:159` hardcodes $150/hr instead of `lib/pricing`). Two quotes for one booking the day pricing changes.
6. **No loading.tsx anywhere**, worst on `book/confirmation` where the customer has just paid and stares at a blank ink page.
7. **Primitives layer** (StepHeading, WizardNav, Field, ChoicePill) to retire ~20 copy-pasted style blocks, 5 duplicate time formatters, and add `aria-pressed`/labels across all selectable controls, including calendar day and slot names (`date-picker.tsx:112-129`, month arrows `75-89`).
8. **Contrast pass**: blocked slots at ~1.4:1 (`time-picker.tsx:140`), 0.52 to 0.62rem labels at 30 to 35 percent opacity across booking, gallery, and confirmation.
9. **Polish**: clickable step indicator with `aria-current`, clamp `prevMonth`, format the raw ISO date in step 2 (`time-picker.tsx:111`), replace the "Other" event-type space sentinel (`details-form.tsx:154`), scroll-to-first-error on details submit, gallery download buttons, focus trap + Escape for the mobile nav menu (`site-nav.tsx:158-199`).

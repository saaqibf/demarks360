'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SiteNav } from '@/components/public/site-nav'
import { DatePicker } from '@/components/public/book/date-picker'
import { TimePicker } from '@/components/public/book/time-picker'
import { AddonsStep } from '@/components/public/book/addons-step'
import { DetailsForm } from '@/components/public/book/details-form'
import { RequestReviewStep } from '@/components/public/book/request-review-step'
import { BOOKING_WIZARD_STORAGE_KEY } from '@/components/public/book/wizard-storage'

export type BookingState = {
  step: 1 | 2 | 3 | 4 | 5
  date: string | null
  startTime: string | null
  endTime: string | null
  addOnIds: string[]
  customerName: string
  customerEmail: string
  customerPhone: string
  locationAddress: string
  locationCity: string
  eventType: string
  // True when the user picked "Other" and eventType holds their free-text description
  isOtherEventType: boolean
  eventName: string
  agreedToTerms: boolean
  // 360 design preferences
  videoType: 'video' | 'slomo'
  videoDuration: number | null
  slomoBoomerang: boolean
  backgroundColorTheme: string
  designThemeTags: string[]
  designNotes: string
  songPreference: string
  // Submit idempotency: the requested booking created for this wizard session, updated in place on re-submits
  pendingBookingId: string | null
  pendingPayloadSig: string | null
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
  isOtherEventType: false,
  eventName: '',
  agreedToTerms: false,
  videoType: 'video',
  videoDuration: null,
  slomoBoomerang: false,
  backgroundColorTheme: '',
  designThemeTags: [],
  designNotes: '',
  songPreference: '',
  pendingBookingId: null,
  pendingPayloadSig: null,
}

const STEP_LABELS = ['Date', 'Time', 'Add-ons', 'Details', 'Review']

// Stale wizard sessions restart fresh instead of resurfacing old dates and times
const STORAGE_TTL_MS = 30 * 60_000

function optionalString(v: unknown): string | null {
  return typeof v === 'string' ? v : null
}

function requiredString(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function stringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

// Rebuild a BookingState from untrusted storage, field by field, and clamp the step
// so a tampered or partial snapshot can never strand the wizard on an unreachable screen
function rehydrateStoredState(raw: unknown): BookingState | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Partial<Record<keyof BookingState, unknown>>
  if (o.step !== 1 && o.step !== 2 && o.step !== 3 && o.step !== 4 && o.step !== 5) return null

  const state: BookingState = {
    step: o.step,
    date: optionalString(o.date),
    startTime: optionalString(o.startTime),
    endTime: optionalString(o.endTime),
    addOnIds: stringArray(o.addOnIds),
    customerName: requiredString(o.customerName),
    customerEmail: requiredString(o.customerEmail),
    customerPhone: requiredString(o.customerPhone),
    locationAddress: requiredString(o.locationAddress),
    locationCity: requiredString(o.locationCity) || 'Calgary',
    eventType: requiredString(o.eventType),
    isOtherEventType: o.isOtherEventType === true,
    eventName: requiredString(o.eventName),
    agreedToTerms: o.agreedToTerms === true,
    videoType: o.videoType === 'slomo' ? 'slomo' : 'video',
    videoDuration: typeof o.videoDuration === 'number' ? o.videoDuration : null,
    slomoBoomerang: o.slomoBoomerang === true,
    backgroundColorTheme: requiredString(o.backgroundColorTheme),
    designThemeTags: stringArray(o.designThemeTags),
    designNotes: requiredString(o.designNotes),
    songPreference: requiredString(o.songPreference),
    pendingBookingId: optionalString(o.pendingBookingId),
    pendingPayloadSig: optionalString(o.pendingPayloadSig),
  }

  if (!state.date) state.step = 1
  else if (state.step > 2 && (!state.startTime || !state.endTime)) state.step = 2

  return state
}

function loadStoredState(): BookingState | null {
  try {
    const raw = sessionStorage.getItem(BOOKING_WIZARD_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const { savedAt, state } = parsed as { savedAt?: unknown; state?: unknown }
    if (typeof savedAt !== 'number' || Date.now() - savedAt > STORAGE_TTL_MS) return null
    return rehydrateStoredState(state)
  } catch {
    return null
  }
}

const EVENT_TYPE_ALIASES: Record<string, string> = {
  birthday: 'Birthday Party',
  'birthday party': 'Birthday Party',
  wedding: 'Wedding',
  graduation: 'Graduation',
  corporate: 'Corporate Event',
  'corporate event': 'Corporate Event',
  engagement: 'Engagement Party',
  'engagement party': 'Engagement Party',
  'baby shower': 'Baby Shower & Gender Reveal',
  'gender reveal': 'Baby Shower & Gender Reveal',
  holiday: 'Holiday Party',
  'holiday party': 'Holiday Party',
}

function normalizeEventType(value: string | null): { eventType: string; isOtherEventType: boolean } {
  if (!value || !value.trim()) return { eventType: '', isOtherEventType: false }
  const normalized = value.trim().replace(/[-_]+/g, ' ').toLowerCase()
  const canonical = EVENT_TYPE_ALIASES[normalized]
  if (canonical) return { eventType: canonical, isOtherEventType: false }
  if (normalized === 'other') return { eventType: '', isOtherEventType: true }
  // Unknown marketing values become a custom event type; the server accepts sanitized free text
  return { eventType: value.trim().slice(0, 100), isOtherEventType: true }
}

function BookPageInner() {
  const params = useSearchParams()
  const prefilledDate = params.get('date') ?? null
  const prefilledEventType = normalizeEventType(params.get('eventType'))
  const [state, setState] = useState<BookingState>({
    ...initialState,
    date: prefilledDate,
    ...prefilledEventType,
    step: prefilledDate ? 2 : 1,
  })
  // Rehydrate after mount (not in the initializer) so server and client render the same
  // initial markup; persisting is skipped until the restore attempt has run
  const hydrated = useRef(false)

  useEffect(() => {
    const stored = loadStoredState()
    if (stored) setState(stored)
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    try {
      sessionStorage.setItem(BOOKING_WIZARD_STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), state }))
    } catch {
      // Storage full or blocked: the wizard still works, it just will not survive a refresh
    }
  }, [state])

  function update(patch: Partial<BookingState>) {
    setState((s) => ({ ...s, ...patch }))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ink)' }}>
      <SiteNav />

      {/* Step indicator */}
      <style>{`
        @media (max-width: 640px) {
          .step-bar { padding: 0 1rem !important; }
          .step-label { display: none !important; }
          .step-content { padding: 2rem 1.25rem !important; }
        }
      `}</style>
      <div style={{ borderBottom: '1px solid var(--color-border-dark)', background: 'var(--color-ink)', position: 'sticky', top: '72px', zIndex: 100 }}>
        <div className="step-bar" style={{ maxWidth: '960px', margin: '0 auto', padding: '0 3rem', display: 'flex', alignItems: 'center', gap: '0' }}>
          {STEP_LABELS.map((label, i) => {
            const stepNum = (i + 1) as 1 | 2 | 3 | 4 | 5
            const active = stepNum === state.step
            const done = stepNum < state.step
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '30px', height: '30px', borderRadius: '50%', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: done ? 'var(--color-amber-light)' : active ? 'var(--color-amber)' : 'transparent',
                    border: active ? '1px solid var(--color-amber)' : done ? 'none' : '1.5px solid var(--color-border-dark)',
                    color: active || done ? 'var(--color-charcoal)' : 'var(--color-muted-light)',
                    fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700,
                    transition: 'background 0.2s ease, color 0.2s ease',
                  }}>
                    {done ? '✓' : stepNum}
                  </span>
                  <span className="step-label" style={{
                    fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: active ? 'var(--color-text-light)' : 'var(--color-muted-light)',
                  }}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div style={{ flex: 1, height: '1px', background: 'var(--color-border-dark)', margin: '0 0.75rem' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="step-content" style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem' }}>
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
          <RequestReviewStep
            state={state}
            onChange={update}
            onBack={() => update({ step: 4 })}
          />
        )}
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--color-ink)' }}>
        <SiteNav />
      </div>
    }>
      <BookPageInner />
    </Suspense>
  )
}

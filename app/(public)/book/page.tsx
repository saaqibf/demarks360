'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SiteNav } from '@/components/public/site-nav'
import { DatePicker } from '@/components/public/book/date-picker'
import { TimePicker } from '@/components/public/book/time-picker'
import { AddonsStep } from '@/components/public/book/addons-step'
import { DetailsForm } from '@/components/public/book/details-form'
import { CheckoutStep } from '@/components/public/book/checkout-step'

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
  eventName: string
  agreedToTerms: boolean
  // 360 design preferences
  videoType: 'video' | 'slomo'
  videoDuration: number | null
  slomoBoomerang: boolean
  backgroundColorTheme: string
  designThemeTags: string[]
  songPreference: string
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
  eventName: '',
  agreedToTerms: false,
  videoType: 'video',
  videoDuration: null,
  slomoBoomerang: false,
  backgroundColorTheme: '',
  designThemeTags: [],
  songPreference: '',
}

const STEP_LABELS = ['Date', 'Time', 'Add-ons', 'Details', 'Checkout']

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

function normalizeEventType(value: string | null): string {
  if (!value) return ''
  const normalized = value.trim().replace(/[-_]+/g, ' ').toLowerCase()
  return EVENT_TYPE_ALIASES[normalized] ?? value.trim()
}

function BookPageInner() {
  const params = useSearchParams()
  const prefilledDate = params.get('date') ?? null
  const prefilledEventType = normalizeEventType(params.get('eventType'))
  const [state, setState] = useState<BookingState>({
    ...initialState,
    date: prefilledDate,
    eventType: prefilledEventType,
    step: prefilledDate ? 2 : 1,
  })

  function update(patch: Partial<BookingState>) {
    setState((s) => ({ ...s, ...patch }))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ink)' }}>
      <SiteNav />

      {/* Step indicator */}
      <div style={{ borderBottom: '1px solid var(--color-border-dark)', background: 'var(--color-ink)', position: 'sticky', top: '72px', zIndex: 100 }}>
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
                    background: done ? 'var(--color-amber-light)' : active ? 'var(--color-text-light)' : 'transparent',
                    border: active || done ? 'none' : '1.5px solid var(--color-border-dark)',
                    color: active || done ? 'var(--color-charcoal)' : 'var(--color-muted-light)',
                    fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
                  }}>
                    {done ? '✓' : stepNum}
                  </span>
                  <span style={{
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

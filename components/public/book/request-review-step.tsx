'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BookingState } from '@/app/(public)/book/page'

interface RequestReviewStepProps {
  state: BookingState
  onChange: (patch: Partial<BookingState>) => void
  onBack: () => void
}

// Public-facing add-on names only. Prices never reach the customer path, so this
// maps ids to labels without importing the pricing config.
const ADDON_LABELS: Record<string, string> = {
  firecrackers: 'Firecrackers',
  smilecam: 'SmileCam Photo Booth',
}

function buildBookingPayload(state: BookingState) {
  return {
    eventDate: state.date,
    startTime: state.startTime,
    endTime: state.endTime,
    addOnIds: state.addOnIds,
    customerName: state.customerName,
    customerEmail: state.customerEmail,
    customerPhone: state.customerPhone,
    locationAddress: state.locationAddress,
    locationCity: state.locationCity,
    eventType: state.eventType.trim(),
    eventName: state.eventName || undefined,
    designNotes: state.designNotes || undefined,
    agreedToTerms: state.agreedToTerms,
    eventPreferences: {
      ...(state.videoType === 'slomo' && { videoType: 'slomo' as const }),
      ...(state.videoDuration !== null && { videoDuration: state.videoDuration }),
      ...(state.slomoBoomerang && { slomoBoomerang: true }),
      ...(state.backgroundColorTheme && { backgroundColorTheme: state.backgroundColorTheme }),
      ...(state.designThemeTags.length > 0 && { designThemeTags: state.designThemeTags }),
      ...(state.songPreference && { songPreference: state.songPreference }),
    },
  }
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

export function RequestReviewStep({ state, onChange, onBack }: RequestReviewStepProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const durationMinutes = state.startTime && state.endTime
    ? timeToMinutes(state.endTime) - timeToMinutes(state.startTime)
    : 0

  const selectedAddOns = state.addOnIds
    .map((id) => ADDON_LABELS[id])
    .filter((label): label is string => Boolean(label))

  async function handleSubmit() {
    if (!state.agreedToTerms || submitting) return
    setError(null)

    const payload = buildBookingPayload(state)
    const payloadSig = JSON.stringify(payload)

    // Double-click / back-button safety: an unchanged, already-submitted request just navigates
    if (state.pendingBookingId && state.pendingPayloadSig === payloadSig) {
      router.push('/book/confirmation?id=' + state.pendingBookingId)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // If details changed since a previous submit, the server updates the requested booking in place
        body: JSON.stringify({ ...payload, bookingId: state.pendingBookingId ?? undefined }),
      })
      const data: { bookingId?: string; error?: string } = await res.json().catch(() => ({}))
      if (!res.ok || !data.bookingId) {
        setError(data.error ?? 'Failed to submit your request. Please try again.')
        setSubmitting(false)
        return
      }
      onChange({ pendingBookingId: data.bookingId, pendingPayloadSig: payloadSig })
      router.push('/book/confirmation?id=' + data.bookingId)
    } catch {
      setError('Failed to submit your request. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'var(--color-amber)' }} />
        Step 5
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400, lineHeight: 0.95, color: 'var(--color-text-light)', marginBottom: '2rem' }}>
        Review your request
      </h2>

      <div className="dm-summary" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'var(--color-surface)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.35)', marginBottom: '0.5rem' }}>Event Summary</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-text-light)' }}>
            {state.date ? new Date(state.date + 'T00:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </p>
          {state.eventName && (
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontStyle: 'italic', color: 'var(--color-amber-light)', marginTop: '0.35rem' }}>
              {state.eventName}
            </p>
          )}
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'rgba(245,240,234,0.6)', marginTop: '0.25rem' }}>
            {state.startTime && formatTime(state.startTime)} → {state.endTime && formatTime(state.endTime)}
            {' · '}{(durationMinutes / 60).toFixed(1).replace('.0', '')} hours
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'rgba(245,240,234,0.4)', marginTop: '0.15rem' }}>
            {state.locationAddress}, {state.locationCity}
          </p>
        </div>

        {state.eventType && (
          <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'rgba(245,240,234,0.55)' }}>Event type</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--color-text-light)', fontWeight: 600, textAlign: 'right' }}>{state.eventType}</span>
          </div>
        )}

        {selectedAddOns.length > 0 && (
          <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'rgba(245,240,234,0.55)' }}>Add-ons of interest</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--color-text-light)', fontWeight: 600, textAlign: 'right' }}>{selectedAddOns.join(', ')}</span>
          </div>
        )}

        <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(245,240,234,0.35)', lineHeight: 1.6 }}>
            No payment is taken now. We review every request within 24 hours and reply with a tailored quote for your event.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '1.5rem' }}>
        <input
          type="checkbox"
          id="tos"
          checked={state.agreedToTerms}
          onChange={e => onChange({ agreedToTerms: e.target.checked })}
          style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: 'var(--color-amber-light)', flexShrink: 0, cursor: 'pointer' }}
        />
        <label htmlFor="tos" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted-light)', lineHeight: 1.6, cursor: 'pointer' }}>
          I have read and agree to the{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-amber-light)', textDecoration: 'underline' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-amber-light)', textDecoration: 'underline' }}>Privacy Policy</a>.
          I understand this is a quote request, that pricing and a deposit to hold my date will be shared in my quote, and that no payment is taken until I accept it.
        </label>
      </div>

      {error && (
        <p role="alert" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-amber-light)', marginTop: '1.25rem', lineHeight: 1.6 }}>
          {error}
        </p>
      )}

      <div className="dm-step-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleSubmit}
          disabled={!state.agreedToTerms || submitting}
          className="btn-primary btn--sm"
        >
          {submitting && (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {submitting ? 'Submitting' : 'Send my quote request'}
        </button>
        <button type="button" onClick={onBack} className="btn-back">
          ← Back
        </button>
      </div>
    </div>
  )
}

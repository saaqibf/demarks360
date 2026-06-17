'use client'
import { useState } from 'react'
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
  border: '1px solid var(--color-border-dark)', background: 'var(--color-surface)',
  fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-light)',
  outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-muted-light)',
  display: 'block', marginBottom: '0.4rem',
}

export function DetailsForm({ state, onChange, onNext, onBack }: DetailsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isOtherMode = !EVENT_TYPES.filter(t => t !== 'Other').includes(state.eventType) && state.eventType !== ''
  const dropdownValue = isOtherMode ? 'Other' : state.eventType

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!state.customerName.trim()) e.customerName = 'Name is required'
    if (!state.customerEmail.includes('@')) e.customerEmail = 'Valid email required'
    if (state.customerPhone.replace(/\D/g, '').length < 10) e.customerPhone = 'Valid phone required'
    if (!state.locationAddress.trim()) e.locationAddress = 'Address is required'
    if (!state.eventType.trim()) e.eventType = 'Event type is required'
    if (!state.agreedToTerms) e.agreedToTerms = 'You must agree to the Terms of Service'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (validate()) onNext()
  }

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'var(--color-amber)' }} />
        Step 4
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400, lineHeight: 0.95, color: 'var(--color-text-light)', marginBottom: '2.5rem' }}>
        Your details
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
          {errors.customerName && <p style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.customerName}</p>}
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
          {errors.customerEmail && <p style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.customerEmail}</p>}
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
          {errors.customerPhone && <p style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.customerPhone}</p>}
        </div>

        <div>
          <label style={labelStyle}>Event Address</label>
          <input
            style={inputStyle}
            value={state.locationAddress}
            onChange={e => onChange({ locationAddress: e.target.value })}
            placeholder="123 Main Street NW"
          />
          {errors.locationAddress && <p style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.locationAddress}</p>}
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
            value={dropdownValue}
            onChange={e => {
              if (e.target.value === 'Other') {
                onChange({ eventType: ' ' })
              } else {
                onChange({ eventType: e.target.value })
              }
            }}
          >
            <option value="">Select event type…</option>
            {EVENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {isOtherMode && (
            <input
              style={{ ...inputStyle, marginTop: '0.5rem' }}
              placeholder="Describe your event…"
              value={state.eventType.trim()}
              onChange={e => onChange({ eventType: e.target.value })}
              autoFocus
            />
          )}
          {errors.eventType && <p style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.eventType}</p>}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem' }}>
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
            I understand my 30% deposit is non-refundable.
          </label>
        </div>
        {errors.agreedToTerms && <p style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '-0.75rem' }}>{errors.agreedToTerms}</p>}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          onClick={handleSubmit}
          style={{
            background: 'var(--color-amber-light)', color: 'var(--color-charcoal)', border: 'none', borderRadius: '999px',
            padding: '0.85rem 2rem', fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Continue to Payment →
        </button>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid var(--color-amber)', borderRadius: '999px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-amber)', padding: '0.85rem 1.6rem', transition: 'border-color 0.2s' }}>
          ← Back
        </button>
      </div>
    </div>
  )
}

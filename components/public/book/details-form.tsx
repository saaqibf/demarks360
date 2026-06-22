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

const DESIGN_THEMES = [
  { tag: 'Birthday (Adult)', icon: '🥂', gradient: 'linear-gradient(135deg, #2a1a2e 0%, #8B1A4A 50%, #C9913F 100%)' },
  { tag: 'Birthday (Kids)', icon: '🎈', gradient: 'linear-gradient(135deg, #1a1050 0%, #D63E6B 50%, #F5C842 100%)' },
  { tag: 'Baby Shower', icon: '✨', gradient: 'linear-gradient(135deg, #1a2535 0%, #7CB3D8 50%, #F0C8D0 100%)' },
  { tag: 'Bachelorette', icon: '💋', gradient: 'linear-gradient(135deg, #1a0a1a 0%, #C2185B 50%, #F8BBD9 100%)' },
  { tag: 'Wedding', icon: '🕊️', gradient: 'linear-gradient(135deg, #1a1512 0%, #8B6F5E 50%, #F5EFE2 100%)' },
  { tag: 'Graduation', icon: '🎓', gradient: 'linear-gradient(135deg, #0a0e1a 0%, #1a3A6B 50%, #C9913F 100%)' },
  { tag: 'Corporate', icon: '◆', gradient: 'linear-gradient(135deg, #0a0f14 0%, #1E3A4C 50%, #4A9B8E 100%)' },
  { tag: 'Holiday / Christmas', icon: '❄️', gradient: 'linear-gradient(135deg, #0a1a0a 0%, #8B0000 50%, #C9913F 100%)' },
  { tag: 'Carnival / Tropical', icon: '🌺', gradient: 'linear-gradient(135deg, #0a1a1a 0%, #00796B 50%, #F57C00 100%)' },
  { tag: 'Casino Night', icon: '♠️', gradient: 'linear-gradient(135deg, #0a120a 0%, #1B5E20 50%, #C9913F 100%)' },
  { tag: 'Sports', icon: '🏆', gradient: 'linear-gradient(135deg, #0a0a1a 0%, #1A237E 50%, #B71C1C 100%)' },
  { tag: 'Custom / Other', icon: '✦', gradient: 'linear-gradient(135deg, #141009 0%, #3D2B1F 50%, #C9913F 100%)' },
] as const

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
          <label htmlFor="df-name" style={labelStyle}>Full Name</label>
          <input
            id="df-name"
            style={inputStyle}
            value={state.customerName}
            onChange={e => onChange({ customerName: e.target.value })}
            placeholder="Jane Smith"
            autoComplete="name"
          />
          {errors.customerName && <p role="alert" style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.customerName}</p>}
        </div>

        <div>
          <label htmlFor="df-email" style={labelStyle}>Email Address</label>
          <input
            id="df-email"
            type="email"
            style={inputStyle}
            value={state.customerEmail}
            onChange={e => onChange({ customerEmail: e.target.value })}
            placeholder="jane@example.com"
            autoComplete="email"
          />
          {errors.customerEmail && <p role="alert" style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.customerEmail}</p>}
        </div>

        <div>
          <label htmlFor="df-phone" style={labelStyle}>Phone Number</label>
          <input
            id="df-phone"
            type="tel"
            style={inputStyle}
            value={state.customerPhone}
            onChange={e => onChange({ customerPhone: e.target.value })}
            placeholder="(403) 555-0123"
            autoComplete="tel"
          />
          {errors.customerPhone && <p role="alert" style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.customerPhone}</p>}
        </div>

        <div>
          <label htmlFor="df-address" style={labelStyle}>Event Address</label>
          <input
            id="df-address"
            style={inputStyle}
            value={state.locationAddress}
            onChange={e => onChange({ locationAddress: e.target.value })}
            placeholder="123 Main Street NW"
            autoComplete="street-address"
          />
          {errors.locationAddress && <p role="alert" style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.locationAddress}</p>}
        </div>

        <div>
          <label htmlFor="df-city" style={labelStyle}>City</label>
          <select
            id="df-city"
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
          <label htmlFor="df-event-type" style={labelStyle}>Event Type</label>
          <select
            id="df-event-type"
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
          {errors.eventType && <p role="alert" style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.eventType}</p>}
        </div>

        <div>
          <label style={labelStyle}>Event Name <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span></label>
          <input
            style={inputStyle}
            value={state.eventName}
            onChange={e => onChange({ eventName: e.target.value })}
            placeholder="e.g. Bolu @ 80, Sarah's Graduation, NCMCC Sisters' Forum"
          />
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.35)', marginTop: '0.35rem' }}>
            Give your event a personal name so it shows on your confirmation and gallery.
          </p>
        </div>

        {/* ── Your 360 Experience ─────────────────────────────── */}
        <div style={{ borderTop: '1px solid var(--color-border-dark)', paddingTop: '2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'var(--color-amber)' }} />
              Your 360 Experience
            </p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 400, color: 'var(--color-text-light)', marginBottom: '0.5rem', lineHeight: 0.95 }}>
              Design your <em style={{ color: 'var(--color-amber-light)', fontStyle: 'italic' }}>moment</em>
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(245,240,234,0.38)', maxWidth: '46ch', lineHeight: 1.65 }}>
              All optional. The more you share, the better we can tailor the booth to your night.
            </p>
          </div>

          {/* Video Format */}
          <div>
            <label style={labelStyle}>Video Format</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {(['video', 'slomo'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange({ videoType: type, videoDuration: null, slomoBoomerang: false })}
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: '999px',
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
                ? 'Standard video. Recommended 15-20 seconds for the best crowd moment.'
                : 'Cinematic slow motion. Up to 12 seconds. Looks incredible on every screen.'}
            </p>
          </div>

          {/* Clip Duration */}
          <div>
            <label style={labelStyle}>
              Clip Duration <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(state.videoType === 'slomo' ? [4, 6, 8, 10, 12] : [5, 10, 15, 20]).map(s => {
                const isRec = state.videoType === 'video' && s === 20
                const selected = state.videoDuration === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ videoDuration: selected ? null : s, ...(selected && { slomoBoomerang: false }) })}
                    style={{
                      padding: '0.6rem 1.1rem', borderRadius: '6px',
                      border: `1.5px solid ${selected ? 'var(--color-amber-light)' : 'var(--color-border-dark)'}`,
                      background: selected ? 'rgba(201,145,63,0.1)' : 'transparent',
                      color: selected ? 'var(--color-amber-light)' : 'var(--color-muted-light)',
                      fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {s}s{isRec ? ' ★' : ''}
                  </button>
                )
              })}
            </div>
            {state.videoType === 'video' && (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.32)', marginTop: '0.4rem' }}>
                20s ★ is our recommended length.
              </p>
            )}
            {state.videoType === 'slomo' && state.videoDuration === 12 && (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'var(--color-amber)', marginTop: '0.4rem' }}>
                At 12s, your output may run slightly longer depending on frame rate.
              </p>
            )}
          </div>

          {/* Boomerang (slomo only) */}
          {state.videoType === 'slomo' && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-dark)', padding: '1.25rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.slomoBoomerang}
                  aria-label="Add Boomerang Loop"
                  onClick={() => onChange({ slomoBoomerang: !state.slomoBoomerang })}
                  style={{
                    width: '44px', height: '24px', borderRadius: '999px', border: 'none',
                    cursor: 'pointer', flexShrink: 0, position: 'relative', transition: 'background 0.2s',
                    background: state.slomoBoomerang ? 'var(--color-amber)' : 'rgba(255,255,255,0.12)',
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

          {/* Color Theme */}
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
              The palette we design your 360 overlay around.
            </p>
          </div>

          {/* Design Theme Cards */}
          <div>
            <label style={labelStyle}>
              Vibe / Theme <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional, pick any that fit)</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {DESIGN_THEMES.map(theme => {
                const selected = state.designThemeTags.includes(theme.tag)
                return (
                  <button
                    key={theme.tag}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? state.designThemeTags.filter(t => t !== theme.tag)
                        : [...state.designThemeTags, theme.tag]
                      onChange({ designThemeTags: next })
                    }}
                    style={{
                      padding: 0, borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                      border: `1.5px solid ${selected ? 'var(--color-amber-light)' : 'rgba(245,240,234,0.1)'}`,
                      background: 'transparent', overflow: 'hidden',
                      boxShadow: selected ? '0 0 0 1px var(--color-amber-light)' : 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                  >
                    {/* Visual preview */}
                    <div style={{
                      height: '80px', position: 'relative',
                      background: theme.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{theme.icon}</span>
                      {selected && (
                        <div style={{
                          position: 'absolute', top: '6px', right: '6px',
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: 'var(--color-amber-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="#141009" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Label */}
                    <div style={{
                      padding: '0.45rem 0.6rem',
                      background: 'rgba(20,16,9,0.7)',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: selected ? 'var(--color-amber-light)' : 'rgba(245,240,234,0.65)',
                        display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {theme.tag}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.32)', marginTop: '0.6rem' }}>
              Helps us pick the right design section from our overlay library.
            </p>
          </div>

          {/* Song Preference */}
          <div>
            <label style={labelStyle}>
              Song for the Booth <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span>
            </label>
            <input
              style={inputStyle}
              value={state.songPreference}
              onChange={e => onChange({ songPreference: e.target.value })}
              placeholder="Artist / Song title, or describe the vibe (e.g. afrobeats energy)"
              maxLength={200}
            />
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.32)', marginTop: '0.35rem' }}>
              We queue this up while the booth runs at your event.
            </p>
          </div>
        </div>
        {/* ── end Your 360 Experience ──────────────────────────── */}

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
        {errors.agreedToTerms && <p role="alert" style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '-0.75rem' }}>{errors.agreedToTerms}</p>}
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

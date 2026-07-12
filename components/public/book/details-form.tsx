'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { parseColorTheme } from '@/lib/overlay-palette'
import { SERVICE_CITIES } from '@/lib/validations/cities'
import { OverlayPreview } from './overlay-preview'

import type { BookingState } from '@/app/(public)/book/page'

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

// No outline override here: the global :focus-visible amber outline in globals.css
// must stay visible on every input in the money path (WCAG 2.4.7)
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.85rem 1rem',
  border: '1px solid var(--color-border-dark)', background: 'var(--color-surface)',
  fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-light)',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-muted-light)',
  display: 'block', marginBottom: '0.4rem',
}

const pillStyle = (selected: boolean): React.CSSProperties => ({
  padding: '0.75rem 1.5rem', borderRadius: '999px', minHeight: '44px',
  border: `1.5px solid ${selected ? 'var(--color-amber-light)' : 'var(--color-border-dark)'}`,
  background: selected ? 'rgba(201,145,63,0.12)' : 'transparent',
  color: selected ? 'var(--color-amber-light)' : 'var(--color-muted-light)',
  fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s',
})

export function DetailsForm({ state, onChange, onNext, onBack }: DetailsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Preview-only state, deliberately NOT in BookingState: an object URL cannot survive
  // the sessionStorage rehydration this wizard does, and the founder designs the real
  // overlay after booking, so nothing here belongs in the payload
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [pose, setPose] = useState<'standing' | 'sitting'>('standing')
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Roving-tabindex radio group: arrow keys must move both selection and focus
  const poseRefs = useRef<Record<'standing' | 'sitting', HTMLButtonElement | null>>({ standing: null, sitting: null })
  const palette = useMemo(() => parseColorTheme(state.backgroundColorTheme), [state.backgroundColorTheme])

  // Revoke via ref on unmount only: a cleanup keyed to photoUrl would revoke the URL
  // the preview is still showing
  const photoUrlRef = useRef<string | null>(null)
  useEffect(() => {
    photoUrlRef.current = photoUrl
  }, [photoUrl])
  useEffect(() => () => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current)
  }, [])

  const isOtherMode = state.isOtherEventType
  const dropdownValue = isOtherMode ? 'Other' : state.eventType

  // AI one-off preview generation; server-gated, so the button only exists when
  // the founder has configured generation credentials
  const AI_TRIES_KEY = 'dm-overlay-gen-left'
  const [aiAvailable, setAiAvailable] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiFrameUrl, setAiFrameUrl] = useState<string | null>(null)
  const [aiTriesLeft, setAiTriesLeft] = useState(3)
  const aiFrameUrlRef = useRef<string | null>(null)
  useEffect(() => {
    aiFrameUrlRef.current = aiFrameUrl
  }, [aiFrameUrl])
  useEffect(() => () => {
    if (aiFrameUrlRef.current) URL.revokeObjectURL(aiFrameUrlRef.current)
  }, [])

  useEffect(() => {
    const stored = Number(sessionStorage.getItem(AI_TRIES_KEY) ?? '3')
    setAiTriesLeft(Number.isFinite(stored) ? Math.max(0, Math.min(3, stored)) : 3)
    let cancelled = false
    fetch('/api/overlay-preview')
      .then(res => (res.ok ? res.json() : { available: false }))
      .then((data: { available?: boolean }) => {
        if (!cancelled) setAiAvailable(data.available === true)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Inputs changed: the generated art no longer reflects them, so return to the
  // honest library selection instead of showing a stale one-off
  const aiInputsKey = `${state.eventType}|${state.backgroundColorTheme}|${state.designNotes}`
  const aiInputsAtGeneration = useRef<string | null>(null)
  useEffect(() => {
    if (aiFrameUrlRef.current && aiInputsAtGeneration.current !== null && aiInputsAtGeneration.current !== aiInputsKey) {
      URL.revokeObjectURL(aiFrameUrlRef.current)
      setAiFrameUrl(null)
      aiInputsAtGeneration.current = null
    }
  }, [aiInputsKey])

  async function generateCustomFrame() {
    if (aiBusy || aiTriesLeft <= 0) return
    setAiBusy(true)
    setAiError(null)
    try {
      const res = await fetch('/api/overlay-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTypeKey: state.eventType,
          colorTheme: state.backgroundColorTheme,
          designNotes: state.designNotes,
        }),
      })
      if (res.status === 429) {
        const data = await res.json().catch(() => null)
        setAiTriesLeft(0)
        sessionStorage.setItem(AI_TRIES_KEY, '0')
        setAiError(data?.error ?? 'Preview limit reached for now.')
        return
      }
      if (!res.ok) {
        setAiError('Could not generate right now. The preview above still reflects your choices.')
        return
      }
      const blob = await res.blob()
      if (aiFrameUrlRef.current) URL.revokeObjectURL(aiFrameUrlRef.current)
      setAiFrameUrl(URL.createObjectURL(blob))
      aiInputsAtGeneration.current = aiInputsKey
      const left = aiTriesLeft - 1
      setAiTriesLeft(left)
      sessionStorage.setItem(AI_TRIES_KEY, String(left))
    } catch {
      setAiError('Could not generate right now. The preview above still reflects your choices.')
    } finally {
      setAiBusy(false)
    }
  }

  const generateButton = aiAvailable ? (
    <div style={{ marginTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      <button
        type="button"
        onClick={generateCustomFrame}
        disabled={aiBusy || aiTriesLeft <= 0}
        style={{
          ...pillStyle(true),
          minHeight: '44px',
          opacity: aiBusy || aiTriesLeft <= 0 ? 0.5 : 1,
          cursor: aiBusy || aiTriesLeft <= 0 ? 'default' : 'pointer',
        }}
      >
        {aiBusy ? 'Designing your overlay...' : aiTriesLeft >= 3 ? '✦ Generate my custom design' : aiTriesLeft > 0 ? `✦ Generate again (${aiTriesLeft} left)` : '✦ Our designer takes it from here'}
      </button>
      {aiBusy ? (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(245,240,234,0.45)', lineHeight: 1.5 }} aria-live="polite">
          Designing your one-of-a-kind overlay, about 20 seconds...
        </p>
      ) : null}
      {aiError ? (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(245,200,160,0.75)', lineHeight: 1.5 }} aria-live="polite">
          {aiError}
        </p>
      ) : null}
    </div>
  ) : null

  const previewProps = {
    eventName: state.eventName,
    eventType: state.eventType,
    eventDate: state.date,
    locationCity: state.locationCity,
    palette,
    designNotes: state.designNotes,
    photoUrl,
    pose,
    generatedFrameUrl: aiFrameUrl,
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!state.customerName.trim()) e.customerName = 'Name is required'
    if (!state.customerEmail.includes('@')) e.customerEmail = 'Valid email required'
    if (state.customerPhone.replace(/\D/g, '').length < 10) e.customerPhone = 'Valid phone required'
    if (!state.locationAddress.trim()) e.locationAddress = 'Address is required'
    if (!state.eventType.trim()) {
      e.eventType = isOtherMode ? 'Please describe your event' : 'Event type is required'
    } else if (state.eventType.trim().length < 2) {
      e.eventType = 'Please describe your event in a few more characters'
    }
    if (!state.eventName.trim()) e.eventName = 'Event name is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (validate()) onNext()
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Reset so re-picking the same file still fires a change event
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(URL.createObjectURL(file))
  }

  function handlePhotoRemove() {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(null)
  }

  return (
    <div>
      <style>{`
        .ovp-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 2.5rem; align-items: start; }
        .ovp-desktop { position: sticky; top: 150px; }
        .ovp-mobile { display: none; }
        @media (max-width: 900px) {
          .ovp-grid { grid-template-columns: 1fr; }
          .ovp-desktop { display: none; }
          .ovp-mobile { display: block; max-width: 280px; margin: 0 auto 0.5rem; }
        }
      `}</style>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'var(--color-amber)' }} />
        Step 4
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400, lineHeight: 0.95, color: 'var(--color-text-light)', marginBottom: '2.5rem' }}>
        Your details
      </h2>

      <div className="ovp-grid">
        <div>
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
                    onChange({ eventType: '', isOtherEventType: true })
                  } else {
                    onChange({ eventType: e.target.value, isOtherEventType: false })
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
                  value={state.eventType}
                  onChange={e => onChange({ eventType: e.target.value })}
                  maxLength={100}
                  aria-label="Describe your event"
                  autoFocus
                />
              )}
              {errors.eventType && <p role="alert" style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.eventType}</p>}
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
                  Watch your custom overlay build itself in the live preview as you fill these in.
                </p>
              </div>

              <div className="ovp-mobile">
                <OverlayPreview {...previewProps} />
                {generateButton}
              </div>

              {/* Event Name */}
              <div>
                <label htmlFor="df-event-name" style={labelStyle}>Event Name</label>
                <input
                  id="df-event-name"
                  style={inputStyle}
                  value={state.eventName}
                  onChange={e => onChange({ eventName: e.target.value })}
                  placeholder="e.g. Bolu @ 80, Sarah's Graduation, NCMCC Sisters' Forum"
                />
                {errors.eventName && <p role="alert" style={{ color: 'var(--color-amber-light)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{errors.eventName}</p>}
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.35)', marginTop: '0.35rem' }}>
                  This becomes the headline of your overlay. Watch it appear in the preview.
                </p>
              </div>

              {/* Color Theme */}
              <div>
                <label htmlFor="df-color-theme" style={labelStyle}>
                  Color Theme <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span>
                </label>
                <input
                  id="df-color-theme"
                  style={inputStyle}
                  value={state.backgroundColorTheme}
                  onChange={e => onChange({ backgroundColorTheme: e.target.value })}
                  placeholder="e.g. Gold and Black, Hot Pink, Navy and Silver, Rose Gold"
                  maxLength={200}
                />
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.32)', marginTop: '0.35rem' }}>
                  Type your colors and watch the preview restyle itself.
                </p>
              </div>

              {/* Describe Your Vision */}
              <div>
                <label htmlFor="df-design-notes" style={labelStyle}>
                  Describe Your Vision <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span>
                </label>
                <textarea
                  id="df-design-notes"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }}
                  value={state.designNotes}
                  onChange={e => onChange({ designNotes: e.target.value })}
                  placeholder="e.g. Elegant and classy, mostly gold, she loves roses, nothing childish"
                  maxLength={500}
                />
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.32)', marginTop: '0.35rem' }}>
                  Goes straight to our designer with your booking, and tunes the live preview as you type.
                </p>
              </div>

              {/* Celebrant Photo */}
              <div>
                <span style={labelStyle}>
                  Celebrant Photo <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span>
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                  tabIndex={-1}
                />
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={pillStyle(false)}
                  >
                    Add a photo of who you&apos;re celebrating
                  </button>
                  {photoUrl && (
                    <>
                      <img
                        src={photoUrl}
                        alt="Selected celebrant photo"
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--color-amber-light)' }}
                      />
                      <button
                        type="button"
                        onClick={handlePhotoRemove}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted-light)', textDecoration: 'underline' }}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.32)', marginTop: '0.45rem' }}>
                  Your photo appears in both bottom corners of the overlay, mirrored like our real frames. Preview only. It stays on your device and is never uploaded.
                </p>
              </div>

              {/* Pose in Preview */}
              <div>
                <span id="df-pose-label" style={labelStyle}>Pose in Preview</span>
                <div role="radiogroup" aria-labelledby="df-pose-label" style={{ display: 'flex', gap: '0.75rem' }}>
                  {(['standing', 'sitting'] as const).map(p => (
                    <button
                      key={p}
                      ref={el => { poseRefs.current[p] = el }}
                      type="button"
                      role="radio"
                      aria-checked={pose === p}
                      tabIndex={pose === p ? 0 : -1}
                      onClick={() => setPose(p)}
                      onKeyDown={e => {
                        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
                        e.preventDefault()
                        const next = p === 'standing' ? 'sitting' : 'standing'
                        setPose(next)
                        poseRefs.current[next]?.focus()
                      }}
                      style={pillStyle(pose === p)}
                    >
                      {p === 'standing' ? 'Standing' : 'Sitting'}
                    </button>
                  ))}
                </div>
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
                      style={pillStyle(state.videoType === type)}
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

              {/* Song Preference */}
              <div>
                <label htmlFor="df-song" style={labelStyle}>
                  Song for the Booth <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span>
                </label>
                <input
                  id="df-song"
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
          </div>

          <div className="dm-step-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={handleSubmit} className="btn-primary btn--sm">
              Review My Request →
            </button>
            <button onClick={onBack} className="btn-back">
              ← Back
            </button>
          </div>
        </div>

        <aside className="ovp-desktop" aria-label="Live overlay preview">
          <OverlayPreview {...previewProps} />
          {generateButton}
        </aside>
      </div>
    </div>
  )
}

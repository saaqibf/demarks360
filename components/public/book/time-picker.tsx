'use client'
import { useState, useEffect } from 'react'
import { PRICING } from '@/lib/pricing'

interface TimePickerProps {
  date: string
  startTime: string | null
  endTime: string | null
  onSelect: (start: string, end: string) => void
  onBack: () => void
}

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
const MIN_DURATION_MINUTES = 90
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
  // Fail closed: on fetch failure no slot is selectable; the user gets a retry state instead
  const [loadError, setLoadError] = useState(false)
  const [retryNonce, setRetryNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    fetch(`/api/availability?date=${date}`)
      .then(r => {
        if (!r.ok) throw new Error(`availability ${r.status}`)
        return r.json()
      })
      .then((data: AvailabilityData) => {
        if (cancelled) return
        setAvailability(data)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setAvailability(null)
        setLoadError(true)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [date, retryNonce])

  function isSlotBlocked(slot: string, avail: AvailabilityData): boolean {
    const slotMin = timeToMinutes(slot)
    for (const b of avail.bookedSlots) {
      const bStart = timeToMinutes(b.startTime)
      const bEnd = timeToMinutes(b.endTime)
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
      <div style={{ padding: '4rem 0', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'rgba(245,240,234,0.4)' }}>
        Loading availability…
      </div>
    )
  }

  if (loadError || !availability) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p role="alert" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--color-amber-light)', marginBottom: '0.6rem' }}>
          We could not load availability for this date.
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'rgba(245,240,234,0.4)', marginBottom: '1.5rem' }}>
          Time slots stay locked until availability loads, so booked times never show as free.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={() => setRetryNonce(n => n + 1)}
            style={{ background: 'var(--color-amber-light)', color: 'var(--color-charcoal)', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '999px', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Retry
          </button>
          <button
            onClick={onBack}
            style={{ background: 'none', border: '1px solid rgba(201,145,63,0.4)', borderRadius: '999px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-amber)', padding: '0.75rem 1.6rem', transition: 'border-color 0.2s' }}
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  const slotsWithStatus = ALL_SLOTS.map(slot => ({
    slot,
    blocked: isSlotBlocked(slot, availability),
  }))

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'var(--color-amber)' }} />
        Step 2
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400, lineHeight: 0.95, color: 'var(--color-text-light)', marginBottom: '0.75rem' }}>
        {phase === 'start' ? 'Pick a start time' : 'Pick an end time'}
      </h2>
      <p style={{ fontSize: '0.82rem', color: 'rgba(245,240,234,0.4)', fontWeight: 300, marginBottom: '2.5rem' }}>
        {phase === 'start'
          ? `${date} · Select when your event starts`
          : `Started at ${selectedStart ? formatTime(selectedStart) : ''} · Minimum 1.5 hours`}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '560px' }}>
        {slotsWithStatus.map(({ slot, blocked }) => {
          const isSelectedEnd = phase === 'end' && slot === selectedEnd
          const isSelectedStart = slot === selectedStart
          // In 'start' phase: highlight the chosen slot; in 'end' phase: highlight both start (dimmer) and end (full amber)
          const isActivePrimary = phase === 'start' ? isSelectedStart : isSelectedEnd
          const isActiveStart = phase === 'end' && isSelectedStart && !isSelectedEnd
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
                borderColor: isActivePrimary ? 'var(--color-amber-light)' : isActiveStart ? 'var(--color-amber)' : blocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                background: isActivePrimary ? 'var(--color-amber-light)' : isActiveStart ? 'rgba(201,145,63,0.18)' : blocked ? 'rgba(255,255,255,0.02)' : 'var(--color-surface)',
                color: isActivePrimary ? 'var(--color-charcoal)' : isActiveStart ? 'var(--color-amber-light)' : blocked ? 'rgba(245,240,234,0.15)' : 'var(--color-text-light)',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: isActivePrimary || isActiveStart ? 700 : 600,
                transition: 'all 0.15s',
              }}
            >
              {formatTime(slot)}
            </button>
          )
        })}
      </div>

      {phase === 'end' && selectedStart && selectedEnd && (
        <div style={{ marginTop: '2rem', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.07)', background: 'var(--color-surface)', maxWidth: '560px' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
            <strong>{formatTime(selectedStart)}</strong> → <strong>{formatTime(selectedEnd)}</strong>
            {' · '}
            {Math.round((timeToMinutes(selectedEnd) - timeToMinutes(selectedStart)) / 60 * 10) / 10} hrs
            {' · '}
            ${Math.ceil((timeToMinutes(selectedEnd) - timeToMinutes(selectedStart)) / 60 * PRICING.HOURLY_RATE).toFixed(0)} estimate
          </p>
          <button
            onClick={() => onSelect(selectedStart, selectedEnd)}
            style={{
              marginTop: '1rem', background: 'var(--color-amber-light)',
              color: 'var(--color-charcoal)', border: 'none', padding: '0.85rem 2rem',
              borderRadius: '999px', fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Continue →
          </button>
        </div>
      )}

      <button
        onClick={() => { if (phase === 'end') { setPhase('start'); setSelectedEnd(null) } else { onBack() } }}
        style={{ marginTop: '1.5rem', display: 'inline-block', background: 'none', border: '1px solid rgba(201,145,63,0.4)', borderRadius: '999px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-amber)', padding: '0.75rem 1.6rem', transition: 'border-color 0.2s' }}
      >
        ← Back
      </button>
    </div>
  )
}

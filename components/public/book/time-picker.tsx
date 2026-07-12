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
const TRAVEL_BUFFER_MINUTES = 90
// Plain-language durations: picking "how long" is far easier than scanning a
// second grid of clock times for a valid end slot
const DURATION_OPTIONS = [
  { minutes: 90, label: '1.5 hours' },
  { minutes: 120, label: '2 hours', popular: true },
  { minutes: 180, label: '3 hours' },
  { minutes: 240, label: '4 hours' },
  { minutes: 300, label: '5 hours' },
]

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatFriendlyDate(iso: string): string {
  const [y, mo, d] = iso.split('-').map(Number)
  const dt = new Date(y, mo - 1, d)
  return dt.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })
}

interface AvailabilityData {
  bookedSlots: { startTime: string; endTime: string }[]
  adminBlocks: { startTime: string | null; endTime: string | null }[]
  isDateFull: boolean
}

export function TimePicker({ date, startTime, endTime, onSelect, onBack }: TimePickerProps) {
  const [phase, setPhase] = useState<'start' | 'duration'>('start')
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

  // A booking must fit inside the day and never cross a booked or blocked stretch,
  // so every half-hour inside the span is checked, not just the endpoints
  function isSpanFree(startMin: number, durationMin: number, avail: AvailabilityData): boolean {
    const endMin = startMin + durationMin
    if (endMin > 24 * 60) return false
    for (let m = startMin; m < endMin; m += 30) {
      if (isSlotBlocked(minutesToTime(m), avail)) return false
    }
    return true
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
        {phase === 'start' ? 'What time does your event start?' : 'How long do you want the booth?'}
      </h2>
      <p style={{ fontSize: '0.82rem', color: 'rgba(245,240,234,0.4)', fontWeight: 300, marginBottom: '2.5rem' }}>
        {phase === 'start'
          ? `${formatFriendlyDate(date)} · Tap the time guests start arriving`
          : `${formatFriendlyDate(date)} · Starting at ${selectedStart ? formatTime(selectedStart) : ''}`}
      </p>

      {phase === 'start' && (
        <div className="dm-time-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '560px' }}>
          {slotsWithStatus.map(({ slot, blocked }) => {
            const isSelectedStart = slot === selectedStart
            return (
              <button
                key={slot}
                disabled={blocked}
                onClick={() => {
                  setSelectedStart(slot)
                  setSelectedEnd(null)
                  setPhase('duration')
                }}
                style={{
                  padding: '0.75rem 0.5rem', border: '1px solid',
                  borderColor: isSelectedStart ? 'var(--color-amber-light)' : blocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                  background: isSelectedStart ? 'var(--color-amber-light)' : blocked ? 'rgba(255,255,255,0.02)' : 'var(--color-surface)',
                  color: isSelectedStart ? 'var(--color-charcoal)' : blocked ? 'rgba(245,240,234,0.15)' : 'var(--color-text-light)',
                  cursor: blocked ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: isSelectedStart ? 700 : 600,
                  transition: 'all 0.15s',
                }}
              >
                {formatTime(slot)}
              </button>
            )
          })}
        </div>
      )}

      {phase === 'duration' && selectedStart && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '560px' }}>
          <button
            onClick={() => { setPhase('start'); setSelectedEnd(null) }}
            style={{ alignSelf: 'flex-start', marginBottom: '0.5rem', background: 'rgba(201,145,63,0.14)', border: '1px solid var(--color-amber)', borderRadius: '999px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-amber-light)', padding: '0.55rem 1.1rem' }}
          >
            Starts at {formatTime(selectedStart)} · Change
          </button>
          {DURATION_OPTIONS.map(({ minutes, label, popular }) => {
            const startMin = timeToMinutes(selectedStart)
            const endTimeStr = minutesToTime(Math.min(startMin + minutes, 24 * 60 - 1))
            const fits = isSpanFree(startMin, minutes, availability)
            const isSelected = selectedEnd !== null && timeToMinutes(selectedEnd) - startMin === minutes
            const price = Math.ceil((minutes / 60) * PRICING.HOURLY_RATE)
            return (
              <button
                key={minutes}
                disabled={!fits}
                onClick={() => setSelectedEnd(minutesToTime(startMin + minutes))}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                  padding: '1rem 1.25rem', border: '1px solid', textAlign: 'left',
                  borderColor: isSelected ? 'var(--color-amber-light)' : fits ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  background: isSelected ? 'rgba(232,178,92,0.14)' : fits ? 'var(--color-surface)' : 'rgba(255,255,255,0.02)',
                  color: fits ? 'var(--color-text-light)' : 'rgba(245,240,234,0.2)',
                  cursor: fits ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
                }}
              >
                <span style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', fontWeight: 700, color: isSelected ? 'var(--color-amber-light)' : undefined }}>
                    {label}{popular && fits ? '  ★ Most popular' : ''}
                  </span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: fits ? 'rgba(245,240,234,0.45)' : 'rgba(245,240,234,0.15)' }}>
                    {fits ? `${formatTime(selectedStart)} to ${formatTime(endTimeStr)}` : 'Not available this day'}
                  </span>
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}>${price}</span>
              </button>
            )
          })}
        </div>
      )}

      {phase === 'duration' && selectedStart && selectedEnd && (
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
        onClick={() => { if (phase === 'duration') { setPhase('start'); setSelectedEnd(null) } else { onBack() } }}
        style={{ marginTop: '1.5rem', display: 'inline-block', background: 'none', border: '1px solid rgba(201,145,63,0.4)', borderRadius: '999px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-amber)', padding: '0.75rem 1.6rem', transition: 'border-color 0.2s' }}
      >
        ← Back
      </button>
    </div>
  )
}

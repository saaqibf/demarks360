'use client'
import { useState, useEffect } from 'react'
import { PRICING } from '@/lib/pricing'

interface DatePickerProps {
  selectedDate: string | null
  onSelect: (date: string) => void
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minDate = new Date(today)
  minDate.setDate(minDate.getDate() + PRICING.LEAD_TIME_DAYS)

  const [viewYear, setViewYear] = useState(() => minDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => minDate.getMonth())
  const [fullDates, setFullDates] = useState<Set<string>>(new Set())
  // Fail closed: dates are only selectable once availability for the month has loaded
  const [availStatus, setAvailStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retryNonce, setRetryNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    const month = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
    setAvailStatus('loading')
    fetch(`/api/availability?month=${month}`)
      .then((r) => {
        if (!r.ok) throw new Error(`availability ${r.status}`)
        return r.json()
      })
      .then((data: { unavailableDates?: string[] }) => {
        if (cancelled) return
        setFullDates(new Set(data.unavailableDates ?? []))
        setAvailStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setFullDates(new Set())
        setAvailStatus('error')
      })
    return () => { cancelled = true }
  }, [viewYear, viewMonth, retryNonce])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function isDisabled(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return availStatus !== 'ready' || d < minDate || fullDates.has(dateStr)
  }

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'var(--color-amber)' }} />
        Step 1
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400, lineHeight: 0.95, color: 'var(--color-text-light)', marginBottom: '2.5rem' }}>
        Pick a date
      </h2>

      <div style={{ maxWidth: '480px', border: '1px solid rgba(255,255,255,0.07)', background: 'var(--color-surface)' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={prevMonth} className="btn-icon" aria-label="Previous month">
            ←
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-text-light)' }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} className="btn-icon" aria-label="Next month">
            →
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ padding: '0.6rem 0', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Availability status: while loading or after a failure, every date stays locked */}
        {availStatus === 'loading' && (
          <div role="status" style={{ padding: '0.6rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,240,234,0.4)' }}>
            Loading availability…
          </div>
        )}
        {availStatus === 'error' && (
          <div role="alert" style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'var(--color-amber-light)' }}>
              We could not load availability. Dates are locked until it loads.
            </span>
            <button onClick={() => setRetryNonce(n => n + 1)} className="btn-back">
              Retry
            </button>
          </div>
        )}

        {/* Day grid */}
        <div className="dm-cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', padding: '0.75rem' }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = toDateStr(viewYear, viewMonth, day)
            const disabled = isDisabled(dateStr)
            const selected = selectedDate === dateStr
            const isFull = fullDates.has(dateStr)
            const isToday = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
            return (
              <button
                key={day}
                onClick={() => !disabled && onSelect(dateStr)}
                disabled={disabled}
                style={{
                  border: isToday && !selected ? '1px solid rgba(201,145,63,0.4)' : 'none',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  padding: '0.6rem 0', margin: '2px', borderRadius: '2px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: selected ? 600 : 400,
                  background: selected ? 'var(--color-amber)' : 'transparent',
                  color: selected ? 'var(--color-charcoal)' : disabled ? 'rgba(243,234,217,0.25)' : isFull ? 'var(--color-amber)' : 'var(--color-text-light)',
                  transition: 'background 0.15s',
                }}
                title={isFull ? 'Fully booked' : undefined}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ padding: '0.75rem 1.5rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: 'rgba(245,240,234,0.35)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-amber)' }} />
            Fully booked
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: 'rgba(245,240,234,0.35)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
            Unavailable (5-day lead time)
          </div>
        </div>
      </div>
    </div>
  )
}

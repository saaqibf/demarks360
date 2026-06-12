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

  useEffect(() => {
    const month = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
    fetch(`/api/availability?month=${month}`)
      .then((r) => (r.ok ? r.json() : Promise.resolve({ unavailableDates: [] })))
      .then((data: { unavailableDates?: string[] }) => {
        setFullDates(new Set(data.unavailableDates ?? []))
      })
      .catch(() => {})
  }, [viewYear, viewMonth])

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
    return d < minDate || fullDates.has(dateStr)
  }

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-crimson)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'var(--color-crimson)' }} />
        Step 1
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: 'var(--color-text)', marginBottom: '2.5rem' }}>
        Pick a Date
      </h2>

      <div style={{ maxWidth: '480px', border: '1px solid rgba(255,255,255,0.07)', background: 'var(--color-surface)' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={prevMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '1rem', color: 'rgba(245,240,234,0.55)', padding: '0.25rem 0.5rem' }}
          >
            ←
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.04em', color: 'var(--color-text)' }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '1rem', color: 'rgba(245,240,234,0.55)', padding: '0.25rem 0.5rem' }}
          >
            →
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ padding: '0.6rem 0', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0.75rem' }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = toDateStr(viewYear, viewMonth, day)
            const disabled = isDisabled(dateStr)
            const selected = selectedDate === dateStr
            const isFull = fullDates.has(dateStr)
            return (
              <button
                key={day}
                onClick={() => !disabled && onSelect(dateStr)}
                disabled={disabled}
                style={{
                  border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                  padding: '0.6rem 0', margin: '2px', borderRadius: '2px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: selected ? 700 : 400,
                  background: selected ? 'var(--color-crimson)' : 'transparent',
                  color: selected ? '#fff' : disabled ? 'rgba(15,15,15,0.2)' : isFull ? 'var(--color-crimson)' : 'var(--color-text)',
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
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-crimson)' }} />
            Fully booked
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: 'rgba(245,240,234,0.35)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
            Unavailable (7-day lead time)
          </div>
        </div>
      </div>
    </div>
  )
}

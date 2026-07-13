'use client'
import { useMemo, useState } from 'react'
import { statusLabel } from '@/lib/admin-status'

interface Block {
  id: string
  blockedDate: string
  startTime: string | null
  endTime: string | null
  reason: string | null
}

export interface CalendarBooking {
  id: string
  date: string
  start: string
  end: string
  name: string
  eventType: string
  status: string
}

interface Props {
  initialBlocks: Block[]
  bookings: CalendarBooking[]
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function fmtTime(t: string | null): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function fmtRange(start: string | null, end: string | null): string {
  if (!start) return ''
  return end ? `${fmtTime(start)} – ${fmtTime(end)}` : fmtTime(start)
}

function fmtDay(key: string): string {
  return new Date(key + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase',
  color: 'var(--adm-muted)', display: 'block', marginBottom: '0.35rem',
}

export function AvailabilityManager({ initialBlocks, bookings }: Props) {
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [selected, setSelected] = useState<string | null>(null)
  const [form, setForm] = useState({ date: '', startTime: '', endTime: '', reason: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>()
    for (const b of bookings) {
      const arr = map.get(b.date) ?? []
      arr.push(b)
      map.set(b.date, arr)
    }
    return map
  }, [bookings])

  const blocksByDate = useMemo(() => {
    const map = new Map<string, Block[]>()
    for (const b of blocks) {
      const arr = map.get(b.blockedDate) ?? []
      arr.push(b)
      map.set(b.blockedDate, arr)
    }
    return map
  }, [blocks])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
    setSelected(null)
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
    setSelected(null)
  }

  async function addBlock() {
    if (!form.date) { setError('Pick a date to block'); return }
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          startTime: form.startTime || undefined,
          endTime: form.endTime || undefined,
          reason: form.reason || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Failed to block date')
      setBlocks(prev => [...prev, data].sort((a, b) => a.blockedDate.localeCompare(b.blockedDate)))
      setForm({ date: '', startTime: '', endTime: '', reason: '' })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function removeBlock(id: string) {
    setError(null)
    const previous = blocks
    setBlocks(prev => prev.filter(b => b.id !== id))
    const res = await fetch(`/api/admin/availability/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setBlocks(previous)
      setError(data.error ?? 'Failed to remove block')
    }
  }

  const selBookings = selected ? bookingsByDate.get(selected) ?? [] : []
  const selBlocks = selected ? blocksByDate.get(selected) ?? [] : []

  // Combined, date-sorted feed for the list at the bottom
  const feed = useMemo(() => {
    const items: { key: string; id: string; date: string; kind: 'booking' | 'block'; sort: string }[] = []
    for (const b of bookings) items.push({ key: `bk-${b.id}`, id: b.id, date: b.date, kind: 'booking', sort: b.date + (b.start ?? '') })
    for (const b of blocks) items.push({ key: `bl-${b.id}`, id: b.id, date: b.blockedDate, kind: 'block', sort: b.blockedDate + (b.startTime ?? '') })
    return items.sort((a, b) => a.sort.localeCompare(b.sort))
  }, [bookings, blocks])

  const bookingById = useMemo(() => new Map(bookings.map(b => [b.id, b])), [bookings])
  const blockById = useMemo(() => new Map(blocks.map(b => [b.id, b])), [blocks])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="admin-2col" style={{ alignItems: 'flex-start' }}>
        {/* Calendar */}
        <div className="adm-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <button onClick={prev} className="btn-icon" aria-label="Previous month">‹</button>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 400, color: 'var(--adm-text)' }}>
              {MONTH_NAMES[month]} {year}
            </p>
            <button onClick={next} className="btn-icon" aria-label="Next month">›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--adm-muted)', padding: '0.3rem 0' }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const key = toKey(year, month, day)
              const hasBooking = bookingsByDate.has(key)
              const hasBlock = blocksByDate.has(key)
              const isSelected = selected === key

              let bg = 'transparent'
              let color = 'var(--adm-text)'
              let border = '1px solid transparent'
              if (hasBooking) { bg = 'rgba(52,168,83,0.12)'; color = 'var(--adm-success)' }
              else if (hasBlock) { bg = 'rgba(201,145,63,0.14)'; color = 'var(--adm-accent)' }
              if (isSelected) {
                border = hasBooking ? '1px solid rgba(52,168,83,0.6)'
                  : hasBlock ? '1px solid rgba(201,145,63,0.6)'
                  : '1px solid var(--adm-border-2)'
              }

              return (
                <button
                  key={key}
                  onClick={() => setSelected(isSelected ? null : key)}
                  aria-label={fmtDay(key)}
                  style={{
                    position: 'relative', background: bg, border, borderRadius: '4px', color,
                    fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: hasBooking || hasBlock ? 700 : 500,
                    padding: '0.55rem 0', minHeight: '44px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.12s',
                  }}
                >
                  {day}
                  {hasBooking && hasBlock && (
                    <span style={{ position: 'absolute', top: '3px', right: '4px', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--adm-accent-2)' }} />
                  )}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--adm-border)' }}>
            {[
              { color: 'var(--adm-success)', label: 'Booked' },
              { color: 'var(--adm-accent-2)', label: 'Blocked' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, opacity: 0.85 }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--adm-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Selected day detail */}
          <div className="adm-card" style={{ minHeight: '150px' }}>
            {selected && (selBookings.length > 0 || selBlocks.length > 0) ? (
              <>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--adm-text)', marginBottom: '0.9rem', lineHeight: 1.2 }}>
                  {fmtDay(selected)}
                </p>
                {selBookings.map(b => (
                  <div key={b.id} style={{ marginBottom: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span className={`adm-pill adm-pill--${b.status}`}>{statusLabel(b.status)}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--adm-success)' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--adm-success)' }} />
                        {fmtRange(b.start, b.end)}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--adm-text)' }}>
                      {b.name}<span style={{ color: 'var(--adm-muted)' }}> · {b.eventType}</span>
                    </p>
                    <a href={`/admin/bookings/${b.id}`} className="adm-link" style={{ marginTop: '0.4rem' }}>Open booking →</a>
                  </div>
                ))}
                {selBlocks.map(bl => (
                  <div key={bl.id} style={{ marginTop: selBookings.length ? '0.75rem' : 0, paddingTop: selBookings.length ? '0.75rem' : 0, borderTop: selBookings.length ? '1px solid var(--adm-border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className="adm-pill adm-pill--completed">Blocked</span>
                      {bl.startTime && (
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--adm-accent)' }}>
                          {fmtRange(bl.startTime, bl.endTime)}
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--adm-text-2)', marginBottom: '0.6rem' }}>
                      {bl.reason ?? 'Unavailable'}
                    </p>
                    <button onClick={() => removeBlock(bl.id)} className="btn-danger btn--sm">Remove block</button>
                  </div>
                ))}
              </>
            ) : selected ? (
              <>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--adm-text)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                  {fmtDay(selected)}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--adm-muted)' }}>
                  Open. No booking or block on this day.
                </p>
              </>
            ) : (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--adm-muted)', lineHeight: 1.6 }}>
                Tap a date to see the booking or block on it.
              </p>
            )}
          </div>

          {/* Block a date */}
          <div className="adm-card">
            <p className="adm-card-label">Block a date</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Date</label>
                <input type="date" min={todayStr} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="adm-input" />
              </div>
              <div>
                <label style={labelStyle}>Start (optional)</label>
                <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="adm-input" />
              </div>
              <div>
                <label style={labelStyle}>End (optional)</label>
                <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="adm-input" />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Reason (optional)</label>
              <input type="text" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Personal day off" className="adm-input" />
            </div>
            {error && <p style={{ color: 'var(--adm-danger)', fontSize: '0.8rem', fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>{error}</p>}
            <button onClick={addBlock} disabled={saving} className="btn-primary btn--sm">
              {saving ? 'Adding…' : 'Block date'}
            </button>
          </div>
        </div>
      </div>

      {/* Combined feed */}
      <div className="adm-card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--adm-border)' }}>
          <p className="adm-card-label" style={{ margin: 0 }}>All bookings &amp; blocks</p>
        </div>
        {feed.length === 0 ? (
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--adm-muted)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
            Nothing booked or blocked yet.
          </div>
        ) : (
          feed.map(item => {
            if (item.kind === 'booking') {
              const b = bookingById.get(item.id)!
              return (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1.5rem', borderBottom: '1px solid var(--adm-border)', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flexWrap: 'wrap' }}>
                    <span className={`adm-pill adm-pill--${b.status}`}>{statusLabel(b.status)}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--adm-muted)', minWidth: '96px' }}>{item.date}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--adm-success)', minWidth: '120px', whiteSpace: 'nowrap' }}>{fmtRange(b.start, b.end)}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--adm-text)' }}>{b.name}<span style={{ color: 'var(--adm-muted)' }}> · {b.eventType}</span></span>
                  </div>
                  <a href={`/admin/bookings/${b.id}`} className="adm-link" style={{ flexShrink: 0 }}>Open →</a>
                </div>
              )
            }
            const bl = blockById.get(item.id)!
            return (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1.5rem', borderBottom: '1px solid var(--adm-border)', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flexWrap: 'wrap' }}>
                  <span className="adm-pill adm-pill--completed">Blocked</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--adm-muted)', minWidth: '96px' }}>{item.date}</span>
                  {bl.startTime && <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--adm-accent)', minWidth: '120px', whiteSpace: 'nowrap' }}>{fmtRange(bl.startTime, bl.endTime)}</span>}
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--adm-text-2)' }}>{bl.reason ?? 'Unavailable'}</span>
                </div>
                <button onClick={() => removeBlock(bl.id)} className="btn-danger btn--sm" style={{ flexShrink: 0 }}>Remove</button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

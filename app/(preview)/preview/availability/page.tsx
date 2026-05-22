'use client'

import { useState } from 'react'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MOCK_BLOCKS: Record<string, { reason: string; type: 'booked' | 'admin' }> = {
  '2026-06-14': { reason: 'Aisha Mohammed — Birthday Party', type: 'booked' },
  '2026-06-21': { reason: 'Jordan & Kezia Tran — Wedding Reception', type: 'booked' },
  '2026-06-27': { reason: 'Personal day off', type: 'admin' },
  '2026-07-03': { reason: 'Priya Sharma — Corporate Event', type: 'booked' },
  '2026-07-04': { reason: 'Canada Day long weekend', type: 'admin' },
  '2026-07-12': { reason: 'Marcus Okonkwo — Graduation Party', type: 'booked' },
  '2026-07-19': { reason: 'Fatima Al-Hassan — Family Gathering', type: 'booked' },
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-sand)',
  border: '1px solid var(--color-border-light)',
  color: 'var(--color-charcoal)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  padding: '0.65rem 0.75rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase',
  color: 'var(--color-muted)', display: 'block', marginBottom: '0.35rem',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700,
  letterSpacing: '0.16em', textTransform: 'uppercase',
  color: 'var(--color-muted)', marginBottom: '1rem',
}

function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function PreviewAvailability() {
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(5)
  const [blocks, setBlocks] = useState(MOCK_BLOCKS)
  const [selected, setSelected] = useState<string | null>(null)
  const [formDate, setFormDate] = useState('')
  const [formReason, setFormReason] = useState('')
  const [saved, setSaved] = useState(false)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelected(null)
  }

  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  function handleAddBlock() {
    if (!formDate || !formReason) return
    setBlocks(b => ({ ...b, [formDate]: { reason: formReason, type: 'admin' } }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setFormDate('')
    setFormReason('')
  }

  function handleRemoveBlock(key: string) {
    setBlocks(b => { const next = { ...b }; delete next[key]; return next })
    if (selected === key) setSelected(null)
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const selectedBlock = selected ? blocks[selected] : null

  return (
    <div style={{ padding: '2.5rem', maxWidth: '960px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-crimson)', marginBottom: '0.5rem' }}>
          Admin
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 400, letterSpacing: '-0.01em', color: 'var(--color-charcoal)', lineHeight: 1 }}>
          Availability
        </h1>
      </div>

      <div className="admin-2col" style={{ alignItems: 'flex-start' }}>
        {/* Calendar */}
        <div style={{ background: 'var(--color-sand-2)', padding: '1.5rem', border: '1px solid var(--color-border-light)' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <button onClick={prev} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '1rem', padding: '0.25rem 0.5rem' }}>‹</button>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 400, letterSpacing: '0.02em', color: 'var(--color-charcoal)' }}>
              {MONTH_NAMES[month]} {year}
            </p>
            <button onClick={next} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '1rem', padding: '0.25rem 0.5rem' }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted-light)', padding: '0.3rem 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const key = toKey(year, month, day)
              const block = blocks[key]
              const isSelected = selected === key

              let bg = 'transparent'
              let color = 'var(--color-charcoal)'
              let border = '1px solid transparent'

              if (block?.type === 'booked') { bg = 'rgba(52,168,83,0.1)'; color = '#2d8a50' }
              if (block?.type === 'admin')  { bg = 'rgba(192,41,58,0.08)'; color = 'var(--color-crimson)' }
              if (isSelected) {
                border = block?.type === 'admin'
                  ? '1px solid rgba(192,41,58,0.5)'
                  : block?.type === 'booked'
                  ? '1px solid rgba(52,168,83,0.5)'
                  : '1px solid var(--color-border-light)'
              }

              return (
                <button
                  key={key}
                  onClick={() => setSelected(isSelected ? null : key)}
                  style={{
                    background: bg, border, borderRadius: '3px', color,
                    fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 500,
                    padding: '0.55rem 0', textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.1s',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-light)' }}>
            {[
              { color: '#2d8a50', label: 'Booked' },
              { color: 'var(--color-crimson)', label: 'Blocked' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, opacity: 0.7 }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {/* Selected day info */}
          <div style={{ background: 'var(--color-sand-2)', padding: '1.5rem', minHeight: '140px', border: '1px solid var(--color-border-light)' }}>
            {selected && selectedBlock ? (
              <>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: selectedBlock.type === 'booked' ? '#2d8a50' : 'var(--color-crimson)', marginBottom: '0.6rem' }}>
                  {selectedBlock.type === 'booked' ? 'Booking' : 'Admin Block'} · {selected}
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--color-charcoal)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {selectedBlock.reason}
                </p>
                {selectedBlock.type === 'admin' && (
                  <button
                    onClick={() => handleRemoveBlock(selected)}
                    style={{ background: 'none', border: '1px solid rgba(192,41,58,0.3)', color: 'var(--color-crimson)', padding: '0.35rem 0.85rem', fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '3px' }}
                  >
                    Remove Block
                  </button>
                )}
              </>
            ) : selected ? (
              <>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.6rem' }}>
                  {selected}
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                  Available — no bookings or blocks.
                </p>
              </>
            ) : (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                Click a date to see details.
              </p>
            )}
          </div>

          {/* Block a date */}
          <div style={{ background: 'var(--color-sand-2)', padding: '1.5rem', border: '1px solid var(--color-border-light)' }}>
            <p style={sectionLabel}>Block a Date</p>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                style={{ ...inputStyle, colorScheme: 'light' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Reason</label>
              <input
                placeholder="e.g. Personal day off"
                value={formReason}
                onChange={e => setFormReason(e.target.value)}
                style={inputStyle}
              />
            </div>
            <button
              onClick={handleAddBlock}
              style={{ background: 'var(--color-charcoal)', color: 'var(--color-sand)', border: 'none', padding: '0.65rem 1.5rem', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              {saved ? 'Blocked ✓' : 'Block Date'}
            </button>
          </div>
        </div>
      </div>

      {/* All blocks list */}
      <div style={{ background: 'var(--color-sand-2)', border: '1px solid var(--color-border-light)', padding: '1.5rem', marginTop: '1px' }}>
        <p style={sectionLabel}>All Blocks & Bookings</p>
        {Object.entries(blocks)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, block]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--color-border-light)', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '3px', background: block.type === 'booked' ? 'rgba(52,168,83,0.1)' : 'rgba(192,41,58,0.08)', border: `1px solid ${block.type === 'booked' ? 'rgba(52,168,83,0.3)' : 'rgba(192,41,58,0.25)'}`, fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: block.type === 'booked' ? '#2d8a50' : 'var(--color-crimson)' }}>
                  {block.type}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-muted)', minWidth: '90px' }}>{key}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-charcoal)' }}>{block.reason}</span>
              </div>
              {block.type === 'admin' && (
                <button
                  onClick={() => handleRemoveBlock(key)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-crimson)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0, opacity: 0.7 }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}

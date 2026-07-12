'use client'

import { useState } from 'react'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const PREVIEW_BLOCKS: Record<string, { reason: string; type: 'booked' | 'admin' }> = {
  '2026-06-14': { reason: 'Aisha Mohammed, Birthday Party', type: 'booked' },
  '2026-06-21': { reason: 'Jordan & Kezia Tran, Wedding Reception', type: 'booked' },
  '2026-06-27': { reason: 'Personal day off', type: 'admin' },
  '2026-07-03': { reason: 'Priya Sharma, Corporate Event', type: 'booked' },
  '2026-07-04': { reason: 'Canada Day long weekend', type: 'admin' },
  '2026-07-12': { reason: 'Marcus Okonkwo, Graduation Party', type: 'booked' },
  '2026-07-19': { reason: 'Fatima Al-Hassan, Family Gathering', type: 'booked' },
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase',
  color: 'rgba(245,240,234,0.35)', display: 'block', marginBottom: '0.35rem',
}

function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function PreviewAvailability() {
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(5)
  const [blocks, setBlocks] = useState(PREVIEW_BLOCKS)
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
    <div className="adm-page" style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="adm-eyebrow" style={{ marginBottom: '0.5rem' }}>
          Admin
        </p>
        <h1 className="adm-h1">
          Availability
        </h1>
      </div>

      <div className="admin-2col" style={{ alignItems: 'flex-start' }}>
        {/* Calendar */}
        <div className="adm-card">
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <button onClick={prev} className="btn-icon" aria-label="Previous month">‹</button>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 400, color: 'var(--color-text-light)' }}>
              {MONTH_NAMES[month]} {year}
            </p>
            <button onClick={next} className="btn-icon" aria-label="Next month">›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', padding: '0.3rem 0' }}>
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
              let color = 'var(--color-text-light)'
              let border = '1px solid transparent'

              if (block?.type === 'booked') { bg = 'rgba(52,168,83,0.1)'; color = '#2d8a50' }
              if (block?.type === 'admin')  { bg = 'rgba(201,145,63,0.12)'; color = 'var(--color-amber)' }
              if (isSelected) {
                border = block?.type === 'admin'
                  ? '1px solid rgba(201,145,63,0.55)'
                  : block?.type === 'booked'
                  ? '1px solid rgba(52,168,83,0.5)'
                  : '1px solid rgba(255,255,255,0.12)'
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
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { color: '#2d8a50', label: 'Booked' },
              { color: 'var(--color-amber)', label: 'Blocked' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, opacity: 0.7 }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.45)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Selected day info */}
          <div className="adm-card" style={{ minHeight: '140px' }}>
            {selected && selectedBlock ? (
              <>
                <p className="adm-card-label" style={{ color: selectedBlock.type === 'booked' ? 'var(--color-success)' : 'var(--color-amber)', marginBottom: '0.6rem' }}>
                  {selectedBlock.type === 'booked' ? 'Booking' : 'Admin Block'} · {selected}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {selectedBlock.reason}
                </p>
                {selectedBlock.type === 'admin' && (
                  <button onClick={() => handleRemoveBlock(selected)} className="btn-danger btn--sm">
                    Remove Block
                  </button>
                )}
              </>
            ) : selected ? (
              <>
                <p className="adm-card-label" style={{ marginBottom: '0.6rem' }}>
                  {selected}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-muted-light)' }}>
                  Available. No bookings or blocks.
                </p>
              </>
            ) : (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-muted-light)', lineHeight: 1.6 }}>
                Click a date to see details.
              </p>
            )}
          </div>

          {/* Block a date */}
          <div className="adm-card">
            <p className="adm-card-label">Block a Date</p>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="adm-input"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Reason</label>
              <input
                placeholder="e.g. Personal day off"
                value={formReason}
                onChange={e => setFormReason(e.target.value)}
                className="adm-input"
              />
            </div>
            <button onClick={handleAddBlock} className="btn-primary btn--sm">
              {saved ? 'Blocked ✓' : 'Block Date'}
            </button>
          </div>
        </div>
      </div>

      {/* All blocks list */}
      <div className="adm-card" style={{ marginTop: '1rem' }}>
        <p className="adm-card-label">All Blocks &amp; Bookings</p>
        {Object.entries(blocks)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, block]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--color-border-dark)', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`adm-pill adm-pill--${block.type === 'booked' ? 'confirmed' : 'pending'}`}>
                  {block.type}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-muted-light)', minWidth: '90px' }}>{key}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{block.reason}</span>
              </div>
              {block.type === 'admin' && (
                <button onClick={() => handleRemoveBlock(key)} className="btn-danger btn--sm" style={{ flexShrink: 0 }}>
                  Remove
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}

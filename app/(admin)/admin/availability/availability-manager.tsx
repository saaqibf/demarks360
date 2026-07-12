'use client'
import { useState } from 'react'

interface Block {
  id: string
  blockedDate: string
  startTime: string | null
  endTime: string | null
  reason: string | null
}

interface Props {
  initialBlocks: Block[]
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

function fmtTime(t: string | null): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function AvailabilityManager({ initialBlocks }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ date: '', startTime: '', endTime: '', reason: '' })
  const [error, setError] = useState<string | null>(null)

  async function addBlock() {
    if (!form.date) { setError('Date is required'); return }
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

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'rgba(245,240,234,0.35)', display: 'block', marginBottom: '0.35rem',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Add block form */}
      <div className="adm-card">
        <p className="adm-card-label">
          Block a Date
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="adm-input"
            />
          </div>
          <div>
            <label style={labelStyle}>Start Time (optional)</label>
            <input
              type="time"
              value={form.startTime}
              onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              className="adm-input"
            />
          </div>
          <div>
            <label style={labelStyle}>End Time (optional)</label>
            <input
              type="time"
              value={form.endTime}
              onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              className="adm-input"
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Reason (optional)</label>
          <input
            type="text"
            value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            placeholder="e.g. Equipment maintenance"
            className="adm-input"
          />
        </div>

        {error && <p style={{ color: 'var(--color-amber-light)', fontSize: '0.8rem', fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>{error}</p>}

        <button onClick={addBlock} disabled={saving} className="btn-primary btn--sm">
          {saving ? 'Adding…' : 'Block Date'}
        </button>
      </div>

      {/* Existing blocks list */}
      <div className="adm-card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border-dark)' }}>
          <p className="adm-card-label" style={{ margin: 0 }}>
            Current Blocks ({blocks.length})
          </p>
        </div>

        {blocks.length === 0 ? (
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--color-muted)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
            No dates blocked
          </div>
        ) : (
          blocks.map(block => (
            <div key={block.id} style={{ padding: '0.9rem 1.5rem', borderBottom: '1px solid var(--color-border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)' }}>
                  {fmtDate(block.blockedDate)}
                  {block.startTime && (
                    <span style={{ fontWeight: 400, color: 'var(--color-muted-light)', marginLeft: '0.5rem' }}>
                      {fmtTime(block.startTime)}{block.endTime ? ` → ${fmtTime(block.endTime)}` : ''}
                    </span>
                  )}
                </p>
                {block.reason && (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                    {block.reason}
                  </p>
                )}
              </div>
              <button onClick={() => removeBlock(block.id)} className="btn-danger btn--sm">
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

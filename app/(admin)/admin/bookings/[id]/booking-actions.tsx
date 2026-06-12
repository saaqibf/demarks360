'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const
type Status = typeof STATUSES[number]

const STATUS_LABELS: Record<Status, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
}

interface Props {
  bookingId: string
  currentStatus: string
  currentNotes: string
}

export function BookingActions({ bookingId, currentStatus, currentNotes }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState(currentNotes)
  const [notesSaved, setNotesSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function setStatus(status: Status) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Failed to update status')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function saveNotes() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Failed to save notes')
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Status buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {STATUSES.map((s) => {
          const active = currentStatus === s
          return (
            <button
              key={s}
              onClick={() => !active && setStatus(s)}
              disabled={active || saving}
              style={{
                padding: '0.55rem 1.1rem',
                border: '1px solid',
                borderColor: active ? 'var(--color-amber-light)' : 'rgba(255,255,255,0.1)',
                background: active ? 'var(--color-amber-light)' : 'transparent',
                color: active ? 'var(--color-charcoal)' : 'rgba(245,240,234,0.55)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: active || saving ? 'default' : 'pointer',
                opacity: saving && !active ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              {STATUS_LABELS[s]}
            </button>
          )
        })}
      </div>

      {/* Notes */}
      <div>
        {error && (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--color-amber-light)', marginBottom: '0.75rem' }}>
            {error}
          </p>
        )}
        <label style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', display: 'block', marginBottom: '0.5rem' }}>
          Internal Notes
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--color-ink)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--color-text-light)', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
            padding: '0.75rem', resize: 'vertical', outline: 'none',
          }}
          placeholder="Add internal notes about this booking…"
        />
        <button
          onClick={saveNotes}
          disabled={saving}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1.25rem',
            background: notesSaved ? 'rgba(52,211,153,0.15)' : 'var(--color-amber-light)',
            color: notesSaved ? '#34D399' : 'var(--color-charcoal)',
            border: 'none',
            borderRadius: '999px',
            fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {notesSaved ? 'Saved ✓' : 'Save Notes'}
        </button>
      </div>
    </div>
  )
}

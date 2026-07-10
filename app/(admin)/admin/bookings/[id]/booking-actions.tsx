'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
  currentStatus: string
  currentNotes: string
  payUrl: string | null
  depositAmount: string
  balanceAmount: string
  depositExpiresAt: string | null
  depositPaidAt: string | null
  autoPayOptIn: boolean
  balancePaid: boolean
}

const actionButtonStyle = (variant: 'primary' | 'danger' | 'ghost', disabled: boolean): React.CSSProperties => ({
  padding: '0.6rem 1.3rem',
  border: '1px solid',
  borderColor: variant === 'primary' ? 'var(--color-amber-light)' : variant === 'danger' ? 'rgba(192,41,58,0.6)' : 'rgba(255,255,255,0.15)',
  background: variant === 'primary' ? 'var(--color-amber-light)' : 'transparent',
  color: variant === 'primary' ? 'var(--color-charcoal)' : variant === 'danger' ? '#e06a76' : 'rgba(245,240,234,0.65)',
  borderRadius: '999px',
  fontFamily: 'var(--font-ui)',
  fontSize: '0.62rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  transition: 'all 0.15s',
})

const metaRowStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
}
const metaLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(245,240,234,0.35)',
}
const metaValueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text-light)',
}

export function BookingActions({
  bookingId, currentStatus, currentNotes, payUrl,
  depositAmount, balanceAmount, depositExpiresAt, depositPaidAt, autoPayOptIn, balancePaid,
}: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState(currentNotes)
  const [notesSaved, setNotesSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDecline, setConfirmingDecline] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  async function callEndpoint(path: string, init: RequestInit) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(path, init)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Request failed')
      setConfirmingDecline(false)
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const approve = () => callEndpoint(`/api/admin/bookings/${bookingId}/approve`, { method: 'POST' })
  const decline = () => callEndpoint(`/api/admin/bookings/${bookingId}/decline`, { method: 'POST' })
  const setStatus = (status: 'cancelled' | 'completed') =>
    callEndpoint(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

  async function copyPayLink() {
    if (!payUrl) return
    try {
      await navigator.clipboard.writeText(payUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      setError('Could not copy the link')
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

  let actions: React.ReactNode
  if (currentStatus === 'requested') {
    actions = (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={approve} disabled={saving} style={actionButtonStyle('primary', saving)}>
          Approve &amp; Send Payment Link
        </button>
        {confirmingDecline ? (
          <>
            <button onClick={decline} disabled={saving} style={actionButtonStyle('danger', saving)}>
              Yes, Decline
            </button>
            <button onClick={() => setConfirmingDecline(false)} disabled={saving} style={actionButtonStyle('ghost', saving)}>
              Keep Request
            </button>
          </>
        ) : (
          <button onClick={() => setConfirmingDecline(true)} disabled={saving} style={actionButtonStyle('danger', saving)}>
            Decline
          </button>
        )}
      </div>
    )
  } else if (currentStatus === 'approved') {
    actions = (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Deposit awaiting payment</span>
            <span style={metaValueStyle}>${Number(depositAmount).toFixed(2)}</span>
          </div>
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Payment link expires</span>
            <span style={metaValueStyle}>{depositExpiresAt ?? 'Not set'}</span>
          </div>
        </div>
        {payUrl && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(245,240,234,0.45)', marginBottom: '0.5rem', wordBreak: 'break-all' }}>
              {payUrl}
            </p>
            <button onClick={copyPayLink} disabled={saving} style={actionButtonStyle('ghost', saving)}>
              {linkCopied ? 'Copied ✓' : 'Copy Payment Link'}
            </button>
          </div>
        )}
        <button onClick={() => setStatus('cancelled')} disabled={saving} style={actionButtonStyle('danger', saving)}>
          Cancel Booking
        </button>
      </div>
    )
  } else if (currentStatus === 'confirmed') {
    actions = (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Deposit paid</span>
            <span style={metaValueStyle}>{depositPaidAt ?? 'Paid (legacy flow)'}</span>
          </div>
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Balance</span>
            <span style={metaValueStyle}>${Number(balanceAmount).toFixed(2)} {balancePaid ? '(paid)' : '(due event day)'}</span>
          </div>
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Auto-pay opt-in</span>
            <span style={metaValueStyle}>{autoPayOptIn ? 'Yes' : 'No'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setStatus('completed')} disabled={saving} style={actionButtonStyle('primary', saving)}>
            Mark Completed
          </button>
          <button onClick={() => setStatus('cancelled')} disabled={saving} style={actionButtonStyle('danger', saving)}>
            Cancel Booking
          </button>
        </div>
      </div>
    )
  } else if (currentStatus === 'expired') {
    actions = (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={approve} disabled={saving} style={actionButtonStyle('primary', saving)}>
          Approve Again &amp; Send Fresh Link
        </button>
      </div>
    )
  } else {
    actions = (
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'rgba(245,240,234,0.4)' }}>
        No actions available for a {currentStatus} booking.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {actions}

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
            color: notesSaved ? 'var(--color-success)' : 'var(--color-charcoal)',
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

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
  currentStatus: string
  currentNotes: string
  payUrl: string | null
  customerName?: string | null
  depositAmount: string
  balanceAmount: string
  depositExpiresAt: string | null
  depositPaidAt: string | null
  autoPayOptIn: boolean
  balancePaid: boolean
}

export function BookingActions({
  bookingId, currentStatus, currentNotes, payUrl, customerName,
  depositAmount, balanceAmount, depositExpiresAt, depositPaidAt, autoPayOptIn, balancePaid,
}: Props) {
  const firstName = customerName?.trim().split(/\s+/)[0] || null
  const approveHint = firstName
    ? `Approving emails ${firstName} their secure deposit link.`
    : 'Approving emails the customer their secure deposit link.'

  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState(currentNotes)
  const [notesSaved, setNotesSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDecline, setConfirmingDecline] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  async function callEndpoint(path: string, init: RequestInit) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(path, init)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Request failed')
      setConfirmingDecline(false)
      setConfirmingCancel(false)
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

  // Cancelling a held or paid booking is destructive, so it always confirms first
  const cancelControls = confirmingCancel ? (
    <>
      <button onClick={() => setStatus('cancelled')} disabled={saving} className="btn-danger btn--sm">
        Yes, cancel booking
      </button>
      <button onClick={() => setConfirmingCancel(false)} disabled={saving} className="btn-back">
        Keep booking
      </button>
    </>
  ) : (
    <button onClick={() => setConfirmingCancel(true)} disabled={saving} className="btn-danger btn--sm">
      Cancel Booking
    </button>
  )

  let actions: React.ReactNode
  if (currentStatus === 'requested') {
    actions = (
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={approve} disabled={saving} className="btn-primary">
            Approve booking
          </button>
          {confirmingDecline ? (
            <>
              <button onClick={decline} disabled={saving} className="btn-danger btn--sm">
                Yes, Decline
              </button>
              <button onClick={() => setConfirmingDecline(false)} disabled={saving} className="btn-back">
                Keep Request
              </button>
            </>
          ) : (
            <button onClick={() => setConfirmingDecline(true)} disabled={saving} className="btn-danger btn--sm">
              Decline
            </button>
          )}
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--adm-text-2)', marginTop: '0.75rem' }}>
          {approveHint}
        </p>
      </div>
    )
  } else if (currentStatus === 'approved') {
    actions = (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <div className="adm-row">
            <span className="adm-row-label">Deposit awaiting payment</span>
            <span className="adm-row-value">${Number(depositAmount).toFixed(2)}</span>
          </div>
          <div className="adm-row">
            <span className="adm-row-label">Payment link expires</span>
            <span className="adm-row-value">{depositExpiresAt ?? 'Not set'}</span>
          </div>
        </div>
        {payUrl && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--adm-text-2)', marginBottom: '0.5rem', wordBreak: 'break-all' }}>
              {payUrl}
            </p>
            <button onClick={copyPayLink} disabled={saving} className="btn-back">
              {linkCopied ? 'Copied ✓' : 'Copy Payment Link'}
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {cancelControls}
        </div>
      </div>
    )
  } else if (currentStatus === 'confirmed') {
    actions = (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <div className="adm-row">
            <span className="adm-row-label">Deposit paid</span>
            <span className="adm-row-value">{depositPaidAt ?? 'Paid (legacy flow)'}</span>
          </div>
          <div className="adm-row">
            <span className="adm-row-label">Balance</span>
            <span className="adm-row-value">${Number(balanceAmount).toFixed(2)} {balancePaid ? '(paid)' : '(due event day)'}</span>
          </div>
          <div className="adm-row">
            <span className="adm-row-label">Auto-pay opt-in</span>
            <span className="adm-row-value">{autoPayOptIn ? 'Yes' : 'No'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setStatus('completed')} disabled={saving} className="btn-primary btn--sm">
            Mark Completed
          </button>
          {cancelControls}
        </div>
      </div>
    )
  } else if (currentStatus === 'expired') {
    actions = (
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={approve} disabled={saving} className="btn-primary">
            Approve again
          </button>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--adm-text-2)', marginTop: '0.75rem' }}>
          {approveHint}
        </p>
      </div>
    )
  } else {
    actions = (
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--adm-text-2)' }}>
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
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--adm-danger)', marginBottom: '0.75rem' }}>
            {error}
          </p>
        )}
        <label className="adm-card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Internal Notes
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="adm-input"
          placeholder="Add internal notes about this booking…"
        />
        <button
          onClick={saveNotes}
          disabled={saving}
          className="btn-primary btn--sm"
          style={{ marginTop: '0.5rem' }}
        >
          {notesSaved ? 'Saved ✓' : 'Save Notes'}
        </button>
      </div>
    </div>
  )
}

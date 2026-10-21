'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { balanceDueSms, holdReminderSms, smsHref } from '@/lib/sms'

interface Props {
  bookingId: string
  currentStatus: string
  currentNotes: string
  payUrl: string | null
  customerName: string | null
  customerPhone: string | null
  eventDate: string
  // For a new request these hold the system's estimate; once quoted, the sent quote
  depositAmount: number
  balanceAmount: number
  holdExpiresAt: string | null
  depositPaidAt: string | null
  balanceDueDate: string | null
  autoPayOptIn: boolean
  balancePaid: boolean
  paidInFull: boolean
  // Server render time, so the countdown is identical on server and client
  nowMs: number
}

type SmsResult = { text: string; href: string | null; autoSent: boolean } | null
type Done = { message: string; sms: SmsResult }

const money = (n: number) => `$${n.toFixed(2)}`

function fmtHold(iso: string): string {
  return new Date(iso).toLocaleString('en-CA', {
    timeZone: 'America/Edmonton', weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

function timeLeft(iso: string, nowMs: number): string {
  const ms = new Date(iso).getTime() - nowMs
  if (ms <= 0) return 'ended'
  const hours = Math.floor(ms / 3_600_000)
  if (hours >= 24) return `${Math.floor(hours / 24)} day${hours >= 48 ? 's' : ''} ${hours % 24}h left`
  return `${Math.max(1, hours)} hour${hours === 1 ? '' : 's'} left`
}

export function BookingActions(p: Props) {
  const router = useRouter()
  const firstName = p.customerName?.trim().split(/\s+/)[0] || 'the customer'
  const estimate = Math.round(p.depositAmount + p.balanceAmount)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<Done | null>(null)
  const [mode, setMode] = useState<'idle' | 'quote' | 'decline' | 'cancel' | 'delete' | 'balance'>(
    p.currentStatus === 'requested' || p.currentStatus === 'expired' ? 'quote' : 'idle',
  )
  const [total, setTotal] = useState(estimate > 0 ? String(estimate) : '')
  const [firstPayment, setFirstPayment] = useState(estimate > 0 ? String(Math.round(estimate / 2)) : '')
  const [note, setNote] = useState('')
  const [declineNote, setDeclineNote] = useState('')
  const [notes, setNotes] = useState(p.currentNotes)
  const [notesSaved, setNotesSaved] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const totalNum = Number(total)
  const firstNum = Number(firstPayment)
  const quoteValid = totalNum >= 1 && firstNum >= 1 && firstNum <= totalNum

  async function call(path: string, init: RequestInit): Promise<{ sms?: SmsResult } | null> {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(path, init)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.')
      return data
    } catch (e) {
      setError((e as Error).message)
      return null
    } finally {
      setSaving(false)
    }
  }

  const json = (body: unknown): RequestInit => ({
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })

  async function sendQuote() {
    const data = await call(`/api/admin/bookings/${p.bookingId}/approve`, json({
      total: totalNum, firstPayment: firstNum, message: note.trim() || undefined,
    }))
    if (!data) return
    setDone({ message: `Quote of ${money(totalNum)} emailed to ${firstName}. The date is held for 3 days.`, sms: data.sms ?? null })
    setMode('idle')
    router.refresh()
  }

  async function sendDecline() {
    const data = await call(`/api/admin/bookings/${p.bookingId}/decline`, json({ message: declineNote.trim() || undefined }))
    if (!data) return
    setDone({ message: `${firstName} has been emailed that we can't take this date.`, sms: data.sms ?? null })
    setMode('idle')
    router.refresh()
  }

  async function extendHold() {
    const data = await call(`/api/admin/bookings/${p.bookingId}/hold`, { method: 'POST' })
    if (!data) return
    setDone({ message: `${firstName} now has 3 more days, and we emailed them the new deadline.`, sms: data.sms ?? null })
    router.refresh()
  }

  async function markBalancePaid() {
    const data = await call(`/api/admin/bookings/${p.bookingId}/balance-paid`, { method: 'POST' })
    if (!data) return
    setDone({ message: `Second payment recorded. ${firstName} got a receipt by email.`, sms: null })
    setMode('idle')
    router.refresh()
  }

  async function setStatus(status: 'cancelled' | 'completed') {
    const data = await call(`/api/admin/bookings/${p.bookingId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    if (!data) return
    setMode('idle')
    router.refresh()
  }

  async function deleteRequest() {
    const data = await call(`/api/admin/bookings/${p.bookingId}`, { method: 'DELETE' })
    if (!data) return
    router.push('/admin/dashboard')
    router.refresh()
  }

  async function copyPayLink() {
    if (!p.payUrl) return
    try {
      await navigator.clipboard.writeText(p.payUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      setError('Could not copy the link')
    }
  }

  async function saveNotes() {
    const res = await call(`/api/admin/bookings/${p.bookingId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }),
    })
    if (!res) return
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  const textButton = (body: string, label = `Text ${firstName}`) => {
    const href = p.customerPhone ? smsHref(p.customerPhone, body) : null
    return href ? <a href={href} className="btn-back">{label}</a> : null
  }

  const quoteForm = (
    <div className="adm-quote">
      <div className="adm-quote-grid">
        <label className="adm-field">
          <span className="adm-field-label">Total price</span>
          <span className="adm-money">
            <span aria-hidden="true">$</span>
            <input
              className="adm-input" inputMode="decimal" value={total}
              onChange={(e) => setTotal(e.target.value.replace(/[^\d.]/g, ''))}
            />
          </span>
        </label>
        <label className="adm-field">
          <span className="adm-field-label">First payment to lock the date</span>
          <span className="adm-money">
            <span aria-hidden="true">$</span>
            <input
              className="adm-input" inputMode="decimal" value={firstPayment}
              onChange={(e) => setFirstPayment(e.target.value.replace(/[^\d.]/g, ''))}
            />
          </span>
        </label>
      </div>
      <p className="adm-hint">
        {quoteValid
          ? `${firstName} can pay ${money(totalNum)} all at once, or ${money(firstNum)} now and ${money(totalNum - firstNum)} the day before the event.`
          : 'Enter the total and the first payment (the first payment cannot be more than the total).'}
        {p.currentStatus === 'requested' && estimate > 0 && ` Suggested from their hours and add-ons: ${money(estimate)}.`}
      </p>
      <label className="adm-field">
        <span className="adm-field-label">Personal note (optional)</span>
        <textarea
          className="adm-input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000}
          placeholder="e.g. This includes a custom welcome screen with your names and an attendant all night."
        />
      </label>
      <p className="adm-hint">We will email the quote and hold the date for {firstName} for 3 days. If they do not pay by then, the date opens back up.</p>
      <div className="adm-actions">
        <button onClick={sendQuote} disabled={saving || !quoteValid} className="btn-primary">
          {saving ? 'Sending…' : p.currentStatus === 'approved' ? 'Send updated quote' : 'Send quote'}
        </button>
        {p.currentStatus === 'approved' && (
          <button onClick={() => setMode('idle')} disabled={saving} className="btn-back">Never mind</button>
        )}
      </div>
    </div>
  )

  const declineForm = (
    <div className="adm-quote">
      <label className="adm-field">
        <span className="adm-field-label">Message to {firstName} (optional)</span>
        <textarea
          className="adm-input" rows={3} value={declineNote} onChange={(e) => setDeclineNote(e.target.value)} maxLength={1000}
          placeholder="e.g. We are already booked that evening, but the following Saturday is open if that helps."
        />
      </label>
      <div className="adm-actions">
        <button onClick={sendDecline} disabled={saving} className="btn-danger btn--sm">{saving ? 'Sending…' : 'Send decline'}</button>
        <button onClick={() => setMode('quote')} disabled={saving} className="btn-back">Go back</button>
      </div>
    </div>
  )

  const cancelConfirm = (
    <div className="adm-actions">
      <button onClick={() => setStatus('cancelled')} disabled={saving} className="btn-danger btn--sm">Yes, cancel booking</button>
      <button onClick={() => setMode('idle')} disabled={saving} className="btn-back">Keep booking</button>
    </div>
  )

  let actions: React.ReactNode
  if (p.currentStatus === 'requested' || p.currentStatus === 'expired') {
    actions = (
      <>
        {p.currentStatus === 'expired' && (
          <p className="adm-callout">The last hold ended without payment, so the date was released. If {firstName} still wants it, send the quote again.</p>
        )}
        {mode === 'decline' ? declineForm : quoteForm}
        {mode !== 'decline' && (
          <p className="adm-hint" style={{ marginTop: '1rem' }}>
            Can&apos;t take this one?{' '}
            <button type="button" className="adm-link-btn" onClick={() => setMode('decline')}>Decline the request</button>
          </p>
        )}
      </>
    )
  } else if (p.currentStatus === 'approved') {
    const holdEnded = !!p.holdExpiresAt && new Date(p.holdExpiresAt).getTime() <= p.nowMs
    actions = mode === 'quote' ? quoteForm : (
      <>
        <div className="adm-rows">
          <div className="adm-row"><span className="adm-row-label">Quote</span><span className="adm-row-value">{money(p.depositAmount + p.balanceAmount)}</span></div>
          <div className="adm-row"><span className="adm-row-label">First payment</span><span className="adm-row-value">{money(p.depositAmount)}</span></div>
          <div className="adm-row"><span className="adm-row-label">Second payment (day before)</span><span className="adm-row-value">{money(p.balanceAmount)}</span></div>
          <div className="adm-row">
            <span className="adm-row-label">Date held until</span>
            <span className="adm-row-value">{p.holdExpiresAt ? `${fmtHold(p.holdExpiresAt)} (${timeLeft(p.holdExpiresAt, p.nowMs)})` : 'Not set'}</span>
          </div>
        </div>
        <p className="adm-hint">
          {holdEnded
            ? 'The hold has ended. The date will be released in the next daily check unless you give them more time.'
            : `Waiting for ${firstName} to pay. They get a reminder email the day before the hold ends.`}
        </p>
        <div className="adm-actions">
          {p.payUrl && p.holdExpiresAt && textButton(holdReminderSms({
            name: p.customerName ?? '', eventDate: p.eventDate, payUrl: p.payUrl, holdExpiresAt: new Date(p.holdExpiresAt),
          }), `Text ${firstName} a reminder`)}
          <button onClick={extendHold} disabled={saving} className="btn-back">Give 3 more days</button>
          <button onClick={() => setMode('quote')} disabled={saving} className="btn-back">Change the price</button>
          <button onClick={copyPayLink} disabled={saving} className="btn-back">{linkCopied ? 'Copied ✓' : 'Copy payment link'}</button>
        </div>
        <div className="adm-actions" style={{ marginTop: '1rem' }}>
          {mode === 'cancel' ? cancelConfirm : (
            <button onClick={() => setMode('cancel')} disabled={saving} className="btn-danger btn--sm">Cancel booking</button>
          )}
        </div>
      </>
    )
  } else if (p.currentStatus === 'confirmed') {
    actions = (
      <>
        <div className="adm-rows">
          {p.paidInFull ? (
            <div className="adm-row"><span className="adm-row-label">Paid in full</span><span className="adm-row-value">{money(p.depositAmount + p.balanceAmount)}</span></div>
          ) : (
            <>
              <div className="adm-row"><span className="adm-row-label">First payment</span><span className="adm-row-value">{money(p.depositAmount)} paid{p.depositPaidAt ? ` ${p.depositPaidAt}` : ''}</span></div>
              <div className="adm-row">
                <span className="adm-row-label">Second payment</span>
                <span className="adm-row-value">
                  {money(p.balanceAmount)} {p.balancePaid ? 'paid ✓' : `due ${p.balanceDueDate ?? 'the day before'}`}
                </span>
              </div>
              {!p.balancePaid && (
                <div className="adm-row">
                  <span className="adm-row-label">How it gets collected</span>
                  <span className="adm-row-value">{p.autoPayOptIn ? 'Their saved card is charged automatically' : 'We email them a payment link'}</span>
                </div>
              )}
            </>
          )}
        </div>
        {!p.balancePaid && (
          mode === 'balance' ? (
            <div className="adm-actions">
              <button onClick={markBalancePaid} disabled={saving} className="btn-primary btn--sm">Yes, they paid {money(p.balanceAmount)}</button>
              <button onClick={() => setMode('idle')} disabled={saving} className="btn-back">Not yet</button>
            </div>
          ) : (
            <div className="adm-actions">
              <button onClick={() => setMode('balance')} disabled={saving} className="btn-back">They paid the rest in cash or e-transfer</button>
              {p.payUrl && textButton(balanceDueSms({ name: p.customerName ?? '', eventDate: p.eventDate, amount: p.balanceAmount, payUrl: p.payUrl }), `Text ${firstName} the payment link`)}
            </div>
          )
        )}
        <div className="adm-actions" style={{ marginTop: '1rem' }}>
          <button onClick={() => setStatus('completed')} disabled={saving} className="btn-primary btn--sm">Event is done</button>
          {mode === 'cancel' ? cancelConfirm : (
            <button onClick={() => setMode('cancel')} disabled={saving} className="btn-danger btn--sm">Cancel booking</button>
          )}
        </div>
      </>
    )
  } else {
    const label: Record<string, string> = {
      declined: 'This request was declined.',
      cancelled: 'This booking was cancelled.',
      completed: 'This event is done. Connect the booth gallery below to share the videos.',
    }
    actions = <p className="adm-hint">{label[p.currentStatus] ?? `Nothing to do for a ${p.currentStatus} booking.`}</p>
  }

  const canDelete = !p.depositPaidAt && !p.balancePaid && !['confirmed', 'completed'].includes(p.currentStatus)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {done && (
        <div className="adm-done" role="status">
          <p>✓ {done.message}</p>
          {done.sms?.autoSent && <p className="adm-hint">We also texted them.</p>}
          {done.sms && !done.sms.autoSent && done.sms.href && (
            <>
              <div className="adm-actions">
                <a href={done.sms.href} className="btn-primary btn--sm">Text {firstName} too</a>
                <button type="button" className="btn-back" onClick={() => setDone(null)}>Done</button>
              </div>
              <p className="adm-hint">Opens Messages on your phone with the text already written. Just press send.</p>
            </>
          )}
        </div>
      )}

      {error && <p className="adm-error" role="alert">{error}</p>}

      <div>{actions}</div>

      <div>
        <label className="adm-card-label" htmlFor="internal-notes" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Private notes (only you two see these)
        </label>
        <textarea
          id="internal-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="adm-input"
          placeholder="e.g. Called them on Tuesday, they want the gold theme."
        />
        <button onClick={saveNotes} disabled={saving} className="btn-back" style={{ marginTop: '0.5rem' }}>
          {notesSaved ? 'Saved ✓' : 'Save notes'}
        </button>
      </div>

      {canDelete && (
        <div className="adm-delete">
          {mode === 'delete' ? (
            <>
              <p className="adm-hint">This permanently removes the request. Use it for test or spam requests. The customer is not emailed.</p>
              <div className="adm-actions">
                <button onClick={deleteRequest} disabled={saving} className="btn-danger btn--sm">Yes, delete it</button>
                <button onClick={() => setMode('idle')} disabled={saving} className="btn-back">Keep it</button>
              </div>
            </>
          ) : (
            <button type="button" className="adm-link-btn adm-link-btn--danger" onClick={() => setMode('delete')}>
              Delete this request (test or spam)
            </button>
          )}
        </div>
      )}
    </div>
  )
}

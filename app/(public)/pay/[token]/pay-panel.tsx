'use client'
import { useState } from 'react'

interface PayPanelProps {
  token: string
  purpose: 'deposit' | 'balance'
  amount: string
}

export function PayPanel({ token, purpose, amount }: PayPanelProps) {
  const [autoPay, setAutoPay] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/pay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, autoPay: purpose === 'deposit' ? autoPay : undefined }),
      })
      const data: { url?: string; error?: string } = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }
      window.location.assign(data.url)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div>
      {purpose === 'deposit' && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input
            type="checkbox"
            id="auto-pay"
            checked={autoPay}
            onChange={e => setAutoPay(e.target.checked)}
            style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: 'var(--color-amber-light)', flexShrink: 0, cursor: 'pointer' }}
          />
          <label htmlFor="auto-pay" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-muted-light)', lineHeight: 1.6, cursor: 'pointer' }}>
            Save my card and charge the balance automatically on event day
          </label>
        </div>
      )}
      {error && (
        <p role="alert" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-amber-light)', marginBottom: '1rem' }}>
          {error}
        </p>
      )}
      <button
        onClick={handlePay}
        disabled={submitting}
        className="btn-primary"
        style={{ width: '100%', opacity: submitting ? 0.65 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
      >
        {submitting
          ? 'Redirecting to payment'
          : purpose === 'deposit' ? `Pay Deposit ${amount}` : `Pay Balance ${amount}`}
      </button>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(245,240,234,0.35)', marginTop: '0.85rem', lineHeight: 1.6 }}>
        You will be taken to a secure Stripe checkout page.
      </p>
    </div>
  )
}

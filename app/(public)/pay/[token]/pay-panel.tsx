'use client'
import { useState } from 'react'

type PayPanelProps =
  | { token: string; purpose: 'quote'; total: number; firstPayment: number; secondPayment: number }
  | { token: string; purpose: 'balance'; amount: number }

const money = (n: number) => `$${n.toFixed(2)}`

export function PayPanel(props: PayPanelProps) {
  const canSplit = props.purpose === 'quote' && props.secondPayment > 0
  const [plan, setPlan] = useState<'full' | 'split'>('full')
  const [autoPay, setAutoPay] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amountNow = props.purpose === 'balance'
    ? props.amount
    : plan === 'split' && canSplit ? props.firstPayment : props.total

  async function handlePay() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/pay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props.purpose === 'quote'
          ? { token: props.token, plan: canSplit ? plan : 'full', autoPay: plan === 'split' ? autoPay : undefined }
          : { token: props.token }),
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
      {canSplit && props.purpose === 'quote' && (
        <fieldset className="pay-plans">
          <legend className="pay-plans-legend">How would you like to pay?</legend>
          <label className={`pay-plan${plan === 'full' ? ' is-on' : ''}`}>
            <input type="radio" name="plan" value="full" checked={plan === 'full'} onChange={() => setPlan('full')} />
            <span>
              <span className="pay-plan-title">Pay in full · {money(props.total)}</span>
              <span className="pay-plan-sub">One payment today and you are all set.</span>
            </span>
          </label>
          <label className={`pay-plan${plan === 'split' ? ' is-on' : ''}`}>
            <input type="radio" name="plan" value="split" checked={plan === 'split'} onChange={() => setPlan('split')} />
            <span>
              <span className="pay-plan-title">Pay in two parts · {money(props.firstPayment)} today</span>
              <span className="pay-plan-sub">Then {money(props.secondPayment)} the day before your event.</span>
            </span>
          </label>
        </fieldset>
      )}

      {canSplit && plan === 'split' && (
        <label className="pay-autopay">
          <input type="checkbox" checked={autoPay} onChange={(e) => setAutoPay(e.target.checked)} />
          <span>Save my card and take the second payment automatically the day before my event</span>
        </label>
      )}

      {error && <p role="alert" className="pay-error">{error}</p>}

      <button onClick={handlePay} disabled={submitting} className="btn-primary pay-submit">
        {submitting ? 'Taking you to checkout…' : `Pay ${money(amountNow)} securely`}
      </button>
      <p className="pay-fine">You will finish on Stripe&apos;s secure checkout page. We never see your card number.</p>
    </div>
  )
}

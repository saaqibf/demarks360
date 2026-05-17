'use client'
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { BookingState } from '@/app/(public)/book/page'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')

interface CheckoutStepProps {
  state: BookingState
  onBack: () => void
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

const ADDON_PRICES: Record<string, number> = { firecrackers: 75 }
const ADDON_NAMES: Record<string, string> = { firecrackers: 'Firecrackers' }

function PaymentForm({ bookingId, onBack }: { bookingId: string; onBack: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/book/confirmation?id=${bookingId}`,
      },
    })

    if (submitError) {
      setError(submitError.message ?? 'Payment failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <p style={{ color: '#EC4899', fontSize: '0.78rem', marginTop: '1rem' }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        style={{
          marginTop: '1.5rem', width: '100%',
          background: submitting ? '#ccc' : 'linear-gradient(90deg,#EC4899,#8B5CF6)',
          color: '#fff', border: 'none', padding: '1rem 2rem',
          fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Processing…' : 'Pay Deposit & Confirm Booking'}
      </button>
      <button
        type="button"
        onClick={onBack}
        style={{ marginTop: '0.75rem', display: 'block', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#888880', textDecoration: 'underline' }}
      >
        ← Back
      </button>
    </form>
  )
}

export function CheckoutStep({ state, onBack }: CheckoutStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  const durationMinutes = state.startTime && state.endTime
    ? timeToMinutes(state.endTime) - timeToMinutes(state.startTime)
    : 0
  const durationHours = durationMinutes / 60
  const hourlySubtotal = durationHours * 150
  const addOnSubtotal = state.addOnIds.reduce((sum, id) => sum + (ADDON_PRICES[id] ?? 0), 0)
  const travelSurcharge = state.locationCity !== 'Calgary' ? 50 : 0
  const subtotal = hourlySubtotal + addOnSubtotal + travelSurcharge
  const deposit = Math.round(subtotal * 0.30 * 100) / 100
  const balance = Math.round(subtotal * 0.70 * 100) / 100

  const balanceChargeDate = (() => {
    if (!state.date) return ''
    const d = new Date(state.date + 'T00:00:00')
    d.setDate(d.getDate() - 7)
    return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  })()

  useEffect(() => {
    if (!state.date || !state.startTime || !state.endTime) return
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventDate: state.date,
        startTime: state.startTime,
        endTime: state.endTime,
        addOnIds: state.addOnIds,
        customerName: state.customerName,
        customerEmail: state.customerEmail,
        customerPhone: state.customerPhone,
        locationAddress: state.locationAddress,
        locationCity: state.locationCity,
        eventType: state.eventType,
        agreedToTerms: state.agreedToTerms,
      }),
    })
      .then(r => r.json())
      .then((data: { clientSecret?: string; bookingId?: string; error?: string }) => {
        if (data.error) { setInitError(data.error); setLoading(false); return }
        setClientSecret(data.clientSecret ?? null)
        setBookingId(data.bookingId ?? null)
        setLoading(false)
      })
      .catch(() => { setInitError('Failed to initialize checkout. Please try again.'); setLoading(false) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: '#888880' }}>
        Preparing your checkout…
      </div>
    )
  }

  if (initError) {
    return (
      <div>
        <p style={{ color: '#EC4899', fontSize: '0.85rem', marginBottom: '1rem' }}>{initError}</p>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#888880', textDecoration: 'underline' }}>
          ← Back
        </button>
      </div>
    )
  }

  const lineItems = [
    { label: `${durationHours.toFixed(1).replace('.0', '')} hrs × $150/hr`, amount: hourlySubtotal },
    ...state.addOnIds.map(id => ({ label: ADDON_NAMES[id] ?? id, amount: ADDON_PRICES[id] ?? 0 })),
    ...(travelSurcharge > 0 ? [{ label: 'Travel surcharge', amount: travelSurcharge }] : []),
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
      {/* Order summary */}
      <div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
          Step 5
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '2rem' }}>
          Checkout
        </h2>

        <div style={{ border: '1px solid rgba(15,15,15,0.10)', background: '#fff' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginBottom: '0.5rem' }}>Booking Summary</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.04em', color: '#0F0F0F' }}>
              {state.date ? new Date(state.date + 'T00:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#3A3A3A', marginTop: '0.25rem' }}>
              {state.startTime && formatTime(state.startTime)} → {state.endTime && formatTime(state.endTime)}
              {' · '}{(durationMinutes / 60).toFixed(1).replace('.0', '')} hours
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: '#888880', marginTop: '0.15rem' }}>
              {state.locationAddress}, {state.locationCity}
            </p>
          </div>

          {lineItems.map(({ label, amount }) => (
            <div key={label} style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(15,15,15,0.06)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#3A3A3A' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#0F0F0F', fontWeight: 600 }}>${amount.toFixed(2)}</span>
            </div>
          ))}

          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(15,15,15,0.10)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: '#888880' }}>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#0F0F0F' }}>${subtotal.toFixed(2)}</span>
          </div>

          <div style={{ padding: '1.25rem 1.5rem', background: '#0F0F0F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Deposit Due Today (30%)</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>
                Balance of ${balance.toFixed(2)} auto-charged on {balanceChargeDate}
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ${deposit.toFixed(2)}
            </span>
          </div>

          <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.5)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#888880', lineHeight: 1.6 }}>
              Your card will be saved for the balance charge. It will be automatically deleted 7 days after your event. Your deposit is non-refundable.
            </p>
          </div>
        </div>
      </div>

      {/* Payment form */}
      <div style={{ position: 'sticky', top: '140px' }}>
        <div style={{ border: '1px solid rgba(15,15,15,0.10)', background: '#fff', padding: '2rem' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginBottom: '1.25rem' }}>
            Payment Details
          </p>
          {clientSecret && bookingId ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: { fontFamily: 'DM Sans, sans-serif', colorPrimary: '#8B5CF6' },
                },
              }}
            >
              <PaymentForm bookingId={bookingId} onBack={onBack} />
            </Elements>
          ) : (
            <p style={{ color: '#888880', fontSize: '0.78rem' }}>Payment unavailable — Stripe not configured.</p>
          )}
        </div>
      </div>
    </div>
  )
}

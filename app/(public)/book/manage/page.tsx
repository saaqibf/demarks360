'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SiteNav } from '@/components/public/site-nav'
import { SiteFooter } from '@/components/public/site-footer'

type BookingData = {
  id: string
  eventDate: string
  startTime: string
  endTime: string
  eventType: string
  locationCity: string
  status: string
  galleryToken: string | null
  customerName: string | null
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://demarks360.vercel.app'

function ManageBookingInner() {
  const params = useSearchParams()
  const id = params.get('id')

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [mode, setMode] = useState<null | 'cancel' | 'change'>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return }
    fetch(`/api/bookings/manage?id=${encodeURIComponent(id)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setBooking(data)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function submit() {
    if (!booking || !mode || !reason.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/bookings/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, requestType: mode, reason: reason.trim() }),
      })
      if (!res.ok) throw new Error('Failed to send request')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please email hello@demarks360.com directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const baseStyle: React.CSSProperties = { minHeight: '100vh', background: 'var(--color-ink)', color: 'var(--color-text-light)' }

  if (loading) return (
    <div style={baseStyle}>
      <SiteNav />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 72px)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted-light)' }}>Loading…</p>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={baseStyle}>
      <SiteNav />
      <div style={{ maxWidth: '540px', margin: '0 auto', padding: '8rem 2rem 4rem', textAlign: 'center' }}>
        <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '1rem' }}>Booking not found</p>
        <h1 className="t-heading" style={{ color: 'var(--color-sand)', marginBottom: '1rem' }}>We couldn&apos;t find this booking</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-muted-light)', lineHeight: 1.75, marginBottom: '2rem' }}>
          The link may have expired or the booking ID is incorrect. Check your confirmation email or contact us directly.
        </p>
        <a href="mailto:hello@demarks360.com" className="btn-primary">Email us</a>
      </div>
      <SiteFooter />
    </div>
  )

  if (!booking) return null

  const canManage = booking.status === 'pending' || booking.status === 'confirmed'
  const galleryUrl = booking.galleryToken ? `${APP_URL}/gallery/${booking.galleryToken}` : null

  return (
    <div style={baseStyle}>
      <SiteNav />
      <main style={{ maxWidth: '620px', margin: '0 auto', padding: '8rem 2rem 6rem' }}>
        <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '1.5rem' }}>
          Your booking
        </p>

        {/* Booking card */}
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'var(--color-surface)', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', marginBottom: '0.4rem' }}>
              Event
            </p>
            <p className="t-subheading" style={{ color: 'var(--color-sand)', lineHeight: 1.1 }}>
              {fmtDate(booking.eventDate)}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--color-muted-light)', marginTop: '0.35rem' }}>
              {fmtTime(booking.startTime)} &rarr; {fmtTime(booking.endTime)} &middot; {booking.eventType} &middot; {booking.locationCity}
            </p>
          </div>
          <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              display: 'inline-block', padding: '0.22rem 0.65rem', borderRadius: '3px',
              background: booking.status === 'confirmed' ? 'rgba(52,211,153,0.1)' : booking.status === 'cancelled' ? 'rgba(201,145,63,0.12)' : 'rgba(251,191,36,0.12)',
              color: booking.status === 'confirmed' ? '#34D399' : booking.status === 'cancelled' ? 'var(--color-amber)' : '#FBB724',
              fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {booking.status}
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'rgba(245,240,234,0.3)' }}>
              Ref: {booking.id.slice(0, 12).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Gallery link — shown when ready */}
        {galleryUrl && (
          <div style={{ border: '1px solid rgba(201,145,63,0.3)', background: 'rgba(201,145,63,0.06)', padding: '1.5rem', marginBottom: '2rem' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-amber)', marginBottom: '0.75rem' }}>
              Your videos are ready
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-muted-light)', marginBottom: '1.25rem', lineHeight: 1.65 }}>
              Your 360 gallery is live. Tap the link to watch and download your clips.
            </p>
            <a href={galleryUrl} className="btn-primary" style={{ fontSize: '0.65rem', padding: '0.75rem 1.75rem' }}>
              Open my gallery &rarr;
            </a>
          </div>
        )}

        {/* Actions */}
        {canManage && !submitted && (
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.3)', marginBottom: '1rem' }}>
              Need to make a change?
            </p>

            {!mode && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setMode('change')}
                  className="btn-primary"
                  style={{ fontSize: '0.65rem', padding: '0.75rem 1.5rem' }}
                >
                  Request a change
                </button>
                <button
                  onClick={() => setMode('cancel')}
                  className="btn-secondary"
                  style={{ fontSize: '0.65rem', padding: '0.75rem 1.5rem', color: 'var(--color-muted-light)', borderColor: 'rgba(255,255,255,0.15)' }}
                >
                  Cancel booking
                </button>
              </div>
            )}

            {mode && (
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-muted-light)', marginBottom: '1rem', lineHeight: 1.65 }}>
                  {mode === 'cancel'
                    ? 'Tell us why you need to cancel. Remember your deposit is non-refundable, but we can move it to a new date if you have 7+ days notice.'
                    : 'Describe what you need changed (date, time, location, etc.). We will get back to you within 24 hours.'}
                </p>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={4}
                  placeholder={mode === 'cancel' ? 'Reason for cancellation…' : 'What would you like to change?'}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--color-ink)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--color-text-light)', fontFamily: 'var(--font-body)', fontSize: '0.88rem',
                    padding: '0.9rem', resize: 'vertical', outline: 'none', marginBottom: '1rem',
                    lineHeight: 1.65,
                  }}
                />
                {error && <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-amber-light)', marginBottom: '0.75rem' }}>{error}</p>}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={submit}
                    disabled={submitting || !reason.trim()}
                    className="btn-primary"
                    style={{ fontSize: '0.65rem', padding: '0.75rem 1.5rem', opacity: (!reason.trim() || submitting) ? 0.5 : 1 }}
                  >
                    {submitting ? 'Sending…' : 'Send request'}
                  </button>
                  <button
                    onClick={() => { setMode(null); setReason(''); setError(null) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'rgba(245,240,234,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {submitted && (
          <div style={{ border: '1px solid rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.06)', padding: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#34D399', marginBottom: '0.5rem' }}>
              Request received
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-muted-light)', lineHeight: 1.65 }}>
              We got your request and will be in touch within 24 hours at the email you booked with. You can also reach us at{' '}
              <a href="tel:+15879179272" style={{ color: 'var(--color-amber-light)' }}>587-917-9272</a>.
            </p>
          </div>
        )}

        {booking.status === 'cancelled' && (
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-muted-light)', lineHeight: 1.65 }}>
              This booking has been cancelled. Want to rebook? <a href="/book" style={{ color: 'var(--color-amber-light)' }}>Check availability &rarr;</a>
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

export default function ManageBookingPage() {
  return (
    <Suspense>
      <ManageBookingInner />
    </Suspense>
  )
}

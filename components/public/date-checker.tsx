'use client'

import { useState } from 'react'
import Link from 'next/link'

type AvailStatus = 'idle' | 'loading' | 'available' | 'limited' | 'booked' | 'error'

export function DateChecker() {
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<AvailStatus>('idle')

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  async function check() {
    if (!date) return
    setStatus('loading')
    try {
      const res = await fetch(`/api/availability?date=${date}`)
      if (!res.ok) { setStatus('error'); return }
      const data = await res.json()
      setStatus(data.status === 'available' ? 'available' : data.status === 'limited' ? 'limited' : 'booked')
    } catch {
      setStatus('error')
    }
  }

  const statusConfig = {
    idle: null,
    loading: { color: 'var(--color-muted-light)', text: 'Checking...' },
    available: { color: 'var(--color-amber-light)', text: 'Your date is available, lock it in below.' },
    limited: { color: 'var(--color-amber-light)', text: 'Limited availability on this date, book soon.' },
    booked: { color: 'var(--color-muted-light)', text: 'This date is fully booked. Pick another date.' },
    error: { color: 'var(--color-muted-light)', text: 'Could not check availability. Try again.' },
  }

  const info = statusConfig[status]

  return (
    <section style={{
      background: 'var(--color-charcoal-2)',
      borderTop: '1px solid var(--color-border-dark)',
      borderBottom: '1px solid var(--color-border-dark)',
    }}>
      <div className="date-check-inner" style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '4.5rem 3rem',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '3rem',
        alignItems: 'center',
      }}>
        <div>
          <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '1rem' }}>
            Check your date
          </p>
          <h2 className="t-heading" style={{ color: 'var(--color-sand)' }}>
            Is your date <em>still open?</em>
          </h2>
          <p className="t-body-dark" style={{
            color: 'var(--color-muted-light)',
            marginTop: '1rem',
          }}>
            Dates book up fast, especially weekends. Check yours before it&apos;s gone.
          </p>
        </div>

        <div>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setStatus('idle') }}
              min={today}
              max={maxDate}
              aria-label="Event date"
              style={{
                flex: '1 1 200px',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: 400,
                color: 'var(--color-sand)',
                background: 'color-mix(in srgb, var(--color-charcoal) 76%, transparent)',
                border: '1px solid var(--color-border-dark)',
                padding: '0.95rem 1.25rem',
                borderRadius: '999px',
                colorScheme: 'dark',
                minHeight: '44px',
              }}
            />
            <button
              onClick={check}
              disabled={!date || status === 'loading'}
              className="btn-primary"
              style={{
                opacity: !date ? 0.45 : 1,
                cursor: !date ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'loading' ? '...' : 'Check'}
            </button>
          </div>

          {info && (
            <div style={{
              marginTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '1rem',
            }}>
              <p className="t-body-dark" aria-live="polite" style={{
                color: info.color,
                fontWeight: 500,
              }}>
                {info.text}
              </p>
              {status === 'available' && date && (
                <Link href={`/book?date=${date}`} className="btn-secondary" style={{
                  color: 'var(--color-sand)',
                  borderColor: 'var(--color-border-dark)',
                }}>
                  Book this date
                </Link>
              )}
              {status === 'limited' && date && (
                <Link href={`/book?date=${date}`} className="btn-secondary" style={{
                  color: 'var(--color-sand)',
                  borderColor: 'var(--color-border-dark)',
                }}>
                  Check remaining slots
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .date-check-inner {
            grid-template-columns: 1fr !important;
            padding: 3.5rem 1.5rem !important;
          }
        }
      `}</style>
    </section>
  )
}

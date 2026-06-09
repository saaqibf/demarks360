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
    loading: { color: 'rgba(237,232,223,0.4)', text: 'Checking...' },
    available: { color: '#6EC97A', text: '✓ Your date is available — lock it in below.' },
    limited: { color: 'var(--color-amber)', text: '⚡ Limited availability on this date — book soon.' },
    booked: { color: '#E07070', text: '✗ This date is fully booked. Pick another date.' },
    error: { color: 'rgba(237,232,223,0.3)', text: 'Could not check availability. Try again.' },
  }

  const info = statusConfig[status]

  return (
    <div style={{
      background: 'var(--color-charcoal-2)',
      borderTop: '1px solid rgba(237,232,223,0.06)',
      borderBottom: '1px solid rgba(237,232,223,0.06)',
      padding: '4rem 3rem',
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(237,232,223,0.28)',
          marginBottom: '1rem',
        }}>
          Check Your Date
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          fontWeight: 900,
          lineHeight: 0.95,
          color: 'var(--color-sand)',
          textTransform: 'uppercase',
          letterSpacing: '-0.01em',
          marginBottom: '0.5rem',
        }}>
          Is your date available?
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'rgba(237,232,223,0.35)',
          lineHeight: 1.7,
          marginBottom: '2rem',
          fontWeight: 400,
        }}>
          Dates book up fast — especially weekends. Check yours before it&apos;s gone.
        </p>

        <div style={{
          display: 'flex',
          gap: '0',
          maxWidth: '480px',
          margin: '0 auto',
          boxShadow: '0 2px 24px rgba(0,0,0,0.3)',
        }}>
          <input
            type="date"
            value={date}
            onChange={e => { setDate(e.target.value); setStatus('idle') }}
            min={today}
            max={maxDate}
            style={{
              flex: 1,
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              fontWeight: 400,
              color: date ? 'var(--color-sand)' : 'rgba(237,232,223,0.35)',
              background: 'rgba(237,232,223,0.06)',
              border: '1.5px solid rgba(237,232,223,0.12)',
              borderRight: 'none',
              padding: '0.9rem 1.25rem',
              outline: 'none',
              borderRadius: '3px 0 0 3px',
              colorScheme: 'dark',
            }}
          />
          <button
            onClick={check}
            disabled={!date || status === 'loading'}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#fff',
              background: !date ? 'rgba(212,133,106,0.4)' : 'var(--color-amber)',
              border: 'none',
              padding: '0.9rem 1.75rem',
              borderRadius: '0 3px 3px 0',
              cursor: !date ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s ease',
              flexShrink: 0,
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
            alignItems: 'center',
            gap: '1rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: info.color,
              letterSpacing: '0.01em',
            }}>
              {info.text}
            </p>
            {status === 'available' && date && (
              <Link
                href={`/book?date=${date}`}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  background: 'var(--color-amber)',
                  padding: '0.85rem 2.25rem',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Book This Date →
              </Link>
            )}
            {status === 'limited' && date && (
              <Link
                href={`/book?date=${date}`}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-charcoal)',
                  background: 'var(--color-sand)',
                  padding: '0.85rem 2.25rem',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Check Remaining Slots →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

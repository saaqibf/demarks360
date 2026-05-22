'use client'

import { useState } from 'react'

type EventType = 'Birthday' | 'Wedding' | 'Corporate' | 'Other'
type Duration = '1.5hr' | '2hr' | '3hr' | '4hr'

const durations: { value: Duration; label: string; price: string; note: string }[] = [
  { value: '1.5hr', label: '1.5 Hours', price: '$225', note: 'Perfect for smaller gatherings' },
  { value: '2hr',   label: '2 Hours',   price: '$300', note: 'The most popular choice' },
  { value: '3hr',   label: '3 Hours',   price: '$450', note: 'Room for every guest to shine' },
  { value: '4hr',   label: '4+ Hours',  price: 'From $600', note: 'For all-night celebrations' },
]

const eventTypes: EventType[] = ['Birthday', 'Wedding', 'Corporate', 'Other']

export function PackageRecommender() {
  const [step, setStep] = useState<1 | 2 | 'result'>(1)
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [duration, setDuration] = useState<Duration | null>(null)

  const selectedDuration = durations.find(d => d.value === duration)

  function selectEvent(e: EventType) {
    setEventType(e)
    setStep(2)
  }

  function selectDuration(d: Duration) {
    setDuration(d)
    setStep('result')
  }

  function reset() {
    setStep(1)
    setEventType(null)
    setDuration(null)
  }

  const noteMap: Record<EventType, string> = {
    Birthday: 'Most birthday events book 2 hours. Enough time for everyone to take a turn without rushing.',
    Wedding: 'We recommend 3 hours for weddings. Your guests will want multiple takes and the experience lasts all night.',
    Corporate: '2 hours works well for most company events. Clean, professional, and a perfect team activity.',
    Other: '2 hours is a solid starting point. You can always extend the conversation when you reach out.',
  }

  return (
    <section style={{ background: 'var(--color-sand)', borderBottom: '1px solid var(--color-border-light)' }}>
      {/* Header */}
      <div style={{ padding: '6rem 3rem 5rem', borderBottom: '1px solid var(--color-border-light)' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--color-muted-light)',
          marginBottom: '1.25rem',
        }}>
          Package Finder
        </p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 300,
          lineHeight: 1.0,
          color: 'var(--color-charcoal)',
          letterSpacing: '-0.025em',
        }}>
          Find your{' '}
          <em style={{ color: 'var(--color-amber)' }}>perfect package.</em>
        </h2>
      </div>

      {/* Step content */}
      <div style={{ padding: '4rem 3rem 5rem' }}>
        {step === 1 && (
          <div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              fontWeight: 500,
              color: 'var(--color-muted)',
              marginBottom: '2.5rem',
              letterSpacing: '0.01em',
            }}>
              Step 1 of 2 — What kind of event are you planning?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0', maxWidth: '640px' }}>
              {eventTypes.map((e, i) => (
                <button
                  key={e}
                  onClick={() => selectEvent(e)}
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                    fontWeight: 400,
                    fontStyle: 'italic',
                    color: 'var(--color-charcoal)',
                    background: 'transparent',
                    border: '1px solid var(--color-border-light)',
                    borderTop: i < 2 ? '1px solid var(--color-border-light)' : 'none',
                    borderLeft: i % 2 === 0 ? '1px solid var(--color-border-light)' : 'none',
                    padding: '2rem 2.5rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    letterSpacing: '-0.01em',
                    lineHeight: 1,
                  }}
                  onMouseEnter={e2 => (e2.currentTarget.style.background = 'rgba(26,23,20,0.04)')}
                  onMouseLeave={e2 => (e2.currentTarget.style.background = 'transparent')}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <button
              onClick={reset}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-muted-light)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: 0,
              }}
            >
              ← Back
            </button>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              fontWeight: 500,
              color: 'var(--color-muted)',
              marginBottom: '2.5rem',
            }}>
              Step 2 of 2 — How long is your event?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxWidth: '640px', border: '1px solid var(--color-border-light)' }}>
              {durations.map((d, i) => (
                <button
                  key={d.value}
                  onClick={() => selectDuration(d.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.5rem 2rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: i < durations.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.18s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,23,20,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, fontStyle: 'italic', color: 'var(--color-charcoal)', letterSpacing: '-0.01em' }}>
                      {d.label}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 400, marginTop: '0.2rem' }}>
                      {d.note}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 400, fontStyle: 'italic', color: 'var(--color-charcoal)', letterSpacing: '-0.01em', flexShrink: 0 }}>
                    {d.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'result' && eventType && selectedDuration && (
          <div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--color-amber)',
              marginBottom: '1.5rem',
            }}>
              Your Package
            </p>
            <div style={{ maxWidth: '620px', padding: '3rem', border: '1px solid var(--color-border-light)', background: 'var(--color-sand-3)' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-charcoal)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '0.25rem' }}>
                {selectedDuration.price}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 400, marginBottom: '1.5rem' }}>
                {eventType} · {selectedDuration.label}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-muted)', lineHeight: 1.75, fontWeight: 400, marginBottom: '2rem', maxWidth: '40ch' }}>
                {noteMap[eventType]}
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <a href="/book" className="btn-primary">Book This Package</a>
                <button
                  onClick={reset}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Start over
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

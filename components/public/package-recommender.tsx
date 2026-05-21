'use client'

import { useState } from 'react'
import { Reveal } from './reveal'

const eventTypes = [
  { id: 'birthday', label: 'Birthday party' },
  { id: 'wedding', label: 'Wedding reception' },
  { id: 'corporate', label: 'Corporate event' },
  { id: 'other', label: 'Other celebration' },
]

const durations = [
  { id: '1.5', label: '1.5 hours', price: '$225', note: 'Perfect for smaller gatherings' },
  { id: '2', label: '2 hours', price: '$300', note: 'Our most popular booking' },
  { id: '3', label: '3 hours', price: '$450', note: 'Great for large receptions' },
  { id: '4+', label: '4+ hours', price: 'From $600', note: 'Full-day or multi-shift events' },
]

function eventLabel(id: string) {
  return eventTypes.find(e => e.id === id)?.label ?? id
}

function durationData(id: string) {
  return durations.find(d => d.id === id)
}

export function PackageRecommender() {
  const [step, setStep] = useState<1 | 2 | 'result'>(1)
  const [eventType, setEventType] = useState<string | null>(null)
  const [duration, setDuration] = useState<string | null>(null)

  const dur = duration ? durationData(duration) : null

  return (
    <section className="sec-pad" style={{ background: 'var(--color-sand-2)', borderBottom: '1px solid var(--color-border-light)' }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.85rem' }}>Find Your Fit</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          lineHeight: 1.0,
          color: 'var(--color-charcoal)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}>
          Not sure what
        </h2>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          fontStyle: 'italic',
          lineHeight: 1.0,
          color: 'var(--color-amber)',
          marginBottom: '3.5rem',
          letterSpacing: '-0.02em',
        }}>
          to book?
        </p>
      </Reveal>

      <div style={{ maxWidth: '680px' }}>

        {/* Step 1 */}
        {(step === 1 || step === 2 || step === 'result') && (
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: step === 1 ? 'var(--color-charcoal)' : 'var(--color-muted)',
              marginBottom: '1rem',
            }}>
              {step === 1 ? '01 — ' : ''}What kind of event?
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {eventTypes.map(e => (
                <button
                  key={e.id}
                  onClick={() => {
                    setEventType(e.id)
                    if (step === 1) setStep(2)
                  }}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.88rem',
                    fontWeight: eventType === e.id ? 700 : 500,
                    padding: '0.65rem 1.4rem',
                    borderRadius: '9999px',
                    border: eventType === e.id
                      ? '1.5px solid var(--color-charcoal)'
                      : '1.5px solid rgba(26,23,20,0.2)',
                    background: eventType === e.id ? 'var(--color-charcoal)' : 'transparent',
                    color: eventType === e.id ? 'var(--color-sand)' : 'var(--color-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    minHeight: '44px',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {(step === 2 || step === 'result') && (
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: step === 2 ? 'var(--color-charcoal)' : 'var(--color-muted)',
              marginBottom: '1rem',
            }}>
              {step === 2 ? '02 — ' : ''}How long is your event?
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {durations.map(d => (
                <button
                  key={d.id}
                  onClick={() => {
                    setDuration(d.id)
                    setStep('result')
                  }}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.88rem',
                    fontWeight: duration === d.id ? 700 : 500,
                    padding: '0.65rem 1.4rem',
                    borderRadius: '9999px',
                    border: duration === d.id
                      ? '1.5px solid var(--color-charcoal)'
                      : '1.5px solid rgba(26,23,20,0.2)',
                    background: duration === d.id ? 'var(--color-charcoal)' : 'transparent',
                    color: duration === d.id ? 'var(--color-sand)' : 'var(--color-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    minHeight: '44px',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {step === 'result' && dur && (
          <div style={{
            padding: '2.25rem',
            background: 'var(--color-sand-3)',
            border: '1px solid var(--color-border-light)',
            borderRadius: '16px',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-amber)',
              marginBottom: '0.75rem',
            }}>
              Your recommendation
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 400,
              color: 'var(--color-charcoal)',
              letterSpacing: '-0.02em',
              marginBottom: '0.25rem',
              lineHeight: 1.1,
            }}>
              360 Booth, {dur.label}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.82rem',
              color: 'var(--color-muted)',
              marginBottom: '0.35rem',
            }}>
              {dur.note}
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.5rem',
              fontWeight: 400,
              color: 'var(--color-charcoal)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginBottom: '1.75rem',
            }}>
              {dur.price}
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href={`/book`}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--color-sand)',
                  background: 'var(--color-charcoal)',
                  padding: '0.9rem 2.25rem',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'background 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                Book This Package
              </a>
              <button
                onClick={() => { setStep(1); setEventType(null); setDuration(null) }}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: 'var(--color-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem 0',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  minHeight: '44px',
                }}
              >
                Start over
              </button>
            </div>
            {eventType && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.72rem',
                color: 'rgba(26,23,20,0.3)',
                marginTop: '1.25rem',
                fontWeight: 400,
              }}>
                Based on: {eventLabel(eventType)}, {dur.label}
              </p>
            )}
          </div>
        )}

      </div>
    </section>
  )
}

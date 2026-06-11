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
    <section className="sec-pad" style={{
      background: 'var(--color-sand)',
      borderBottom: '1px solid var(--color-border-light)',
    }}>
      <div className="package-finder" style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '0.9fr 1.1fr',
        gap: 'clamp(2rem, 6vw, 5rem)',
        alignItems: 'start',
      }}>
        <div>
          <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '1.25rem' }}>
            Package finder
          </p>
          <h2 className="t-heading" style={{
            color: 'var(--color-charcoal)',
            maxWidth: '13ch',
          }}>
            Find the package that <em>fits your night.</em>
          </h2>
        </div>

        <div>
          {step === 1 && (
            <div>
              <p className="t-label" style={{
                color: 'var(--color-muted)',
                marginBottom: '1.5rem',
              }}>
                Step 1 of 2 · What kind of event are you planning?
              </p>
              <div className="package-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                borderTop: '1px solid var(--color-border-light)',
                borderLeft: '1px solid var(--color-border-light)',
              }}>
                {eventTypes.map(e => (
                  <button
                    key={e}
                    onClick={() => selectEvent(e)}
                    className="package-choice"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
                      fontWeight: 400,
                      color: 'var(--color-charcoal)',
                      background: 'transparent',
                      border: 'none',
                      borderRight: '1px solid var(--color-border-light)',
                      borderBottom: '1px solid var(--color-border-light)',
                      padding: '2rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease, color 0.2s ease',
                      lineHeight: 1,
                    }}
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
                className="t-label"
                style={{
                  color: 'var(--color-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: '1.5rem',
                  padding: 0,
                }}
              >
                Back
              </button>
              <p className="t-label" style={{
                color: 'var(--color-muted)',
                marginBottom: '1.5rem',
              }}>
                Step 2 of 2 · How long is your event?
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                borderTop: '1px solid var(--color-border-light)',
              }}>
                {durations.map((d, i) => (
                  <button
                    key={d.value}
                    onClick={() => selectDuration(d.value)}
                    className="package-choice"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.5rem',
                      padding: '1.5rem 0',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--color-border-light)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.18s ease',
                    }}
                  >
                    <div>
                      <p className="t-subheading" style={{
                        color: 'var(--color-charcoal)',
                        fontSize: 'clamp(1.35rem, 2vw, 1.8rem)',
                      }}>
                        {d.label}
                      </p>
                      <p className="t-body" style={{
                        color: 'var(--color-muted)',
                        marginTop: '0.25rem',
                      }}>
                        {d.note}
                      </p>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: '1.6rem',
                      fontWeight: 400,
                      color: 'var(--color-amber)',
                      flexShrink: 0,
                    }}>
                      {d.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'result' && eventType && selectedDuration && (
            <div>
              <p className="t-label" style={{
                color: 'var(--color-amber)',
                marginBottom: '1.5rem',
              }}>
                Your package
              </p>
              <div style={{
                padding: '2.5rem',
                border: '1px solid var(--color-border-light)',
                background: 'var(--color-sand-3)',
                borderRadius: '8px',
              }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(2.8rem, 5vw, 4rem)',
                  fontWeight: 400,
                  color: 'var(--color-amber)',
                  lineHeight: 1,
                  marginBottom: '0.25rem',
                }}>
                  {selectedDuration.price}
                </p>
                <p className="t-label" style={{
                  color: 'var(--color-muted)',
                  marginBottom: '1.5rem',
                }}>
                  {eventType} · {selectedDuration.label}
                </p>
                <p className="t-body" style={{
                  color: 'var(--color-muted)',
                  marginBottom: '2rem',
                }}>
                  {noteMap[eventType]}
                </p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <a href="/book" className="btn-primary">Book this package</a>
                  <button
                    onClick={reset}
                    className="btn-secondary"
                  >
                    Start over
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .package-choice:hover {
          background: var(--color-sand-2) !important;
        }
        @media (max-width: 840px) {
          .package-finder {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .package-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}

'use client'
import { Reveal } from './reveal'

const events = [
  { num: '01', type: 'Birthday', tag: 'Milestones & Celebrations' },
  { num: '02', type: 'Wedding', tag: 'Your Most Important Day' },
  { num: '03', type: 'Corporate', tag: 'Brand Moments & Team Events' },
  { num: '04', type: 'Graduation', tag: 'Years of Work, One Moment' },
]

export function EventTypes() {
  return (
    <section className="sec-pad" style={{
      background: 'var(--color-charcoal)',
      borderBottom: '1px solid var(--color-border-dark)',
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <Reveal>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
            gap: '2rem',
            flexWrap: 'wrap',
            marginBottom: '3rem',
          }}>
            <div>
              <p className="t-label" style={{ color: 'var(--color-amber)', marginBottom: '1.25rem' }}>
                What we do
              </p>
              <h2 className="t-heading" style={{
                color: 'var(--color-sand)',
                maxWidth: '13ch',
              }}>
                A 360 experience for <em>every occasion.</em>
              </h2>
            </div>
            <p className="t-body-dark" style={{
              color: 'var(--color-muted-light)',
              maxWidth: '34ch',
            }}>
              From private milestones to polished brand moments, the booth adapts to the room.
            </p>
          </div>
        </Reveal>

        <div>
          {events.map((ev, i) => (
            <Reveal key={ev.type} delay={i * 60}>
              <a
                href="/book"
                aria-label={`Book for your ${ev.type.toLowerCase()} event`}
                className="event-type-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto minmax(0, 1fr) minmax(140px, 220px) auto',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1.6rem 0',
                  borderTop: '1px solid var(--color-border-dark)',
                  textDecoration: 'none',
                  transition: 'color 0.22s ease, background 0.22s ease',
                }}
              >
                <span className="t-label" style={{
                  color: 'var(--color-muted-light)',
                  minWidth: '2.5rem',
                }}>
                  {ev.num}
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                  fontWeight: 400,
                  lineHeight: 1,
                  color: 'var(--color-sand)',
                }}>
                  {ev.type}
                </span>
                <span className="t-body-dark" style={{
                  color: 'var(--color-muted-light)',
                  textAlign: 'right',
                }}>
                  {ev.tag}
                </span>
                <span aria-hidden="true" style={{
                  color: 'var(--color-amber-light)',
                  fontSize: '1.4rem',
                  lineHeight: 1,
                }}>
                  →
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border-dark)',
        }}>
          <p className="t-body-dark" style={{ color: 'var(--color-muted-light)' }}>
            Not sure what fits your event?{' '}
            <a href="/book" style={{ color: 'var(--color-amber-light)', textDecoration: 'none', fontWeight: 600 }}>
              Book a consultation
            </a>
          </p>
        </div>
      </div>

      <style>{`
        .event-type-row:hover {
          background: color-mix(in srgb, var(--color-sand) 4%, transparent);
        }
        @media (max-width: 720px) {
          .event-type-row {
            grid-template-columns: auto minmax(0, 1fr) auto !important;
          }
          .event-type-row span:nth-child(3) {
            grid-column: 2 / -1;
            text-align: left !important;
          }
        }
      `}</style>
    </section>
  )
}

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
    <section style={{
      background: 'var(--color-charcoal)',
      borderBottom: '1px solid rgba(237,232,223,0.06)',
      padding: '6rem 0 0',
    }}>
      <div style={{ padding: '0 3rem', marginBottom: '4rem' }}>
        <Reveal>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(237,232,223,0.30)',
            marginBottom: '1.5rem',
          }}>
            What We Do
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 5.5vw, 5.5rem)',
            fontWeight: 900,
            lineHeight: 0.92,
            color: 'var(--color-sand)',
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            maxWidth: '600px',
          }}>
            The 360 Experience,
            <br />
            <span style={{ color: 'var(--color-amber)' }}>
              for Every Occasion.
            </span>
          </h2>
        </Reveal>
      </div>

      {/* Horizontal list — each event is a full-width row */}
      {events.map((ev, i) => (
        <Reveal key={ev.type} delay={i * 60}>
          <a
            href="/book"
            aria-label={`Book for your ${ev.type.toLowerCase()} event`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2rem 3rem',
              borderTop: '1px solid rgba(237,232,223,0.07)',
              textDecoration: 'none',
              transition: 'background 0.22s ease',
              cursor: 'pointer',
              gap: '2rem',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(237,232,223,0.03)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: 'rgba(237,232,223,0.20)',
              minWidth: '40px',
              flexShrink: 0,
            }}>
              {ev.num}
            </span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4.5vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1,
              color: 'var(--color-sand)',
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
              flex: 1,
            }}>
              {ev.type}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.7rem',
              fontWeight: 400,
              color: 'rgba(237,232,223,0.30)',
              letterSpacing: '0.02em',
              textAlign: 'right',
              maxWidth: '180px',
            }}>
              {ev.tag}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'rgba(237,232,223,0.25)',
              flexShrink: 0,
            }}>
              →
            </span>
          </a>
        </Reveal>
      ))}

      <div style={{ padding: '2rem 3rem', borderTop: '1px solid rgba(237,232,223,0.07)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(237,232,223,0.28)', fontWeight: 400 }}>
          Not sure what fits your event?{' '}
          <a href="/book" style={{ color: 'var(--color-amber)', textDecoration: 'none', fontWeight: 600 }}>
            Book a consultation →
          </a>
        </p>
      </div>
    </section>
  )
}

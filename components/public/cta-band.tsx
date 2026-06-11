import { Reveal } from './reveal'

export function CtaBand() {
  return (
    <section style={{
      background: 'var(--color-charcoal)',
      padding: '8rem 3rem',
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid var(--color-border-dark)',
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(var(--color-border-dark) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-dark) 1px, transparent 1px)',
        backgroundSize: '84px 84px',
        opacity: 0.42,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: '1240px', margin: '0 auto' }}>
        <Reveal>
          <p className="t-label" style={{
            color: 'var(--color-amber)',
            marginBottom: '1.5rem',
          }}>
            Ready to book
          </p>

          <h2 className="t-display" style={{
            color: 'var(--color-sand)',
            maxWidth: '12ch',
          }}>
            Some moments deserve <em>every angle.</em>
          </h2>

          <p className="t-body-dark" style={{
            color: 'var(--color-muted-light)',
            marginTop: '2rem',
            marginBottom: '2.5rem',
          }}>
            $150/hr, 1.5-hour minimum. Gallery delivered the same day. Serving Calgary, Airdrie, and surrounding areas.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/book" className="btn-primary">
              Book your experience
            </a>
            <a href="#pricing" className="btn-secondary" style={{
              color: 'var(--color-sand)',
              borderColor: 'var(--color-border-dark)',
            }}>
              View pricing
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

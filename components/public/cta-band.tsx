import { Reveal } from './reveal'

export function CtaBand() {
  return (
    <section style={{ padding: '6rem 3rem', background: 'var(--color-surface)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <Reveal>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 5.5rem)', fontWeight: 900, letterSpacing: '0.01em', lineHeight: 0.9, textTransform: 'uppercase', color: 'var(--color-text)' }}>
              Ready to Make it<br />
              <span style={{ color: 'var(--color-crimson)' }}>Unforgettable?</span>
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'rgba(245,240,234,0.45)', fontWeight: 300, marginTop: '1.25rem', maxWidth: '380px', lineHeight: 1.75 }}>
              Book your 360 experience — $150/hr, 1.5 hr minimum. Calgary and surrounding areas.
            </p>
          </div>
          <a href="/book" className="btn-primary" style={{ whiteSpace: 'nowrap', flexShrink: 0, padding: '1.1rem 2.5rem', fontSize: '1rem' }}>
            Book Your Experience
          </a>
        </div>
      </Reveal>
    </section>
  )
}

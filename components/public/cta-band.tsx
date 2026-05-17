import { Reveal } from './reveal'

export function CtaBand() {
  return (
    <section style={{ padding: '6rem 3rem', background: '#0F0F0F', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <Reveal>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#fff' }}>
              Ready to Make it<br />
              <span style={{ background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Unforgettable?
              </span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300, marginTop: '1rem', maxWidth: '380px', lineHeight: 1.75 }}>
              Book your 360 experience — $150/hr, 1.5 hr minimum. Calgary and surrounding areas.
            </p>
          </div>
          <a
            href="/book"
            style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: '#fff', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
              padding: '1.25rem 2.75rem', textDecoration: 'none', display: 'inline-block',
              whiteSpace: 'nowrap',
            }}
          >
            Book Your Experience
          </a>
        </div>
      </Reveal>
    </section>
  )
}

import { Reveal } from './reveal'

const D = 'rgba(255,255,255,0.07)'

const testimonials = [
  { name: 'Aisha M.', event: 'Birthday Party · Calgary', quote: 'The 360 booth was the highlight of my birthday — everyone was obsessed. The video quality was incredible and we had our gallery link the same night.' },
  { name: 'Jordan & Kezia T.', event: 'Wedding Reception · Airdrie', quote: 'We added firecrackers and honestly it was the most fun part of the whole reception. Worth every penny. The team was professional and so easy to work with.' },
  { name: 'Priya S.', event: 'Corporate Event · Downtown Calgary', quote: "Booked for our company's holiday party. The booking process was seamless, the team showed up early, and the videos looked amazing. Will book again." },
]

export function Testimonials() {
  return (
    <section style={{ padding: '6rem 3rem', background: 'var(--color-surface)', borderBottom: `1px solid ${D}` }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.75rem' }}>Testimonials</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: '0.01em', lineHeight: 0.9, textTransform: 'uppercase', color: 'var(--color-text)', marginBottom: '4rem' }}>
          What People Say
        </h2>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: D }}>
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 80}>
            <div style={{ padding: '2.5rem', background: 'var(--color-surface)' }}>
              <p style={{ fontSize: '0.9rem', color: 'rgba(245,240,234,0.65)', lineHeight: 1.85, fontWeight: 300, fontStyle: 'italic', marginBottom: '2rem' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div style={{ borderTop: `1px solid ${D}`, paddingTop: '1.25rem' }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>{t.name}</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-crimson)', marginTop: '0.3rem' }}>{t.event}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

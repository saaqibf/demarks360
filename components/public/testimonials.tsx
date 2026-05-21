import { Reveal } from './reveal'

const testimonials = [
  { name: 'Aisha M.', event: 'Birthday Party · Calgary', quote: 'The 360 booth was the highlight of my birthday — everyone was obsessed. The video quality was incredible and we had our gallery link the same night.' },
  { name: 'Jordan & Kezia T.', event: 'Wedding Reception · Airdrie', quote: 'We added firecrackers and honestly it was the most fun part of the whole reception. Worth every penny. The team was professional and so easy to work with.' },
  { name: 'Priya S.', event: 'Corporate Event · Downtown Calgary', quote: "Booked for our company's holiday party. The booking process was seamless, the team showed up early, and the videos looked amazing. Will book again." },
]

export function Testimonials() {
  return (
    <section className="sec-pad sec-light" style={{ borderBottom: '1px solid rgba(28,25,23,0.08)' }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.75rem' }}>Testimonials</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(3rem, 6vw, 6rem)',
          fontWeight: 700,
          fontStyle: 'italic',
          letterSpacing: '0.01em',
          lineHeight: 0.92,
          color: 'var(--color-ink-warm)',
          marginBottom: '4rem',
        }}>
          Heard From<br />
          <em style={{ fontStyle: 'normal', color: 'var(--color-crimson)', fontFamily: 'var(--font-display)', fontSize: '0.85em', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Our Clients
          </em>
        </h2>
      </Reveal>

      <div className="testi-grid">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 80}>
            <div style={{ padding: '3rem 2.5rem', background: 'var(--color-cream)', position: 'relative' }}>
              <div aria-hidden="true" style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '7rem',
                lineHeight: 0.65,
                color: 'var(--color-crimson)',
                opacity: 0.14,
                userSelect: 'none',
                marginBottom: '1rem',
                fontStyle: 'italic',
                fontWeight: 700,
              }}>
                &#8220;
              </div>

              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.1rem',
                fontStyle: 'italic',
                color: 'var(--color-ink-warm)',
                lineHeight: 1.72,
                fontWeight: 400,
                marginBottom: '2.5rem',
              }}>
                {t.quote}
              </p>

              <div style={{ borderTop: '1px solid rgba(28,25,23,0.08)', paddingTop: '1.25rem' }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-ink-warm)' }}>{t.name}</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-crimson)', marginTop: '0.3rem' }}>{t.event}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

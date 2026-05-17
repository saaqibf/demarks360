import { Reveal } from './reveal'

const testimonials = [
  { name: 'Aisha M.', event: 'Birthday Party · Calgary', quote: 'The 360 booth was the highlight of my birthday — everyone was obsessed. The video quality was incredible and we had our gallery link the same night.' },
  { name: 'Jordan & Kezia T.', event: 'Wedding Reception · Airdrie', quote: 'We added firecrackers and honestly it was the most fun part of the whole reception. Worth every penny. The team was professional and so easy to work with.' },
  { name: 'Priya S.', event: 'Corporate Event · Downtown Calgary', quote: "Booked for our company's holiday party. The booking process was seamless, the team showed up early, and the videos looked amazing. Will book again." },
]

export function Testimonials() {
  return (
    <section style={{ padding: '6rem 3rem', borderBottom: '1px solid rgba(15,15,15,0.10)', background: '#0F0F0F' }}>
      <Reveal>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
          Testimonials
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#fff', marginBottom: '4rem' }}>
          What People Say
        </h2>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 80}>
            <div style={{ padding: '2.5rem', background: '#0F0F0F' }}>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontWeight: 300, fontStyle: 'italic', marginBottom: '2rem' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{t.name}</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: '0.25rem' }}>{t.event}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

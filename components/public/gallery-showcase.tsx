import { Reveal } from './reveal'

export function GalleryShowcase() {
  const placeholders = Array.from({ length: 6 }, (_, i) => i)

  return (
    <section id="gallery" style={{ padding: '6rem 3rem', borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
      <Reveal>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
          Gallery
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '3rem' }}>
          From Our Events
        </h2>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(15,15,15,0.10)' }}>
        {placeholders.map((i) => (
          <Reveal key={i} delay={i * 60}>
            <div style={{
              aspectRatio: '9/16',
              background: i % 3 === 1 ? '#0F0F0F' : '#E8E4DC',
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', opacity: 0.08, color: i % 3 === 1 ? '#fff' : '#0F0F0F' }}>360</span>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={100}>
        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.78rem', color: '#888880', fontWeight: 300 }}>
          Videos are added after each event. Your gallery will be ready the same day.
        </p>
      </Reveal>
    </section>
  )
}

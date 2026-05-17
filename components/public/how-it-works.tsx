import { Reveal } from './reveal'

const steps = [
  {
    num: '01',
    title: 'Browse & Pick Your Hours',
    desc: 'Choose how long you need the booth — minimum 1.5 hours, no maximum. $150/hour, simple.',
    bullets: ['No hidden fees', 'Instant price calculation', 'Add firecrackers', 'Secure checkout'],
  },
  {
    num: '02',
    title: 'Choose Your Date & Time',
    desc: "Pick from available slots on our live calendar. See exactly what's taken so you can plan around it.",
    bullets: ['7-day advance booking', 'Real-time availability', 'Two events per day max', '30-min slot increments'],
  },
  {
    num: '03',
    title: 'Secure With a Deposit',
    desc: 'Pay 30% upfront to hold your date. Your card is saved — the remaining 70% is charged automatically 7 days before your event.',
    bullets: ['30% deposit today', 'Card saved securely', '70% auto-charged at 7 days', 'Full receipt emailed'],
  },
  {
    num: '04',
    title: 'We Show Up & Shoot',
    desc: 'Our team arrives, sets up, and captures every angle. After the event, your gallery link is ready to share.',
    bullets: ['Professional setup', 'Unlimited takes', 'Same-day gallery link', 'Download & share freely'],
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '6rem 3rem', borderBottom: '1px solid rgba(15,15,15,0.10)', background: '#FAF8F4' }}>
      <Reveal>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
          Process
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F' }}>
          How It Works
        </h2>
      </Reveal>

      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(15,15,15,0.10)', marginTop: '4rem' }}>
        {steps.map((step, i) => (
          <Reveal key={step.num} delay={i * 80}>
            <div
              className="hiw-step-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr 1fr',
                alignItems: 'center',
                borderBottom: i < steps.length - 1 ? '1px solid rgba(15,15,15,0.10)' : undefined,
                transition: 'background 0.35s',
                cursor: 'default',
              }}
            >
              {/* Step number */}
              <div style={{ padding: '3rem 2rem', borderRight: '1px solid rgba(15,15,15,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '5.5rem', lineHeight: 1,
                  background: 'linear-gradient(135deg,#EC4899,#8B5CF6)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  opacity: 0.15, transition: 'opacity 0.4s',
                  display: 'block',
                }}
                  data-hiw-num
                >
                  {step.num}
                </span>
              </div>

              {/* Title + desc */}
              <div style={{ padding: '2.5rem 3rem', borderRight: '1px solid rgba(15,15,15,0.10)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', letterSpacing: '0.04em', color: '#0F0F0F', marginBottom: '0.75rem' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#3A3A3A', lineHeight: 1.75, fontWeight: 300 }}>
                  {step.desc}
                </p>
              </div>

              {/* Bullets */}
              <div style={{ padding: '2.5rem 3rem' }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {step.bullets.map((b) => (
                    <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: '#3A3A3A' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'linear-gradient(135deg,#EC4899,#8B5CF6)', flexShrink: 0, display: 'inline-block' }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

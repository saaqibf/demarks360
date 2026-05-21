import { Reveal } from './reveal'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  { q: 'How much does it cost?', a: '$150 per hour with a 1.5-hour minimum. So the minimum booking is $225. Add firecrackers for $75 flat.' },
  { q: 'How far in advance do I need to book?', a: 'We require at least 7 days notice. This gives us time to prepare, confirm your slot, and make sure everything is perfect for your event.' },
  { q: 'Where do you serve?', a: 'We serve Calgary, Airdrie, Cochrane, Chestermere, Okotoks, and Rocky View County. A $50 travel fee applies for events outside Calgary city limits.' },
  { q: 'How does payment work?', a: 'You pay a 30% deposit when booking to hold your date. We save your card securely — the remaining 70% is automatically charged 7 days before your event.' },
  { q: 'What if I need to cancel or reschedule?', a: 'Your deposit is non-refundable — it exists to protect your date. However, we offer free rescheduling if you request it at least 7 days before your event, subject to availability.' },
  { q: 'When do I get my videos?', a: 'We send you a shareable gallery link the same day as your event. You and all your guests can view and download every video from the link — no login required.' },
  { q: 'How many videos will I get?', a: 'It depends on how many takes your guests do — events typically produce 50–150+ videos. Every take is captured and added to your gallery.' },
]

export function Faq() {
  return (
    <section id="faq" className="sec-pad sec-light" style={{ borderBottom: '1px solid rgba(28,25,23,0.08)' }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.75rem' }}>FAQ</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(3rem, 6vw, 6rem)',
          fontWeight: 700,
          fontStyle: 'italic',
          letterSpacing: '0.01em',
          lineHeight: 0.92,
          color: 'var(--color-ink-warm)',
          marginBottom: '3rem',
        }}>
          Common<br />
          <em style={{ fontStyle: 'normal', color: 'var(--color-crimson)', fontFamily: 'var(--font-display)', fontSize: '0.85em', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Questions
          </em>
        </h2>
      </Reveal>

      <Reveal delay={100}>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} style={{ borderBottom: '1px solid rgba(28,25,23,0.1)' }}>
              <AccordionTrigger style={{ fontFamily: 'var(--font-ui)', fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-ink-warm)', textAlign: 'left', padding: '1.5rem 0' }}>
                {faq.q}
              </AccordionTrigger>
              <AccordionContent style={{ fontSize: '0.88rem', color: 'var(--color-muted-warm)', lineHeight: 1.85, fontWeight: 300, paddingBottom: '1.5rem' }}>
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  )
}

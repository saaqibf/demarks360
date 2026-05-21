import { Reveal } from './reveal'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  { q: 'How much does it cost?', a: '$150 per hour with a 1.5-hour minimum. So the minimum booking is $225. Add firecrackers for $75 flat.' },
  { q: 'How far in advance do I need to book?', a: 'We require at least 7 days notice. This gives us time to prepare, confirm your slot, and make sure everything is perfect for your event.' },
  { q: 'Where do you serve?', a: 'We serve Calgary, Airdrie, Cochrane, Chestermere, Okotoks, and Rocky View County. A $50 travel fee applies for events outside Calgary city limits.' },
  { q: 'How does payment work?', a: 'You pay a 30% deposit when booking to hold your date. Your card is saved securely, and the remaining 70% is automatically charged 7 days before your event.' },
  { q: 'What if I need to cancel or reschedule?', a: 'Your deposit is non-refundable since it holds your date exclusively. That said, we offer free rescheduling if you give us at least 7 days notice, subject to availability.' },
  { q: 'When do I get my videos?', a: 'You get a shareable gallery link the same day as your event. You and all your guests can view and download every video straight from the link. No login needed.' },
  { q: 'How many videos will I get?', a: 'It depends on how many takes your guests want to do. Most events end up with 50 to 150+ videos. Every single take is captured and added to your gallery automatically.' },
]

export function Faq() {
  return (
    <section id="faq" className="sec-pad" style={{ background: 'var(--color-sand)', borderBottom: '1px solid var(--color-border-light)' }}>
      <Reveal>
        <p className="section-label" style={{ marginBottom: '0.85rem' }}>FAQ</p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          lineHeight: 1.0,
          color: 'var(--color-charcoal)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}>
          Common
        </h2>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 5vw, 5rem)',
          fontWeight: 400,
          fontStyle: 'italic',
          lineHeight: 1.0,
          color: 'var(--color-amber)',
          marginBottom: '3.5rem',
          letterSpacing: '-0.02em',
        }}>
          Questions
        </p>
      </Reveal>

      <Reveal delay={100}>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              style={{ borderBottom: '1px solid var(--color-border-light)' }}
            >
              <AccordionTrigger style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--color-charcoal)',
                textAlign: 'left',
                padding: '1.5rem 0',
              }}>
                {faq.q}
              </AccordionTrigger>
              <AccordionContent style={{
                fontSize: '0.9rem',
                color: 'var(--color-muted)',
                lineHeight: 1.85,
                fontWeight: 400,
                paddingBottom: '1.5rem',
                fontFamily: 'var(--font-body)',
              }}>
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  )
}

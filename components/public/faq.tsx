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
    <section id="faq" style={{ background: 'var(--color-sand)', borderBottom: '1px solid var(--color-border-light)' }}>
      {/* Header */}
      <div style={{ padding: '6rem 3rem 4rem', borderBottom: '1px solid var(--color-border-light)' }}>
        <Reveal>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-muted-light)',
            marginBottom: '1.25rem',
          }}>
            FAQ
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            fontWeight: 300,
            lineHeight: 1.0,
            color: 'var(--color-charcoal)',
            letterSpacing: '-0.025em',
          }}>
            Common questions,{' '}
            <em style={{ color: 'var(--color-amber)' }}>answered.</em>
          </h2>
        </Reveal>
      </div>

      {/* Accordion */}
      <div style={{ padding: '0 3rem 6rem', maxWidth: '860px' }}>
        <Reveal delay={80}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                style={{ borderBottom: '1px solid var(--color-border-light)' }}
              >
                <AccordionTrigger style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)',
                  fontWeight: 400,
                  color: 'var(--color-charcoal)',
                  textAlign: 'left',
                  padding: '1.75rem 0',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                }}>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  color: 'var(--color-muted)',
                  lineHeight: 1.8,
                  fontWeight: 400,
                  paddingBottom: '1.75rem',
                }}>
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}

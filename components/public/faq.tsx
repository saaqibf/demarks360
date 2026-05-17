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
    <section id="faq" style={{ padding: '6rem 3rem', borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
      <Reveal>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
          FAQ
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '3rem' }}>
          Common Questions
        </h2>
      </Reveal>

      <Reveal delay={100}>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} style={{ borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
              <AccordionTrigger style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', fontWeight: 600, color: '#0F0F0F', textAlign: 'left', padding: '1.5rem 0' }}>
                {faq.q}
              </AccordionTrigger>
              <AccordionContent style={{ fontSize: '0.85rem', color: '#3A3A3A', lineHeight: 1.8, fontWeight: 300, paddingBottom: '1.5rem' }}>
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  )
}

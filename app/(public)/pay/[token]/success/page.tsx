import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBookingByPayToken } from '@/lib/db/queries/bookings'
import { stripe } from '@/lib/stripe'
import { SiteNav } from '@/components/public/site-nav'
import { SiteFooter } from '@/components/public/site-footer'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ session_id?: string }>
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function money(v: string | number | null): string {
  return `$${Number(v ?? 0).toFixed(2)}`
}

function Panel({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '7rem 2rem 5rem' }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', marginBottom: '0.75rem' }}>
        {eyebrow}
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, lineHeight: 1, color: 'var(--color-text-light)', marginBottom: '1.25rem' }}>
        {title}
      </h1>
      <p style={{ fontSize: '0.92rem', color: 'rgba(245,240,234,0.55)', lineHeight: 1.75, fontWeight: 300, marginBottom: '2rem' }}>
        {body}
      </p>
      <Link href="/" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-charcoal)', background: 'var(--color-amber-light)', borderRadius: '999px', padding: '0.85rem 1.5rem', textDecoration: 'none', display: 'inline-block' }}>
        Back to Home
      </Link>
    </div>
  )
}

export default async function PaySuccessPage({ params, searchParams }: PageProps) {
  const { token } = await params
  const { session_id: sessionId } = await searchParams

  const row = await getBookingByPayToken(token)
  if (!row?.booking || !sessionId) notFound()
  const { booking: b } = row

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>> | null = null
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (err) {
    // A bad or foreign session id must not leak anything; treat it like a missing page
    console.error('[pay/success] failed to retrieve checkout session:', err)
  }
  // The session must belong to this booking; the query param alone is never trusted
  if (!session || session.metadata?.bookingId !== b.id) notFound()

  let panel: React.ReactNode
  if (session.payment_status === 'paid') {
    const purpose = session.metadata?.purpose
    const total = Number(b.depositAmount ?? 0) + Number(b.balanceAmount ?? 0)
    panel = purpose === 'balance' ? (
      <Panel
        eyebrow="Payment received"
        title="You are fully paid"
        body={`Your second payment of ${money(b.balanceAmount)} went through, thank you! Your ${fmtDate(b.eventDate)} booking is fully paid and we will see you there. A receipt is on its way to your inbox.`}
      />
    ) : purpose === 'full' ? (
      <Panel
        eyebrow="Paid in full"
        title="You are booked"
        body={`Your payment of ${money(total)} went through and ${fmtDate(b.eventDate)} is officially yours. There is nothing left to pay. A confirmation email is on its way.`}
      />
    ) : (
      <Panel
        eyebrow="First payment received"
        title="Your date is locked in"
        body={`Thank you! ${fmtDate(b.eventDate)} is officially yours. The second payment of ${money(b.balanceAmount)} is due the day before your event, and we will email you a reminder. A confirmation email is on its way.`}
      />
    )
  } else {
    panel = (
      <Panel
        eyebrow="Almost there"
        title="Payment processing"
        body="Your payment is still processing. You will get an email shortly once it goes through."
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ink)' }}>
      <SiteNav />
      {panel}
      <SiteFooter />
    </div>
  )
}

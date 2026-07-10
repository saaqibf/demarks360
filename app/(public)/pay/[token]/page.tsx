import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBookingByPayToken } from '@/lib/db/queries/bookings'
import { ADDON_CATALOG } from '@/lib/pricing'
import { SiteNav } from '@/components/public/site-nav'
import { SiteFooter } from '@/components/public/site-footer'
import { PayPanel } from './pay-panel'

// Payment state must always reflect the live booking row, never a cached render
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ token: string }>
}

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function money(v: string | number | null): string {
  return `$${Number(v ?? 0).toFixed(2)}`
}

function StatusMessage({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
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
      <Link href="/book" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-charcoal)', background: 'var(--color-amber-light)', borderRadius: '999px', padding: '0.85rem 1.5rem', textDecoration: 'none', display: 'inline-block' }}>
        Check availability
      </Link>
    </div>
  )
}

export default async function PayPage({ params }: PageProps) {
  const { token } = await params
  const row = await getBookingByPayToken(token)
  if (!row?.booking) notFound()

  const { booking: b } = row
  const now = Date.now()
  const windowOpen = !!b.depositExpiresAt && b.depositExpiresAt.getTime() > now

  let content: React.ReactNode

  if (b.status === 'approved' && windowOpen && !b.depositPaidAt) {
    const subtotal = Number(b.depositAmount ?? 0) + Number(b.balanceAmount ?? 0)
    const addOnItems = (b.addOns as string[])
      .filter((id) => id in ADDON_CATALOG)
      .map((id) => ({ label: ADDON_CATALOG[id].name, amount: `$${ADDON_CATALOG[id].price.toFixed(2)}` }))
    const lineItems = [
      { label: `${(b.durationMinutes / 60).toFixed(1).replace('.0', '')} hours of 360 booth`, amount: '' },
      ...addOnItems,
      ...(Number(b.travelSurcharge) > 0 ? [{ label: 'Travel surcharge', amount: money(b.travelSurcharge) }] : []),
    ]
    content = (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', marginBottom: '0.75rem' }}>
          Lock in your date
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, lineHeight: 1, color: 'var(--color-text-light)', marginBottom: '2rem' }}>
          Pay your deposit
        </h1>

        <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'var(--color-surface)', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--color-text-light)' }}>
              {fmtDate(b.eventDate)}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'rgba(245,240,234,0.6)', marginTop: '0.25rem' }}>
              {fmtTime(b.startTime)} → {fmtTime(b.endTime)} · {b.locationCity}
            </p>
          </div>
          {lineItems.map(({ label, amount }) => (
            <div key={label} style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'rgba(245,240,234,0.55)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--color-text-light)', fontWeight: 600 }}>{amount}</span>
            </div>
          ))}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'rgba(245,240,234,0.4)' }}>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--color-text-light)' }}>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ padding: '1.25rem 1.5rem', background: 'var(--color-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Deposit due now (50%)</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>
                Balance of {money(b.balanceAmount)} (50%) due on your event day
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-amber-light)', fontWeight: 500 }}>
              {money(b.depositAmount)}
            </span>
          </div>
        </div>

        <PayPanel token={token} purpose="deposit" amount={money(b.depositAmount)} />
      </div>
    )
  } else if (b.status === 'expired' || (b.status === 'approved' && !b.depositPaidAt)) {
    content = (
      <StatusMessage
        eyebrow="Link expired"
        title="This payment link has expired"
        body="This payment link has expired and the date was released. Reply to our email or submit a new request."
      />
    )
  } else if (b.status === 'confirmed' && !b.balanceChargedAt) {
    content = (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', marginBottom: '0.75rem' }}>
          One payment left
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, lineHeight: 1, color: 'var(--color-text-light)', marginBottom: '2rem' }}>
          Pay your balance
        </h1>
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'var(--color-surface)', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--color-text-light)' }}>
              {fmtDate(b.eventDate)}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'rgba(245,240,234,0.6)', marginTop: '0.25rem' }}>
              {fmtTime(b.startTime)} → {fmtTime(b.endTime)} · {b.locationCity}
            </p>
          </div>
          <div style={{ padding: '1.25rem 1.5rem', background: 'var(--color-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Remaining balance</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>
                Deposit of {money(b.depositAmount)} already paid
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-amber-light)', fontWeight: 500 }}>
              {money(b.balanceAmount)}
            </span>
          </div>
        </div>
        <PayPanel token={token} purpose="balance" amount={money(b.balanceAmount)} />
      </div>
    )
  } else if (b.status === 'confirmed') {
    content = (
      <StatusMessage
        eyebrow="Fully paid"
        title="All paid, see you at your event"
        body={`Your booking for ${fmtDate(b.eventDate)} is fully paid. Nothing left to do, we will see you there.`}
      />
    )
  } else if (b.status === 'requested') {
    content = (
      <StatusMessage
        eyebrow="In review"
        title="Your request is still in review"
        body="We review every request within 24 hours. Once approved, this page becomes your payment page and we will email you."
      />
    )
  } else if (b.status === 'declined') {
    content = (
      <StatusMessage
        eyebrow="Request declined"
        title="We could not take this date"
        body="We were not able to take this booking, so there is nothing to pay. You are welcome to request another date."
      />
    )
  } else if (b.status === 'cancelled') {
    content = (
      <StatusMessage
        eyebrow="Cancelled"
        title="This booking was cancelled"
        body="There is nothing to pay on a cancelled booking. Want to rebook? Check availability for a new date."
      />
    )
  } else {
    content = (
      <StatusMessage
        eyebrow="Nothing due"
        title="No payment is due"
        body="There is nothing to pay on this booking right now. If that seems wrong, reply to our email and we will sort it out."
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ink)' }}>
      <SiteNav />
      {content}
      <SiteFooter />
    </div>
  )
}

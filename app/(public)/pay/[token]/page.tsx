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
    const firstPayment = Number(b.depositAmount ?? 0)
    const secondPayment = Number(b.balanceAmount ?? 0)
    const total = firstPayment + secondPayment
    const hours = (b.durationMinutes / 60).toFixed(1).replace('.0', '')
    const included = [
      `${hours} hours of the 360 booth`,
      ...(b.addOns as string[]).filter((id) => id in ADDON_CATALOG).map((id) => ADDON_CATALOG[id].name),
    ]
    const holdUntil = b.depositExpiresAt!.toLocaleString('en-CA', {
      timeZone: 'America/Edmonton', weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
    })
    content = (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '6rem 1.5rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', marginBottom: '0.75rem' }}>
          Your quote
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, lineHeight: 1, color: 'var(--color-text-light)', marginBottom: '1rem' }}>
          Lock in your date
        </h1>
        <p className="pay-hold">
          We are holding this date for you until <strong>{holdUntil}</strong>. After that it opens back up for other bookings.
        </p>

        <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'var(--color-surface)', marginBottom: '2rem', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--color-text-light)' }}>
              {fmtDate(b.eventDate)}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'rgba(245,240,234,0.7)', marginTop: '0.25rem' }}>
              {fmtTime(b.startTime)} to {fmtTime(b.endTime)} · {b.locationCity}
            </p>
          </div>
          {included.map((label) => (
            <div key={label} style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.92rem', color: 'rgba(245,240,234,0.75)' }}>✓ {label}</span>
            </div>
          ))}
          <div style={{ padding: '1.25rem 1.5rem', background: 'var(--color-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Total</p>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-amber-light)', fontWeight: 500 }}>
              {money(total)}
            </span>
          </div>
        </div>

        <PayPanel token={token} purpose="quote" total={total} firstPayment={firstPayment} secondPayment={secondPayment} />
      </div>
    )
  } else if (b.status === 'expired' || (b.status === 'approved' && !b.depositPaidAt)) {
    content = (
      <StatusMessage
        eyebrow="Hold ended"
        title="The hold on this date has ended"
        body="We could not keep the date held any longer, so it opened back up. It may still be free: reply to our email or call or text 403 402 0816 and we will check right away."
      />
    )
  } else if (b.status === 'confirmed' && !b.balanceChargedAt) {
    content = (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', marginBottom: '0.75rem' }}>
          One payment left
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, lineHeight: 1, color: 'var(--color-text-light)', marginBottom: '2rem' }}>
          Your second payment
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
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Second payment</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>
                First payment of {money(b.depositAmount)} already received, thank you
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-amber-light)', fontWeight: 500 }}>
              {money(b.balanceAmount)}
            </span>
          </div>
        </div>
        <PayPanel token={token} purpose="balance" amount={Number(b.balanceAmount ?? 0)} />
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
        body="We reply to every request within 24 hours. When your quote is ready we will email you, and this page is where you can book."
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

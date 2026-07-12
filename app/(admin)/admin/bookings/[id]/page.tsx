import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBookingWithCustomer } from '@/lib/db/queries/bookings'
import { APP_URL } from '@/lib/app-url'
import { BookingActions } from './booking-actions'
import { DriveImport } from './drive-import'
import { DeviceUpload } from './device-upload'
import { statusLabel } from '@/lib/admin-status'

function fmt(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params
  const row = await getBookingWithCustomer(id)
  if (!row) notFound()

  const { booking: b, customer: c } = row
  const payUrl = b.payToken ? `${APP_URL}/pay/${b.payToken}` : null
  const fmtTimestamp = (d: Date | null) =>
    d ? d.toLocaleString('en-CA', { timeZone: 'America/Edmonton', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : null
  const balanceDate = b.balanceChargeDate
    ? new Date(b.balanceChargeDate + 'T00:00:00').toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="adm-page" style={{ maxWidth: '900px' }}>
      {/* Back */}
      <Link href="/admin/dashboard" className="adm-link" style={{ marginBottom: '1.5rem' }}>
        ← All Bookings
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p className="adm-eyebrow" style={{ color: 'var(--color-muted-light)', marginBottom: '0.4rem' }}>
            Booking · {b.id.slice(0, 12).toUpperCase()}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--color-text-light)', lineHeight: 1, marginBottom: '0.5rem' }}>
            {c?.name ?? 'Unknown customer'}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-muted-light)' }}>{fmtDate(b.eventDate)}</p>
        </div>
        <span className={`adm-pill adm-pill--${b.status}`}>
          {statusLabel(b.status)}
        </span>
      </div>

      <div className="admin-2col" style={{ marginBottom: '1rem' }}>
        {/* Event info */}
        <div className="adm-card">
          <p className="adm-card-label">Event</p>
          {[
            { label: 'Date', value: fmtDate(b.eventDate) },
            { label: 'Time', value: `${fmt(b.startTime)} → ${fmt(b.endTime)}` },
            { label: 'Type', value: b.eventType },
            ...(b.eventName ? [{ label: 'Event Name', value: b.eventName }] : []),
            ...(b.designNotes ? [{ label: 'Design Notes', value: b.designNotes }] : []),
            { label: 'Address', value: `${b.locationAddress}, ${b.locationCity}` },
            { label: 'Add-ons', value: (b.addOns as string[]).join(', ') || 'None' },
          ].map(({ label, value }) => (
            <div key={label} className="adm-row">
              <span className="adm-row-label">{label}</span>
              <span className="adm-row-value">{value}</span>
            </div>
          ))}
        </div>

        {/* Customer + payment info */}
        <div className="adm-card">
          <p className="adm-card-label">Customer &amp; Payment</p>
          {[
            { label: 'Name', value: c?.name ?? 'Not set' },
            { label: 'Email', value: c?.email ?? 'Not set' },
            { label: 'Phone', value: c?.phone ?? 'Not set' },
            { label: 'Deposit Paid', value: `$${Number(b.depositAmount ?? 0).toFixed(2)}` },
            { label: 'Balance Due', value: `$${Number(b.balanceAmount ?? 0).toFixed(2)}` },
            { label: 'Balance Date', value: balanceDate ?? 'Not set' },
            { label: 'Gallery Token', value: b.galleryToken ?? 'Not set' },
          ].map(({ label, value }) => (
            <div key={label} className="adm-row">
              <span className="adm-row-label">{label}</span>
              <span className="adm-row-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 360 Design Preferences — helpful context to read before deciding */}
      {b.eventPreferences && (() => {
        type Prefs = {
          backgroundColorTheme?: string
          designThemeTags?: string[]
          songPreference?: string
          videoType?: string
          videoDuration?: number
          slomoBoomerang?: boolean
        }
        const p = b.eventPreferences as Prefs
        const rows = [
          p.videoType && { label: 'Video Format', value: p.videoType === 'slomo' ? 'Slow Motion' : 'Video' },
          p.videoDuration && { label: 'Clip Duration', value: `${p.videoDuration}s${p.slomoBoomerang ? ' + boomerang loop' : ''}` },
          p.backgroundColorTheme && { label: 'Color Theme', value: p.backgroundColorTheme },
          p.designThemeTags?.length && { label: 'Vibe / Theme', value: p.designThemeTags.join(', ') },
          p.songPreference && { label: 'Song', value: p.songPreference },
        ].filter(Boolean) as { label: string; value: string }[]
        if (!rows.length) return null
        return (
          <div className="adm-card" style={{ marginTop: '1rem' }}>
            <p className="adm-card-label" style={{ color: 'var(--color-amber)' }}>360 Design Preferences</p>
            {rows.map(({ label, value }) => (
              <div key={label} className="adm-row">
                <span className="adm-row-label">{label}</span>
                <span className="adm-row-value" style={{ color: 'var(--color-amber-light)' }}>{value}</span>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Actions — read the essentials above, then decide here */}
      <div className="adm-card" style={{ marginTop: '1rem' }}>
        <p className="adm-card-label">
          Actions
        </p>
        <BookingActions
          bookingId={b.id}
          currentStatus={b.status}
          currentNotes={b.notes ?? ''}
          payUrl={payUrl}
          customerName={c?.name ?? null}
          depositAmount={String(b.depositAmount ?? 0)}
          balanceAmount={String(b.balanceAmount ?? 0)}
          depositExpiresAt={fmtTimestamp(b.depositExpiresAt)}
          depositPaidAt={fmtTimestamp(b.depositPaidAt)}
          autoPayOptIn={b.autoPayOptIn}
          balancePaid={!!b.balanceChargedAt}
        />
      </div>

      {/* After the event — for the videographer */}
      <div className="adm-card" style={{ marginTop: '1rem' }}>
        <p className="adm-card-label" style={{ marginBottom: '0.4rem' }}>After the event</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-muted-light)', marginBottom: '1.5rem' }}>
          For the videographer. Upload the finished video and share the gallery link.
        </p>

        <div className="admin-2col">
          <DeviceUpload bookingId={b.id} />
          <DriveImport bookingId={b.id} />
        </div>

        {b.galleryToken && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-dark)' }}>
            <p className="adm-card-label" style={{ marginBottom: '0.75rem' }}>
              Client Gallery Link
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-muted-light)', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
              {process.env.NEXT_PUBLIC_APP_URL ?? 'https://demarks360.vercel.app'}/gallery/{b.galleryToken}
            </p>
            <Link href={`/gallery/${b.galleryToken}`} target="_blank" className="adm-link">
              Preview Gallery →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBookingWithCustomer, getReferrer, countReferralsFrom } from '@/lib/db/queries/bookings'
import { APP_URL } from '@/lib/app-url'
import { BookingActions } from './booking-actions'
import { DriveImport } from './drive-import'
import { DeviceUpload } from './device-upload'
import { GalleryQr } from '@/components/admin/gallery-qr'
import { TouchpixConnect } from '@/components/admin/touchpix-connect'
import { ClipCurator, type CuratorClip } from '@/components/admin/clip-curator'
import { fetchTouchpixGallery } from '@/lib/touchpix'
import { statusLabel } from '@/lib/admin-status'
import { isPaidInFull } from '@/lib/pricing/paid-in-full'

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
  const [referrer, referralCount] = await Promise.all([getReferrer(id), countReferralsFrom(id)])

  // Clips for the curator (feature/hide), loaded live from the connected Touchpix gallery
  let curatorClips: CuratorClip[] = []
  if (b.touchpixGalleryUrl) {
    try {
      const g = await fetchTouchpixGallery(b.touchpixGalleryUrl)
      curatorClips = g.items.map(i => ({ videoUrl: i.videoUrl, thumbnailUrl: i.thumbnailUrl, capturedAt: i.capturedAt }))
    } catch { /* leave empty if Touchpix is unreachable */ }
  }
  const payUrl = b.payToken ? `${APP_URL}/pay/${b.payToken}` : null
  const fmtTimestamp = (d: Date | null) =>
    d ? d.toLocaleString('en-CA', { timeZone: 'America/Edmonton', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : null
  const balanceDate = b.balanceChargeDate
    ? new Date(b.balanceChargeDate + 'T00:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })
    : null
  const phoneDigits = c?.phone?.replace(/\D/g, '') ?? ''
  const telHref = phoneDigits.length === 10 ? `tel:+1${phoneDigits}` : phoneDigits ? `tel:+${phoneDigits}` : null

  return (
    <div className="adm-page" style={{ maxWidth: '900px' }}>
      {/* Back */}
      <Link href="/admin/dashboard" className="adm-link" style={{ marginBottom: '1.5rem' }}>
        ← All Bookings
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p className="adm-eyebrow" style={{ color: 'var(--adm-text-2)', marginBottom: '0.4rem' }}>
            Booking · {b.id.slice(0, 12).toUpperCase()}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--adm-text)', lineHeight: 1, marginBottom: '0.5rem' }}>
            {c?.name ?? 'Unknown customer'}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--adm-text-2)' }}>{fmtDate(b.eventDate)}</p>
        </div>
        <span className={`adm-pill adm-pill--${b.status}`}>
          {statusLabel(b.status)}
        </span>
      </div>

      {(referrer || referralCount > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          {referrer && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--adm-text-2)' }}>
              Referred by{' '}
              <Link href={`/admin/bookings/${referrer.booking.id}`} className="adm-link" style={{ fontSize: '0.72rem' }}>
                {referrer.customer?.name ?? 'a past event'}{referrer.booking.eventName ? ` · ${referrer.booking.eventName}` : ''} →
              </Link>
            </span>
          )}
          {referralCount > 0 && (
            <span className="adm-pill adm-pill--confirmed">
              Brought in {referralCount} booking{referralCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

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

        {/* Customer: one tap to call, text or email from mom's phone */}
        <div className="adm-card">
          <p className="adm-card-label">Customer</p>
          <div className="adm-row">
            <span className="adm-row-label">Name</span>
            <span className="adm-row-value">{c?.name ?? 'Not set'}</span>
          </div>
          <div className="adm-row">
            <span className="adm-row-label">Phone</span>
            <span className="adm-row-value">
              {c?.phone && telHref ? <a href={telHref} className="adm-link">{c.phone}</a> : (c?.phone ?? 'Not set')}
            </span>
          </div>
          <div className="adm-row">
            <span className="adm-row-label">Email</span>
            <span className="adm-row-value" style={{ wordBreak: 'break-all' }}>
              {c?.email ? <a href={`mailto:${c.email}`} className="adm-link">{c.email}</a> : 'Not set'}
            </span>
          </div>
          <div className="adm-row">
            <span className="adm-row-label">Requested</span>
            <span className="adm-row-value">{fmtTimestamp(b.createdAt)}</span>
          </div>
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
            <p className="adm-card-label" style={{ color: 'var(--adm-accent)' }}>360 Design Preferences</p>
            {rows.map(({ label, value }) => (
              <div key={label} className="adm-row">
                <span className="adm-row-label">{label}</span>
                <span className="adm-row-value" style={{ color: 'var(--adm-accent)' }}>{value}</span>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Actions — read the essentials above, then decide here */}
      <div className="adm-card" style={{ marginTop: '1rem' }}>
        <p className="adm-card-label">
          {b.status === 'requested' ? 'Reply to this request' : 'Quote and payment'}
        </p>
        <BookingActions
          bookingId={b.id}
          currentStatus={b.status}
          currentNotes={b.notes ?? ''}
          payUrl={payUrl}
          customerName={c?.name ?? null}
          customerPhone={c?.phone ?? null}
          eventDate={b.eventDate}
          depositAmount={Number(b.depositAmount ?? 0)}
          balanceAmount={Number(b.balanceAmount ?? 0)}
          holdExpiresAt={b.depositExpiresAt?.toISOString() ?? null}
          depositPaidAt={fmtTimestamp(b.depositPaidAt)}
          balanceDueDate={balanceDate}
          autoPayOptIn={b.autoPayOptIn}
          balancePaid={!!b.balanceChargedAt}
          paidInFull={isPaidInFull(b)}
          nowMs={Date.now()}
        />
      </div>

      {/* After the event — connect Touchpix, then share the guest gallery */}
      <div className="adm-card" style={{ marginTop: '1rem' }}>
        <p className="adm-card-label" style={{ marginBottom: '0.4rem' }}>After the event</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--adm-text-2)', marginBottom: '1.5rem' }}>
          Connect the Touchpix gallery, then hand guests the QR so they can find and share their own clip.
        </p>

        <TouchpixConnect
          bookingId={b.id}
          currentUrl={b.touchpixGalleryUrl}
          galleryPath={`/gallery/${b.galleryToken}`}
        />

        {curatorClips.length > 0 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--adm-border)' }}>
            <ClipCurator
              bookingId={b.id}
              clips={curatorClips}
              initialHidden={b.clipCuration?.hidden ?? []}
              initialFeatured={b.clipCuration?.featured ?? []}
            />
          </div>
        )}

        {b.galleryToken && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--adm-border)' }}>
            <p className="adm-card-label" style={{ marginBottom: '0.75rem' }}>
              Guest gallery link
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--adm-text-2)', marginBottom: '1rem', wordBreak: 'break-all' }}>
              {APP_URL}/gallery/{b.galleryToken}
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <GalleryQr url={`${APP_URL}/gallery/${b.galleryToken}`} />
            </div>
            <Link href={`/gallery/${b.galleryToken}`} target="_blank" className="adm-link">
              Preview gallery →
            </Link>
          </div>
        )}

        {/* Manual upload stays available as a fallback for one-off clips */}
        <details style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--adm-border)' }}>
          <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--adm-text-2)', listStyle: 'none' }}>
            Add a video manually (rarely needed)
          </summary>
          <div className="admin-2col" style={{ marginTop: '1.25rem' }}>
            <DeviceUpload bookingId={b.id} />
            <DriveImport bookingId={b.id} />
          </div>
        </details>
      </div>
    </div>
  )
}

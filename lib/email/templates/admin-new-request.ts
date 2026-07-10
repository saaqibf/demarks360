import { APP_URL } from '@/lib/app-url'
import { escapeHtml } from '@/lib/email/escape-html'
import { ctaButton, detailRow, emailShell, fmtDate, fmtTime, money, moneyRow, type EmailContent } from './shared'

interface AdminNewRequestParams {
  bookingId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  eventDate: string
  startTime: string
  endTime: string
  eventType: string
  locationAddress: string
  locationCity: string
  eventName?: string | null
  durationMinutes?: number
  subtotal?: number
  depositAmount?: number
  balanceAmount?: number
  addOnNames?: string[]
  colorTheme?: string | null
  designNotes?: string | null
  songPreference?: string | null
}

export function adminNewRequestEmail(p: AdminNewRequestParams): EmailContent {
  const d = new Date(p.eventDate + 'T00:00:00')
  const dayNum = d.getDate()
  const month = d.toLocaleDateString('en-CA', { month: 'short' }).toUpperCase()
  const weekday = d.toLocaleDateString('en-CA', { weekday: 'long' })
  const hours = p.durationMinutes ? p.durationMinutes / 60 : null
  const timeStr = `${fmtTime(p.startTime)} to ${fmtTime(p.endTime)}${hours ? ` &middot; ${hours.toFixed(1).replace('.0', '')} hours` : ''}`

  const overlay = [
    p.colorTheme ? escapeHtml(p.colorTheme) : null,
    p.designNotes ? escapeHtml(p.designNotes) : null,
    p.songPreference ? escapeHtml(p.songPreference) : null,
  ].filter(Boolean).join(' &middot; ')

  const body = `
    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#5E5647;max-width:46ch;">
      A new request is waiting for your review. Approve it to send the customer a secure link for their 50% deposit.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
      <tr><td style="height:1px;font-size:0;line-height:0;background:#E9E3D8;">&nbsp;</td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${detailRow('Date', fmtDate(p.eventDate))}
      ${detailRow('Time', timeStr)}
      ${detailRow('Event type', escapeHtml(p.eventType))}
      ${detailRow('Location', escapeHtml(`${p.locationAddress}, ${p.locationCity}`))}
      ${p.addOnNames && p.addOnNames.length ? detailRow('Add-ons', p.addOnNames.map(escapeHtml).join(', ')) : ''}
      ${detailRow('Customer', `${escapeHtml(p.customerName)} &middot; <a href="tel:+1${p.customerPhone.replace(/\D/g, '')}" style="color:#B8925A;text-decoration:none;">${escapeHtml(p.customerPhone)}</a>`)}
      ${overlay ? detailRow('Overlay', overlay) : ''}
    </table>

    ${p.subtotal != null ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
      ${moneyRow('Quote total', p.subtotal)}
      ${moneyRow('Deposit on approval (50%)', p.depositAmount ?? null, { gold: true })}
      ${moneyRow('Balance on event day', p.balanceAmount ?? null, { big: true })}
    </table>` : ''}

    ${ctaButton(`${APP_URL}/admin/bookings/${p.bookingId}`, 'Review & approve')}
    <p style="margin:14px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;color:#9A9080;">
      Approving emails ${firstNameSafe(p.customerName)} their secure ${money(p.depositAmount ?? null)} deposit link.
    </p>`

  return {
    subject: `New request: ${p.eventType} on ${weekday} ${month} ${dayNum}${p.subtotal != null ? ` (${money(p.subtotal)})` : ''}`,
    html: emailShell('You have a new booking request', body, {
      eyebrow: 'New booking request',
      heroImage: `${APP_URL}/email/hero.jpg`,
      heroTitle: p.eventName || p.eventType,
    }),
  }
}

function firstNameSafe(name: string): string {
  return escapeHtml(name.trim().split(/\s+/)[0] || 'the customer')
}

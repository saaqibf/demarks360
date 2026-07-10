import { APP_URL } from '@/lib/app-url'
import { escapeHtml } from '@/lib/email/escape-html'
import { emailShell, fmtTime, money, type EmailContent } from './shared'

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

// The owner reviews most requests from her phone: everything needed to say yes
// lives above the fold - the date ticket, the money, and one gold button
export function adminNewRequestEmail(p: AdminNewRequestParams): EmailContent {
  const d = new Date(p.eventDate + 'T00:00:00')
  const dayNum = d.getDate()
  const month = d.toLocaleDateString('en-CA', { month: 'short' }).toUpperCase()
  const weekday = d.toLocaleDateString('en-CA', { weekday: 'long' })
  const hours = p.durationMinutes ? p.durationMinutes / 60 : null
  const phoneDigits = p.customerPhone.replace(/\D/g, '')

  const designLines = [
    p.colorTheme ? `<strong style="color:#B07E2F;">Colors</strong> &nbsp;${escapeHtml(p.colorTheme)}` : null,
    p.designNotes ? `<strong style="color:#B07E2F;">Vision</strong> &nbsp;${escapeHtml(p.designNotes)}` : null,
    p.songPreference ? `<strong style="color:#B07E2F;">Song</strong> &nbsp;${escapeHtml(p.songPreference)}` : null,
  ].filter(Boolean)

  const body = `
    <table cellpadding="0" cellspacing="0" style="margin:0 0 22px 0;"><tr>
      <td style="background:#FBF6EA;border:1px solid #D8BE8C;border-radius:999px;padding:7px 14px;font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B07E2F;">
        New request &middot; respond within 24 hours
      </td>
    </tr></table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF8F1;border:1px solid #E7DFD0;border-radius:12px;">
      <tr>
        <td width="96" align="center" style="padding:22px 8px;border-right:1px dashed #D8BE8C;">
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2.5px;color:#9A917F;">${month}</p>
          <p style="margin:2px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:44px;line-height:1;color:#231C10;">${dayNum}</p>
          <p style="margin:4px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:1px;color:#9A917F;">${weekday}</p>
        </td>
        <td style="padding:22px 22px;">
          ${p.eventName ? `<p style="margin:0 0 4px 0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:22px;color:#B07E2F;">${escapeHtml(p.eventName)}</p>` : ''}
          <p style="margin:0 0 10px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#231C10;">${escapeHtml(p.eventType)}</p>
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#5A5142;line-height:1.8;">
            ${fmtTime(p.startTime)} to ${fmtTime(p.endTime)}${hours ? ` &middot; ${hours.toFixed(1).replace('.0', '')} hours` : ''}<br>
            ${escapeHtml(p.locationAddress)}, ${escapeHtml(p.locationCity)}
            ${p.addOnNames && p.addOnNames.length ? `<br><span style="color:#B07E2F;">+ ${p.addOnNames.map(escapeHtml).join(' &middot; + ')}</span>` : ''}
          </p>
        </td>
      </tr>
    </table>

    ${p.subtotal != null ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 0 0;background:#FBF8F1;border:1px solid #E7DFD0;border-radius:12px;">
      <tr>
        <td width="33%" align="center" style="padding:16px 4px;border-right:1px solid #E7DFD0;">
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9A917F;">Quote</p>
          <p style="margin:6px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#231C10;">${money(p.subtotal)}</p>
        </td>
        <td width="34%" align="center" style="padding:16px 4px;border-right:1px solid #E7DFD0;">
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9A917F;">Deposit</p>
          <p style="margin:6px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#B07E2F;">${money(p.depositAmount ?? null)}</p>
        </td>
        <td width="33%" align="center" style="padding:16px 4px;">
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9A917F;">Balance</p>
          <p style="margin:6px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#231C10;">${money(p.balanceAmount ?? null)}</p>
        </td>
      </tr>
    </table>` : ''}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 0 0;">
      <tr>
        <td style="padding:16px 0 6px 0;font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#9A917F;">Customer</td>
      </tr>
      <tr>
        <td style="font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#231C10;padding-bottom:10px;">${escapeHtml(p.customerName)}</td>
      </tr>
      <tr><td>
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="border:1px solid #D8BE8C;border-radius:999px;">
            <a href="tel:+1${phoneDigits}" style="display:inline-block;padding:9px 16px;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;color:#B07E2F;text-decoration:none;">Call ${escapeHtml(p.customerPhone)}</a>
          </td>
          <td width="8" style="font-size:0;">&nbsp;</td>
          <td style="border:1px solid #D8BE8C;border-radius:999px;">
            <a href="mailto:${escapeHtml(p.customerEmail)}" style="display:inline-block;padding:9px 16px;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;color:#B07E2F;text-decoration:none;">Reply by email</a>
          </td>
        </tr></table>
      </td></tr>
    </table>

    ${designLines.length ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0 0;background:#FBF6EA;border-left:3px solid #C9913F;border-radius:0 10px 10px 0;">
      <tr><td style="padding:14px 18px;">
        <p style="margin:0 0 8px 0;font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#9A917F;">Overlay design brief</p>
        <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#5A5142;line-height:1.9;">${designLines.join('<br>')}</p>
      </td></tr>
    </table>` : ''}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0 0;">
      <tr><td align="center" style="background:#C9913F;border-radius:999px;">
        <a href="${APP_URL}/admin/bookings/${p.bookingId}" style="display:block;padding:16px 30px;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">
          Review &amp; approve
        </a>
      </td></tr>
    </table>
    <p style="margin:12px 0 0 0;text-align:center;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#9A917F;">
      Approving emails ${firstNameSafe(p.customerName)} a secure link for the ${money(p.depositAmount ?? null)} deposit.
    </p>`

  return {
    subject: `New request: ${p.eventType} on ${weekday} ${month} ${dayNum}${p.subtotal != null ? ` (${money(p.subtotal)})` : ''}`,
    html: emailShell('You have a new booking request', body),
  }
}

function firstNameSafe(name: string): string {
  return escapeHtml(name.trim().split(/\s+/)[0] || 'the customer')
}

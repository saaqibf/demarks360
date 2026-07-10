import { escapeHtml } from '@/lib/email/escape-html'
import { detailRow, emailShell, firstName, fmtDate, fmtTime, money, type EmailContent } from './shared'

interface BookingConfirmedParams {
  name: string
  eventDate: string
  startTime: string
  endTime: string
  eventType: string
  locationAddress: string
  locationCity: string
  depositAmount: string | number | null
  balanceAmount: string | number | null
  autoPayOptIn: boolean
}

export function bookingConfirmedEmail(p: BookingConfirmedParams): EmailContent {
  const balanceLine = p.autoPayOptIn
    ? `The remaining ${money(p.balanceAmount)} is due on event day. We'll charge your saved card that morning and email a receipt.`
    : `The remaining ${money(p.balanceAmount)} is due on event day. We'll email you a payment link that morning.`
  const body = `
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      Hi ${firstName(p.name)},
    </p>
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      Your deposit of ${money(p.depositAmount)} has been received and your date is locked in.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${detailRow('Date', fmtDate(p.eventDate))}
      ${detailRow('Time', `${fmtTime(p.startTime)} to ${fmtTime(p.endTime)}`)}
      ${detailRow('Event type', escapeHtml(p.eventType))}
      ${detailRow('Location', escapeHtml(`${p.locationAddress}, ${p.locationCity}`))}
      ${detailRow('Deposit paid', money(p.depositAmount))}
      ${detailRow('Balance due on event day', money(p.balanceAmount))}
    </table>
    <p style="margin:20px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      ${balanceLine}
    </p>
    <p style="margin:16px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#9A917F;line-height:1.65;">
      Your deposit is non-refundable. Same-day gallery link comes to this email after your event.
    </p>`
  return {
    subject: `You're booked for ${fmtDate(p.eventDate)}`,
    html: emailShell("You're booked", body),
  }
}

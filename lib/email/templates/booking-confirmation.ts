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
  paidInFull?: boolean
}

export function bookingConfirmedEmail(p: BookingConfirmedParams): EmailContent {
  const total = Number(p.depositAmount ?? 0) + Number(p.balanceAmount ?? 0)
  const balanceLine = p.paidInFull
    ? 'You paid in full, so there is nothing left to pay. All that is left is to enjoy your event!'
    : p.autoPayOptIn
      ? `The second payment of ${money(p.balanceAmount)} is due the day before your event. We will charge your saved card that day and email you a receipt.`
      : `The second payment of ${money(p.balanceAmount)} is due the day before your event. We will email you a payment link that day.`
  const body = `
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      Hi ${firstName(p.name)},
    </p>
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      ${p.paidInFull ? `Your payment of ${money(total)} has been received` : `Your first payment of ${money(p.depositAmount)} has been received`} and your date is locked in. Thank you!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${detailRow('Date', fmtDate(p.eventDate))}
      ${detailRow('Time', `${fmtTime(p.startTime)} to ${fmtTime(p.endTime)}`)}
      ${detailRow('Event type', escapeHtml(p.eventType))}
      ${detailRow('Location', escapeHtml(`${p.locationAddress}, ${p.locationCity}`))}
      ${p.paidInFull
        ? detailRow('Paid in full', money(total))
        : `${detailRow('Paid today', money(p.depositAmount))}${detailRow('Due the day before', money(p.balanceAmount))}`}
    </table>
    <p style="margin:20px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      ${balanceLine}
    </p>
    <p style="margin:16px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#9A917F;line-height:1.65;">
      Your first payment holds your date and is non-refundable. Your same-day gallery link comes to this email after your event.
    </p>`
  return {
    subject: `You're booked for ${fmtDate(p.eventDate)}`,
    html: emailShell("You're booked", body),
  }
}

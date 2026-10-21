import { escapeHtml } from '@/lib/email/escape-html'
import { APP_URL } from '@/lib/app-url'
import {
  CONTACT_LINE, ctaButton, detailRow, emailShell, firstName, fmtDate, fmtTime, holdUntilLabel, money, moneyRow, para,
  personalNote, type EmailContent,
} from './shared'

interface QuoteSentParams {
  name: string
  eventDate: string
  startTime: string
  endTime: string
  eventType: string
  locationCity: string
  depositAmount: number
  balanceAmount: number
  payToken: string
  holdExpiresAt: Date
  message?: string | null
  isUpdate?: boolean
}

export function quoteSentEmail(p: QuoteSentParams): EmailContent {
  const payUrl = `${APP_URL}/pay/${p.payToken}`
  const total = p.depositAmount + p.balanceAmount
  const intro = p.isUpdate
    ? `Here is your updated quote for ${fmtDate(p.eventDate)}.`
    : `Thank you for reaching out! We would love to be part of your ${escapeHtml(p.eventType.toLowerCase())} on ${fmtDate(p.eventDate)}, and the date is available. Here is your quote.`
  const body = `
    ${para(`Hi ${firstName(p.name)},`)}
    ${para(intro)}
    ${p.message?.trim() ? personalNote(p.message.trim()) : ''}
    <table width="100%" cellpadding="0" cellspacing="0">
      ${detailRow('Date', fmtDate(p.eventDate))}
      ${detailRow('Time', `${fmtTime(p.startTime)} to ${fmtTime(p.endTime)}`)}
      ${detailRow('Location', escapeHtml(p.locationCity))}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      ${moneyRow('Your quote', total, { gold: true, big: true })}
    </table>
    ${para('<strong>Two ways to pay, whichever is easier for you:</strong>')}
    ${para(`<strong>Pay in full:</strong> ${money(total)} today and you are all set.<br>
      <strong>Pay in two parts:</strong> ${money(p.depositAmount)} today to lock in your date, then ${money(p.balanceAmount)} the day before your event.`)}
    ${ctaButton(payUrl, 'View quote and book')}
    <p style="margin:24px 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      We are holding this date for you until <strong>${holdUntilLabel(p.holdExpiresAt)}</strong>.
      If it is not booked by then, it opens back up for other customers.
    </p>
    ${para(CONTACT_LINE)}
    ${para(`Or copy this link: <a href="${payUrl}" style="color:#B07E2F;word-break:break-all;">${payUrl}</a>`, { small: true, last: true })}`
  return {
    subject: p.isUpdate ? `Your updated Demarks 360 quote for ${fmtDate(p.eventDate)}` : `Your Demarks 360 quote for ${fmtDate(p.eventDate)}`,
    html: emailShell(p.isUpdate ? 'Your updated quote' : 'Your quote is ready', body),
  }
}

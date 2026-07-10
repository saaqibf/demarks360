import { escapeHtml } from '@/lib/email/escape-html'
import { detailRow, emailShell, firstName, fmtDate, fmtTime, type EmailContent } from './shared'

interface RequestReceivedParams {
  name: string
  eventDate: string
  startTime: string
  endTime: string
  locationAddress: string
  locationCity: string
}

export function requestReceivedEmail(p: RequestReceivedParams): EmailContent {
  const body = `
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#3A3A3A;line-height:1.65;">
      Hi ${firstName(p.name)},
    </p>
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#3A3A3A;line-height:1.65;">
      Thanks for your booking request. Here is what you asked for:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${detailRow('Date', fmtDate(p.eventDate))}
      ${detailRow('Time', `${fmtTime(p.startTime)} to ${fmtTime(p.endTime)}`)}
      ${detailRow('Location', escapeHtml(`${p.locationAddress}, ${p.locationCity}`))}
    </table>
    <p style="margin:20px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#3A3A3A;line-height:1.65;">
      We review every request within 24 hours. Once approved, we will email you a secure
      payment link to lock in your date. No payment has been taken yet.
    </p>`
  return {
    subject: 'We got your booking request',
    html: emailShell('We got your request', body),
  }
}

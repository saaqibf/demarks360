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
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      Hi ${firstName(p.name)},
    </p>
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      Thanks for your quote request. Here is what you asked for:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${detailRow('Date', fmtDate(p.eventDate))}
      ${detailRow('Time', `${fmtTime(p.startTime)} to ${fmtTime(p.endTime)}`)}
      ${detailRow('Location', escapeHtml(`${p.locationAddress}, ${p.locationCity}`))}
    </table>
    <p style="margin:20px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      We reply with a tailored quote for your event, often the same day and always within 24
      hours. A deposit holds your date once you are ready. No payment has been taken yet.
    </p>
    <p style="margin:16px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      In a hurry, or have a question? Call or text us at
      <a href="tel:+14034020816" style="color:#B07E2F;text-decoration:none;font-weight:600;">403 402 0816</a>
      and we will help you right away.
    </p>`
  return {
    subject: 'We got your quote request',
    html: emailShell('We got your request', body),
  }
}

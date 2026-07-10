import { APP_URL } from '@/lib/app-url'
import { ctaButton, emailShell, firstName, fmtDate, type EmailContent } from './shared'

interface RequestExpiredParams {
  name: string
  eventDate: string
}

export function requestExpiredEmail(p: RequestExpiredParams): EmailContent {
  const body = `
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#D8CFC0;line-height:1.65;">
      Hi ${firstName(p.name)},
    </p>
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#D8CFC0;line-height:1.65;">
      The deposit window for your ${fmtDate(p.eventDate)} booking has closed, so the date
      has been released for other customers. No charge was made.
    </p>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#D8CFC0;line-height:1.65;">
      Still want the booth? You are welcome to submit a new request any time.
    </p>
    ${ctaButton(`${APP_URL}/book`, 'Submit a new request')}`
  return {
    subject: 'Your booking request has expired',
    html: emailShell('Your request expired', body),
  }
}

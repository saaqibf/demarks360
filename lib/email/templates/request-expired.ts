import { APP_URL } from '@/lib/app-url'
import { ctaButton, emailShell, firstName, fmtDate, type EmailContent } from './shared'

interface RequestExpiredParams {
  name: string
  eventDate: string
}

export function requestExpiredEmail(p: RequestExpiredParams): EmailContent {
  const body = `
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      Hi ${firstName(p.name)},
    </p>
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      The hold on ${fmtDate(p.eventDate)} has ended, so the date has been opened back up
      for other bookings. No charge was made.
    </p>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      Still want the booth? Send us a new request, or just reply to this email, and if the
      date is still free we will hold it for you again.
    </p>
    ${ctaButton(`${APP_URL}/book`, 'Submit a new request')}`
  return {
    subject: 'The hold on your date has ended',
    html: emailShell('Your hold has ended', body),
  }
}

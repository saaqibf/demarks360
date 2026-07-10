import { APP_URL } from '@/lib/app-url'
import { ctaButton, emailShell, firstName, fmtDate, type EmailContent } from './shared'

interface RequestDeclinedParams {
  name: string
  eventDate: string
}

export function requestDeclinedEmail(p: RequestDeclinedParams): EmailContent {
  const body = `
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      Hi ${firstName(p.name)},
    </p>
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      Thank you so much for thinking of us for ${fmtDate(p.eventDate)}. We are really sorry,
      we are not able to take this date and time. No charge was made.
    </p>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      We would still love to be part of your event. If another date could work, send us a new
      request and we will do our best to make it happen.
    </p>
    ${ctaButton(`${APP_URL}/book`, 'Request another date')}`
  return {
    subject: 'About your booking request',
    html: emailShell('About your request', body),
  }
}

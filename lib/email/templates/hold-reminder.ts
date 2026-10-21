import { APP_URL } from '@/lib/app-url'
import { CONTACT_LINE, ctaButton, emailShell, firstName, fmtDate, holdUntilLabel, para, type EmailContent } from './shared'

interface HoldReminderParams {
  name: string
  eventDate: string
  payToken: string
  holdExpiresAt: Date
}

export function holdReminderEmail(p: HoldReminderParams): EmailContent {
  const payUrl = `${APP_URL}/pay/${p.payToken}`
  const body = `
    ${para(`Hi ${firstName(p.name)},`)}
    ${para(`Just a friendly reminder: we are still holding ${fmtDate(p.eventDate)} for you until <strong>${holdUntilLabel(p.holdExpiresAt)}</strong>. After that, the date opens back up for other bookings.`)}
    ${para('If you would like to keep it, you can pay in full or just the first part to lock it in.')}
    ${ctaButton(payUrl, 'Lock in my date')}
    <p style="margin:24px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      Plans changed? No problem at all, there is nothing you need to do. ${CONTACT_LINE}
    </p>`
  return {
    subject: `We're still holding ${fmtDate(p.eventDate)} for you`,
    html: emailShell('Your date is on hold', body),
  }
}

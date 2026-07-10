import { APP_URL } from '@/lib/app-url'
import { ctaButton, emailShell, firstName, fmtDate, money, type EmailContent } from './shared'

interface DepositLinkParams {
  name: string
  eventDate: string
  depositAmount: string | number | null
  balanceAmount: string | number | null
  payToken: string
  depositExpiresAt: Date
}

export function depositLinkEmail(p: DepositLinkParams): EmailContent {
  const payUrl = `${APP_URL}/pay/${p.payToken}`
  const validUntil = p.depositExpiresAt.toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton', year: 'numeric', month: 'long', day: 'numeric',
  })
  const body = `
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      Hi ${firstName(p.name)},
    </p>
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;">
      Good news, ${fmtDate(p.eventDate)} is yours if you want it. Pay half now
      (${money(p.depositAmount)}) to lock in your date. The other half
      (${money(p.balanceAmount)}) is due on event day.
    </p>
    ${ctaButton(payUrl, 'Pay deposit')}
    <p style="margin:20px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#9A917F;line-height:1.65;">
      Or copy this link: <a href="${payUrl}" style="color:#B07E2F;word-break:break-all;">${payUrl}</a><br>
      This link is valid until ${validUntil}. After that the date is released again.
    </p>`
  return {
    subject: 'Your date is available, lock it in with your deposit',
    html: emailShell('Your date is available', body),
  }
}

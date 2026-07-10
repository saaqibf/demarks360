import { APP_URL } from '@/lib/app-url'
import { ctaButton, emailShell, firstName, money, type EmailContent } from './shared'

interface BalanceDueParams {
  name: string
  balanceAmount: string | number | null
  payToken: string
  cardFailed?: boolean
}

export function balanceDueEmail(p: BalanceDueParams): EmailContent {
  const payUrl = `${APP_URL}/pay/${p.payToken}`
  const failedLine = p.cardFailed
    ? `<p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#3A3A3A;line-height:1.65;">
        We tried your saved card but it did not go through, you can pay here instead.
      </p>`
    : ''
  const body = `
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#3A3A3A;line-height:1.65;">
      Hi ${firstName(p.name)},
    </p>
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#3A3A3A;line-height:1.65;">
      Tonight is the night. Your remaining balance of ${money(p.balanceAmount)} is due today.
    </p>
    ${failedLine}
    ${ctaButton(payUrl, 'Pay balance')}
    <p style="margin:20px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#888580;line-height:1.65;">
      Or copy this link: <a href="${payUrl}" style="color:#C0293A;word-break:break-all;">${payUrl}</a>
    </p>`
  return {
    subject: 'Your remaining balance is due today',
    html: emailShell('Balance due today', body),
  }
}

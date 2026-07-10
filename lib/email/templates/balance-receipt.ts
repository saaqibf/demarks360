import { emailShell, firstName, fmtDate, money, type EmailContent } from './shared'

interface BalanceReceiptParams {
  name: string
  eventDate: string
  balanceAmount: string | number | null
}

export function balanceReceiptEmail(p: BalanceReceiptParams): EmailContent {
  const body = `
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#D8CFC0;line-height:1.65;">
      Hi ${firstName(p.name)},
    </p>
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#D8CFC0;line-height:1.65;">
      Your balance of ${money(p.balanceAmount)} has been paid. Your booking for
      ${fmtDate(p.eventDate)} is now fully paid.
    </p>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#D8CFC0;line-height:1.65;">
      See you soon. Your gallery link will land in this inbox after the event.
    </p>`
  return {
    subject: 'Payment received, see you soon',
    html: emailShell('All paid', body),
  }
}

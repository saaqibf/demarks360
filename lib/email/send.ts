import { getResend, FROM_EMAIL } from './resend'
import { ADMIN_EMAILS } from '../admin-emails'

// Kept for callers that want the operator inbox(es). Resend accepts an array of
// recipients, so both emails on the allow-list get booking alerts.
export { ADMIN_EMAILS }

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
}

// Customer addresses are PII and must never land in logs verbatim
function maskEmail(to: string | string[]): string {
  const first = Array.isArray(to) ? to[0] ?? '' : to
  const [local, domain] = first.split('@')
  const extra = Array.isArray(to) && to.length > 1 ? ` (+${to.length - 1})` : ''
  return `${local?.slice(0, 2) ?? ''}***@${domain ?? ''}${extra}`
}

// Email must never take down the request that triggered it: without an API key we
// log instead of sending, and send failures are logged rather than rethrown.
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email:dev]', maskEmail(to), subject)
    return
  }
  // Bound the wait: these sends sit on the booking/approve request path, so a
  // slow or hung Resend must not stall the response (which would trigger client
  // retries and duplicate submissions). Errors and timeouts are swallowed.
  try {
    await Promise.race([
      getResend().emails.send({ from: FROM_EMAIL, to, subject, html }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('email send timeout')), 8000)),
    ])
  } catch (err) {
    console.error(`[email] send failed or timed out: "${subject}"`, err)
  }
}

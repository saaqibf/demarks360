import { getResend, FROM_EMAIL } from './resend'

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'saaqibf.ayodimeji@gmail.com'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
}

// Customer addresses are PII and must never land in logs verbatim
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  return `${local?.slice(0, 2) ?? ''}***@${domain ?? ''}`
}

// Email must never take down the request that triggered it: without an API key we
// log instead of sending, and send failures are logged rather than rethrown.
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email:dev]', maskEmail(to), subject)
    return
  }
  try {
    await getResend().emails.send({ from: FROM_EMAIL, to, subject, html })
  } catch (err) {
    console.error(`[email] send failed: "${subject}"`, err)
  }
}

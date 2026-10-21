import { escapeHtml } from '@/lib/email/escape-html'
import { APP_URL } from '@/lib/app-url'
import { ctaButton, emailShell, para, type EmailContent } from './shared'

interface AdminNoticeParams {
  subject: string
  heading: string
  lines: string[]
  bookingId: string
}

// Short operator alerts (payment in, hold expired): what happened, plus one tap to the booking
export function adminNoticeEmail(p: AdminNoticeParams): EmailContent {
  const body = `
    ${p.lines.map((line, i) => para(escapeHtml(line), { last: i === p.lines.length - 1 })).join('')}
    ${ctaButton(`${APP_URL}/admin/bookings/${p.bookingId}`, 'Open booking')}`
  return { subject: p.subject, html: emailShell(escapeHtml(p.heading), body) }
}

import { APP_URL } from '@/lib/app-url'
import { escapeHtml } from '@/lib/email/escape-html'
import { ctaButton, detailRow, emailShell, fmtDate, fmtTime, type EmailContent } from './shared'

interface AdminNewRequestParams {
  bookingId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  eventDate: string
  startTime: string
  endTime: string
  eventType: string
  locationAddress: string
  locationCity: string
}

export function adminNewRequestEmail(p: AdminNewRequestParams): EmailContent {
  const body = `
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#D8CFC0;line-height:1.65;">
      A new booking request is waiting for review.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${detailRow('Customer', escapeHtml(p.customerName))}
      ${detailRow('Email', escapeHtml(p.customerEmail))}
      ${detailRow('Phone', escapeHtml(p.customerPhone))}
      ${detailRow('Date', fmtDate(p.eventDate))}
      ${detailRow('Time', `${fmtTime(p.startTime)} to ${fmtTime(p.endTime)}`)}
      ${detailRow('Event type', escapeHtml(p.eventType))}
      ${detailRow('Location', escapeHtml(`${p.locationAddress}, ${p.locationCity}`))}
    </table>
    ${ctaButton(`${APP_URL}/admin/bookings/${p.bookingId}`, 'Review request')}`
  return {
    subject: `New booking request for ${p.eventDate}`,
    html: emailShell('New booking request', body),
  }
}

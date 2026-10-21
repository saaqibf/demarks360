import { APP_URL } from '@/lib/app-url'
import { CONTACT_LINE, ctaButton, emailShell, firstName, fmtDate, para, personalNote, type EmailContent } from './shared'

interface RequestDeclinedParams {
  name: string
  eventDate: string
  message?: string | null
}

export function requestDeclinedEmail(p: RequestDeclinedParams): EmailContent {
  const body = `
    ${para(`Hi ${firstName(p.name)},`)}
    ${para(`Thank you so much for thinking of us for ${fmtDate(p.eventDate)}. We are really sorry, but we are not able to take this booking. No charge was made.`)}
    ${p.message?.trim() ? personalNote(p.message.trim()) : ''}
    ${para('We would still love to be part of your celebration. If another date could work, send us a new request and we will do our best to make it happen.')}
    ${para(CONTACT_LINE, { last: true })}
    ${ctaButton(`${APP_URL}/book`, 'Request another date')}`
  return {
    subject: 'About your Demarks 360 request',
    html: emailShell('About your request', body),
  }
}

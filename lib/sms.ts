// Customer texts. With Twilio configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
// TWILIO_FROM_NUMBER) they send automatically; without it they cost nothing and the
// admin sends them from their own phone through a prefilled sms: link.

const SHORT_DATE: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }

function shortDate(eventDate: string): string {
  return new Date(`${eventDate}T00:00:00`).toLocaleDateString('en-CA', SHORT_DATE)
}

function holdUntil(d: Date): string {
  return d.toLocaleString('en-CA', {
    timeZone: 'America/Edmonton', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits.length >= 8 ? `+${digits}` : null
}

// "?&body=" is the form both iOS Messages and Android accept
export function smsHref(phone: string, body: string): string | null {
  const to = toE164(phone)
  return to ? `sms:${to}?&body=${encodeURIComponent(body)}` : null
}

export function quoteSms(p: { name: string; eventDate: string; total: number; payUrl: string; holdExpiresAt: Date }): string {
  const first = p.name.trim().split(/\s+/)[0]
  return `Hi ${first}, it's Demarks 360! Great news, we can do ${shortDate(p.eventDate)}. Your quote is $${p.total.toFixed(2)}. `
    + `We're holding the date for you until ${holdUntil(p.holdExpiresAt)}. Pay in full or in two parts here: ${p.payUrl}`
}

export function declineSms(p: { name: string; eventDate: string; message?: string | null }): string {
  const first = p.name.trim().split(/\s+/)[0]
  const note = p.message?.trim() ? ` ${p.message.trim()}` : ''
  return `Hi ${first}, it's Demarks 360. Thank you for thinking of us! Unfortunately we can't take ${shortDate(p.eventDate)}.${note} `
    + `We've also sent you an email. We'd love to help with another date anytime.`
}

export function holdReminderSms(p: { name: string; eventDate: string; payUrl: string; holdExpiresAt: Date }): string {
  const first = p.name.trim().split(/\s+/)[0]
  return `Hi ${first}, a friendly reminder from Demarks 360: we're still holding ${shortDate(p.eventDate)} for you until `
    + `${holdUntil(p.holdExpiresAt)}. You can lock it in here: ${p.payUrl}`
}

export function balanceDueSms(p: { name: string; eventDate: string; amount: number; payUrl: string }): string {
  const first = p.name.trim().split(/\s+/)[0]
  return `Hi ${first}, Demarks 360 here, so excited for ${shortDate(p.eventDate)}! The second payment of $${p.amount.toFixed(2)} `
    + `is due before your event. You can pay here: ${p.payUrl}`
}

export function isAutoSmsConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER)
}

// Never throws: a text is a courtesy on top of the email, so it must not fail the action
export async function sendSms(phone: string, body: string): Promise<boolean> {
  const to = toE164(phone)
  if (!to || !isAutoSmsConfigured()) return false
  const sid = process.env.TWILIO_ACCOUNT_SID!
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: process.env.TWILIO_FROM_NUMBER!, Body: body }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) console.error(`[sms] Twilio responded ${res.status}`)
    return res.ok
  } catch (err) {
    console.error('[sms] send failed:', err)
    return false
  }
}

// Plain-language health of the services the booking flow depends on, for the admin
// dashboard. Reads only whether a setting exists and which kind it is (a Stripe key's
// live/test prefix); it never returns a secret or any part of one.

export type SetupState = 'ok' | 'warn' | 'off' | 'info'

export interface SetupItem {
  key: string
  label: string
  state: SetupState
  detail: string
}

type Env = Record<string, string | undefined>

const has = (v: string | undefined) => !!v && v.trim().length > 0

export function setupCheck(env: Env, adminEmails: string[]): SetupItem[] {
  const items: SetupItem[] = []

  const stripeKey = env.STRIPE_SECRET_KEY?.trim() ?? ''
  const live = /^(sk|rk)_live_/.test(stripeKey)
  const test = /^(sk|rk)_test_/.test(stripeKey)
  items.push({
    key: 'payments',
    label: 'Card payments',
    state: live ? 'ok' : test ? 'warn' : 'off',
    detail: live
      ? 'Live. Customers pay with real cards.'
      : test
        ? 'Test mode. No real money moves. Switch Stripe to live keys before taking real bookings.'
        : 'Not set up. Customers cannot pay online.',
  })

  const webhook = env.STRIPE_WEBHOOK_SECRET?.trim() ?? ''
  items.push({
    key: 'confirmations',
    label: 'Payment confirmations',
    state: webhook.startsWith('whsec_') ? 'ok' : 'warn',
    detail: webhook.startsWith('whsec_')
      ? 'Stripe tells the site when someone pays, so the booking updates by itself.'
      : 'Not connected. Paid quotes will not mark themselves as booked.',
  })

  const from = env.RESEND_FROM_EMAIL?.trim() || 'Demarks 360 <onboarding@resend.dev>'
  const testSender = from.includes('resend.dev')
  items.push({
    key: 'email',
    label: 'Emails',
    state: !has(env.RESEND_API_KEY) ? 'off' : testSender ? 'warn' : 'ok',
    detail: !has(env.RESEND_API_KEY)
      ? 'Not set up. Customers and you will not get emails.'
      : testSender
        ? 'Using the test sender, so emails may only reach your own inbox.'
        : `Sent from ${from}.`,
  })

  const autoText = has(env.TWILIO_ACCOUNT_SID) && has(env.TWILIO_AUTH_TOKEN) && has(env.TWILIO_FROM_NUMBER)
  items.push({
    key: 'sms',
    label: 'Text messages',
    state: autoText ? 'ok' : 'info',
    detail: autoText
      ? 'Sent automatically.'
      : 'From your own phone: tap "Text them too" after you reply to a request.',
  })

  items.push({
    key: 'cron',
    label: 'Reminders and holds',
    state: has(env.CRON_SECRET) ? 'ok' : 'warn',
    detail: has(env.CRON_SECRET)
      ? 'Runs every morning: hold reminders, released dates and second-payment links.'
      : 'The morning job is not protected, so it will not run.',
  })

  items.push({
    key: 'admins',
    label: 'Who can sign in here',
    state: adminEmails.length > 0 ? 'ok' : 'warn',
    detail: adminEmails.length > 0 ? adminEmails.join(', ') : 'Nobody is on the list yet.',
  })

  const site = env.APP_URL?.trim() ?? ''
  items.push({
    key: 'site',
    label: 'Links in emails',
    state: site.startsWith('https://') && !site.includes('vercel.app') && !site.includes('localhost') ? 'ok' : 'warn',
    detail: site ? `Point to ${site.replace(/\/$/, '')}.` : 'No site address set, so email links may be wrong.',
  })

  return items
}

import { describe, it, expect } from 'vitest'

import { setupCheck } from './setup-check'

const FULL = {
  STRIPE_SECRET_KEY: 'sk_live_abc123',
  STRIPE_WEBHOOK_SECRET: 'whsec_xyz',
  RESEND_API_KEY: 're_123',
  RESEND_FROM_EMAIL: 'Demarks 360 <bookings@demarks360.ca>',
  CRON_SECRET: 'c',
  APP_URL: 'https://demarks360.ca',
}

function item(env: Record<string, string | undefined>, key: string, admins: string[] = ['a@x.com']) {
  return setupCheck(env, admins).find((i) => i.key === key)
}

describe('setupCheck', () => {
  it('calls live Stripe keys live', () => {
    expect(item(FULL, 'payments')?.state).toBe('ok')
  })

  it('accepts restricted live keys as live', () => {
    expect(item({ ...FULL, STRIPE_SECRET_KEY: 'rk_live_1' }, 'payments')?.state).toBe('ok')
  })

  it('warns when Stripe is in test mode', () => {
    expect(item({ ...FULL, STRIPE_SECRET_KEY: 'sk_test_1' }, 'payments')?.state).toBe('warn')
  })

  it('reports payments off without a Stripe key', () => {
    expect(item({ ...FULL, STRIPE_SECRET_KEY: undefined }, 'payments')?.state).toBe('off')
  })

  it('warns when the payment webhook is not connected', () => {
    expect(item({ ...FULL, STRIPE_WEBHOOK_SECRET: '' }, 'confirmations')?.state).toBe('warn')
  })

  it('warns on the Resend test sender', () => {
    expect(item({ ...FULL, RESEND_FROM_EMAIL: undefined }, 'email')?.state).toBe('warn')
  })

  it('names the real sender address', () => {
    expect(item(FULL, 'email')?.detail).toBe('Sent from Demarks 360 <bookings@demarks360.ca>.')
  })

  it('treats texts from the phone as normal, not a problem', () => {
    expect(item(FULL, 'sms')?.state).toBe('info')
  })

  it('needs all three Twilio settings for automatic texts', () => {
    expect(item({ ...FULL, TWILIO_ACCOUNT_SID: 'a', TWILIO_AUTH_TOKEN: 'b' }, 'sms')?.state).toBe('info')
  })

  it('turns texts automatic with all three Twilio settings', () => {
    expect(item({ ...FULL, TWILIO_ACCOUNT_SID: 'a', TWILIO_AUTH_TOKEN: 'b', TWILIO_FROM_NUMBER: '+1' }, 'sms')?.state).toBe('ok')
  })

  it('warns when the morning job has no secret', () => {
    expect(item({ ...FULL, CRON_SECRET: '' }, 'cron')?.state).toBe('warn')
  })

  it('lists who can sign in', () => {
    expect(item(FULL, 'admins', ['a@x.com', 'b@y.com'])?.detail).toBe('a@x.com, b@y.com')
  })

  it('warns when nobody can sign in', () => {
    expect(item(FULL, 'admins', [])?.state).toBe('warn')
  })

  it('warns when email links point at a preview address', () => {
    expect(item({ ...FULL, APP_URL: 'https://x.vercel.app' }, 'site')?.state).toBe('warn')
  })

  it('never echoes a secret', () => {
    const text = JSON.stringify(setupCheck({ ...FULL, TWILIO_AUTH_TOKEN: 'tok_secret' }, []))
    expect(text).not.toMatch(/sk_live_abc123|whsec_xyz|re_123|tok_secret/)
  })
})

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getResend, FROM_EMAIL } from '@/lib/email/resend'
import { ADMIN_EMAILS } from '@/lib/admin-emails'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(`notify:${ip}`, { limit: 3, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429, headers: rateLimitHeaders(0, rl.resetAt) },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const { email } = parsed.data

  try {
    const resend = getResend()
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: 'New notify-me signup - Demarks 360',
      html: `<p>New email captured: <strong>${email}</strong></p>`,
    })
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "You're on the list - Demarks 360",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; color: #1A1714;">
          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">You're on the list.</h2>
          <p style="color: #7A7168; line-height: 1.75;">
            We'll let you know when new dates open up and when we're running any promotions.
          </p>
          <p style="color: #7A7168; line-height: 1.75; margin-top: 1rem;">
            In the meantime, feel free to <a href="https://demarks360.ca/book" style="color: #A87530;">book your experience</a>. Dates go fast.
          </p>
          <p style="margin-top: 2rem; font-size: 0.85rem; color: #A8A099;">Demarks 360 · Calgary, AB</p>
        </div>
      `,
    })
  } catch {
    // Log but don't surface server errors to client
  }

  return NextResponse.json({ ok: true })
}

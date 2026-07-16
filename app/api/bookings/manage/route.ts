import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { bookings, customers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ADMIN_EMAILS, sendEmail } from '@/lib/email/send'
import { escapeHtml } from '@/lib/email/escape-html'
import { getClientIp, checkRateLimitDb, rateLimitHeaders } from '@/lib/rate-limit'

async function getBookingRow(id: string) {
  const rows = await db
    .select({ booking: bookings, customer: customers })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .where(eq(bookings.id, id))
  return rows[0] ?? null
}

// Ownership proof: the caller must present the email the booking was made with.
// Without it, a leaked booking id must never unlock PII or the gallery token.
function emailMatches(row: { customer: { email: string } | null }, email: string | null): boolean {
  if (!email || !row.customer?.email) return false
  return row.customer.email.trim().toLowerCase() === email.trim().toLowerCase()
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = await checkRateLimitDb(`manage-get:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(0, rl.resetAt) },
    )
  }

  const id = req.nextUrl.searchParams.get('id')
  const email = req.nextUrl.searchParams.get('email')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const row = await getBookingRow(id)
  // Same response for unknown id and wrong email, so the endpoint is not an existence oracle
  if (!row || !emailMatches(row, email)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { booking: b, customer: c } = row
  return NextResponse.json({
    id: b.id,
    eventDate: b.eventDate,
    startTime: b.startTime,
    endTime: b.endTime,
    eventType: b.eventType,
    locationCity: b.locationCity,
    status: b.status,
    galleryToken: b.galleryToken,
    customerName: c?.name ?? null,
  })
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = await checkRateLimitDb(`manage-post:${ip}`, { limit: 3, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(0, rl.resetAt) },
    )
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { bookingId, email, requestType, reason } = body as {
    bookingId?: string
    email?: string
    requestType?: 'cancel' | 'change'
    reason?: string
  }

  if (!bookingId || !email || !requestType || !reason?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (requestType !== 'cancel' && requestType !== 'change') {
    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  }
  if (reason.length > 2000) {
    return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
  }

  const row = await getBookingRow(bookingId)
  if (!row || !emailMatches(row, email)) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const { booking: b, customer: c } = row
  const safeName = escapeHtml(c?.name ?? 'Unknown')
  const subject = requestType === 'cancel'
    ? `Cancellation Request - ${c?.name ?? 'Customer'} (${b.eventDate})`
    : `Change Request - ${c?.name ?? 'Customer'} (${b.eventDate})`

  await sendEmail({
    to: ADMIN_EMAILS,
    subject,
    html: `
      <p style="font-family:sans-serif;font-size:14px;color:#333;">
        <strong>${requestType === 'cancel' ? 'Cancellation' : 'Change'} request from ${escapeHtml(c?.name ?? 'a customer')}</strong>
      </p>
      <table style="font-family:sans-serif;font-size:13px;color:#555;border-collapse:collapse;width:100%;max-width:480px;">
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;width:40%;">Booking ID</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${escapeHtml(b.id.slice(0, 12).toUpperCase())}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">Customer</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${safeName}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">Email</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${escapeHtml(c?.email ?? 'Unknown')}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">Phone</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${escapeHtml(c?.phone ?? 'Unknown')}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">Event Date</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${escapeHtml(b.eventDate)}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">Event Type</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${escapeHtml(b.eventType)}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">Status</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${escapeHtml(b.status)}</td></tr>
      </table>
      <p style="font-family:sans-serif;font-size:13px;color:#333;margin-top:20px;"><strong>Their message:</strong></p>
      <p style="font-family:sans-serif;font-size:13px;color:#555;background:#f9f9f9;padding:12px;border-left:3px solid #c9913f;">${escapeHtml(reason).replace(/\n/g, '<br>')}</p>
      <p style="font-family:sans-serif;font-size:12px;color:#aaa;margin-top:24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://demarks360.ca'}/admin/bookings/${b.id}">View booking in admin &rarr;</a>
      </p>
    `,
  })

  return NextResponse.json({ ok: true })
}

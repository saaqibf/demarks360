import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { bookings, customers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getResend, FROM_EMAIL } from '@/lib/email/resend'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const rows = await db
    .select({ booking: bookings, customer: customers })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .where(eq(bookings.id, id))

  const row = rows[0]
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

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
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { bookingId, requestType, reason } = body as {
    bookingId?: string
    requestType?: 'cancel' | 'change'
    reason?: string
  }

  if (!bookingId || !requestType || !reason?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const rows = await db
    .select({ booking: bookings, customer: customers })
    .from(bookings)
    .leftJoin(customers, eq(bookings.customerId, customers.id))
    .where(eq(bookings.id, bookingId))

  const row = rows[0]
  if (!row) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const { booking: b, customer: c } = row
  const adminEmail = process.env.ADMIN_EMAIL ?? 'hello@demarks360.com'
  const subject = requestType === 'cancel'
    ? `Cancellation Request — ${c?.name ?? 'Customer'} (${b.eventDate})`
    : `Change Request — ${c?.name ?? 'Customer'} (${b.eventDate})`

  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject,
    html: `
      <p style="font-family:sans-serif;font-size:14px;color:#333;">
        <strong>${requestType === 'cancel' ? 'Cancellation' : 'Change'} request from ${c?.name ?? 'a customer'}</strong>
      </p>
      <table style="font-family:sans-serif;font-size:13px;color:#555;border-collapse:collapse;width:100%;max-width:480px;">
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;width:40%;">Booking ID</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${b.id.slice(0, 12).toUpperCase()}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">Customer</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${c?.name ?? 'Unknown'}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">Email</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${c?.email ?? 'Unknown'}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">Phone</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${c?.phone ?? 'Unknown'}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">Event Date</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${b.eventDate}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">Event Type</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${b.eventType}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #eee;">Status</td><td style="padding:6px 0;border-bottom:1px solid #eee;">${b.status}</td></tr>
      </table>
      <p style="font-family:sans-serif;font-size:13px;color:#333;margin-top:20px;"><strong>Their message:</strong></p>
      <p style="font-family:sans-serif;font-size:13px;color:#555;background:#f9f9f9;padding:12px;border-left:3px solid #c9913f;">${reason.replace(/\n/g, '<br>')}</p>
      <p style="font-family:sans-serif;font-size:12px;color:#aaa;margin-top:24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://demarks360.vercel.app'}/admin/bookings/${b.id}">View booking in admin &rarr;</a>
      </p>
    `,
  })

  return NextResponse.json({ ok: true })
}

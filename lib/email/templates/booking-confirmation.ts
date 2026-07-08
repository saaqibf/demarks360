import { ADDON_CATALOG } from '@/lib/pricing'
import { escapeHtml } from '@/lib/email/escape-html'

interface BookingEmailData {
  booking: {
    id: string
    eventDate: string
    startTime: string
    endTime: string
    eventType: string
    locationAddress: string
    locationCity: string
    depositAmount: string | number | null
    balanceAmount: string | number | null
    balanceChargeDate: string | null
    addOns: string[]
    galleryToken: string | null
  }
  customer: {
    name: string
    email: string
  }
}

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function fmtDateShort(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function googleCalendarUrl(data: BookingEmailData['booking']): string {
  const dateStr = data.eventDate.replace(/-/g, '')
  const startStr = `${dateStr}T${data.startTime.replace(':', '')}00`
  const endStr = `${dateStr}T${data.endTime.replace(':', '')}00`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Demarks 360 — ${data.eventType}`,
    dates: `${startStr}/${endStr}`,
    location: `${data.locationAddress}, ${data.locationCity}, Alberta`,
    details: 'Your Demarks 360 360-degree video booth is confirmed for this event.',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://demarks360.vercel.app'

export function bookingConfirmationHtml({ booking: b, customer: c }: BookingEmailData): string {
  const addOnsList = b.addOns.map(id => {
    const a = ADDON_CATALOG[id]
    return a ? `${a.name} (+$${a.price})` : id
  })
  const deposit = Number(b.depositAmount ?? 0).toFixed(2)
  const balance = Number(b.balanceAmount ?? 0).toFixed(2)
  const balanceDate = b.balanceChargeDate ? fmtDateShort(b.balanceChargeDate) : null
  const ref = b.id.slice(0, 12).toUpperCase()
  const calUrl = googleCalendarUrl(b)

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e3dd;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#888580;font-weight:400;width:45%;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e3dd;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#0F0F0F;font-weight:500;text-align:right;">${value}</td>
    </tr>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Booking Confirmed — Demarks 360</title>
</head>
<body style="margin:0;padding:0;background:#F5F0EA;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EA;padding:48px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Logo -->
  <tr><td style="padding-bottom:32px;">
    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#0F0F0F;">
      DEMARKS <span style="color:#C0293A;">360</span>
    </p>
  </td></tr>

  <!-- Hero banner -->
  <tr><td style="background:#080808;padding:40px 36px;border-radius:3px 3px 0 0;">
    <p style="margin:0 0 10px 0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:rgba(245,240,234,0.4);">
      BOOKING CONFIRMED
    </p>
    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:52px;font-weight:700;line-height:0.92;text-transform:uppercase;color:#F5F0EA;letter-spacing:-1px;">
      You&rsquo;re<br>Booked.
    </h1>
    <p style="margin:20px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:rgba(245,240,234,0.55);font-weight:300;line-height:1.6;">
      Hi ${escapeHtml(c.name.split(' ')[0])} &mdash; your 360 video booth is locked in.<br>
      Here&rsquo;s everything you need to know.
    </p>
  </td></tr>

  <!-- Crimson accent bar -->
  <tr><td style="background:#C0293A;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <!-- Event details card -->
  <tr><td style="background:#ffffff;padding:32px 36px;">
    <p style="margin:0 0 20px 0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#888580;">
      EVENT DETAILS
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${row('Date', fmtDate(b.eventDate))}
      ${row('Time', `${fmtTime(b.startTime)} &rarr; ${fmtTime(b.endTime)}`)}
      ${row('Event type', escapeHtml(b.eventType))}
      ${row('Location', escapeHtml(`${b.locationAddress}, ${b.locationCity}`))}
      ${addOnsList.length > 0 ? row('Add-ons', addOnsList.join(', ')) : ''}
      ${row('Booking reference', `<span style="font-family:monospace;font-size:12px;letter-spacing:1px;">${ref}</span>`)}
    </table>

    <!-- Add to Calendar -->
    <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr><td style="background:#080808;border-radius:2px;">
        <a href="${calUrl}" style="display:inline-block;padding:12px 24px;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
          Add to Google Calendar &rarr;
        </a>
      </td></tr>
    </table>
  </td></tr>

  <!-- Payment summary -->
  <tr><td style="background:#faf8f4;padding:28px 36px;border-top:1px solid #e8e3dd;">
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#888580;">
      PAYMENT
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${row('Deposit paid (30%)', `<strong style="color:#0F0F0F;">$${deposit}</strong>`)}
      ${row('Balance due (70%)', `$${balance}`)}
      ${balanceDate ? row('Balance charge date', balanceDate) : ''}
    </table>
    <p style="margin:16px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#888580;line-height:1.65;">
      Your saved card will be automatically charged the balance on ${balanceDate ?? 'the scheduled date'}.
      Your deposit is non-refundable. Free rescheduling is available with 7+ days notice.
    </p>
  </td></tr>

  <!-- What to expect -->
  <tr><td style="background:#ffffff;padding:28px 36px;border-top:1px solid #e8e3dd;">
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#888580;">
      WHAT HAPPENS NEXT
    </p>
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr><td style="padding:8px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#3A3A3A;line-height:1.5;">
        &bull;&nbsp; We&rsquo;ll arrive and set up before your event starts.
      </td></tr>
      <tr><td style="padding:8px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#3A3A3A;line-height:1.5;">
        &bull;&nbsp; Your guests step onto the platform &mdash; we handle everything.
      </td></tr>
      <tr><td style="padding:8px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#3A3A3A;line-height:1.5;">
        &bull;&nbsp; Same-day gallery link sent to this email with all your videos.
      </td></tr>
      <tr><td style="padding:8px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#3A3A3A;line-height:1.5;">
        &bull;&nbsp; You and your guests download directly &mdash; no login required.
      </td></tr>
    </table>
  </td></tr>

  <!-- Manage booking -->
  <tr><td style="background:#faf8f4;padding:24px 36px;border-top:1px solid #e8e3dd;text-align:center;">
    <p style="margin:0 0 14px 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#888580;line-height:1.6;">
      Need to reschedule, cancel, or check on your gallery after the event?
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td style="border:1px solid #c9913f;border-radius:2px;">
        <a href="${APP_URL}/book/manage?id=${b.id}" style="display:inline-block;padding:11px 24px;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9913f;text-decoration:none;">
          Manage My Booking &rarr;
        </a>
      </td></tr>
    </table>
    <p style="margin:12px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#bbb;line-height:1.5;">
      Bookmark this page &mdash; your gallery link will appear here after your event.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0F0F0F;padding:28px 36px;border-radius:0 0 3px 3px;">
    <p style="margin:0 0 6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#F5F0EA;">
      DEMARKS <span style="color:#C0293A;">360</span>
    </p>
    <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:rgba(245,240,234,0.35);">
      Calgary &middot; Airdrie &middot; Cochrane &middot; Chestermere &middot; Okotoks
    </p>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:rgba(245,240,234,0.25);line-height:1.6;">
      Questions? Reply to this email or visit <a href="${APP_URL}" style="color:#C0293A;text-decoration:none;">${APP_URL.replace('https://', '')}</a><br>
      &copy; ${new Date().getFullYear()} Demarks 360. All rights reserved.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

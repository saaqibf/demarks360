import { escapeHtml } from '@/lib/email/escape-html'

export interface EmailContent {
  subject: string
  html: string
}

export function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function money(v: string | number | null): string {
  return `$${Number(v ?? 0).toFixed(2)}`
}

export function firstName(name: string): string {
  return escapeHtml(name.split(' ')[0])
}

export function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2E2418;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9C8B6E;width:42%;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #2E2418;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#F5EFE2;font-weight:500;text-align:right;">${value}</td>
    </tr>`
}

export function ctaButton(href: string, label: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:26px 0 0 0;">
      <tr><td style="background:#E8B25C;border-radius:999px;">
        <a href="${href}" style="display:inline-block;padding:14px 30px;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#141009;text-decoration:none;">
          ${label}
        </a>
      </td></tr>
    </table>`
}

export function emailShell(heading: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#0B0906;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0906;padding:48px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
  <tr><td align="center" style="padding-bottom:26px;">
    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#F5EFE2;">
      Demarks<span style="color:#E8B25C;font-style:italic;">360</span>
    </p>
    <p style="margin:6px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#9C8B6E;">
      We create the atmosphere for celebration
    </p>
  </td></tr>
  <tr><td style="height:1px;font-size:0;line-height:0;background:#C9913F;">&nbsp;</td></tr>
  <tr><td style="background:#17110A;padding:34px 36px 8px 36px;">
    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;line-height:1.1;color:#F5EFE2;">
      ${heading}
    </h1>
  </td></tr>
  <tr><td style="background:#17110A;padding:20px 36px 36px 36px;">
    ${bodyHtml}
  </td></tr>
  <tr><td style="height:1px;font-size:0;line-height:0;background:#C9913F;">&nbsp;</td></tr>
  <tr><td align="center" style="padding:26px 36px;">
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#9C8B6E;line-height:1.7;">
      Questions? Just reply to this email &middot; 403 402 0816 &middot; demarks360.ca<br>
      &copy; ${new Date().getFullYear()} Demarks 360 &middot; Calgary, Alberta
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

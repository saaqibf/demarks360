import { escapeHtml } from '@/lib/email/escape-html'
import { APP_URL } from '@/lib/app-url'

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
      <td style="padding:11px 0;border-bottom:1px solid #EFE9DE;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9A917F;width:42%;">${label}</td>
      <td style="padding:11px 0;border-bottom:1px solid #EFE9DE;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#231C10;font-weight:500;text-align:right;">${value}</td>
    </tr>`
}

export function ctaButton(href: string, label: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:28px 0 0 0;">
      <tr><td style="background:#C9913F;border-radius:999px;">
        <a href="${href}" style="display:inline-block;padding:15px 32px;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">
          ${label}
        </a>
      </td></tr>
    </table>`
}

// Light-first shell: dark email themes get unpredictably recolored by Gmail and
// Outlook, so trust-critical emails stay cream/white with brand gold accents
export function emailShell(heading: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#EDE7DB;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#EDE7DB;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(20,16,9,0.16);">
  <!-- cinematic banner: an image, so email clients cannot recolor it -->
  <tr><td style="font-size:0;line-height:0;">
    <img src="${APP_URL}/email/header.jpg" width="600" alt="Demarks 360 - We create the atmosphere for celebration" style="display:block;border:0;width:100%;max-width:600px;height:auto;">
  </td></tr>
  <tr><td style="padding:34px 26px 10px 26px;">
    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;line-height:1.18;color:#1E1810;letter-spacing:0.2px;">
      ${heading}
    </h1>
  </td></tr>
  <tr><td style="padding:14px 26px 40px 26px;">
    ${bodyHtml}
  </td></tr>
  <!-- gold texture divider strip -->
  <tr><td style="font-size:0;line-height:0;">
    <img src="${APP_URL}/email/gold-strip.jpg" width="600" alt="" style="display:block;border:0;width:100%;max-width:600px;height:auto;">
  </td></tr>
  <tr><td align="center" style="background:#17110A;padding:28px 40px;">
    <p style="margin:0 0 12px 0;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#F5EFE2;">
      Demarks<span style="font-style:italic;color:#E8B25C;">360</span>
    </p>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#B6A78C;line-height:1.9;">
      Reply anytime &middot; 403 402 0816<br>
      <a href="https://demarks360.ca" style="color:#E8B25C;text-decoration:none;font-weight:600;">demarks360.ca</a>
      &nbsp;&middot;&nbsp;
      <a href="https://instagram.com/demarks360" style="color:#E8B25C;text-decoration:none;font-weight:600;">@demarks360</a>
      &nbsp;&middot;&nbsp; Calgary, Alberta<br>
      <span style="color:#7C7159;">&copy; ${new Date().getFullYear()} Demarks 360</span>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

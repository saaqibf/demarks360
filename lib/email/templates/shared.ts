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
<body style="margin:0;padding:0;background:#F2EDE3;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F2EDE3;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td align="center" style="padding:8px 0 26px 0;">
    <img src="${APP_URL}/email/logo.png" width="208" height="33" alt="Demarks 360 - We create the atmosphere for celebration" style="display:block;border:0;max-width:208px;height:auto;">
  </td></tr>
  <tr><td style="background:#FFFFFF;border:1px solid #E7DFD0;border-radius:16px;overflow:hidden;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="height:5px;font-size:0;line-height:0;background:#C9913F;">&nbsp;</td></tr>
      <tr><td style="padding:36px 40px 10px 40px;">
        <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:27px;font-weight:400;line-height:1.2;color:#231C10;">
          ${heading}
        </h1>
      </td></tr>
      <tr><td style="padding:16px 40px 40px 40px;">
        ${bodyHtml}
      </td></tr>
    </table>
  </td></tr>
  <tr><td align="center" style="padding:26px 36px;">
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#9A917F;line-height:1.8;">
      Questions? Just reply to this email &middot; 403 402 0816<br>
      <a href="https://demarks360.ca" style="color:#B07E2F;text-decoration:none;font-weight:600;">demarks360.ca</a> &middot; Calgary, Alberta<br>
      &copy; ${new Date().getFullYear()} Demarks 360
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

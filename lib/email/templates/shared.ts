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
      <td style="padding:9px 0;border-bottom:1px solid #e8e3dd;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#888580;width:42%;">${label}</td>
      <td style="padding:9px 0;border-bottom:1px solid #e8e3dd;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#0F0F0F;font-weight:500;text-align:right;">${value}</td>
    </tr>`
}

export function ctaButton(href: string, label: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:24px 0 0 0;">
      <tr><td style="background:#C0293A;border-radius:2px;">
        <a href="${href}" style="display:inline-block;padding:13px 26px;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
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
<body style="margin:0;padding:0;background:#F5F0EA;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EA;padding:48px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
  <tr><td style="padding-bottom:28px;">
    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#0F0F0F;">
      DEMARKS <span style="color:#C0293A;">360</span>
    </p>
  </td></tr>
  <tr><td style="background:#080808;padding:32px 36px;border-radius:3px 3px 0 0;">
    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:700;line-height:1.05;color:#F5F0EA;">
      ${heading}
    </h1>
  </td></tr>
  <tr><td style="background:#C0293A;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td style="background:#ffffff;padding:32px 36px;border-radius:0 0 3px 3px;">
    ${bodyHtml}
  </td></tr>
  <tr><td style="padding:24px 36px;">
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#a8a49e;line-height:1.6;">
      Questions? Just reply to this email.<br>
      &copy; ${new Date().getFullYear()} Demarks 360. Calgary, Alberta.
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

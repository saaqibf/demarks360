import { escapeHtml } from '@/lib/email/escape-html'
import { APP_URL } from '@/lib/app-url'

export interface EmailContent {
  subject: string
  html: string
}

// Fraunces (refined modern serif) for headings and money, Figtree for body.
// Both load via web font in clients that support it (Apple Mail, iOS) and fall
// back to Georgia / system sans everywhere else, so nothing looks broken.
const SERIF = "'Fraunces',Georgia,'Times New Roman',serif"
const SANS = "'Figtree',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
const INK = '#1A140C'
const MUTE = '#6B6355'
const FAINT = '#9A9080'
const GOLD = '#B8925A'
const HAIR = '#E9E3D8'

export function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  // Normalize a 24:00 end time (midnight) so it reads "12:00 AM", not "12:00 PM".
  const hh = h % 24
  const period = hh >= 12 ? 'PM' : 'AM'
  const hour = hh % 12 === 0 ? 12 : hh % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function money(v: string | number | null): string {
  return `$${Number(v ?? 0).toFixed(2)}`
}

export function firstName(name: string): string {
  return escapeHtml(name.split(' ')[0])
}

// A clean two-column data row: muted label left, ink value right-of-label
export function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:11px 0;font-family:${SANS};font-size:15px;color:${FAINT};width:38%;vertical-align:top;">${label}</td>
      <td style="padding:11px 0;font-family:${SANS};font-size:15px;color:${INK};font-weight:500;vertical-align:top;">${value}</td>
    </tr>`
}

// A money row with the amount set in serif, gold when it is the highlighted figure
export function moneyRow(label: string, value: string | number | null, opts: { gold?: boolean; big?: boolean } = {}): string {
  const border = opts.big ? '' : `border-bottom:1px solid ${HAIR};`
  const size = opts.big ? '23px' : '18px'
  const color = opts.gold ? GOLD : INK
  return `
    <tr>
      <td style="padding:${opts.big ? '16px 0 0 0' : '13px 0'};${border}font-family:${SANS};font-size:15px;color:${MUTE};">${label}</td>
      <td align="right" style="padding:${opts.big ? '16px 0 0 0' : '13px 0'};${border}font-family:${SERIF};font-size:${size};color:${color};">${money(value)}</td>
    </tr>`
}

const BODY_P = 'font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A5142;line-height:1.65;'

export function para(html: string, opts: { last?: boolean; small?: boolean } = {}): string {
  const style = opts.small
    ? 'font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#9A917F;line-height:1.65;'
    : BODY_P
  return `<p style="margin:${opts.last ? '0' : '0 0 16px 0'};${style}">${html}</p>`
}

// The operator's own words, set apart so the customer reads it as a personal note
export function personalNote(text: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px 0;">
      <tr><td style="border-left:3px solid ${GOLD};padding:4px 0 4px 16px;font-family:${SERIF};font-style:italic;font-size:16px;line-height:1.6;color:${INK};">
        ${escapeHtml(text).replace(/\n/g, '<br>')}
      </td></tr>
    </table>`
}

export function holdUntilLabel(d: Date): string {
  return d.toLocaleString('en-CA', {
    timeZone: 'America/Edmonton', weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export const CONTACT_LINE = 'Questions? Just reply to this email, or call or text us at '
  + '<a href="tel:+14034020816" style="color:#B07E2F;text-decoration:none;font-weight:600;">403 402 0816</a>.'

export function ctaButton(href: string, label: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:32px 0 0 0;">
      <tr><td style="background:${INK};border-radius:999px;">
        <a href="${href}" style="display:inline-block;padding:16px 42px;font-family:${SANS};font-size:13px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#F5EFE2;text-decoration:none;">
          ${label}
        </a>
      </td></tr>
    </table>`
}

export interface ShellOptions {
  eyebrow?: string
  // Photo hero: a hosted image with a serif title overlaid. Falls back to a
  // clean serif headline in the body when omitted.
  heroImage?: string
  heroTitle?: string
}

export function emailShell(heading: string, bodyHtml: string, opts: ShellOptions = {}): string {
  const hero = opts.heroImage
    ? `
      <tr><td style="font-size:0;line-height:0;">
        <img src="${opts.heroImage}" width="600" alt="" style="display:block;border:0;width:100%;max-width:600px;height:auto;">
      </td></tr>
      <tr><td style="background:#141009;padding:24px 44px 26px 44px;">
        <p style="margin:0;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#E8B25C;">Demarks 360</p>
        <p style="margin:9px 0 0 0;font-family:${SERIF};font-style:italic;font-size:32px;line-height:1.1;color:#FFFFFF;">${escapeHtml(opts.heroTitle ?? heading)}</p>
      </td></tr>`
    : `
      <tr><td style="padding:44px 44px 0 44px;">
        <p style="margin:0;font-family:${SERIF};font-size:24px;color:${INK};">Demarks<span style="font-style:italic;color:${GOLD};">360</span></p>
      </td></tr>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(heading)}</title>
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!--<![endif]-->
</head>
<body style="margin:0;padding:0;background:#EEEAE2;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#EEEAE2;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FBFAF7;">
  ${hero}
  <tr><td style="padding:${opts.heroImage ? '36px' : '30px'} 44px 8px 44px;">
    ${opts.eyebrow ? `<p style="margin:0 0 14px 0;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${GOLD};">${escapeHtml(opts.eyebrow)}</p>` : ''}
    ${!opts.heroImage ? `<h1 style="margin:0;font-family:${SERIF};font-size:32px;font-weight:400;line-height:1.15;color:${INK};">${heading}</h1>` : ''}
  </td></tr>
  <tr><td style="padding:14px 44px 40px 44px;">
    ${bodyHtml}
  </td></tr>
  <tr><td style="background:#141009;padding:32px 44px;text-align:center;">
    <p style="margin:0;font-family:${SERIF};font-size:20px;color:#F5EFE2;">Demarks<span style="font-style:italic;color:#E8B25C;">360</span></p>
    <p style="margin:12px 0 0 0;font-family:${SANS};font-size:12px;color:#9C8B6E;line-height:1.9;">
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

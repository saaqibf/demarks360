// Base for absolute links in emails and for Stripe redirect URLs.
// Order matters: an explicit APP_URL wins, then the public site URL (always set
// in prod, and what og:url uses), then Vercel's production URL, then localhost.
// This prevents emails/payment links from ever falling back to localhost in prod
// when APP_URL is missing on a deployment.
function resolveAppUrl(): string {
  const explicit = process.env.APP_URL?.trim()
  if (explicit && !explicit.includes('localhost')) return explicit.replace(/\/+$/, '')

  const publicUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (publicUrl && !publicUrl.includes('localhost')) return publicUrl.replace(/\/+$/, '')

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProd) return `https://${vercelProd.replace(/\/+$/, '')}`

  return explicit || 'http://localhost:3000'
}

export const APP_URL = resolveAppUrl()

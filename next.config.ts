import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Close base-tag hijacking, plugin/object embedding, framing (clickjacking) and
      // stray form posts. script-src keeps 'unsafe-inline'/'unsafe-eval' because Next.js
      // hydration + Clerk need them without a nonce-based CSP (a tested nonce migration
      // is tracked separately).
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.stripe.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.stripe.com https://*.clerk.com https://*.clerk.accounts.dev https://*.sentry.io",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.stripe.com https://img.clerk.com https://*.cloudfront.net https://image.mux.com https://*.digitaloceanspaces.com",
      "media-src 'self' https://stream.mux.com https://*.mux.com https://res.cloudinary.com https://*.digitaloceanspaces.com blob:",
      "connect-src 'self' https://*.stripe.com https://*.clerk.com https://*.clerk.accounts.dev https://*.sentry.io wss://*.pusher.com https://*.mux.com https://api.mux.com",
      "frame-src https://*.stripe.com https://*.clerk.com https://*.clerk.accounts.dev",
      "worker-src blob:",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: 'demarks360',
  project: 'demarks360',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: false,
  },
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
})

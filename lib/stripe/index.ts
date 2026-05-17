import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY not set — payment features will fail')
}

// Stripe v22 validates the key format at instantiation; use a structurally valid
// placeholder so the module can be imported during build even without a real key.
// Use || (not ??) so an empty-string env value also triggers the fallback.
const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_00000000000000000000000000000000000000000000000000'

export const stripe = new Stripe(apiKey, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

import { PRICING } from '@/lib/pricing'

// Landing-page pricing anchor: the cheapest possible booking (minimum duration at the hourly rate)
export const FROM_PRICE = Math.round(PRICING.HOURLY_RATE * (PRICING.MIN_DURATION_MINUTES / 60))

export interface PackageFeature {
  lead?: string
  rest: string
}

export interface LandingPackage {
  tier: string
  badge?: string
  starred?: boolean
  priceLabel: string
  priceNote: string
  compactPrice?: boolean
  features: PackageFeature[]
}

// All package prices derive from lib/pricing/config.ts so the landing page,
// the JSON-LD, and the checkout can never quote different numbers.
export const PACKAGES: LandingPackage[] = [
  {
    tier: 'Essential',
    priceLabel: `$${2 * PRICING.HOURLY_RATE}`,
    priceNote: ' / 2 hrs',
    features: [
      { lead: '2 hours', rest: ' of unlimited spins' },
      { rest: 'Professional attendant, setup & teardown' },
      { rest: 'Same-day shareable gallery' },
      { rest: 'LED ring light' },
    ],
  },
  {
    tier: 'Celebration',
    badge: 'Most booked',
    starred: true,
    priceLabel: `$${3 * PRICING.HOURLY_RATE}`,
    priceNote: ' / 3 hrs',
    features: [
      { lead: '3 hours', rest: ' of unlimited spins' },
      { rest: 'Everything in Essential' },
      { rest: 'Props that are not tacky' },
      { rest: 'Custom video overlay with your names' },
      { rest: 'Backdrop matched to your theme' },
    ],
  },
  {
    tier: 'All-night',
    priceLabel: `From $${4 * PRICING.HOURLY_RATE}`,
    priceNote: ' / 4+ hrs',
    compactPrice: true,
    features: [
      { lead: '4+ hours', rest: ', evening to last dance' },
      { rest: 'Everything in Celebration' },
      { rest: 'Second attendant for big guest lists' },
      { rest: 'Priority next-morning highlight reel' },
    ],
  },
]

export interface LandingFaq {
  q: string
  a: string
}

// Single FAQ source: the visible <details> markup and the FAQPage JSON-LD are both generated from this array
export const FAQS: LandingFaq[] = [
  {
    q: 'How much space does the booth need?',
    a: 'A 10 by 10 foot footprint with standard ceiling height works perfectly. We have set up in living rooms, banquet halls, offices, and backyards. We just need a regular power outlet within 25 feet.',
  },
  {
    q: 'How do guests get their videos?',
    a: 'Right at the booth. A quick QR code pops up on screen, guests scan it with their phone camera, and the video is theirs to save and share in seconds. No app to install and no waiting until after the event.',
  },
  {
    q: 'Can it run outdoors?',
    a: 'Yes, from May to September, with a covered or wind-sheltered spot. For winter events we keep it indoors. This is Calgary after all.',
  },
  {
    q: 'How far do you travel?',
    a: 'Calgary and area is included: Airdrie, Chestermere, Okotoks, Cochrane. Farther out is usually fine too, with a small travel fee shown upfront when you book.',
  },
  {
    q: 'What do you need to hold a date?',
    a: 'A deposit through our secure checkout holds your date. The rest is due the week of the event. Cancel 7 or more days out and the deposit moves to a new date, no questions.',
  },
]

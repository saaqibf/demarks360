export interface PackageFeature {
  lead?: string
  rest: string
}

export interface LandingPackage {
  tier: string
  badge?: string
  starred?: boolean
  // No public prices: every tier is quoted per event, so this slot carries a
  // quote-oriented label instead of a dollar amount.
  quoteLabel: string
  features: PackageFeature[]
}

// Tiers and their feature lists are public; the dollar amounts are not. Pricing
// is shared privately in each customer's quote.
export const PACKAGES: LandingPackage[] = [
  {
    tier: 'Essential',
    quoteLabel: 'Custom quote',
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
    quoteLabel: 'Custom quote',
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
    quoteLabel: 'Custom quote',
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
    a: 'Calgary and area is included: Airdrie, Chestermere, Okotoks, Cochrane. Farther out is usually fine too, with any small travel cost included in your quote.',
  },
  {
    q: 'How does pricing work?',
    a: 'You request a quote with your event details and we reply with tailored pricing for your date, hours, and any add-ons. Once you are happy with it, a deposit holds your date. The rest is due the week of the event. Cancel 7 or more days out and the deposit moves to a new date, no questions.',
  },
]

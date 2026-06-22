export const revalidate = 300

import type { Metadata } from 'next'
import { DemarksLandingFx } from './_components/demarks-landing-fx'
import './_components/demarks-landing.css'

export const metadata: Metadata = {
  title: 'Demarks 360: Calgary 360° Video Booth Rental',
  description:
    '360° slow-motion video booth rental in Calgary. Same-day gallery delivery, unlimited takes, cinematic results. From $225. Book online.',
  alternates: { canonical: 'https://demarks360.com' },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Demarks 360',
  description: '360° slow-motion video booth rental for events in Calgary and surrounding areas.',
  url: 'https://demarks360.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Calgary',
    addressRegion: 'AB',
    addressCountry: 'CA',
  },
  areaServed: ['Calgary', 'Airdrie', 'Cochrane', 'Chestermere', 'Okotoks', 'Rocky View County'],
  priceRange: '$$',
  openingHours: 'Mo-Su 09:00-22:00',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
  sameAs: ['https://instagram.com/demarks360'],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much space does the booth need?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A 10 by 10 foot footprint with standard ceiling height. We have set up in living rooms, banquet halls, offices, and backyards. We just need a regular power outlet within 25 feet.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do guests get their videos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Right at the booth. We send your video straight to your phone by text or WhatsApp. Tap to save and it goes directly into your photos. No QR codes to scan, no downloading from a gallery link.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can the booth run outdoors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, from May to September with a covered or wind-sheltered spot. For winter events we keep it indoors.',
      },
    },
    {
      '@type': 'Question',
      name: 'How far do you travel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Calgary and area is included: Airdrie, Chestermere, Okotoks, Cochrane. Travel farther is usually fine with a small fee shown upfront when you book.',
      },
    },
    {
      '@type': 'Question',
      name: 'What do you need to hold a date?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A deposit through our secure checkout holds your date. The rest is due the week of the event. Cancel 7 or more days out and the deposit moves to a new date.',
      },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <DemarksLandingFx />

      <div className="dm-landing">

        {/* ── Nav ── */}
        <nav className="dm-nav" id="dm-nav">
          <a className="dm-wordmark" href="/">Demarks<em>360</em></a>
          <div className="dm-nav-links">
            <a href="#dm-experience">The experience</a>
            <a href="#dm-packages">Packages</a>
            <a href="#dm-gallery">Gallery</a>
            <a href="#dm-faq">FAQ</a>
          </div>
          <div className="dm-nav-right">
            <a className="dm-ghost-btn" href="#dm-check">Check your date</a>
            <a className="dm-cta-btn" href="/book">Book now</a>
            <button className="dm-burger" id="dm-burger" aria-label="Open menu">
              <i /><i /><i />
            </button>
          </div>
        </nav>

        <div id="dm-mobile-menu" role="dialog" aria-label="Navigation menu">
          <a href="#dm-experience">The experience</a>
          <a href="#dm-packages">Packages</a>
          <a href="#dm-gallery">Gallery</a>
          <a href="#dm-faq">FAQ</a>
          <a className="dm-cta-btn" href="/book" style={{ fontSize: '0.72rem' }}>Book now</a>
        </div>

        {/* ── Hero ── */}
        <header className="dm-hero" id="dm-hero">
          <canvas id="dm-ring-canvas" aria-hidden="true" />
          <div className="dm-hero-copy">
            <p className="dm-hero-kicker">Calgary&apos;s 360° slow-motion video booth</p>
            <h1>
              <span className="dm-line"><span>Every angle</span></span>
              <span className="dm-line"><span>of <em>the moment.</em></span></span>
            </h1>
            <p className="dm-hero-sub">
              Cinematic slow-motion video of your guests, captured in one spin and delivered the same day.
            </p>
            <div className="dm-hero-ctas">
              <a className="dm-cta-btn" href="/book">Check your date</a>
              <a className="dm-ghost-btn" href="#dm-experience">See it in action</a>
            </div>
            <div className="dm-hero-proof">
              <span><b>★ 5.0</b> Google reviews</span>
              <span><b>120fps</b> slow motion</span>
              <span><b>Same-day</b> gallery</span>
            </div>
          </div>
          <div className="dm-scroll-hint" aria-hidden="true">Scroll</div>
        </header>

        {/* ── Experience ── */}
        <section className="dm-sect" id="dm-experience">
          <div className="dm-sect-head">
            <span className="dm-eyebrow">The experience · 001</span>
            <h2>Your event, shot like a <em>film premiere.</em></h2>
          </div>
          <div className="dm-steps">
            <div className="dm-step">
              <div className="dm-step-visual">
                <div className="dm-step-img" />
                <span className="dm-frame-lbl">Frame 001 · Step on</span>
              </div>
              <div className="dm-step-copy">
                <span className="dm-step-no">01</span>
                <h3>Step on the platform</h3>
                <p>
                  Your guests step up, the camera arm begins its orbit, and the room turns into a film set.{' '}
                  <strong>No instructions needed.</strong> Our attendant handles everything.
                </p>
              </div>
            </div>
            <div className="dm-step">
              <div className="dm-step-visual">
                <div className="dm-step-img" />
                <span className="dm-frame-lbl">Frame 002 · The spin</span>
              </div>
              <div className="dm-step-copy">
                <span className="dm-step-no">02</span>
                <h3>The camera orbits</h3>
                <p>
                  One smooth 360° revolution in buttery slow motion. Confetti hangs in the air. Laughter stretches
                  into something cinematic. <strong>Unlimited spins, all night.</strong>
                </p>
              </div>
            </div>
            <div className="dm-step">
              <div className="dm-step-visual">
                <div className="dm-step-img" />
                <span className="dm-frame-lbl">Frame 003 · Same-day gallery</span>
              </div>
              <div className="dm-step-copy">
                <span className="dm-step-no">03</span>
                <h3>Leave with the video</h3>
                <p>
                  Your video lands in your texts or WhatsApp the moment it is ready. One tap saves it{' '}
                  <strong>directly to your camera roll.</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        <hr className="dm-amber-rule" />

        {/* ── Packages ── */}
        <section className="dm-sect" id="dm-packages">
          <div className="dm-sect-head dm-center">
            <span className="dm-eyebrow">Packages · 002</span>
            <h2>Clear pricing. <em>Zero surprises.</em></h2>
          </div>
          <div className="dm-packs">

            <div className="dm-pack">
              <span className="dm-pack-tier">Essential</span>
              <div className="dm-pack-price">$300<small> / 2 hrs</small></div>
              <ul>
                <li><b>2 hours</b> of unlimited spins</li>
                <li>Professional attendant, setup &amp; teardown</li>
                <li>Same-day shareable gallery</li>
                <li>LED ring light</li>
              </ul>
              <a className="dm-ghost-btn" href="/book">Check your date</a>
            </div>

            <div className="dm-pack dm-pack--star">
              <span className="dm-pack-badge">Most booked</span>
              <span className="dm-pack-tier">Celebration</span>
              <div className="dm-pack-price">$450<small> / 3 hrs</small></div>
              <ul>
                <li><b>3 hours</b> of unlimited spins</li>
                <li>Everything in Essential</li>
                <li>Props that are not tacky</li>
                <li>Custom video overlay with your names</li>
                <li>Backdrop matched to your theme</li>
              </ul>
              <a className="dm-cta-btn" href="/book">Check your date</a>
            </div>

            <div className="dm-pack">
              <span className="dm-pack-tier">All-night</span>
              <div className="dm-pack-price" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)' }}>From $600<small> / 4+ hrs</small></div>
              <ul>
                <li><b>4+ hours</b>, evening to last dance</li>
                <li>Everything in Celebration</li>
                <li>Second attendant for big guest lists</li>
                <li>Priority next-morning highlight reel</li>
              </ul>
              <a className="dm-ghost-btn" href="/book">Check your date</a>
            </div>

          </div>
          <p className="dm-packs-note">
            Travel included within Calgary. Weddings and corporate events get a custom quote in the booking flow.
          </p>
        </section>

        {/* ── Date checker band ── */}
        <div className="dm-check-band" id="dm-check">
          <div className="dm-check-inner">
            <div>
              <span className="dm-eyebrow">Availability</span>
              <h2>Is your date <em>still open?</em></h2>
            </div>
            <div className="dm-check-form">
              <a className="dm-cta-btn" href="/book" style={{ textAlign: 'center' }}>
                Check availability
              </a>
            </div>
          </div>
        </div>

        {/* ── Gallery ── */}
        <section className="dm-gallery-wrap" id="dm-gallery">
          <div className="dm-gallery-head">
            <span className="dm-eyebrow">Fresh reels · 003</span>
            <h2>From <em>last weekend&apos;s</em> events.</h2>
          </div>
          <div className="dm-reel" id="dm-reel">
            <figure className="dm-frame">
              <div className="dm-frame-ph"><div className="dm-frame-fill" /></div>
              <figcaption><span>Aisha&apos;s 30th</span><span>YYC</span></figcaption>
            </figure>
            <figure className="dm-frame">
              <div className="dm-frame-ph"><div className="dm-frame-fill" /></div>
              <figcaption><span>Singh wedding</span><span>YYC</span></figcaption>
            </figure>
            <figure className="dm-frame">
              <div className="dm-frame-ph"><div className="dm-frame-fill" /></div>
              <figcaption><span>Stampede social</span><span>YYC</span></figcaption>
            </figure>
            <figure className="dm-frame">
              <div className="dm-frame-ph"><div className="dm-frame-fill" /></div>
              <figcaption><span>UofC grad</span><span>YYC</span></figcaption>
            </figure>
            <figure className="dm-frame">
              <div className="dm-frame-ph"><div className="dm-frame-fill" /></div>
              <figcaption><span>TELUS team night</span><span>YYC</span></figcaption>
            </figure>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <a className="dm-ghost-btn" href="/gallery">Open the full gallery</a>
          </div>
        </section>

        <hr className="dm-amber-rule" />

        {/* ── Reviews ── */}
        <section className="dm-sect">
          <div className="dm-sect-head">
            <span className="dm-eyebrow">Reviews · 004</span>
            <h2>The part of the night <em>everyone remembers.</em></h2>
          </div>
          <div className="dm-reviews">
            <div className="dm-rev-main">
              <blockquote>
                &ldquo;The videos were ready before the cake was cut. My cousins in Lagos were watching my mom&apos;s{' '}
                <em>60th birthday spin</em> the same night.&rdquo;
              </blockquote>
              <div className="dm-rev-by">
                <span>Funmi · 60th birthday, Skyview</span>
                <span className="dm-stars">★★★★★</span>
              </div>
            </div>
            <div className="dm-rev-side">
              <div className="dm-rev">
                <q>
                  Booked it for our wedding reception kind of last minute and honestly it was the best money we spent.
                  The attendant kept the line moving and hyped everyone up.
                </q>
                <div className="dm-rev-by">
                  <span>Jasleen &amp; Arjun · wedding</span>
                  <span className="dm-stars">★★★★★</span>
                </div>
              </div>
              <div className="dm-rev">
                <q>Our whole office is still posting the videos. Two weeks later. HR wants it back for the holiday party.</q>
                <div className="dm-rev-by">
                  <span>Mark · corporate event</span>
                  <span className="dm-stars">★★★★★</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="dm-amber-rule" />

        {/* ── FAQ ── */}
        <section className="dm-sect" id="dm-faq">
          <div className="dm-sect-head dm-center">
            <span className="dm-eyebrow">FAQ · 005</span>
            <h2>Before you <em>book.</em></h2>
          </div>
          <div className="dm-faq-wrap">
            <details className="dm-faq" open>
              <summary>
                How much space does the booth need?
                <span className="dm-faq-icon">+</span>
              </summary>
              <div className="dm-faq-ans">
                A 10 by 10 foot footprint with standard ceiling height works perfectly. We have set up in living rooms,
                banquet halls, offices, and backyards. We just need a regular power outlet within 25 feet.
              </div>
            </details>
            <details className="dm-faq">
              <summary>
                How do guests get their videos?
                <span className="dm-faq-icon">+</span>
              </summary>
              <div className="dm-faq-ans">
                Right at the booth. We send your video straight to your phone by text or WhatsApp. Tap to save and it
                goes directly into your photos. No QR codes to scan, no downloading from a gallery link.
              </div>
            </details>
            <details className="dm-faq">
              <summary>
                Can it run outdoors?
                <span className="dm-faq-icon">+</span>
              </summary>
              <div className="dm-faq-ans">
                Yes, from May to September, with a covered or wind-sheltered spot. For winter events we keep it indoors.
                This is Calgary after all.
              </div>
            </details>
            <details className="dm-faq">
              <summary>
                How far do you travel?
                <span className="dm-faq-icon">+</span>
              </summary>
              <div className="dm-faq-ans">
                Calgary and area is included: Airdrie, Chestermere, Okotoks, Cochrane. Farther out is usually fine too,
                with a small travel fee shown upfront when you book.
              </div>
            </details>
            <details className="dm-faq">
              <summary>
                What do you need to hold a date?
                <span className="dm-faq-icon">+</span>
              </summary>
              <div className="dm-faq-ans">
                A deposit through our secure checkout holds your date. The rest is due the week of the event. Cancel 7 or
                more days out and the deposit moves to a new date, no questions.
              </div>
            </details>
          </div>
        </section>

        {/* ── Finale ── */}
        <section className="dm-finale">
          <h2>Some moments deserve <em>every angle.</em></h2>
          <a className="dm-cta-btn" href="/book" style={{ padding: '1.3rem 3.2rem' }}>
            Check your date
          </a>
        </section>

        {/* ── Footer ── */}
        <footer>
          <div className="dm-foot-grid">
            <div className="dm-foot-brand">
              <a className="dm-wordmark" href="/">Demarks<em>360</em></a>
              <p>Calgary&apos;s 360° slow-motion video booth. Family-run, every event welcome, every moment cinematic.</p>
            </div>
            <div className="dm-fcol">
              <h5>Book</h5>
              <a href="#dm-packages">Packages</a>
              <a href="/book">Check your date</a>
              <a href="#dm-gallery">Gallery</a>
              <a href="#dm-faq">FAQ</a>
            </div>
            <div className="dm-fcol">
              <h5>Events</h5>
              <a href="/book?eventType=Wedding">Weddings</a>
              <a href="/book?eventType=Birthday">Birthdays</a>
              <a href="/book?eventType=Corporate">Corporate</a>
              <a href="/book?eventType=Graduation">Graduations</a>
            </div>
            <div className="dm-fcol">
              <h5>Contact</h5>
              <a href="tel:+15879179272">587-917-9272</a>
              <a href="tel:+14034020816">403-402-0816</a>
              <a href="mailto:hello@demarks360.com">hello@demarks360.com</a>
              <a href="https://instagram.com/demarks360" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://tiktok.com/@demarks360" target="_blank" rel="noopener noreferrer">TikTok</a>
              <a href="/privacy">Privacy policy</a>
              <a href="/terms">Terms of service</a>
            </div>
          </div>
          <div className="dm-foot-base">
            <span>© 2026 Demarks 360</span>
            <span>Calgary, Alberta</span>
          </div>
        </footer>

      </div>
    </>
  )
}

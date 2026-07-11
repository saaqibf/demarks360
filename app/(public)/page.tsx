export const revalidate = 300

import type { Metadata } from 'next'

import { SiteFooter } from '@/components/public/site-footer'
import { SiteNav } from '@/components/public/site-nav'
import { FAQS, FROM_PRICE, PACKAGES } from '@/lib/content/landing'

import { DemarksLandingFx } from './_components/demarks-landing-fx'
import './_components/demarks-landing.css'

export const metadata: Metadata = {
  title: 'Demarks 360: Calgary 360° Video Booth Rental',
  description:
    `360° slow-motion video booth rental in Calgary. Same-day gallery delivery, unlimited takes, cinematic results. From $${FROM_PRICE}. Book online.`,
  alternates: { canonical: 'https://demarks360.ca' },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Demarks 360',
  description: '360° slow-motion video booth rental for events in Calgary and surrounding areas.',
  url: 'https://demarks360.ca',
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

// Generated from the same FAQS array as the visible FAQ markup, so the two can never drift
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
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

        <SiteNav />

        {/* ── Hero ── */}
        <header className="dm-hero" id="dm-hero" data-nav-section="dm-hero" data-nav-label="Home">
          <div className="dm-hero-set" id="dm-hero-set" aria-hidden="true">

            {/* Far depth: back light rig, spotlight, big atmosphere */}
            <div className="dm-parallax dm-parallax--far">
              <div className="dm-glow-horizon" />
              <div className="dm-glow-high" />
              <div className="dm-spot" />
              <div className="dm-orbit dm-orbit--far">
                <div className="dm-orbit-rotator" id="dm-orbit-rotator-far">
                  <span className="dm-orbit-head" />
                </div>
              </div>
              <div className="dm-bokeh dm-bokeh--a" />
              <div className="dm-bokeh dm-bokeh--d" />
              <span className="dm-mote dm-mote--1" />
              <span className="dm-mote dm-mote--2" />
              <span className="dm-mote dm-mote--3 dm-mote--desk" />
              <span className="dm-mote dm-mote--4 dm-mote--desk" />
              <span className="dm-mote dm-mote--5 dm-mote--desk" />
            </div>

            {/* Mid depth: the signature orbit with its comet tail */}
            <div className="dm-parallax dm-parallax--mid">
              <div className="dm-bokeh dm-bokeh--b" />
              <div className="dm-bokeh dm-bokeh--c" />
              <div className="dm-orbit">
                <div className="dm-orbit-trail" data-dm-trail="6"><span /></div>
                <div className="dm-orbit-trail" data-dm-trail="5"><span /></div>
                <div className="dm-orbit-trail" data-dm-trail="4"><span /></div>
                <div className="dm-orbit-trail" data-dm-trail="3"><span /></div>
                <div className="dm-orbit-trail" data-dm-trail="2"><span /></div>
                <div className="dm-orbit-trail" data-dm-trail="1"><span /></div>
                <div className="dm-orbit-rotator" id="dm-orbit-rotator">
                  <span className="dm-orbit-head" />
                </div>
              </div>
              <span className="dm-mote dm-mote--6" />
              <span className="dm-mote dm-mote--7" />
              <span className="dm-mote dm-mote--8" />
              <span className="dm-mote dm-mote--9 dm-mote--desk" />
              <span className="dm-mote dm-mote--10 dm-mote--desk" />
            </div>

            {/* Near depth: static dust closest to the lens */}
            <span className="dm-mote dm-mote--11" />
            <span className="dm-mote dm-mote--12" />
            <span className="dm-mote dm-mote--13 dm-mote--desk" />
            <span className="dm-mote dm-mote--14 dm-mote--desk" />
          </div>

          <div className="dm-hero-copy">
            <p className="dm-hero-kicker">Calgary&apos;s 360° slow-motion video booth</p>
            <h1>
              <span className="dm-line"><span>Every angle</span></span>
              <span className="dm-line"><span>of <em className="dm-em">the moment.<span className="dm-em-glow" aria-hidden="true">the moment.</span></em></span></span>
            </h1>
            <p className="dm-hero-sub">
              Cinematic slow-motion video of your guests, captured in one spin and delivered the same day.
            </p>
            <div className="dm-hero-ctas">
              <a className="btn-primary btn--lg" href="/book">Check your date</a>
              <a className="btn-ghost" href="#dm-experience">See it in action</a>
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
        <section className="dm-sect" id="dm-experience" data-nav-section="dm-experience" data-nav-label="Experience">
          <div className="dm-sect-head">
            <span className="dm-eyebrow">The experience · 001</span>
            <h2><span className="dm-line"><span>Your event, shot like a <em>film premiere.</em></span></span></h2>
          </div>
          <div className="dm-steps">
            <div className="dm-step">
              <div className="dm-step-visual">
                <div className="dm-step-img" />
                <img className="dm-media dm-step-media" src="/media/step-1.jpg" alt="" loading="lazy" />
                <span className="dm-frame-lbl">Frame 001 · Step on</span>
                <span className="dm-shutter" aria-hidden="true" />
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
                <img className="dm-media dm-step-media" src="/media/step-2.jpg" alt="" loading="lazy" />
                <span className="dm-frame-lbl">Frame 002 · The spin</span>
                <span className="dm-shutter" aria-hidden="true" />
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
                <img className="dm-media dm-step-media" src="/media/step-3.jpg" alt="" loading="lazy" />
                <span className="dm-frame-lbl">Frame 003 · Same-day gallery</span>
                <span className="dm-shutter" aria-hidden="true" />
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
        <section className="dm-sect" id="dm-packages" data-nav-section="dm-packages" data-nav-label="Packages">
          <div className="dm-sect-head dm-center">
            <span className="dm-eyebrow">Packages · 002</span>
            <h2><span className="dm-line"><span>Clear pricing. <em>Zero surprises.</em></span></span></h2>
          </div>
          <div className="dm-packs">

            {PACKAGES.map((pack) => (
              <div
                key={pack.tier}
                className={`dm-card dm-card--lift dm-pack${pack.starred ? ' dm-pack--star' : ''}`}
              >
                {pack.badge && (
                  <span className="dm-pack-badge-mask">
                    <span className="dm-pack-badge">{pack.badge}</span>
                  </span>
                )}
                <span className="dm-pack-tier">{pack.tier}</span>
                <div className={`dm-pack-price${pack.compactPrice ? ' dm-pack-price--compact' : ''}`}>
                  {pack.priceLabel}<small>{pack.priceNote}</small>
                </div>
                <ul>
                  {pack.features.map((f, i) => (
                    <li key={i}>{f.lead && <b>{f.lead}</b>}{f.rest}</li>
                  ))}
                </ul>
                <a className={pack.starred ? 'btn-primary' : 'btn-ghost'} href="/book">Check your date</a>
              </div>
            ))}

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
              <h2><span className="dm-line"><span>Is your date <em>still open?</em></span></span></h2>
            </div>
            <div className="dm-check-form">
              <input
                id="dm-check-date"
                className="dm-field"
                type="date"
                aria-label="Event date"
              />
              <a id="dm-check-cta" className="btn-primary" href="/book">
                Check your date
              </a>
            </div>
          </div>
        </div>

        {/* ── Gallery ── */}
        <section className="dm-gallery-wrap" id="dm-gallery" data-nav-section="dm-gallery" data-nav-label="Gallery">
          <div className="dm-gallery-head">
            <span className="dm-eyebrow">Fresh reels · 003</span>
            <h2><span className="dm-line"><span>From <em>last weekend&apos;s</em> events.</span></span></h2>
          </div>
          <div className="dm-reel-scroller">
            <div className="dm-reel" id="dm-reel">
              <figure className="dm-frame">
                <div className="dm-frame-ph"><div className="dm-frame-fill" /><img className="dm-media dm-frame-media" src="/media/gallery-1.jpg" alt="" loading="lazy" /></div>
                <figcaption><span>Aisha&apos;s 30th</span><span>YYC</span></figcaption>
              </figure>
              <figure className="dm-frame">
                <div className="dm-frame-ph"><div className="dm-frame-fill" /><img className="dm-media dm-frame-media" src="/media/gallery-2.jpg" alt="" loading="lazy" /></div>
                <figcaption><span>Singh wedding</span><span>YYC</span></figcaption>
              </figure>
              <figure className="dm-frame">
                <div className="dm-frame-ph"><div className="dm-frame-fill" /><img className="dm-media dm-frame-media" src="/media/gallery-3.jpg" alt="" loading="lazy" /></div>
                <figcaption><span>Stampede social</span><span>YYC</span></figcaption>
              </figure>
              <figure className="dm-frame">
                <div className="dm-frame-ph"><div className="dm-frame-fill" /><img className="dm-media dm-frame-media" src="/media/gallery-4.jpg" alt="" loading="lazy" /></div>
                <figcaption><span>UofC grad</span><span>YYC</span></figcaption>
              </figure>
              <figure className="dm-frame">
                <a className="dm-frame-link" href="/book">
                  <div className="dm-frame-ph"><div className="dm-frame-fill" /><div className="dm-frame-card"><span>Your event, next weekend</span></div></div>
                </a>
                <figcaption><span>Reserve the date</span><span>YYC</span></figcaption>
              </figure>
            </div>
          </div>
          <div className="dm-gallery-cta">
            <a className="btn-ghost" href="/gallery">Open the full gallery</a>
          </div>
        </section>

        <hr className="dm-amber-rule" />

        {/* ── Reviews ── */}
        <section className="dm-sect">
          <div className="dm-sect-head">
            <span className="dm-eyebrow">Reviews · 004</span>
            <h2><span className="dm-line"><span>The part of the night <em>everyone remembers.</em></span></span></h2>
          </div>
          <div className="dm-reviews">
            <div className="dm-rev-main">
              <blockquote>
                &ldquo;The videos were ready before the cake was cut. My cousins in Lagos were watching my mom&apos;s{' '}
                <em>60th birthday spin</em>{' '}the same night.&rdquo;
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
        <section className="dm-sect" id="dm-faq" data-nav-section="dm-faq" data-nav-label="FAQ">
          <div className="dm-sect-head dm-center">
            <span className="dm-eyebrow">FAQ · 005</span>
            <h2><span className="dm-line"><span>Before you <em>book.</em></span></span></h2>
          </div>
          <div className="dm-faq-wrap">
            {FAQS.map((faq, i) => (
              <details key={faq.q} className="dm-faq" open={i === 0}>
                <summary>
                  {faq.q}
                  <span className="dm-faq-icon">+</span>
                </summary>
                <div className="dm-faq-ans-wrap">
                  <div className="dm-faq-ans">
                    <div className="dm-faq-ans-inner">{faq.a}</div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Finale ── */}
        <section className="dm-finale">
          <div className="dm-finale-orbit" aria-hidden="true">
            <div className="dm-finale-rotator" id="dm-finale-rotator">
              <span className="dm-orbit-head" />
            </div>
          </div>
          <h2><span className="dm-line"><span>Some moments deserve <em className="dm-em">every angle.<span className="dm-em-glow" aria-hidden="true">every angle.</span></em></span></span></h2>
          <a className="btn-primary btn--lg" href="/book">
            Check your date
          </a>
        </section>

        <div id="dm-contact" data-nav-section="dm-contact" data-nav-label="Contact">
          <SiteFooter />
        </div>

      </div>
    </>
  )
}

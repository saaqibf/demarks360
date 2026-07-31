export const revalidate = 300

import type { Metadata } from 'next'

import { HeroHeadline } from '@/components/public/hero-headline'
import { HeroIntro } from '@/components/public/hero-intro'
import { InviewVideo } from '@/components/public/inview-video'
import { SiteFooter } from '@/components/public/site-footer'
import { SiteNav } from '@/components/public/site-nav'
import { FAQS, PACKAGES } from '@/lib/content/landing'

import { DemarksLandingFx } from './_components/demarks-landing-fx'
import './_components/demarks-landing.css'

export const metadata: Metadata = {
  title: 'Demarks 360: Calgary 360° Video Booth Rental',
  description:
    '360° slow-motion video booth rental in Calgary. Same-day gallery delivery, unlimited takes, cinematic results. Request a quote.',
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
  openingHours: 'Mo-Su 09:00-22:00',
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

      <noscript><style>{`.dm-intro{display:none!important}`}</style></noscript>

      <div className="dm-landing">

        <HeroIntro />
        <SiteNav />

        {/* ── Hero ── */}
        <header className="dm-hero" id="dm-hero" data-nav-section="dm-hero" data-nav-label="Home">
          <div className="dm-hero-set" id="dm-hero-set" aria-hidden="true">
            {/* Cinematic booth footage as the living hero background */}
            <video
              className="dm-hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/media/hero-still.jpg"
            >
              <source src="/media/hero-loop.mp4" type="video/mp4" />
            </video>
            <div className="dm-hero-scrim" />
            <div className="dm-hero-boot" aria-hidden="true" />
          </div>

          <div className="dm-hero-copy">
            <p className="dm-hero-kicker">Calgary&apos;s 360° slow-motion video booth</p>
            <HeroHeadline />
            <p className="dm-hero-sub">
              Cinematic slow-motion video of your guests, captured in one spin and delivered the same day.
            </p>
            <div className="dm-hero-ctas">
              <a className="btn-primary btn--lg" href="/book">Request a quote</a>
              <a className="btn-ghost" href="#dm-experience">See it in action</a>
            </div>
            <div className="dm-hero-proof">
              <span><b>Unlimited</b> takes</span>
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
                  Scan the QR code at the booth and your clip is ready the moment it is. One tap saves it{' '}
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
            <h2><span className="dm-line"><span>Built for <em>your kind of night.</em></span></span></h2>
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
                <div className="dm-pack-price">
                  {pack.quoteLabel}
                </div>
                <ul>
                  {pack.features.map((f, i) => (
                    <li key={i}>{f.lead && <b>{f.lead}</b>}{f.rest}</li>
                  ))}
                </ul>
                <a className={pack.starred ? 'btn-primary' : 'btn-ghost'} href="/book">Request a quote</a>
              </div>
            ))}

          </div>
          <p className="dm-packs-note">
            Travel included within Calgary. Every event gets a custom quote, tailored to your date, hours, and add-ons.
          </p>
        </section>

        {/* ── How booking works ── */}
        <section className="dm-sect" id="dm-how" data-nav-section="dm-how" data-nav-label="Booking">
          <div className="dm-sect-head dm-center">
            <span className="dm-eyebrow">Booking · 003</span>
            <h2><span className="dm-line"><span>Requesting a quote takes <em>two minutes.</em></span></span></h2>
          </div>
          <ol className="dm-flow">
            <li className="dm-flow-step">
              <span className="dm-flow-no">1</span>
              <h3>Request your quote</h3>
              <p>Tell us the event and your vision. No payment, no card, no commitment yet.</p>
            </li>
            <li className="dm-flow-step">
              <span className="dm-flow-no">2</span>
              <h3>We reply in 24 hours</h3>
              <p>We review your details and send back a tailored quote for your event.</p>
            </li>
            <li className="dm-flow-step">
              <span className="dm-flow-no">3</span>
              <h3>Hold your date</h3>
              <p>Once you love the quote, a deposit reserves your date. The balance is not due yet.</p>
            </li>
            <li className="dm-flow-step">
              <span className="dm-flow-no">4</span>
              <h3>Balance on event day</h3>
              <p>The balance is settled the week of your event. Then we show up and spin.</p>
            </li>
          </ol>
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
                Request a quote
              </a>
            </div>
          </div>
        </div>

        {/* ── Gallery ── */}
        <section className="dm-gallery-wrap" id="dm-gallery" data-nav-section="dm-gallery" data-nav-label="Gallery">
          <div className="dm-gallery-head">
            <span className="dm-eyebrow">Fresh reels · 004</span>
            <h2><span className="dm-line"><span>From <em>last weekend&apos;s</em> events.</span></span></h2>
          </div>
          <div className="dm-reel-scroller">
            <div className="dm-reel" id="dm-reel">
              <figure className="dm-frame">
                <a className="dm-frame-link" href="/gallery/cil2okfbfy7u5ynjc3nd9hox">
                  <div className="dm-frame-ph">
                    <div className="dm-frame-fill" />
                    <InviewVideo
                      className="dm-media dm-frame-media"
                      preload="metadata"
                      poster="https://touchpix-space-1.nyc3.cdn.digitaloceanspaces.com/buckets_us/a9407efb-e408-4117-ac48-ee25ddd34947/434120/thumbs/43-20260711-223545.168007-slomo.png"
                      src="https://touchpix-space-1.nyc3.cdn.digitaloceanspaces.com/buckets_us/a9407efb-e408-4117-ac48-ee25ddd34947/434120/43-20260711-223545.168007-slomo.mp4"
                    />
                    <span className="dm-frame-live">Real event</span>
                  </div>
                </a>
                <figcaption><span>Olabode @ 60</span><span>YYC</span></figcaption>
              </figure>
              <figure className="dm-frame">
                <a className="dm-frame-link" href="/gallery/hz920bua1lhwypsmgbsl8s7a">
                  <div className="dm-frame-ph">
                    <div className="dm-frame-fill" />
                    <InviewVideo
                      className="dm-media dm-frame-media"
                      preload="metadata"
                      poster="https://touchpix-space-1.nyc3.cdn.digitaloceanspaces.com/buckets_us/a9407efb-e408-4117-ac48-ee25ddd34947/441081/thumbs/32-20260725-200701.573022-slomo.png"
                      src="https://touchpix-space-1.nyc3.cdn.digitaloceanspaces.com/buckets_us/a9407efb-e408-4117-ac48-ee25ddd34947/441081/32-20260725-200701.573022-slomo.mp4"
                    />
                    <span className="dm-frame-live">Real event</span>
                  </div>
                </a>
                <figcaption><span>Ruth &amp; Azeez</span><span>YYC</span></figcaption>
              </figure>
              <figure className="dm-frame">
                <a className="dm-frame-link" href="https://fotoshare.co/e/ITA2oC15xRM33iFi_FjMm" target="_blank" rel="noopener noreferrer">
                  <div className="dm-frame-ph">
                    <div className="dm-frame-fill" />
                    <img className="dm-media dm-frame-media" src="/media/laitan-1.jpg" alt="Guests at Laitan's 50th in the Demarks 360 photo booth" loading="lazy" />
                    <span className="dm-frame-live">Real event</span>
                  </div>
                </a>
                <figcaption><span>Laitan @ 50</span><span>Photo booth</span></figcaption>
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
            <span className="dm-eyebrow">Reviews · 005</span>
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
                <span className="dm-stars" style={{ '--rating': 5 } as React.CSSProperties} aria-label="5 out of 5"><span className="dm-stars-fill" /></span>
              </div>
            </div>
            <div className="dm-rev-side">
              <div className="dm-rev">
                <q>
                  Booked it kind of last minute for our reception and it was some of the best money we spent. The line
                  did get long around cake time, so grab the extra hour if your guest list is big. The videos came out gorgeous.
                </q>
                <div className="dm-rev-by">
                  <span>Jasleen &amp; Arjun · wedding</span>
                  <span className="dm-stars" style={{ '--rating': 4.5 } as React.CSSProperties} aria-label="4.5 out of 5"><span className="dm-stars-fill" /></span>
                </div>
              </div>
              <div className="dm-rev">
                <q>
                  The start was a little chaotic, it took a while to get everyone through and the music cut out once.
                  But the team was so kind about it and the clips still turned out beautiful. My teenagers have not stopped rewatching.
                </q>
                <div className="dm-rev-by">
                  <span>Ama · family gathering</span>
                  <span className="dm-stars" style={{ '--rating': 3.5 } as React.CSSProperties} aria-label="3.5 out of 5"><span className="dm-stars-fill" /></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="dm-amber-rule" />

        {/* ── FAQ ── */}
        <section className="dm-sect" id="dm-faq" data-nav-section="dm-faq" data-nav-label="FAQ">
          <div className="dm-sect-head dm-center">
            <span className="dm-eyebrow">FAQ · 006</span>
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
          {/* A real 360 clip: the spin shows the guest from every angle, tying
              the motion to the closing line. Blurred + scrimmed so it reads as
              atmosphere behind the words, not a competing video. */}
          <div className="dm-finale-media" aria-hidden="true">
            <InviewVideo
              className="dm-finale-video"
              preload="none"
              poster="https://touchpix-space-1.nyc3.cdn.digitaloceanspaces.com/buckets_us/a9407efb-e408-4117-ac48-ee25ddd34947/434120/thumbs/43-20260711-223545.168007-slomo.png"
              src="https://touchpix-space-1.nyc3.cdn.digitaloceanspaces.com/buckets_us/a9407efb-e408-4117-ac48-ee25ddd34947/434120/43-20260711-223545.168007-slomo.mp4"
            />
            <div className="dm-finale-scrim" />
          </div>
          <div className="dm-finale-embers" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} style={{ ['--n' as string]: i }} />
            ))}
          </div>
          <span className="dm-eyebrow dm-finale-eyebrow">The last frame · 007</span>
          <h2><span className="dm-line"><span>Some moments deserve <em className="dm-em">every angle.</em></span></span></h2>
          <p className="dm-finale-lead">One spin, delivered the same day, shared for weeks. Let&apos;s put your night on the reel.</p>
          <a className="btn-primary btn--lg" href="/book">
            Request a quote
          </a>
        </section>

        <div id="dm-contact" data-nav-section="dm-contact" data-nav-label="Contact">
          <SiteFooter />
        </div>

      </div>
    </>
  )
}

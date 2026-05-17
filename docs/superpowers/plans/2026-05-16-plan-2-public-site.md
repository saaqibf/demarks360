# Demarks 360 — Plan 2: Public Marketing Site

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete public marketing site homepage — sticky nav, hero with Cloudinary video background, pricing card, How It Works, gallery showcase, testimonials, FAQ, footer, cookie consent banner, plus placeholder privacy and terms pages — matching the approved design mockup exactly.

**Architecture:** All homepage sections are React Server Components composed in `app/(public)/page.tsx`. Each section is its own file in `components/public/`. Scroll-reveal animations use an `IntersectionObserver` client component wrapper. The hero video is the Cloudinary MP4 rendered as a native `<video>` tag. Pricing is a single $150/hr card + add-ons (NOT 3 tiers — that design changed during spec review).

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui (accordion for FAQ), DM Sans + Bebas Neue + Syne via Google Fonts (already in globals.css)

**Reference design:** `/Users/saaqibfagbenro/demarks360/.superpowers/brainstorm/63313-1778959095/content/demarks360-v2.html` — approved by Saaqib. Implement this faithfully as React components.

**Hero video URL:** `https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4`

---

## File Map

```
app/
├── (public)/
│   ├── page.tsx                          # Homepage — composes all sections
│   ├── privacy/page.tsx                  # PIPEDA privacy policy
│   └── terms/page.tsx                    # Terms of service
components/
└── public/
    ├── promo-bar.tsx                     # Top ink bar — "Book now…"
    ├── site-nav.tsx                      # Sticky frosted-glass nav
    ├── hero.tsx                          # Full-viewport hero + video
    ├── pricing.tsx                       # $150/hr card + add-ons
    ├── how-it-works.tsx                  # 4-step cream rows
    ├── gallery-showcase.tsx              # Public showcase video grid (placeholder)
    ├── testimonials.tsx                  # 3 quote cards
    ├── faq.tsx                           # Accordion FAQ
    ├── cta-band.tsx                      # Bottom CTA strip
    ├── site-footer.tsx                   # Footer with Instagram
    ├── cookie-consent.tsx                # PIPEDA cookie banner (client)
    └── reveal.tsx                        # IntersectionObserver scroll-reveal wrapper (client)
```

---

## Task 1: Scroll Reveal + Site Shell

**Files:**
- Create: `components/public/reveal.tsx`
- Create: `components/public/cookie-consent.tsx`
- Modify: `app/(public)/page.tsx`

- [ ] **Step 1: Write the scroll-reveal client wrapper**

`components/public/reveal.tsx`:
```tsx
'use client'
import { useEffect, useRef } from 'react'

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect() } },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
```

Add to `app/globals.css`:
```css
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.75s cubic-bezier(.22,1,.36,1), transform 0.75s cubic-bezier(.22,1,.36,1);
}
.reveal.visible { opacity: 1; transform: translateY(0); }
```

- [ ] **Step 2: Write cookie consent banner**

`components/public/cookie-consent.tsx`:
```tsx
'use client'
import { useState, useEffect } from 'react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, background: '#0F0F0F', color: 'rgba(255,255,255,0.65)',
        fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.06em',
        padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
        borderRadius: '2px', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span>We use cookies to make this site work.</span>
      <button
        onClick={accept}
        style={{
          background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
          color: '#fff', border: 'none', padding: '0.4rem 1rem',
          fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
        }}
      >
        OK
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Update homepage to shell structure**

`app/(public)/page.tsx`:
```tsx
import { PromoBar } from '@/components/public/promo-bar'
import { SiteNav } from '@/components/public/site-nav'
import { Hero } from '@/components/public/hero'
import { Pricing } from '@/components/public/pricing'
import { HowItWorks } from '@/components/public/how-it-works'
import { GalleryShowcase } from '@/components/public/gallery-showcase'
import { Testimonials } from '@/components/public/testimonials'
import { Faq } from '@/components/public/faq'
import { CtaBand } from '@/components/public/cta-band'
import { SiteFooter } from '@/components/public/site-footer'
import { CookieConsent } from '@/components/public/cookie-consent'

export default function HomePage() {
  return (
    <>
      <PromoBar />
      <SiteNav />
      <main>
        <Hero />
        <Pricing />
        <HowItWorks />
        <GalleryShowcase />
        <Testimonials />
        <Faq />
        <CtaBand />
      </main>
      <SiteFooter />
      <CookieConsent />
    </>
  )
}
```

- [ ] **Step 4: Build check**

```bash
cd /Users/saaqibfagbenro/demarks360 && pnpm build 2>&1 | tail -6
```
Expected: clean build — imports will fail until all components exist, so stub each one first.

Create stubs for all missing components before the build check:
```tsx
// Each stub — e.g. components/public/promo-bar.tsx
export function PromoBar() { return null }
```
Stubs needed: `promo-bar`, `site-nav`, `hero`, `pricing`, `how-it-works`, `gallery-showcase`, `testimonials`, `faq`, `cta-band`, `site-footer`

- [ ] **Step 5: Commit**

```bash
git add components/public/ app/\(public\)/page.tsx app/globals.css
git commit -m "feat: public site shell, reveal animation, cookie consent"
```

---

## Task 2: Promo Bar + Navigation

**Files:**
- Modify: `components/public/promo-bar.tsx`
- Modify: `components/public/site-nav.tsx`

- [ ] **Step 1: Write promo bar**

`components/public/promo-bar.tsx`:
```tsx
export function PromoBar() {
  return (
    <div style={{
      background: '#0F0F0F',
      color: 'rgba(255,255,255,0.55)',
      fontFamily: 'var(--font-ui)',
      fontSize: '0.62rem',
      fontWeight: 600,
      letterSpacing: '0.14em',
      textAlign: 'center',
      padding: '0.6rem 1rem',
      textTransform: 'uppercase',
    }}>
      Calgary&apos;s premier 360 video booth —{' '}
      <strong style={{
        fontWeight: 700,
        background: 'linear-gradient(90deg, #EC4899, #8B5CF6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        book your experience
      </strong>
    </div>
  )
}
```

- [ ] **Step 2: Write sticky nav**

`components/public/site-nav.tsx`:
```tsx
import Link from 'next/link'

export function SiteNav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(239,236,231,0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(15,15,15,0.10)',
      height: '66px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 3rem',
    }}>
      <Link href="/" style={{ display: 'flex', flexDirection: 'column', gap: '1px', textDecoration: 'none' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', letterSpacing: '0.04em', color: '#0F0F0F' }}>
          DEMARKS{' '}
          <span style={{ background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>360</span>
        </span>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.47rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9B9590' }}>
          Calgary 360 Video Booth
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2.25rem' }}>
        {['How It Works', 'Pricing', 'Gallery', 'FAQ'].map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
            style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#3A3A3A', textDecoration: 'none',
            }}
          >
            {label}
          </a>
        ))}
      </div>

      <Link
        href="/book"
        style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#fff', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
          padding: '0.62rem 1.5rem', textDecoration: 'none', display: 'inline-block',
        }}
      >
        Book Now
      </Link>
    </nav>
  )
}
```

- [ ] **Step 3: Build check**

```bash
pnpm build 2>&1 | tail -4
```

- [ ] **Step 4: Commit**

```bash
git add components/public/promo-bar.tsx components/public/site-nav.tsx
git commit -m "feat: promo bar and sticky nav"
```

---

## Task 3: Hero Section

**Files:**
- Modify: `components/public/hero.tsx`

- [ ] **Step 1: Write hero component**

`components/public/hero.tsx`:
```tsx
export function Hero() {
  return (
    <section style={{
      minHeight: 'calc(100vh - 66px)',
      display: 'grid',
      gridTemplateColumns: '1fr 42%',
      gridTemplateRows: 'auto 1fr',
      borderBottom: '1px solid rgba(15,15,15,0.10)',
      overflow: 'hidden',
    }}>
      {/* Headline block — full width */}
      <div style={{
        gridColumn: '1 / -1',
        padding: '3.5rem 3rem 0',
        borderBottom: '1px solid rgba(15,15,15,0.10)',
      }}>
        <p style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
          letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880',
          display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem',
        }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', flexShrink: 0 }} />
          Calgary &amp; Area · 360 Video Booth Rental
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(5.5rem, 12vw, 11.5rem)',
          letterSpacing: '0.01em',
          lineHeight: 0.85,
          color: '#0F0F0F',
        }}>
          DEMARKS{' '}
          <span style={{
            background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            position: 'relative',
            display: 'inline-block',
          }}>
            360
          </span>
        </h1>
      </div>

      {/* Left — description + stats */}
      <div style={{
        padding: '2.5rem 3rem 3rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderRight: '1px solid rgba(15,15,15,0.10)',
      }}>
        <div>
          <p style={{ fontSize: '0.9rem', color: '#3A3A3A', lineHeight: 1.75, maxWidth: '380px', fontWeight: 300 }}>
            Calgary&apos;s premier 360 video booth — <strong style={{ fontWeight: 500, color: '#0F0F0F' }}>unforgettable moments, captured from every angle.</strong>{' '}
            Birthdays, weddings, graduations, and corporate events across Calgary and surrounding areas.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2rem' }}>
            <a
              href="/book"
              style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#fff', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
                padding: '1rem 2.25rem', textDecoration: 'none', display: 'inline-block',
              }}
            >
              Book Your Experience
            </a>
            <a
              href="#how-it-works"
              style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#0F0F0F', textDecoration: 'none',
              }}
            >
              How It Works →
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid rgba(15,15,15,0.10)', marginTop: 'auto', paddingTop: '0' }}>
          {[
            { val: '150+', label: 'Events Booked' },
            { val: 'YYC', label: 'Calgary & Area' },
            { val: '100%', label: 'Satisfaction' },
          ].map(({ val, label }, i) => (
            <div key={val} style={{
              padding: '1.25rem 0',
              borderRight: i < 2 ? '1px solid rgba(15,15,15,0.10)' : undefined,
              paddingLeft: i > 0 ? '1.5rem' : undefined,
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', letterSpacing: '0.02em', lineHeight: 1 }}>
                <span style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {val}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880', marginTop: '0.2rem' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — video panel */}
      <div style={{
        gridColumn: 2, gridRow: 2,
        background: '#0F0F0F',
        position: 'relative', overflow: 'hidden',
        minHeight: '400px',
      }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        >
          <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to top, rgba(15,15,15,0.6) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 2 }}>
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            padding: '0.4rem 0.75rem',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(4px)',
          }}>
            360° Experience
          </span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Build check**

```bash
pnpm build 2>&1 | tail -4
```

- [ ] **Step 3: Commit**

```bash
git add components/public/hero.tsx
git commit -m "feat: hero section with Cloudinary video background"
```

---

## Task 4: Pricing Section

**Files:**
- Modify: `components/public/pricing.tsx`

- [ ] **Step 1: Write pricing component**

`components/public/pricing.tsx`:
```tsx
import { Reveal } from './reveal'

export function Pricing() {
  const features = [
    '360° slow-motion video',
    'Unlimited takes',
    'Same-day delivery link',
    'Shareable gallery',
    'Professional attendant',
    '1.5 hr minimum',
  ]

  return (
    <section id="pricing" style={{ padding: '6rem 3rem', borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
      <Reveal>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
          Pricing
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '3rem' }}>
          Simple, Transparent Pricing
        </h2>
      </Reveal>

      {/* Main pricing card */}
      <Reveal delay={100}>
        <div style={{ border: '1px solid rgba(15,15,15,0.10)', display: 'grid', gridTemplateColumns: '260px 1fr 220px' }}>
          {/* Left — identity */}
          <div style={{ padding: '2.5rem', borderRight: '1px solid rgba(15,15,15,0.10)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', marginBottom: '0.5rem' }}>
                Standard Package
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '3.8rem', letterSpacing: '0.02em', lineHeight: 0.85, color: '#0F0F0F' }}>
                360<br />BOOTH
              </p>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#888880', fontWeight: 300, marginTop: '0.85rem' }}>
              1.5 hr minimum · no maximum
            </p>
          </div>

          {/* Middle — features */}
          <div style={{ padding: '2.5rem 3rem', display: 'flex', alignItems: 'center' }}>
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem 2.5rem', width: '100%' }}>
              {features.map((feat) => (
                <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.8rem', color: '#3A3A3A', lineHeight: 1.3 }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#EC4899,#8B5CF6)', display: 'inline-block' }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — price + CTA */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', borderLeft: '1px solid rgba(15,15,15,0.10)' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '3.8rem', letterSpacing: '0.02em', lineHeight: 1, color: '#0F0F0F' }}>$150</p>
              <p style={{ fontSize: '0.62rem', color: '#888880', fontWeight: 300, marginTop: '0.3rem', lineHeight: 1.6 }}>per hour<br />1.5 hr minimum</p>
            </div>
            <a
              href="/book"
              style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#fff', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
                padding: '0.85rem 1.5rem', textDecoration: 'none',
                display: 'inline-block', marginTop: '1.5rem',
              }}
            >
              Book Now
            </a>
          </div>
        </div>
      </Reveal>

      {/* Add-ons */}
      <Reveal delay={150}>
        <div style={{ marginTop: '0' }}>
          <div style={{ border: '1px solid rgba(15,15,15,0.10)', borderTop: 'none', padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.4)' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880' }}>Add-on</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', fontWeight: 800, color: '#0F0F0F' }}>Firecrackers</p>
              <p style={{ fontSize: '0.78rem', color: '#888880', fontWeight: 300 }}>Pyro-style sparks effect for maximum impact</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.02em', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>$75</p>
              <p style={{ fontSize: '0.62rem', color: '#888880', fontWeight: 300 }}>flat fee</p>
            </div>
          </div>

          {/* SmileCam — coming soon */}
          <div style={{ border: '1px solid rgba(15,15,15,0.10)', borderTop: 'none', padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.2)', opacity: 0.6 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.52rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888880' }}>Add-on · Coming Soon</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', fontWeight: 800, color: '#0F0F0F' }}>SmileCam</p>
              <p style={{ fontSize: '0.78rem', color: '#888880', fontWeight: 300 }}>AI-powered smile detection camera</p>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.35rem 0.85rem', border: '1px solid rgba(15,15,15,0.15)', color: '#888880' }}>Coming Soon</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Travel surcharge note */}
      <Reveal delay={200}>
        <p style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: '#888880', fontWeight: 300 }}>
          Serving Calgary, Airdrie, Cochrane, Chestermere, Okotoks & Rocky View County. $50 travel fee applies outside Calgary city limits.
        </p>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: Build check**

```bash
pnpm build 2>&1 | tail -4
```

- [ ] **Step 3: Commit**

```bash
git add components/public/pricing.tsx
git commit -m "feat: pricing section — $150/hr card + add-ons"
```

---

## Task 5: How It Works Section

**Files:**
- Modify: `components/public/how-it-works.tsx`

- [ ] **Step 1: Write How It Works component**

`components/public/how-it-works.tsx`:
```tsx
import { Reveal } from './reveal'

const steps = [
  {
    num: '01',
    title: 'Browse & Pick Your Hours',
    desc: 'Choose how long you need the booth — minimum 1.5 hours, no maximum. $150/hour, simple.',
    bullets: ['No hidden fees', 'Instant price calculation', 'Add firecrackers', 'Secure checkout'],
  },
  {
    num: '02',
    title: 'Choose Your Date & Time',
    desc: 'Pick from available slots on our live calendar. See exactly what\'s taken so you can plan around it.',
    bullets: ['7-day advance booking', 'Real-time availability', 'Two events per day max', '30-min slot increments'],
  },
  {
    num: '03',
    title: 'Secure With a Deposit',
    desc: 'Pay 30% upfront to hold your date. Your card is saved — the remaining 70% is charged automatically 7 days before your event.',
    bullets: ['30% deposit today', 'Card saved securely', '70% auto-charged at 7 days', 'Full receipt emailed'],
  },
  {
    num: '04',
    title: 'We Show Up & Shoot',
    desc: 'Our team arrives, sets up, and captures every angle. After the event, your gallery link is ready to share.',
    bullets: ['Professional setup', 'Unlimited takes', 'Same-day gallery link', 'Download & share freely'],
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '6rem 3rem', borderBottom: '1px solid rgba(15,15,15,0.10)', background: '#FAF8F4' }}>
      <Reveal>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
          Process
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F' }}>
          How It Works
        </h2>
      </Reveal>

      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(15,15,15,0.10)', marginTop: '4rem' }}>
        {steps.map((step, i) => (
          <Reveal key={step.num} delay={i * 80}>
            <div
              className="hiw-step-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr 1fr',
                alignItems: 'center',
                borderBottom: i < steps.length - 1 ? '1px solid rgba(15,15,15,0.10)' : undefined,
                transition: 'background 0.35s',
                cursor: 'default',
              }}
            >
              {/* Step number */}
              <div style={{ padding: '3rem 2rem', borderRight: '1px solid rgba(15,15,15,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '5.5rem', lineHeight: 1,
                  background: 'linear-gradient(135deg,#EC4899,#8B5CF6)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  opacity: 0.15, transition: 'opacity 0.4s',
                  display: 'block',
                }}
                  data-hiw-num
                >
                  {step.num}
                </span>
              </div>

              {/* Title + desc */}
              <div style={{ padding: '2.5rem 3rem', borderRight: '1px solid rgba(15,15,15,0.10)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', letterSpacing: '0.04em', color: '#0F0F0F', marginBottom: '0.75rem' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#3A3A3A', lineHeight: 1.75, fontWeight: 300 }}>
                  {step.desc}
                </p>
              </div>

              {/* Bullets */}
              <div style={{ padding: '2.5rem 3rem' }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {step.bullets.map((b) => (
                    <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: '#3A3A3A' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'linear-gradient(135deg,#EC4899,#8B5CF6)', flexShrink: 0, display: 'inline-block' }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
```

Add to `app/globals.css`:
```css
.hiw-step-row:hover { background: #fff; }
.hiw-step-row:hover [data-hiw-num] { opacity: 1 !important; }
```

- [ ] **Step 2: Build check**

```bash
pnpm build 2>&1 | tail -4
```

- [ ] **Step 3: Commit**

```bash
git add components/public/how-it-works.tsx app/globals.css
git commit -m "feat: How It Works section with hover step reveal"
```

---

## Task 6: Gallery, Testimonials, FAQ, CTA Band, Footer

**Files:**
- Modify: `components/public/gallery-showcase.tsx`
- Modify: `components/public/testimonials.tsx`
- Modify: `components/public/faq.tsx`
- Modify: `components/public/cta-band.tsx`
- Modify: `components/public/site-footer.tsx`

- [ ] **Step 1: Write gallery showcase (placeholder grid)**

`components/public/gallery-showcase.tsx`:
```tsx
import { Reveal } from './reveal'

export function GalleryShowcase() {
  const placeholders = Array.from({ length: 6 }, (_, i) => i)

  return (
    <section id="gallery" style={{ padding: '6rem 3rem', borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
      <Reveal>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
          Gallery
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '3rem' }}>
          From Our Events
        </h2>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(15,15,15,0.10)' }}>
        {placeholders.map((i) => (
          <Reveal key={i} delay={i * 60}>
            <div style={{
              aspectRatio: '9/16',
              background: i % 3 === 1 ? '#0F0F0F' : '#E8E4DC',
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', opacity: 0.08, color: i % 3 === 1 ? '#fff' : '#0F0F0F' }}>360</span>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={100}>
        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.78rem', color: '#888880', fontWeight: 300 }}>
          Videos are added after each event. Your gallery will be ready the same day.
        </p>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: Write testimonials**

`components/public/testimonials.tsx`:
```tsx
import { Reveal } from './reveal'

const testimonials = [
  { name: 'Aisha M.', event: 'Birthday Party · Calgary', quote: 'The 360 booth was the highlight of my birthday — everyone was obsessed. The video quality was incredible and we had our gallery link the same night.' },
  { name: 'Jordan & Kezia T.', event: 'Wedding Reception · Airdrie', quote: 'We added firecrackers and honestly it was the most fun part of the whole reception. Worth every penny. The team was professional and so easy to work with.' },
  { name: 'Priya S.', event: 'Corporate Event · Downtown Calgary', quote: 'Booked for our company\'s holiday party. The booking process was seamless, the team showed up early, and the videos looked amazing. Will book again.' },
]

export function Testimonials() {
  return (
    <section style={{ padding: '6rem 3rem', borderBottom: '1px solid rgba(15,15,15,0.10)', background: '#0F0F0F' }}>
      <Reveal>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
          Testimonials
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#fff', marginBottom: '4rem' }}>
          What People Say
        </h2>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 80}>
            <div style={{ padding: '2.5rem', background: '#0F0F0F' }}>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontWeight: 300, fontStyle: 'italic', marginBottom: '2rem' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{t.name}</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: '0.25rem' }}>{t.event}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Write FAQ with shadcn accordion**

`components/public/faq.tsx`:
```tsx
import { Reveal } from './reveal'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  { q: 'How much does it cost?', a: '$150 per hour with a 1.5-hour minimum. So the minimum booking is $225. Add firecrackers for $75 flat.' },
  { q: 'How far in advance do I need to book?', a: 'We require at least 7 days notice. This gives us time to prepare, confirm your slot, and make sure everything is perfect for your event.' },
  { q: 'Where do you serve?', a: 'We serve Calgary, Airdrie, Cochrane, Chestermere, Okotoks, and Rocky View County. A $50 travel fee applies for events outside Calgary city limits.' },
  { q: 'How does payment work?', a: 'You pay a 30% deposit when booking to hold your date. We save your card securely — the remaining 70% is automatically charged 7 days before your event.' },
  { q: 'What if I need to cancel or reschedule?', a: 'Your deposit is non-refundable — it exists to protect your date. However, we offer free rescheduling if you request it at least 7 days before your event, subject to availability.' },
  { q: 'When do I get my videos?', a: 'We send you a shareable gallery link the same day as your event. You and all your guests can view and download every video from the link — no login required.' },
  { q: 'How many videos will I get?', a: 'It depends on how many takes your guests do — events typically produce 50–150+ videos. Every take is captured and added to your gallery.' },
]

export function Faq() {
  return (
    <section id="faq" style={{ padding: '6rem 3rem', borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
      <Reveal>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888880', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '1.5px', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)' }} />
          FAQ
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#0F0F0F', marginBottom: '3rem' }}>
          Common Questions
        </h2>
      </Reveal>

      <Reveal delay={100}>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} style={{ borderBottom: '1px solid rgba(15,15,15,0.10)' }}>
              <AccordionTrigger style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', fontWeight: 600, color: '#0F0F0F', textAlign: 'left', padding: '1.5rem 0' }}>
                {faq.q}
              </AccordionTrigger>
              <AccordionContent style={{ fontSize: '0.85rem', color: '#3A3A3A', lineHeight: 1.8, fontWeight: 300, paddingBottom: '1.5rem' }}>
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 4: Write CTA band**

`components/public/cta-band.tsx`:
```tsx
import { Reveal } from './reveal'

export function CtaBand() {
  return (
    <section style={{ padding: '6rem 3rem', background: '#0F0F0F', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <Reveal>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: '0.02em', lineHeight: 0.9, color: '#fff' }}>
              Ready to Make it<br />
              <span style={{ background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Unforgettable?
              </span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300, marginTop: '1rem', maxWidth: '380px', lineHeight: 1.75 }}>
              Book your 360 experience — $150/hr, 1.5 hr minimum. Calgary and surrounding areas.
            </p>
          </div>
          <a
            href="/book"
            style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: '#fff', background: 'linear-gradient(90deg,#EC4899,#8B5CF6)',
              padding: '1.25rem 2.75rem', textDecoration: 'none', display: 'inline-block',
              whiteSpace: 'nowrap',
            }}
          >
            Book Your Experience
          </a>
        </div>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 5: Write footer**

`components/public/site-footer.tsx`:
```tsx
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer style={{ background: '#0F0F0F', padding: '3rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.04em', color: '#fff' }}>
            DEMARKS{' '}
            <span style={{ background: 'linear-gradient(90deg,#EC4899,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>360</span>
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: '0.25rem' }}>
            Calgary 360 Video Booth
          </p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: '1rem', fontWeight: 300 }}>
            Serving Calgary, Airdrie, Cochrane,<br />Chestermere, Okotoks & Rocky View County
          </p>
        </div>

        <div style={{ display: 'flex', gap: '3rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem' }}>Navigation</p>
            {['How It Works', 'Pricing', 'Gallery', 'FAQ'].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`} style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '0.4rem', fontWeight: 300 }}>{l}</a>
            ))}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem' }}>Legal</p>
            <Link href="/privacy" style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '0.4rem', fontWeight: 300 }}>Privacy Policy</Link>
            <Link href="/terms" style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 300 }}>Terms of Service</Link>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem' }}>Follow</p>
            <a href="https://instagram.com/demarks360" target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 300 }}>@demarks360</a>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>
          © {new Date().getFullYear()} Demarks 360. All rights reserved.
        </p>
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>
          Calgary, Alberta, Canada
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 6: Build check**

```bash
pnpm build 2>&1 | tail -6
```

- [ ] **Step 7: Commit**

```bash
git add components/public/gallery-showcase.tsx components/public/testimonials.tsx components/public/faq.tsx components/public/cta-band.tsx components/public/site-footer.tsx
git commit -m "feat: gallery, testimonials, FAQ, CTA band, footer"
```

---

## Task 7: Privacy Policy + Terms of Service Pages

**Files:**
- Create: `app/(public)/privacy/page.tsx`
- Create: `app/(public)/terms/page.tsx`

- [ ] **Step 1: Write PIPEDA privacy policy page**

`app/(public)/privacy/page.tsx`:
```tsx
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '6rem 3rem', fontFamily: 'var(--font-body)' }}>
      <Link href="/" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888880', textDecoration: 'none', display: 'block', marginBottom: '3rem' }}>← Back to Home</Link>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: '#0F0F0F', marginBottom: '0.5rem' }}>Privacy Policy</h1>
      <p style={{ fontSize: '0.75rem', color: '#888880', marginBottom: '3rem' }}>Last updated: May 16, 2026</p>

      {[
        { title: '1. Who We Are', body: 'Demarks 360 is a 360 video booth rental service operating in Calgary, Alberta, Canada. We are committed to protecting your personal information in accordance with the Personal Information Protection and Electronic Documents Act (PIPEDA).' },
        { title: '2. What We Collect', body: 'We collect: name, email address, phone number, event address (city and postal code), event type, and payment information. Payment card details are processed and stored by Stripe — we never store your card number directly.' },
        { title: '3. How We Use It', body: 'Your information is used to: process your booking, charge your deposit and balance payment, send booking confirmations and event reminders via email and SMS, deliver your gallery link after the event, and respond to your inquiries.' },
        { title: '4. SMS Communications', body: 'By providing your phone number, you consent to receive SMS messages from Demarks 360 related to your booking (confirmations, reminders, gallery notifications). Standard message and data rates may apply. You can opt out at any time by replying STOP.' },
        { title: '5. Data Retention', body: 'Your booking data is retained for 3 years for accounting and tax purposes. Your saved payment method is automatically deleted from Stripe 7 days after your event. You may request deletion of your personal data at any time.' },
        { title: '6. Third Parties', body: 'We share your data only with services required to operate the platform: Stripe (payments), Clerk (authentication), Resend (email), Twilio (SMS), Mux (video hosting), and Vercel (hosting). We do not sell your data.' },
        { title: '7. Your Rights', body: 'Under PIPEDA, you have the right to access the personal information we hold about you, correct inaccuracies, and request deletion. To exercise these rights, email us at bookings@demarks360.ca.' },
        { title: '8. Cookies', body: 'We use cookies to keep you signed in and make the site work. We do not use tracking or advertising cookies. By continuing to use the site, you consent to our use of cookies.' },
        { title: '9. Contact', body: 'For privacy questions or requests, email bookings@demarks360.ca. We will respond within 30 days.' },
      ].map(({ title, body }) => (
        <div key={title} style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 700, color: '#0F0F0F', marginBottom: '0.75rem' }}>{title}</h2>
          <p style={{ fontSize: '0.88rem', color: '#3A3A3A', lineHeight: 1.8, fontWeight: 300 }}>{body}</p>
        </div>
      ))}
    </main>
  )
}
```

- [ ] **Step 2: Write Terms of Service page**

`app/(public)/terms/page.tsx`:
```tsx
import Link from 'next/link'

export default function TermsPage() {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '6rem 3rem', fontFamily: 'var(--font-body)' }}>
      <Link href="/" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888880', textDecoration: 'none', display: 'block', marginBottom: '3rem' }}>← Back to Home</Link>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: '#0F0F0F', marginBottom: '0.5rem' }}>Terms of Service</h1>
      <p style={{ fontSize: '0.75rem', color: '#888880', marginBottom: '3rem' }}>Last updated: May 16, 2026</p>

      {[
        { title: '1. Service', body: 'Demarks 360 provides 360 video booth rental services in Calgary, Airdrie, Cochrane, Chestermere, Okotoks, and Rocky View County, Alberta, Canada. By booking our services, you agree to these terms.' },
        { title: '2. Pricing', body: 'Our rate is $150 CAD per hour with a 1.5-hour minimum. A $50 travel fee applies for events outside Calgary city limits. Add-ons (e.g., Firecrackers at $75) are charged as flat fees. All prices are in Canadian dollars.' },
        { title: '3. Booking & Payment', body: 'A 30% non-refundable deposit is required to confirm your booking. By providing your payment card, you authorize Demarks 360 to automatically charge the remaining 70% balance 7 days before your event. Your saved card will be deleted 7 days after your event.' },
        { title: '4. Cancellation Policy', body: 'Your deposit is non-refundable in all cases. If you cancel before the 7-day mark, only the deposit is forfeited and no balance is charged. If you cancel within 7 days of the event, the full amount (deposit + balance) applies. Free rescheduling is available if requested 7+ days before your event, subject to availability.' },
        { title: '5. Service Area', body: 'We only accept bookings within our approved service area. Your event address must be in Calgary, Airdrie, Cochrane, Chestermere, Okotoks, or Rocky View County. Bookings outside this area will be cancelled and deposits refunded.' },
        { title: '6. Lead Time', body: 'We require a minimum of 7 days advance notice for all bookings. Same-week bookings cannot be accommodated.' },
        { title: '7. Our Cancellation', body: 'If Demarks 360 must cancel your booking (equipment failure, emergency), we will issue a full refund of all amounts paid, including the deposit. We will notify you as soon as possible.' },
        { title: '8. Liability', body: 'Demarks 360 is not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability is limited to the amount paid for the affected booking.' },
        { title: '9. Governing Law', body: 'These terms are governed by the laws of the Province of Alberta and the federal laws of Canada applicable therein.' },
        { title: '10. Contact', body: 'For questions about these terms, email bookings@demarks360.ca.' },
      ].map(({ title, body }) => (
        <div key={title} style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 700, color: '#0F0F0F', marginBottom: '0.75rem' }}>{title}</h2>
          <p style={{ fontSize: '0.88rem', color: '#3A3A3A', lineHeight: 1.8, fontWeight: 300 }}>{body}</p>
        </div>
      ))}
    </main>
  )
}
```

- [ ] **Step 3: Build check**

```bash
pnpm build 2>&1 | tail -6
```
Expected: all routes compile cleanly

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/privacy/" "app/(public)/terms/"
git commit -m "feat: PIPEDA privacy policy and terms of service pages"
```

---

## Task 8: Deploy + Visual QA

- [ ] **Step 1: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 2: Deploy to Vercel**

```bash
source ~/.zshrc && vercel deploy --prod 2>&1 | tail -5
```

- [ ] **Step 3: Verify deployed routes**

Check the following URLs on the live deployment:
- `/` — homepage loads, all sections visible, video plays
- `/privacy` — privacy policy renders
- `/terms` — terms renders
- `/sign-in` — Clerk sign-in form shows
- `/sign-up` — Clerk sign-up form shows

- [ ] **Step 4: Commit (if any fixes needed)**

```bash
git add .
git commit -m "fix: post-deploy QA fixes"
git push
```

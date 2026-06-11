---
name: Demarks 360
description: Calgary's premier 360 video booth — cinematic, golden, trustworthy.
colors:
  sand: "#F5EFE2"
  sand-2: "#EFE6D2"
  sand-3: "#FAF6EC"
  charcoal: "#141009"
  charcoal-2: "#1A140B"
  charcoal-3: "#221A0F"
  text: "#1C1610"
  text-light: "#F3EAD9"
  muted: "#7A6C52"
  muted-light: "#B9AD97"
  amber: "#C9913F"
  amber-light: "#E8B25C"
typography:
  display:
    fontFamily: "'Bodoni Moda', Georgia, serif"
    fontSize: "clamp(3.5rem, 7vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: "-0.015em"
  heading:
    fontFamily: "'Bodoni Moda', Georgia, serif"
    fontSize: "clamp(2rem, 3.5vw, 2.667rem)"
    fontWeight: 400
    lineHeight: 1.1
  subheading:
    fontFamily: "'Bodoni Moda', Georgia, serif"
    fontSize: "clamp(1.5rem, 2.5vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "'Figtree', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 300
    lineHeight: 1.7
  label:
    fontFamily: "'Figtree', system-ui, sans-serif"
    fontSize: "0.62rem"
    fontWeight: 500
    letterSpacing: "0.22em"
rounded:
  pill: "999px"
  card: "14px"
  card-sm: "10px"
spacing:
  section: "7rem 3rem"
  section-mobile: "4.5rem 1.5rem"
  card-inner: "2.25rem"
components:
  button-primary:
    backgroundColor: "{colors.amber-light}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.pill}"
    padding: "0.95rem 2.5rem"
    letterSpacing: "0.26em"
    textTransform: uppercase
  button-primary-hover:
    transform: "scale(1.04)"
    boxShadow: "0 12px 44px rgba(232,178,92,0.35)"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    border: "1px solid rgba(28,22,16,0.3)"
    rounded: "{rounded.pill}"
    padding: "0.95rem 2.5rem"
---

# Design System: Demarks 360

## 1. Overview

**Creative North Star: "Golden Hour Cinema"**

The booth spins, the lights catch, and for eight seconds every guest is the lead in their own film. The Demarks 360 site is built around that feeling: warm stage light on dark charcoal, serif title cards, letterboxed video, the hush before the premiere. Joy is the first impression; trust is the aftertaste.

This is a Calgary family business, owned by a Muslim mother, and the design reflects that grounded, community-first spirit. It is accessible to every family, every culture, every type of celebration. The cinema framing is never cold or exclusive: the light is candle-warm, the copy is plain and welcoming, and booking stays effortless.

This system explicitly rejects: nightclub energy (neon on black, aggressive display type); corporate rental-catalog dryness (spreadsheet pricing, emotionless stock photography); AI-generated SaaS aesthetics (purple gradients, floating card grids, hero metric templates); and cold editorial luxury that makes a mother planning a birthday feel like she's in the wrong place. If a design choice reads as any of those, restart.

**Key Characteristics:**
- Stage charcoal darks and warm cream lights, never pure black or pure white
- Golden amber as the single celebratory accent, applied through italic serif phrases and pill CTAs
- Bodoni Moda serif headings in sentence case, weight 400–500, with one italic amber `<em>` phrase per heading
- Figtree (300–600) for all body and UI text
- Pill buttons: amber fill primary with glow hover, outlined secondary
- Letterbox bars and title-card centering in the hero; dark/light section alternation for scroll rhythm

## 2. Colors: The Golden Hour Palette

A committed warm palette. Charcoals carry the cinematic dark sections, creams carry the light sections, and amber marks every moment of emphasis.

### Accent
- **Amber** (`#C9913F`, `--color-amber`): The core brand accent. Label rules, dividers, active states, the "360" in the wordmark.
- **Amber Light** (`#E8B25C`, `--color-amber-light`): The brighter stage-light amber. Italic `<em>` phrases inside headings, primary button fill, stat values, hover states.

### Neutral (Light)
- **Sand** (`#F5EFE2`, `--color-sand`): Primary light section background. Never pure white.
- **Sand 2** (`#EFE6D2`, `--color-sand-2`): Alternate light section, trust strip.
- **Sand 3** (`#FAF6EC`, `--color-sand-3`): Lightest surface, card faces within light sections.

### Neutral (Dark)
- **Charcoal** (`#141009`, `--color-charcoal`): Primary dark stage. Hero, gallery, CTA band, footer. Never pure black.
- **Charcoal 2** (`#1A140B`) / **Charcoal 3** (`#221A0F`): Layered dark surfaces and cards on dark sections.
- **Text** (`#1C1610`) on light; **Text Light** (`#F3EAD9`) on dark.
- **Muted** (`#7A6C52`) body copy on light; **Muted Light** (`#B9AD97`) secondary text on dark.
- Borders: `rgba(243,234,217,0.10)` on dark, `rgba(28,22,16,0.12)` on light (`--color-border-dark` / `--color-border-light`).

### Named Rules
**The Warm Tint Rule.** No pure whites or pure blacks anywhere. Every surface is tinted toward amber. `#FAF6EC` is the lightest; `#141009` is the darkest.

**The Token Rule.** Never hardcode hex values or font names in components. Use the `--color-*` and `--font-*` variables or the semantic classes (`.t-display`, `.t-heading`, `.t-subheading`, `.t-body`, `.t-label`, `.btn-primary`, `.btn-secondary`).

**The Earned Amber Rule.** Amber never fills a section background or a large surface. It appears as the italic phrase, the pill CTA, the thin rule, the stat value. Its rarity is the glow.

## 3. Typography

**Display Font:** Bodoni Moda (Georgia fallback), weights 400–500, italic 400/500
**Body Font:** Figtree (system-ui fallback), weights 300–700

**Character:** Bodoni Moda's high-contrast strokes are the film-poster serif: ceremony without stuffiness. Figtree keeps everything readable and friendly, the voice of the attendant explaining how the booth works. Headings are always sentence case; the days of uppercase 700-weight headings are over.

### Hierarchy
- **Display** (`.t-display`, 400, `--text-3xl`): Hero title card only.
- **Heading** (`.t-heading`, 400, `--text-xl`): Section headings. Sentence case with exactly one italic amber `<em>` phrase.
- **Subheading** (`.t-subheading`, 500, `--text-lg`): Card and step titles.
- **Body** (`.t-body`, Figtree 300, 1rem, line-height 1.7): Paragraph copy, max 65ch. Muted on light, Muted Light on dark.
- **Label** (`.t-label`, Figtree 500, 0.62rem, letter-spacing 0.22em, UPPERCASE): Section kickers and eyebrows. The ONLY uppercase element in the system. Amber on light sections, muted light on dark.

### Named Rules
**The One Em Rule.** Every section heading contains exactly one `<em>` phrase, which renders italic in amber light (styled globally on `em` inside `.t-display/.t-heading/.t-subheading`). Example: "Your event, shot like a *film premiere.*" Never two, never zero, never a whole heading in amber.

**The Sentence Case Rule.** Headings are sentence case, weight 400–500. Uppercase lives only in `.t-label` eyebrows and button text. Any `textTransform: 'uppercase'` or weight 700+ on an h1/h2/h3 is wrong.

## 4. Elevation

Flat by default, lit by state. Depth comes from tonal layering (Sand 3 cards on Sand 2 sections; Charcoal 3 cards on Charcoal) and thin borders, not ambient shadows.

### Shadow Vocabulary
- **Primary button hover** (`0 12px 44px rgba(232,178,92,0.35)` + `scale(1.04)`): The amber glow. The one shadow that exists by design; it reads as stage light, not elevation.
- **Card hover lift** (`0 8px 32px rgba(20,16,9,0.12)` + `translateY(-2px)`): Interactive cards only, warm-tinted.

**The Flat-By-Default Rule.** No card has a resting-state shadow. Shadows are responses to hover.

## 5. Components

### Buttons
- **Shape:** Fully pill (border-radius 999px), min-height 44px.
- **Primary** (`.btn-primary`): Amber Light fill, Charcoal text, Figtree 600 at 0.72rem with 0.26em letter-spacing, uppercase. Hover: scale 1.04 + amber glow shadow. One per section maximum.
- **Secondary** (`.btn-secondary`): Transparent, 1px border at 30% text color, same metrics. Hover: fills charcoal with light text.
- On dark sections, secondary borders use the light border token.

### Cards / Containers
- **Corners:** 14px primary, 10px compact.
- **Dark sections:** Charcoal 2/3 surfaces, `--color-border-dark` thin borders, italic serif amber prices/values.
- **Light sections:** Sand 3 faces, `--color-border-light` borders.
- No side-stripe accents, no glassmorphism, no nested cards.

### Hero (Signature Component)
Letterboxed full-viewport video: real Cloudinary event footage under a radial golden-hour overlay, top and bottom letterbox bars (`clamp(18px, 4vh, 42px)`, `#0c0a06`), centered serif title card with kicker (0.5em tracking, amber light), one italic amber phrase in the headline, amber pill CTA, and a blurred stat bar above the bottom bar with italic serif values.

### Navigation
- Fixed header; wordmark in Bodoni Moda ("Demarks" + italic amber "360"). Nav links Figtree, token colors, active in amber. CTA is `.btn-primary` scaled down. Mobile collapses to burger.

### Section Label
`.t-label` eyebrow above every section heading, preceded by a short amber rule. The only decorative before-rule in the system.

## 6. Do's and Don'ts

### Do:
- **Do** use tokens and semantic classes for every color and font. Hardcoded hex is a bug.
- **Do** give every section heading one italic amber `<em>` phrase, sentence case, serif 400–500.
- **Do** alternate dark stage sections and warm cream sections for scroll rhythm.
- **Do** keep booking effortless: price, CTA, and service area visible within two screens on mobile.
- **Do** keep Calgary-specific, inclusive, warm copy. Real footage over stock.
- **Do** keep 44px touch targets, reduced-motion handling, and accessibility attributes intact through any restyle.

### Don't:
- **Don't** use nightclub aesthetics: no neon, no heavy condensed all-caps display type, no red/black combos.
- **Don't** use corporate catalog aesthetics: no spreadsheet pricing tables, no emotionless stock imagery.
- **Don't** produce SaaS landing-page slop: no purple/blue gradients, no glass card stacks, no "Join 10,000+ users" banners, no hero-metric templates.
- **Don't** use em dashes anywhere in copy. Commas, colons, periods.
- **Don't** use border-left/right color stripes, gradient text, or resting-state card shadows.
- **Don't** set uppercase or 700+ weight on headings. Uppercase belongs to `.t-label` and buttons only.
- **Don't** change business logic, prices, package contents, or data fetching during visual work. Restyle containers and typography only.

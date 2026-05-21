---
name: Demarks 360
description: Calgary's premier 360 video booth — joyful, trustworthy, cinematic.
colors:
  warm-sand: "#EDE8DF"
  warm-sand-dim: "#E4DDD4"
  warm-sand-bright: "#F7F4EF"
  celebration-charcoal: "#1A1714"
  celebration-charcoal-mid: "#242019"
  celebration-charcoal-soft: "#2E2A25"
  muted-walnut: "#7A7168"
  muted-walnut-light: "#A8A099"
  event-amber: "#A87530"
  event-amber-light: "#C49045"
typography:
  display:
    fontFamily: "'DM Serif Display', Georgia, serif"
    fontSize: "clamp(2.5rem, 5vw, 5rem)"
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'DM Serif Display', Georgia, serif"
    fontSize: "clamp(1.6rem, 2.5vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Nunito', system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "'Nunito', system-ui, sans-serif"
    fontSize: "0.62rem"
    fontWeight: 700
    letterSpacing: "0.18em"
rounded:
  pill: "9999px"
  card: "16px"
  card-sm: "12px"
spacing:
  section: "6rem 3rem"
  section-mobile: "4rem 1.5rem"
  card-inner: "2.25rem"
  card-inner-sm: "1.25rem 2rem"
components:
  button-primary:
    backgroundColor: "{colors.celebration-charcoal}"
    textColor: "{colors.warm-sand}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 2.25rem"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.celebration-charcoal-mid}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.celebration-charcoal}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 2.25rem"
  nav-link:
    textColor: "{colors.muted-walnut}"
    typography: "{typography.body}"
  nav-link-active:
    textColor: "{colors.celebration-charcoal}"
---

# Design System: Demarks 360

## 1. Overview

**Creative North Star: "The Warm Celebration"**

Every design decision in this system originates from a single image: stepping into a beautifully lit room full of people who love each other. The Demarks 360 brand is the 360 booth at that party: warm, present, reliable, and genuinely delighted to be there. Joy is the first impression; trust is the aftertaste.

This is a Calgary family business, owned by a Muslim mother, and the design must reflect that grounded, community-first spirit. It is accessible to every family, every culture, every type of celebration. The warmth is not decorative. It is the product. The palette lives in the temperatures of candlelight and warm wood, not in the cold blues or aggressive neons that dominate the events industry.

This system explicitly rejects: nightclub energy (neon on black, aggressive display type, Vegas brightness); corporate rental-catalog dryness (price lists, no emotion, stock photography of empty conference rooms); AI-generated SaaS aesthetics (purple gradients, floating card grids, "Join 10,000+ users" banners); and cold editorial luxury (fashion-magazine distance, unapproachable serif-only layouts that make booking feel intimidating). If a design choice would read as any of those, restart.

**Key Characteristics:**
- Warm sand and charcoal surfaces, never pure white or pure black
- Amber gold used as the one celebratory accent, not decoration
- DM Serif Display italic for emotional emphasis; Nunito for everything readable
- Pill-shaped buttons (inviting, not corporate)
- Rounded cards (16px) that feel soft rather than sharp
- Sections alternate warm sand and warm charcoal for rhythm, never monotone

## 2. Colors: The Celebration Palette

A restrained warm palette with one committed accent. The sand tones carry the light sections; the charcoals carry the dark sections; the amber marks every moment of emphasis and joy.

### Primary
- **Event Amber** (`#A87530`): The celebratory accent. Used for section label lines, italic heading emphasis, star ratings, feature dots, the "360" in the logo, and the amber decorative line. It appears on roughly 10% of any screen. Its rarity is the point. Do not use it for backgrounds or large fills.
- **Event Amber Light** (`#C49045`): Hover state for amber elements. Slightly warmer.

### Neutral (Light)
- **Warm Sand** (`#EDE8DF`): The primary background for light sections. Also used as the text color on dark charcoal sections (inverted). Never use pure white; always tinted toward amber.
- **Warm Sand Dim** (`#E4DDD4`): Alternate light section background (slightly warmer). Used for alternating sections and the trust strip.
- **Warm Sand Bright** (`#F7F4EF`): The lightest surface, used for card faces within light sections (pricing card interior, testimonial cards, FAQ background).

### Neutral (Dark)
- **Celebration Charcoal** (`#1A1714`): The primary dark surface and text color on light backgrounds. Used for dark sections (hero, gallery, CTA band, footer). Never use pure black.
- **Celebration Charcoal Mid** (`#242019`): Slightly lighter. Used for footer and secondary dark surfaces.
- **Celebration Charcoal Soft** (`#2E2A25`): The lightest charcoal. Used for gallery tile alternates and interactive dark surfaces.
- **Muted Walnut** (`#7A7168`): All body copy on light backgrounds; secondary text. Also used for nav links in default state.
- **Muted Walnut Light** (`#A8A099`): Tertiary text, timestamps, legal copy.

### Named Rules
**The Warm Tint Rule.** There are no pure whites or pure blacks anywhere in this system. Every surface is tinted toward amber. `#EDE8DF` is the lightest; `#1A1714` is the darkest. If a color passes the "is this pure white?" or "is this pure black?" test, it is wrong.

**The One Amber Rule.** Event Amber appears on no more than 10% of any screen. It marks joy, emphasis, and the brand. It never fills a section background, a card, or a large button. When amber appears, it has earned its place.

## 3. Typography

**Display Font:** DM Serif Display (with Georgia, serif fallback)
**Body Font:** Nunito (with system-ui, sans-serif fallback)

**Character:** DM Serif Display carries the brand's warmth and ceremony: its italic cuts lean into celebration without feeling stuffy. Nunito grounds everything in accessibility and friendliness: it is the font of the attendant who explains how the booth works with a smile. They work together because one is for the headline, the other is for the conversation.

### Hierarchy
- **Display** (400, `clamp(2.5rem, 5vw, 5rem)`, line-height 1.0): Section headings only. Always set in two lines: the first line straight, the second in italic with amber color. Example: "Three steps." / *"Zero stress."* (in amber italic).
- **Headline** (400, `clamp(1.6rem, 2.5vw, 2.25rem)`, line-height 1.15): Step titles, card headings, pricing tier names. Set in DM Serif Display. Italic allowed for emotional moments.
- **Body** (400, 0.9rem, line-height 1.75): All paragraph copy. Nunito. Max 65ch line length on desktop. Color is Muted Walnut on light sections; 55% opacity Sand on dark sections.
- **Label** (700, 0.62rem, letter-spacing 0.18em, UPPERCASE): Section kickers above display headings. Amber on light sections; 55% opacity Sand on dark sections. Always preceded by a 20px amber rule via `::before`.
- **UI / Button** (700, 0.88rem): Nunito bold for all button text, nav links, and small interactive text.

### Named Rules
**The Two-Line Heading Rule.** Every display heading is a two-liner: one straight line (charcoal or sand) and one italic amber line. The straight line states the fact; the italic amber line makes it feel. Never use three display lines, never set the whole heading in one color.

**The Italic Accent Rule.** Italic in DM Serif Display is reserved for the amber-colored second line of display headings, for the "360" in the logo, and for the `<em>` emphasis in hero copy. Nowhere else.

## 4. Elevation

This system is **flat by default, lifted by state**. There are no ambient box shadows on resting surfaces. Depth is expressed through tonal layering: Warm Sand Bright cards sit on Warm Sand Dim section backgrounds, which creates a 2-level surface hierarchy without shadows.

Shadows appear only as a response to hover state on interactive cards. The hover shadow is diffuse and warm:

### Shadow Vocabulary
- **Card hover lift** (`0 8px 32px rgba(26,23,20,0.12)`): Applied on `.card-hover:hover`. Warm-tinted dark shadow, never cold blue. Paired with `translateY(-2px)` for physical feedback.
- **Button hover** (`none`; instead uses `translateY(-1px)`): Buttons do not gain a shadow on hover. The slight lift is enough.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. No card has a shadow in its resting state. Shadows appear only as hover state feedback. If a designer adds a resting-state shadow, it should be removed.

## 5. Components

### Buttons
Buttons are the booking invitation. They must feel warm and easy to press, never aggressive.

- **Shape:** Fully pill-shaped (border-radius: 9999px)
- **Primary:** Celebration Charcoal fill, Warm Sand text, 0.85rem Nunito 700. Padding: 0.85rem 2.25rem. On hover: transitions to Charcoal Mid + translateY(-1px). On dark sections, primary becomes Warm Sand fill with Celebration Charcoal text.
- **Ghost / Text link:** No background, no border. Muted Walnut on light sections. Fades to full charcoal on hover. Used for secondary navigation CTAs ("How It Works →").
- **Secondary (outlined):** Transparent background, 1.5px Celebration Charcoal border at 25% opacity, same pill radius. Hover: slight sand fill.

### Cards / Containers
- **Corner Style:** Gently rounded (16px on primary cards; 12px on smaller containers like add-on rows)
- **Background:** Warm Sand Bright on light sections; Celebration Charcoal variations on dark sections
- **Shadow Strategy:** None at rest. Warm lift shadow on hover for interactive cards only.
- **Border:** Light sections use `1px solid rgba(26,23,20,0.10)`. Dark sections use `1px solid rgba(237,232,223,0.06)`.
- **Internal Padding:** 2.25rem for full cards; 1.25rem 2rem for compact rows.

### Navigation
- **Style:** Fixed header, sand-tinted frosted glass (`rgba(247,244,239,0.82)` with `backdrop-filter: blur(20px)`). Gains a border-bottom on scroll.
- **Layout:** 3-column grid (`1fr auto 1fr`): logo left, links centered, CTA right.
- **Default link:** Muted Walnut, Nunito 500, 0.82rem
- **Active link:** Celebration Charcoal, Nunito 700
- **Logo:** DM Serif Display, "Demarks" in Charcoal + italic "360" in Amber
- **Book Now:** Primary button pill, Charcoal fill, scaled down to 0.82rem 1.5rem padding
- **Mobile:** Collapses to logo + hamburger; dropdown appears below header in matching frosted sand

### Section Label (Signature Component)
The section label is the only element with a decorative before-rule. Used at the top of every section to signal a new topic.

- **Style:** 0.62rem Nunito 700, 0.18em letter-spacing, all-caps, Event Amber on light sections / 55% Sand on dark sections
- **Before-rule:** 20px × 1.5px line in matching color, vertically centered to the text
- **Position:** Always directly above the display heading, 0.85rem margin-bottom

### Promo Bar
- **Style:** Celebration Charcoal background, 0.68rem Nunito 500, 0.12em letter-spacing, all-caps. The bold highlight uses Warm Sand at 100% opacity. One line only.

## 6. Do's and Don'ts

### Do:
- **Do** tint every surface toward amber. Use `#EDE8DF` (Warm Sand) as the lightest, `#1A1714` (Celebration Charcoal) as the darkest. No pure white, no pure black, ever.
- **Do** use the two-line heading structure for every display heading: straight first line in charcoal/sand, italic amber second line.
- **Do** keep Event Amber to 10% of any screen surface. More than that and the celebration becomes noise.
- **Do** use fully pill-shaped buttons (border-radius: 9999px). The pill is inviting, not corporate.
- **Do** alternate sections: warm sand section, charcoal section, warm sand section. The rhythm creates a scroll experience with visible momentum.
- **Do** make booking effortless: price, CTA, and service area must be visible within the first two screens without scrolling on mobile.
- **Do** reflect the local and welcoming nature: Calgary-specific copy, inclusive language, warm voice throughout.
- **Do** use rounded cards (16px) for all card containers. Sharp corners conflict with the warm, welcoming personality.

### Don't:
- **Don't** use nightclub or party-supply aesthetics: no neon, no aggressive all-caps display type set in heavy condensed fonts, no high-contrast red/black combos. The site serves birthday parties, not bars.
- **Don't** use corporate event rental catalog aesthetics: no dry product grids, no pricing tables that look like spreadsheets, no emotionless stock imagery of empty rooms.
- **Don't** produce AI-built SaaS landing-page aesthetics: no purple or blue gradients, no glass cards stacked on dark backgrounds, no "Join 10,000+ users" banners, no hero metric grids (big number + small label + gradient accent).
- **Don't** use cold editorial luxury: no all-Cormorant italic layouts, no broadsheet-grid black-and-white treatments, no design that makes a mother organizing a birthday party feel like she's in the wrong place.
- **Don't** use em dashes. Use commas, colons, semicolons, or periods instead.
- **Don't** use border-left as a colored accent stripe on cards or list items. Not a side stripe; use full border, tonal background, or a leading number.
- **Don't** use gradient text (background-clip: text with a gradient). The amber color is already enough; it does not need to shimmer.
- **Don't** add a resting-state shadow to any card. Shadows are hover-only.
- **Don't** set all-caps body copy. Reserve uppercase for the 0.62rem section labels only.
- **Don't** reach for DM Serif Display italic in contexts outside the Two-Line Heading Rule and the logo "360". Italic is celebratory; diluting it by overuse makes it lose meaning.

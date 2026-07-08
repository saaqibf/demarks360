# Golden Hour Cinema — Section Rollout Spec

The design foundation is already committed (globals.css tokens + hero.tsx). Your job: bring every remaining public-page section in line with the new direction. Visual reference: `~/design-directions/demarks-d-cinema-website.html` (open it to see the target).

## The direction
Warm cinema. Bodoni Moda serif headings in sentence case with one italic amber phrase; Figtree body; golden amber accents (#C9913F / #E8B25C via tokens); stage charcoal darks (#141009 family via tokens); warm cream lights (#F5EFE2 family via tokens); pill buttons (.btn-primary / .btn-secondary).

## Global rules (apply to every component you touch)
1. NEVER hardcode hex values or font names. Use the CSS variables from globals.css (--color-*, --font-*) or the semantic classes (.t-display, .t-heading, .t-subheading, .t-body, .t-label, .btn-primary, .btn-secondary).
2. Kill ALL `textTransform: 'uppercase'` on headings (h1/h2/h3). Headings are serif sentence case now. Labels/eyebrows STAY uppercase (.t-label style, letter-spacing 0.22em+).
3. Kill ALL fontWeight 700/800/900 on headings; serif headings are weight 400-500.
4. Rewrite each section heading as sentence case with ONE italic amber phrase using `<em>` (globals.css already styles `em` inside .t-display/.t-heading/.t-subheading). Examples:
   - How it works: "Your event, shot like a <em>film premiere.</em>"
   - Date checker: "Is your date <em>still open?</em>"
   - Pricing: "Clear pricing. <em>Zero surprises.</em>"
   - Testimonials: "The part of the night <em>everyone remembers.</em>"
   - Gallery: "From <em>last weekend's</em> events."
   - FAQ: "Before you <em>book.</em>"
   - CTA band: "Some moments deserve <em>every angle.</em>"
5. Buttons: replace inline rectangular button styles with .btn-primary (amber pill) or .btn-secondary. One .btn-primary max per section.
6. NO em dashes in any copy. Use commas, colons, periods.
7. Do not change any data fetching, props, API calls, schema markup, or business logic. Pricing numbers, package contents, FAQ answers, testimonial text stay EXACTLY as they are (only restyle containers/typography).
8. Keep all accessibility attributes, reduced-motion handling, and 44px touch targets.

## Components to restyle (components/public/)
- how-it-works.tsx
- date-checker.tsx
- pricing.tsx (keep all real prices/packages; style like the mockup's pack cards: dark stage cards, thin borders, italic serif prices in amber, "Most booked" pill badge on the featured tier if one exists)
- trust-strip.tsx
- event-types.tsx
- benefit-blocks.tsx
- gallery-showcase.tsx (frame captions in small caps mono-style labels)
- mid-cta.tsx
- package-recommender.tsx
- testimonials.tsx
- faq.tsx (accordion rows: serif question, amber + that rotates 45deg when open, thin separator lines)
- email-capture.tsx
- cta-band.tsx
- site-footer.tsx (4-column layout like mockup footer: brand blurb + Book / Events / Contact columns, base bar with copyright)
- site-nav.tsx (wordmark already inherits serif; ensure nav link hover/active colors use tokens, CTA button uses .btn-primary)
- promo-bar.tsx

## Also update
- `.claude/rules/frontend.md`: replace the "Design Direction" section content with: Golden Hour Cinema. Bodoni Moda (400-500, sentence case, italic amber em accents) for display/headings, Figtree (300-600) for body/UI. Accent --color-amber #C9913F / --color-amber-light #E8B25C. Dark --color-charcoal #141009. Cream --color-sand #F5EFE2. Pill buttons (999px). Dark/light section alternation stays.

## Verify before finishing
- `pnpm exec tsc --noEmit` passes
- `pnpm build` passes
- Do NOT commit. Print a list of files changed and any component you intentionally skipped with the reason.

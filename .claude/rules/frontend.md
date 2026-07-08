---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.css"
  - "**/components/**"
  - "**/styles/**"
  - "app/globals.css"
---

# Frontend

## Design Tokens

All tokens live in `app/globals.css` inside the `@theme` block as CSS custom properties (`--color-*`, `--font-*`). Never hardcode raw hex values or font names in components — always reference the variable.

Current token families: `--color-charcoal`, `--color-sand`, `--color-amber`, `--color-muted`, `--color-border-light`, `--font-display` (Bodoni Moda), `--font-body` (Figtree).

## Design Direction

Golden Hour Cinema. Bodoni Moda (400-500, sentence case, italic amber em accents) for display/headings, Figtree (300-600) for body/UI. Accent --color-amber #C9913F / --color-amber-light #E8B25C. Dark --color-charcoal #141009. Cream --color-sand #F5EFE2. Pill buttons (999px). Dark/light section alternation stays.

## Typography Rules (impeccable)

- Body max-width: `65ch` — never wider
- Body line-height: `1.75` (light), `1.8` (dark backgrounds)
- Headings: Bodoni Moda 400-500, sentence case, tight leading (0.98-1.2), one italic amber `<em>` phrase per heading
- Labels/eyebrows: Figtree 500, `0.22em` letter-spacing, uppercase, `0.62rem` (the only uppercase text besides buttons)
- Use `.t-display`, `.t-heading`, `.t-subheading`, `.t-body`, `.t-label`, `.t-ui` semantic classes
- Never set body text below `1rem` (16px)
- Scale ratio: 1.333× between steps — never flat scales

## Component Framework

| Category | In use |
|---|---|
| CSS | Tailwind v4 (`@theme` block in `globals.css`) |
| Primitives | Radix UI (`@radix-ui/react-*`) |
| Icons | Lucide React |
| Animation | CSS transitions + `Reveal` component (IntersectionObserver) |

Don't add competing libraries. Don't add shadcn components without checking Radix primitives first.

## Layout

- CSS Grid for 2D, Flexbox for 1D. Use `gap`, not margin hacks.
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Mobile-first. Touch targets: minimum 44x44px.

## Accessibility (non-negotiable)

- All interactive elements keyboard-accessible.
- Images: meaningful `alt` text. Decorative: `alt=""`.
- Form inputs: associated `<label>` or `aria-label`.
- Contrast: 4.5:1 normal text, 3:1 large text.
- Visible focus indicators. Never `outline: none` without replacement.
- `aria-live` for dynamic content. Respect `prefers-reduced-motion`.

## Performance

- Images: `loading="lazy"` below fold, explicit `width`/`height`.
- Fonts: `font-display: swap`.
- Animations: `transform` and `opacity` only.
- Bundle size: never import a whole library for one function.

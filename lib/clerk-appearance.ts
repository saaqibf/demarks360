// Dark Clerk theme for the sign-in / sign-up / admin-login surfaces.
// Clerk derives hover, border and muted shades from these, so they must be
// literal colors (not var(--…)), and the Core 3 names (colorForeground,
// colorInput, …) — the older colorText / colorInputBackground keys are ignored
// and leave dark text on the dark card. Values mirror the tokens in globals.css.
export const darkAuthAppearance = {
  variables: {
    colorPrimary: '#E8B25C', // --color-amber-light
    colorPrimaryForeground: '#141009', // --color-ink
    colorBackground: '#1A140B', // --color-surface
    colorForeground: '#F3EAD9', // --color-text-light
    colorMutedForeground: '#B9AD97', // --color-muted-light
    colorInput: '#141009', // --color-ink
    colorInputForeground: '#F3EAD9',
    colorNeutral: '#F3EAD9',
    fontFamily: "'Figtree', system-ui, sans-serif",
  },
}

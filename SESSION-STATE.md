# SESSION-STATE — Demarks360
_Last updated: 2026-06-11, written for session handoff/compaction. THE canonical resume point._

## The contract (locked 2026-06-10 via founder grill interview — never re-ask)
- Demarks360 + Harmony Living launch TOGETHER: real users, real payments, custom domains.
- Founder picked Direction A "Golden Hour Cinema"; full-website mockup `~/design-directions/demarks-d-cinema-website.html` is the visual target.
- Roles: Claude Code = design/immersive/backend/final review of ALL code. Codex CLI = section rollout/security/completion from Claude's written specs (Codex cannot use Claude skills).
- Check-ins with founder ONLY for: design approval + money steps. Everything else autonomous with summary reports. Founder said "accept all edits", "if blocked just wait".
- Budget: $0 build, ~$20-40/mo at launch. Founder owns NO launch assets yet.
- Copy rules: NO em dashes anywhere; testimonials/reviews in natural human voice (founder reversed his old em-dash rule 2026-06-10).
- Commits: author Saaqib Fagbenro <saaqibf.ayodimeji@gmail.com>, short messages, no AI mentions, no Co-Authored-By.

## State right now
- **Design foundation COMMITTED (ef186d9)**: globals.css swapped to Golden Hour Cinema (Bodoni Moda + Figtree, amber #C9913F/#E8B25C, stage charcoal #141009, cream #F5EFE2, pill buttons, em-italic-amber heading accents) + hero.tsx rebuilt (centered serif title card over the real Cloudinary event video, letterbox bars, amber pill CTA, italic stat bar). tsc + pnpm build PASS. Verified visually via Playwright on localhost:3777 (dev server may still be running, port 3777; kill it if stale).
- **Codex RUNNING (detached, pid logged in codex-rollout.log)**: executing `DESIGN-ROLLOUT-SPEC.md` — restyling all remaining public components (how-it-works, date-checker, pricing, testimonials, faq, footer, nav, etc.) to the cinema system. It will NOT commit. **FIRST ACTION NEXT SESSION: check `~/demarks360/codex-rollout.log` tail + `git diff` → review → tsc + build → screenshot localhost → commit if sound.**
- Security audit PASSED (rate limits on notify/availability/bookings, webhook sig validation, isAdmin on all admin routes). No TODOs. Drive import implemented (needs GOOGLE_SERVICE_ACCOUNT_JSON env, founder step).
- Real pricing lives in pricing.tsx / PRODUCT copy ("From $225") — mockup's $349/$549/$749 were placeholders; spec told Codex to keep real prices. Founder still must confirm final pricing.
- Visual QA loop tooling: `~/design-directions/shoot.mjs` (mockups) and `shoot-live.mjs` (localhost) — Playwright via harmony's node_modules, channel:'chrome'.

## Design rollout + deploy DONE (2026-06-11/12)
- ALL pages restyled to Golden Hour Cinema and committed: d50a9ce (16 public sections via Codex, reviewed), 8b248b6 (book flow, admin, gallery, sign-up, preview pages; crimson token retired), b77c759 (month availability endpoint: calendar now 1 request/month instead of 30 vs the 10/min rate limit; Clerk dev domain in CSP), 630efac (Cloudinary in media-src). DESIGN.md rewritten to the new system; .claude/rules/frontend.md updated.
- DEPLOYED to production: https://demarks360.vercel.app (project existed with envs from 26d ago; alias auto-set; public 200). Verified live via screenshots: homepage + /book calendar render correctly.
- **Hero video BROKEN at source: Cloudinary account dfonotyfb is DISABLED** ("cloud_name dfonotyfb is disabled"). No local/Mux copy of dds3_1_rqhg7x.mp4 exists. Hero degrades gracefully (dark stage + letterbox + glow, looks intentional). FOUNDER STEP: re-enable Cloudinary (or provide the original booth footage; Mux account is empty and ready as alternative host). Video element left in place; recovers automatically when the asset is reachable.

## Mockup port DONE (2026-06-17, commit 000ace5)
- `app/(public)/page.tsx` is now a direct structural port of `demarks-d-cinema-website.html`. All sections present: WebGL Three.js torus ring hero, 3-step experience, 3-pack pricing (real prices: $300/2hr, $450/3hr, from $600/4+hr), date check band (links to /book), horizontal-drift gallery reel, reviews grid, FAQ accordion, finale CTA, full footer.
- `app/(public)/_components/demarks-landing.css` — dm- prefixed scoped CSS ported directly from the mockup.
- `app/(public)/_components/demarks-landing-fx.tsx` — client component: Three.js 0.184 torus ring (amber metalness, orbiting cream sphere/light), GSAP 3.15 preloader degree counter, letterbox bar intro, Lenis 1.x smooth scroll, all scroll reveals + parallax + gallery drift. Returns loader+bars+grain JSX.
- lenis 1.3.23 + three 0.184 + @types/three installed (pnpm).
- Build + tsc PASS. Verified visually via Playwright shots: hero ✓, steps ✓, pricing ✓, check band ✓, gallery ✓, reviews ✓, FAQ ✓, finale ✓, footer ✓.
- Deployed to demarks360.vercel.app (prod, 2026-06-17).

## Next steps (in order)
1. e2e booking test in Stripe test mode on the live deployment.
2. Founder: confirm package pricing; Cloudinary account (above).
3. Founder money steps: domain, Clerk pk_live, Stripe live, Vercel Pro.

## Founder-pending
- Confirm real package pricing (current: $300/2hr, $450/3hr, from $600/4+hr — derived from $150/hr base).

## Fable 5 UI overhaul PASS 1 DONE (2026-07-05, uncommitted)
Executed ~/fable5-prompt.md (D-1..D-10) in this working tree. NOT yet committed — founder to review first.
- globals.css: .t-display letter-spacing → -0.02em, .btn-primary weight → 700, new .btn-secondary--dark hover, .hero-ghost-cta hover fill, .dm-nav-* rules (moved out of site-nav <style> tag), --color-success/--color-pending status tokens.
- site-nav: scroll state (.dm-nav--scrolled) gives Book-now CTA stronger amber fill; hamburger hover; inline <style> removed.
- Hero: amber wash 0.22, headline -0.02em, letterbox bars via color-mix; pricing: "Most booked" pill sized, dark-context CTA hover; testimonials: ★ rows to spec, Bodoni italic names, caps event lines, amber left rule on secondary cards, quote mark hardened (z-index/pointer-events).
- Booking: stepper circles 30px amber-active; date-picker today ring + amber selected; checkout pay button spinner; FIXED real bug: Stripe appearance.variables used var() strings (unresolvable in iframe) → literal values.
- Verified: tsc PASS, pnpm build PASS, hex-class grep zero in app/ + components/.

## CRITICAL DISCOVERY (2026-07-06): homepage does NOT use components/public/*
The live landing is app/(public)/page.tsx (459-line monolith, dm-* classes) + _components/demarks-landing.css + demarks-landing-fx.tsx (GSAP+Lenis+Three.js ring, preloader, letterbox bars). components/public/hero|pricing|testimonials|how-it-works|faq|benefit-blocks are an OLD unused iteration — do not spend effort there. site-nav.tsx IS used on /book.
Also: the Cloudinary video (dds3_1_rqhg7x.mp4) now returns 401 — no public media assets exist.

## Media plumbing shipped (2026-07-06)
All 9 landing media slots (hero film + 3 step frames + 5 gallery frames) render /media/* files with graceful fallback to designed placeholders. Founder drops real footage into public/media/ per public/media/README.md (exact filenames + specs there) and redeploys — page lights up with zero code changes. Timecode ticks in bottom letterbox bar. fx script removes missing media elements and pauses offscreen videos.

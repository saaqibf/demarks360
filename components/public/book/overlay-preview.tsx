'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { OVERLAY_HAZE, OVERLAY_INK, OVERLAY_REC_RED, OVERLAY_RIBBON_INK, pickOverlayFrame } from '@/lib/overlay-palette'

import type { OverlayFrameFile, OverlayPalette } from '@/lib/overlay-palette'

interface OverlayPreviewProps {
  eventName: string
  eventType: string
  eventDate: string | null
  locationCity: string
  palette: OverlayPalette
  /** The customer's "describe your vision" notes; steers which frame archetype renders */
  designNotes: string
  photoUrl: string | null
  pose: 'standing' | 'sitting'
  /** AI-generated one-off frame (object URL); overrides the library frame while set */
  generatedFrameUrl?: string | null
}

const FRAME_FALLBACK: OverlayFrameFile = 'frame-gold-black.webp'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const EYEBROW_BY_EVENT_TYPE: Record<string, string> = {
  'Birthday Party': 'A birthday celebration',
  'Wedding': 'A wedding celebration',
  'Graduation': 'A graduation celebration',
  'Corporate Event': 'An evening with',
  'Engagement Party': 'An engagement celebration',
  'Baby Shower & Gender Reveal': 'A shower of love',
  'Holiday Party': 'A holiday celebration',
}
const DEFAULT_EYEBROW = 'A night to remember'

const GHOST_BY_EVENT_TYPE: Record<string, string> = {
  'Birthday Party': "Aisha's 30th",
  'Wedding': 'The Bello Wedding',
  'Graduation': 'Zara, Class of 2026',
  'Corporate Event': 'Summit Night 2026',
  'Engagement Party': 'She Said Yes',
  'Baby Shower & Gender Reveal': 'Oh Baby, Amara',
  'Holiday Party': 'The Golden Gala',
}
const DEFAULT_GHOST = 'Your Event Name'

// Palette changes wash over every tinted element instead of snapping
const TINT_TRANSITION = 'color .4s ease, border-color .4s ease, background-color .4s ease, fill .4s ease, stroke .4s ease'

// Geometry of the production frame art (720x1280, measured off the alpha channel):
// transparent window roughly x 4-96% / y 20-92%, dark platform mound from y 86%,
// empty satin ribbon band y 93.4-98.6% with a usable flat width of ~62% centered.
// All six variants share this layout.
const FRAME_RIBBON = { top: '93.4%', height: '5.2%', inlineInset: '19%' } as const

// Fashion-illustration silhouettes drawn in viewBox 0 0 200 260; feet rest on the
// platform top face at y=227 so the overlay is scaled against a believable human
const STANDING_BODY = `
  M 97 94 C 93 95 91 97 90 100 C 84 103 80 108 79 115
  C 78 123 80 131 81 139 C 82 147 79 155 77 164
  C 75 175 76 188 78 200 C 79 211 80 220 80 227
  L 89 227 C 89 216 90 205 91 195 C 92 187 94 181 96 176
  C 98 181 100 189 101 197 C 102 208 103 218 104 227
  L 113 227 C 112 214 111 200 110 188 C 109 176 110 165 108 154
  C 107 144 108 132 109 122 C 110 115 112 111 114 108
  C 118 102 122 94 125 86 C 127 80 129 74 130 70
  C 131 66 129 64 127 66 C 124 68 122 73 120 79
  C 117 87 113 93 109 97 C 105 95 101 94 97 94 Z`
const STANDING_RIM = `
  M 130 70 C 129 74 127 80 125 86 C 122 94 118 102 114 108
  C 112 111 110 115 109 122 C 108 132 107 144 108 154
  C 110 165 109 176 110 188 C 111 200 112 214 113 226`
const SITTING_BODY = `
  M 100 127 C 97 128 94 131 91 136 C 87 142 85 152 86 162
  C 85 168 85 174 86 180 C 87 186 89 189 94 190
  C 101 191 108 190 113 187 C 117 184 120 180 122 176
  C 126 179 128 185 129 192 C 130 202 130 212 129 221
  C 129 224 128 226 127 227 L 135 227 C 136 216 136 204 134 194
  C 133 186 130 179 126 174 C 128 170 129 166 129 162
  C 126 165 121 168 116 170 C 110 172 104 172 99 171
  C 101 178 102 186 102 194 C 102 206 101 216 100 224
  L 92 224 C 92 214 92 202 93 192 C 93 186 94 180 95 176
  C 92 172 90 166 90 158 C 90 148 92 140 96 134
  C 98 131 100 129 103 128 Z`
const SITTING_STOOL = `
  M 84 190 L 122 190 L 122 195 L 116 195 L 118 227 L 113 227
  L 112 195 L 94 195 L 93 227 L 88 227 L 90 195 L 84 195 Z`
const SITTING_RIM = `
  M 104 129 C 107 134 108 142 108 152 C 108 160 110 166 114 170
  C 120 174 126 181 128 190 C 130 202 130 214 129 225`

const BOKEH_TINTED_COLOR = 'color-mix(in srgb, var(--op-secondary) 16%, transparent)'
const BOKEH_AMBER_COLOR = 'color-mix(in srgb, var(--color-amber) 12%, transparent)'

// [x%, y%, radius cqw] clustered in the upper two thirds so they read as string lights
const BOKEH_TINTED_DISCS: Array<[number, number, number]> = [
  [12, 14, 6], [30, 8, 4], [55, 18, 8], [78, 10, 5], [88, 30, 6], [22, 38, 7], [65, 42, 4], [40, 26, 5],
]
const BOKEH_AMBER_DISCS: Array<[number, number, number]> = [
  [8, 28, 5], [35, 15, 7], [60, 6, 4], [82, 20, 8], [50, 36, 6], [18, 52, 4], [72, 50, 6],
]

function bokehBackground(color: string, discs: Array<[number, number, number]>): string {
  return discs
    .map(([x, y, r]) => `radial-gradient(${r}cqw at ${x}% ${y}%, ${color} 0%, ${color} 40%, transparent 70%)`)
    .join(', ')
}

// The component renders twice (desktop + mobile mounts), so the style tag renders
// twice too; wrapping the CSS in one shared constant keeps both copies identical
const OVP_CSS = `
.ovp-sweep { opacity: 0; }
.ovp-pose { transform-box: fill-box; transform-origin: bottom center; }
@media (prefers-reduced-motion: no-preference) {
  .ovp-live-dot, .ovp-rec-dot { animation: ovp-pulse 2s ease-in-out infinite; }
  .ovp-bokeh-a { animation: ovp-drift-a 14s ease-in-out infinite alternate; }
  .ovp-bokeh-b { animation: ovp-drift-b 18s ease-in-out infinite alternate; }
  .ovp-sweep { animation: ovp-sweep 5s linear infinite; }
  .ovp-pose { transition: opacity .3s ease, transform .3s ease; }
  .ovp-bloom { animation: ovp-bloom .4s ease; }
  .ovp-frame { transition: opacity .4s ease; }
}
@keyframes ovp-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
@keyframes ovp-drift-a {
  from { transform: translateX(-4%); }
  to { transform: translateX(4%); }
}
@keyframes ovp-drift-b {
  from { transform: translateX(4%); }
  to { transform: translateX(-4%); }
}
@keyframes ovp-sweep {
  0% { transform: translateX(-160%) skewX(-18deg); opacity: 0; }
  8% { opacity: 1; }
  26% { transform: translateX(320%) skewX(-18deg); opacity: 0; }
  100% { transform: translateX(320%) skewX(-18deg); opacity: 0; }
}
@keyframes ovp-bloom {
  from { opacity: 0; transform: scale(0.9); box-shadow: 0 0 30px color-mix(in srgb, var(--op-primary) 60%, transparent); }
  to { opacity: 1; transform: scale(1); box-shadow: 0 0 0 transparent; }
}
`

export function OverlayPreview({ eventName, eventType, eventDate, locationCity, palette, designNotes, photoUrl, pose, generatedFrameUrl }: OverlayPreviewProps) {
  const name = eventName.trim()
  const ghost = GHOST_BY_EVENT_TYPE[eventType] ?? DEFAULT_GHOST
  const displayName = name || ghost
  const eyebrow = EYEBROW_BY_EVENT_TYPE[eventType] ?? DEFAULT_EYEBROW
  // Length-stepped so long names shrink to stay inside the ribbon's flat band
  const ribbonSize = displayName.length <= 14 ? '6.4cqw' : displayName.length <= 26 ? '5cqw' : displayName.length <= 38 ? '4cqw' : '3.3cqw'
  const subLine = eventDate ? `${formatOverlayDate(eventDate)} · ${locationCity}` : locationCity

  const frameTarget = useMemo(
    () => pickOverlayFrame({ eventTypeKey: eventType, designNotes, palette }),
    [eventType, designNotes, palette],
  )
  // Cross-fade state: keep every frame we have ever needed mounted (plus the
  // signature default as the always-warm fallback) and only swap the visible one
  // once the incoming file has actually loaded, so the art never flashes empty
  const [shownFrame, setShownFrame] = useState<OverlayFrameFile>(frameTarget)
  const [mountedFrames, setMountedFrames] = useState<readonly OverlayFrameFile[]>(() =>
    frameTarget === FRAME_FALLBACK ? [FRAME_FALLBACK] : [FRAME_FALLBACK, frameTarget],
  )
  const loadedFramesRef = useRef<Set<OverlayFrameFile>>(new Set())
  const frameTargetRef = useRef(frameTarget)

  useEffect(() => {
    frameTargetRef.current = frameTarget
    setMountedFrames(prev => (prev.includes(frameTarget) ? prev : [...prev, frameTarget]))
    if (loadedFramesRef.current.has(frameTarget)) setShownFrame(frameTarget)
  }, [frameTarget])

  function handleFrameLoaded(frame: OverlayFrameFile) {
    loadedFramesRef.current.add(frame)
    if (frame === frameTargetRef.current) setShownFrame(frame)
  }

  function handleFrameError(frame: OverlayFrameFile) {
    // A frame that has not shipped yet falls back to the signature balloon arch
    if (frame === frameTargetRef.current && frame !== FRAME_FALLBACK) setShownFrame(FRAME_FALLBACK)
  }

  // The generated frame fades in only once loaded; until then (and on error) the
  // library frame underneath keeps the preview whole
  const [generatedLoaded, setGeneratedLoaded] = useState(false)
  useEffect(() => {
    setGeneratedLoaded(false)
  }, [generatedFrameUrl])

  return (
    <div>
      <style>{OVP_CSS}</style>

      <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-amber)', marginBottom: '0.75rem' }}>
        <span className="ovp-live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-amber-light)', flexShrink: 0 }} />
        Live overlay preview
      </p>

      <div
        role="img"
        aria-label={`Preview of your 360 overlay: ${displayName}, ${palette.label} palette${photoUrl ? ', photo added' : ''}`}
        style={{
          '--op-primary': palette.primary,
          '--op-secondary': palette.secondary,
          aspectRatio: '9 / 16', width: '100%', position: 'relative', overflow: 'hidden',
          borderRadius: '12px', border: '1px solid var(--color-border-dark)',
          containerType: 'inline-size',
          background: `radial-gradient(120% 90% at 50% 30%, ${OVERLAY_HAZE}, ${OVERLAY_INK} 70%)`,
          boxShadow: '0 0 40px color-mix(in srgb, var(--op-secondary) 14%, transparent)',
          transition: 'box-shadow .4s ease',
        } as React.CSSProperties}
      >
        {/* Layer 1: venue plate floor glow, tinted by the palette */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(45% 22% at 50% 80%, color-mix(in srgb, var(--op-secondary) 10%, transparent), transparent 70%)' }} />

        {/* Layer 2: counter-drifting bokeh reads as the camera orbiting the subject */}
        <div aria-hidden="true" className="ovp-bokeh-a" style={{ position: 'absolute', inset: 0, background: bokehBackground(BOKEH_TINTED_COLOR, BOKEH_TINTED_DISCS) }} />
        <div aria-hidden="true" className="ovp-bokeh-b" style={{ position: 'absolute', inset: 0, background: bokehBackground(BOKEH_AMBER_COLOR, BOKEH_AMBER_DISCS) }} />

        {/* Layer 3: platform glow + subject silhouette, the "video" seen through the frame window */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '18%', right: '18%', top: '75%', height: '12%', background: 'radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--op-secondary) 12%, transparent), transparent 70%)' }} />
        <svg aria-hidden="true" viewBox="0 0 200 260" style={{ position: 'absolute', left: 0, bottom: '11%', width: '100%', height: 'auto' }}>
          {/* 360 platform: dark top face with a lit front rim */}
          <ellipse cx="100" cy="228" rx="62" ry="14" fill={OVERLAY_INK} />
          <ellipse cx="100" cy="220" rx="46" ry="8" opacity="0.06" style={{ fill: 'var(--op-secondary)', transition: TINT_TRANSITION }} />
          <path d="M 38 228 A 62 14 0 0 0 162 228" fill="none" strokeWidth="2" opacity="0.7" style={{ stroke: 'var(--op-secondary)', transition: TINT_TRANSITION }} />

          <g className="ovp-pose" style={{ opacity: pose === 'standing' ? 1 : 0, transform: pose === 'standing' ? 'scale(1)' : 'scale(0.98)' }}>
            <circle cx="97" cy="86" r="9" fill={OVERLAY_INK} />
            <path d={STANDING_BODY} fill={OVERLAY_INK} />
            {/* Partial stroke on the light-facing side reads as a backlit rim; a gradient
                would need an SVG id, which this twice-mounted component must not carry */}
            <path d={STANDING_RIM} fill="none" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" style={{ stroke: 'var(--op-secondary)', transition: TINT_TRANSITION }} />
          </g>

          <g className="ovp-pose" style={{ opacity: pose === 'sitting' ? 1 : 0, transform: pose === 'sitting' ? 'scale(1)' : 'scale(0.98)' }}>
            <circle cx="100" cy="117" r="9" fill={OVERLAY_INK} />
            <path d={SITTING_STOOL} fill={OVERLAY_INK} />
            <path d={SITTING_BODY} fill={OVERLAY_INK} />
            <path d={SITTING_RIM} fill="none" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" style={{ stroke: 'var(--op-secondary)', transition: TINT_TRANSITION }} />
          </g>
        </svg>

        {/* Layer 4: the production frame art. Never tinted or filtered; cross-fades
            between variants. Mounting gold-black permanently doubles as its preload. */}
        {mountedFrames.map(frame => (
          <img
            key={frame}
            className="ovp-frame"
            src={`/overlays/${frame}`}
            alt=""
            draggable={false}
            decoding="async"
            onLoad={() => handleFrameLoaded(frame)}
            onError={() => handleFrameError(frame)}
            // Cached images can complete before hydration, in which case onLoad never fires
            ref={el => { if (el && el.complete && el.naturalWidth > 0) handleFrameLoaded(frame) }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: frame === shownFrame && !(generatedFrameUrl && generatedLoaded) ? 1 : 0, pointerEvents: 'none' }}
          />
        ))}
        {generatedFrameUrl ? (
          <img
            className="ovp-frame"
            src={generatedFrameUrl}
            alt=""
            draggable={false}
            decoding="async"
            onLoad={() => setGeneratedLoaded(true)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: generatedLoaded ? 1 : 0, pointerEvents: 'none' }}
          />
        ) : null}

        {/* Layer 5: monitor chrome, kept inside the transparent window under the balloon arch */}
        <div aria-hidden="true" style={{ position: 'absolute', top: '21.5%', left: '8cqw', right: '8cqw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.5 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '1.5cqw' }}>
            <span className="ovp-rec-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: OVERLAY_REC_RED, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '2.2cqw', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(245,239,226,0.9)' }}>REC</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '2.2cqw', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(245,239,226,0.9)' }}>360° · 120FPS</span>
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.4cqw', letterSpacing: '0.2em', color: 'rgba(245,239,226,0.7)' }}>
            DEMARKS 360
          </span>
        </div>

        <p aria-hidden="true" style={{ position: 'absolute', top: '25.5%', left: '8cqw', right: '8cqw', margin: 0, textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '2.6cqw', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--op-secondary)', transition: TINT_TRANSITION }}>
          {eyebrow}
        </p>

        <p aria-hidden="true" style={{ position: 'absolute', top: '29.2%', left: '8cqw', right: '8cqw', margin: 0, textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '2.2cqw', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(245,239,226,0.7)' }}>
          {subLine}
        </p>

        {/* Layer 6: event name lettered onto the frame's empty satin ribbon */}
        <p
          aria-hidden="true"
          style={{
            position: 'absolute', top: FRAME_RIBBON.top, height: FRAME_RIBBON.height,
            left: FRAME_RIBBON.inlineInset, right: FRAME_RIBBON.inlineInset, margin: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-script), cursive', fontWeight: 400, fontSize: ribbonSize, lineHeight: 1,
            color: OVERLAY_RIBBON_INK, textShadow: '0 1px 0 rgba(255,236,190,0.5)',
            whiteSpace: 'nowrap', overflowX: 'clip', overflowY: 'visible',
            opacity: name ? 1 : 0.5,
          }}
        >
          {displayName}
        </p>

        {/* Layer 7: mirrored celebrant duo in the bottom corners, overlapping the
            glitter rails the way the production overlays do */}
        {photoUrl && (['left', 'right'] as const).map(side => (
          <div
            key={`${side}-${photoUrl}`}
            aria-hidden="true"
            className="ovp-bloom"
            style={{
              position: 'absolute', bottom: '7%', width: '35cqw', aspectRatio: '4 / 5',
              ...(side === 'left' ? { left: '2cqw' } : { right: '2cqw' }),
              border: '1.5px solid var(--color-amber-light)',
              borderRadius: '999px 999px 10px 10px', overflow: 'hidden',
              WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 98%)',
              maskImage: 'linear-gradient(to bottom, black 70%, transparent 98%)',
              pointerEvents: 'none',
            }}
          >
            <img
              src={photoUrl}
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: side === 'right' ? 'scaleX(-1)' : undefined }}
            />
          </div>
        ))}

        <div aria-hidden="true" className="ovp-sweep" style={{ position: 'absolute', top: '-10%', bottom: '-10%', left: 0, width: '40cqw', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.09), transparent)', pointerEvents: 'none' }} />
      </div>

      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(245,239,226,0.4)', lineHeight: 1.6, marginTop: '0.75rem' }}>
        {!photoUrl && 'Add a photo to see them in the overlay. '}
        A mock, not the final art. Our designer builds your real overlay after booking.
      </p>
    </div>
  )
}

// Split the string manually: new Date('YYYY-MM-DD') parses as UTC and shifts the day in Calgary
function formatOverlayDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${MONTHS[Number(month) - 1] ?? ''} ${Number(day)} ${year}`
}

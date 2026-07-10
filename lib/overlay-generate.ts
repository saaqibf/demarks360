import sharp from 'sharp'

const EVENT_STYLE: Record<string, string> = {
  wedding: 'romantic florals, soft satin ribbon, delicate greenery accents',
  anniversary: 'romantic florals with metallic accents, elegant and warm',
  'baby-shower': 'soft pastel balloons, gentle clouds, sweet and airy',
  bachelorette: 'glam sparkle, champagne tones, playful shimmer streamers',
  'birthday-adult': 'glossy balloons, foil stars, glitter borders, celebratory streamers',
  'birthday-kids': 'bright playful balloons, rainbow confetti, paper stars',
  graduation: 'refined geometric lines, metallic accents, understated celebration',
  corporate: 'clean art-deco lines, premium metallic keylines, minimal ornament',
  holiday: 'festive ornaments, warm lights, seasonal sparkle',
  other: 'glossy balloons, foil stars, glitter borders, celebratory streamers',
}

// User text is folded into an image prompt; keep it short and strip anything URL-like
export function sanitizeNotes(notes: string): string {
  return notes
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 280)
}

export function buildOverlayPrompt(input: {
  eventTypeKey?: string
  colorWords?: string
  designNotes?: string
}): string {
  const style = EVENT_STYLE[input.eventTypeKey ?? 'other'] ?? EVENT_STYLE.other
  const colors = input.colorWords?.trim()
    ? `Color palette: ${sanitizeNotes(input.colorWords)}.`
    : 'Color palette: metallic gold, black and cream.'
  const notes = input.designNotes?.trim()
    ? `Client vision to honor: ${sanitizeNotes(input.designNotes)}.`
    : ''
  return [
    'Party photo-booth overlay frame graphic, vertical 9:16, NO people and NO text anywhere.',
    `Design language: ${style}. ${colors} ${notes}`,
    'Composition requirements: decorations form an arch across the top and slim borders down both left and right edges.',
    'At the bottom center: a wide elegant EMPTY satin ribbon banner with flowing folded ends, completely blank with no text, sitting over a dark semicircle platform mound.',
    'The entire center of the frame and all remaining background is pure flat white #FFFFFF with nothing in it.',
    'Clean high-end event graphic design, crisp edges, print quality.',
  ].join(' ')
}

const WHITE_MIN = 238
const OUT_W = 720
const OUT_H = 1280

// The generator returns opaque art on a white field; the booking preview needs the
// connected white region (center window + outer margins) turned into real alpha.
// Flood fill from the window center plus near-white margin seeds, exactly like the
// offline pipeline that produced the static frames.
export async function keyWhiteCenter(image: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(image)
    .resize(OUT_W, OUT_H, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  const isWhite = (i: number) =>
    data[i] >= WHITE_MIN && data[i + 1] >= WHITE_MIN && data[i + 2] >= WHITE_MIN

  const seeds: Array<[number, number]> = [
    [Math.floor(width / 2), Math.floor(height / 2)],
    [Math.floor(width / 2), 20],
    [20, 30],
    [width - 20, 30],
    [20, Math.floor(height / 2)],
    [width - 20, Math.floor(height / 2)],
    [30, height - 20],
    [width - 30, height - 20],
  ]

  const visited = new Uint8Array(width * height)
  const stack: number[] = []
  for (const [sx, sy] of seeds) {
    const p = sy * width + sx
    if (!visited[p] && isWhite(p * channels)) {
      visited[p] = 1
      stack.push(p)
    }
  }

  while (stack.length > 0) {
    const p = stack.pop() as number
    data[p * channels + 3] = 0
    const x = p % width
    const y = (p - x) / width
    const neighbors = [
      x > 0 ? p - 1 : -1,
      x < width - 1 ? p + 1 : -1,
      y > 0 ? p - width : -1,
      y < height - 1 ? p + width : -1,
    ]
    for (const n of neighbors) {
      if (n >= 0 && !visited[n] && isWhite(n * channels)) {
        visited[n] = 1
        stack.push(n)
      }
    }
  }

  return sharp(data, { raw: { width, height, channels } }).png().toBuffer()
}

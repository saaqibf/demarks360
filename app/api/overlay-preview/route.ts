import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getClientIp, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { buildOverlayPrompt, keyWhiteCenter } from '@/lib/overlay-generate'

export const runtime = 'nodejs'
export const maxDuration = 60

const requestSchema = z.object({
  eventTypeKey: z.string().max(40).optional(),
  colorTheme: z.string().max(120).optional(),
  designNotes: z.string().max(500).optional(),
})

function higgsfieldCredentials(): string | null {
  if (process.env.HF_CREDENTIALS) return process.env.HF_CREDENTIALS
  if (process.env.HF_API_KEY && process.env.HF_API_SECRET) {
    return `${process.env.HF_API_KEY}:${process.env.HF_API_SECRET}`
  }
  return null
}

export async function GET() {
  return NextResponse.json({ available: higgsfieldCredentials() !== null })
}

export async function POST(req: NextRequest) {
  const credentials = higgsfieldCredentials()
  if (!credentials) {
    return NextResponse.json({ error: 'Custom preview generation is not configured' }, { status: 503 })
  }

  const ip = getClientIp(req)
  // Each generation spends real credits; keep bots and refresh-spammers off the faucet
  const rl = checkRateLimit(`overlay-preview:${ip}`, { limit: 5, windowMs: 60 * 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Preview limit reached for now. Our designer will take it from here after booking.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)), ...rateLimitHeaders(0, rl.resetAt) } },
    )
  }

  // Backstop independent of IP so header/IP rotation can't drain the credit
  // balance. A durable store (Upstash / Vercel KV) is the complete fix and is
  // flagged for provisioning; this bounds worst-case spend per instance.
  const day = new Date().toISOString().slice(0, 10)
  const globalRl = checkRateLimit(`overlay-preview:global:${day}`, { limit: 100, windowMs: 24 * 60 * 60_000 })
  if (!globalRl.allowed) {
    return NextResponse.json(
      { error: 'Custom previews are paused for today. Our designer will craft yours after booking.' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 422 })
  }

  const prompt = buildOverlayPrompt({
    eventTypeKey: parsed.data.eventTypeKey,
    colorWords: parsed.data.colorTheme,
    designNotes: parsed.data.designNotes,
  })

  try {
    const { higgsfield, config } = await import('@higgsfield/client/v2')
    config({ credentials })
    const model = process.env.OVERLAY_MODEL ?? 'flux-pro/kontext/max/text-to-image'
    const result = await higgsfield.subscribe(model, {
      input: { prompt, aspect_ratio: '9:16' },
      withPolling: true,
    })
    const url = result.images?.[0]?.url
    if (result.status !== 'completed' || !url) {
      return NextResponse.json({ error: 'Generation did not complete' }, { status: 502 })
    }

    const imageRes = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    if (!imageRes.ok) {
      return NextResponse.json({ error: 'Could not fetch generated image' }, { status: 502 })
    }
    const raw = Buffer.from(await imageRes.arrayBuffer())
    const keyed = await keyWhiteCenter(raw)

    return new NextResponse(new Uint8Array(keyed), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, max-age=3600',
        ...rateLimitHeaders(rl.remaining, rl.resetAt),
      },
    })
  } catch (err) {
    console.error('overlay-preview generation failed', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
  }
}

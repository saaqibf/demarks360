import { NextRequest, NextResponse } from 'next/server'

// Same-origin download proxy. Browsers ignore the <a download> attribute on
// cross-origin URLs, so a guest tapping "Download my video" on a Touchpix CDN
// link just opens the clip instead of saving it. This route streams the clip
// back same-origin with Content-Disposition: attachment so it lands in the
// camera roll. Host is allow-listed so it can't be used as an open proxy.
const ALLOWED_HOST = /(^|\.)digitaloceanspaces\.com$/i

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url')
  if (!raw) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }
  if (target.protocol !== 'https:' || !ALLOWED_HOST.test(target.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
  }

  let upstream: Response
  try {
    upstream = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Demarks360Gallery/1.0)' },
      signal: AbortSignal.timeout(20_000),
    })
  } catch (err) {
    console.error('clip-download upstream fetch failed', err)
    return NextResponse.json({ error: 'Could not reach the clip' }, { status: 502 })
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Clip unavailable' }, { status: 502 })
  }

  const name = target.pathname.split('/').pop() || 'demarks360-clip.mp4'
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'video/mp4',
      'Content-Disposition': `attachment; filename="${name.replace(/[^\w.-]/g, '_')}"`,
      'Cache-Control': 'private, max-age=0, no-store',
    },
  })
}

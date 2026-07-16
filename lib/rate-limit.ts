import type { NextRequest } from 'next/server';

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

// The leftmost X-Forwarded-For value is attacker-controlled, so we never key
// limits on it. On Vercel, x-real-ip is set at the edge to the true client IP
// and overwritten on every request, so it can't be spoofed. Fall back to the
// LAST X-Forwarded-For entry (the one the platform appended), never the first.
export function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return 'unknown';
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of store.entries()) {
    if (now > bucket.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count++;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

// Durable, cross-instance rate limit backed by the rate_limits table. A single
// atomic upsert keyed on `key` increments (or resets when the window elapsed)
// using the DB clock, so counts hold across serverless instances and cold starts
// — unlike the in-memory Map. If the table is missing (migration not yet applied)
// or the DB is unreachable, it falls back to the in-memory limiter so the endpoint
// still has protection and the limiter itself never hard-fails a request.
export async function checkRateLimitDb(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const resetAt = new Date(Date.now() + windowMs);
  try {
    const { db } = await import('@/lib/db');
    const { sql } = await import('drizzle-orm');
    const res = await db.execute(sql`
      INSERT INTO rate_limits (key, count, reset_at)
      VALUES (${key}, 1, ${resetAt.toISOString()})
      ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN rate_limits.reset_at < now() THEN 1 ELSE rate_limits.count + 1 END,
        reset_at = CASE WHEN rate_limits.reset_at < now() THEN ${resetAt.toISOString()} ELSE rate_limits.reset_at END
      RETURNING count, reset_at
    `);
    const rows = (res as { rows?: Array<Record<string, unknown>> }).rows ?? (res as unknown as Array<Record<string, unknown>>);
    const row = rows[0];
    const count = Number(row.count);
    const rAt = new Date(row.reset_at as string).getTime();
    return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetAt: rAt };
  } catch {
    return checkRateLimit(key, { limit, windowMs });
  }
}

export function rateLimitHeaders(remaining: number, resetAt: number) {
  return {
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
  };
}

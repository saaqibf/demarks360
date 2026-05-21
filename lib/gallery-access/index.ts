import { db } from '@/lib/db'
import { bookings, galleryItems } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

type Booking = typeof bookings.$inferSelect
type GalleryItem = typeof galleryItems.$inferSelect

export type GalleryAccessResult =
  | { status: 'published'; booking: Booking; items: GalleryItem[] }
  | { status: 'pending'; booking: Booking }
  | { status: 'not-found' }
  | { status: 'cancelled' }

export async function resolveGalleryAccess(token: string): Promise<GalleryAccessResult> {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.galleryToken, token))

  if (!booking) return { status: 'not-found' }
  if (booking.status === 'cancelled') return { status: 'cancelled' }
  if (!booking.galleryPublishedAt) return { status: 'pending', booking }

  const items = await db
    .select()
    .from(galleryItems)
    .where(and(eq(galleryItems.bookingId, booking.id), eq(galleryItems.published, true)))
    .orderBy(asc(galleryItems.createdAt))

  return { status: 'published', booking, items }
}

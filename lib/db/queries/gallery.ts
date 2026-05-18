import { db } from '@/lib/db'
import { bookings, galleryItems } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export async function getGalleryByToken(token: string) {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.galleryToken, token))
  if (!booking) return null

  const items = await db
    .select()
    .from(galleryItems)
    .where(and(eq(galleryItems.bookingId, booking.id), eq(galleryItems.published, true)))
    .orderBy(asc(galleryItems.createdAt))

  return { booking, items }
}

export async function getPublicShowcaseItems() {
  return db
    .select()
    .from(galleryItems)
    .where(and(eq(galleryItems.published, true), eq(galleryItems.isPublicShowcase, true)))
    .orderBy(asc(galleryItems.createdAt))
}

export async function addGalleryItem(params: {
  bookingId: string
  muxAssetId: string
  muxPlaybackId: string
  thumbnailUrl?: string
  title?: string
}) {
  const [item] = await db
    .insert(galleryItems)
    .values({
      bookingId: params.bookingId,
      muxAssetId: params.muxAssetId,
      muxPlaybackId: params.muxPlaybackId,
      thumbnailUrl: params.thumbnailUrl ?? null,
      title: params.title ?? null,
      published: true,
    })
    .returning()
  return item
}

export async function setShowcaseStatus(id: string, isPublicShowcase: boolean) {
  await db
    .update(galleryItems)
    .set({ isPublicShowcase })
    .where(eq(galleryItems.id, id))
}

export async function publishGallery(bookingId: string) {
  await db
    .update(bookings)
    .set({ galleryPublishedAt: new Date() })
    .where(eq(bookings.id, bookingId))
}

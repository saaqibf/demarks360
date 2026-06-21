import {
  pgTable, text, integer, timestamp, boolean,
  jsonb, date, time, numeric, pgEnum,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending', 'confirmed', 'cancelled', 'completed',
])

export const customers = pgTable('customers', {
  id: text('id').primaryKey(), // Clerk user ID
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const bookings = pgTable('bookings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  customerId: text('customer_id').references(() => customers.id).notNull(),
  eventDate: date('event_date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  addOns: jsonb('add_ons').$type<string[]>().default([]).notNull(),
  status: bookingStatusEnum('status').notNull().default('pending'),
  eventType: text('event_type').notNull(),
  locationAddress: text('location_address').notNull(),
  locationCity: text('location_city').notNull(),
  travelSurcharge: numeric('travel_surcharge', { precision: 10, scale: 2 }).default('0').notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeSetupIntentId: text('stripe_setup_intent_id'),
  stripeCustomerId: text('stripe_customer_id'),
  depositAmount: numeric('deposit_amount', { precision: 10, scale: 2 }),
  balanceAmount: numeric('balance_amount', { precision: 10, scale: 2 }),
  balanceChargeDate: date('balance_charge_date'),
  balanceChargedAt: timestamp('balance_charged_at'),
  chargeFailedAt: timestamp('charge_failed_at'),
  chargeRetryAt: timestamp('charge_retry_at'),
  chargeResolvedAt: timestamp('charge_resolved_at'),
  cardDeletedAt: timestamp('card_deleted_at'),
  galleryToken: text('gallery_token').$defaultFn(() => createId()),
  galleryPublishedAt: timestamp('gallery_published_at'),
  notes: text('notes'),
  eventName: text('event_name'),
  eventPreferences: jsonb('event_preferences').$type<{
    backgroundColorTheme?: string
    designThemeTags?: string[]
    songPreference?: string
    videoType?: 'video' | 'slomo'
    videoDuration?: number
    slomoBoomerang?: boolean
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const addOns = pgTable('add_ons', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  active: boolean('active').default(true).notNull(),
  comingSoon: boolean('coming_soon').default(false).notNull(),
})

export const galleryItems = pgTable('gallery_items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  bookingId: text('booking_id').references(() => bookings.id).notNull(),
  muxAssetId: text('mux_asset_id').notNull(),
  muxPlaybackId: text('mux_playback_id').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  title: text('title'),
  published: boolean('published').default(false).notNull(),
  isPublicShowcase: boolean('is_public_showcase').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const availabilityBlocks = pgTable('availability_blocks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  blockedDate: date('blocked_date').notNull(),
  startTime: time('start_time'),
  endTime: time('end_time'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

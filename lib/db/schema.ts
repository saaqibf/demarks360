import {
  pgTable, text, integer, timestamp, boolean,
  jsonb, date, time, numeric, pgEnum,
  index, uniqueIndex,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// 'pending' is legacy only: PG cannot remove enum values, so it stays but new code never writes it.
// New values are appended at the end so drizzle emits pure ALTER TYPE ... ADD VALUE statements.
export const bookingStatusEnum = pgEnum('booking_status', [
  'pending', 'confirmed', 'cancelled', 'completed',
  'requested', 'approved', 'declined', 'expired',
])

export const customers = pgTable('customers', {
  // cuid2 for new rows; legacy rows keep their Stripe 'cus_...' PKs from the old checkout-first flow
  id: text('id').primaryKey(),
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
  approvedAt: timestamp('approved_at'),
  depositExpiresAt: timestamp('deposit_expires_at'),
  depositPaidAt: timestamp('deposit_paid_at'),
  autoPayOptIn: boolean('auto_pay_opt_in').default(false).notNull(),
  // Public payment-page token, same pattern as galleryToken
  payToken: text('pay_token').$defaultFn(() => createId()),
  stripeDepositSessionId: text('stripe_deposit_session_id'),
  stripeBalanceSessionId: text('stripe_balance_session_id'),
  stripeBalancePaymentIntentId: text('stripe_balance_payment_intent_id'),
  // Idempotency guard so a re-run cron never double-emails the balance-due link
  balanceDueEmailSentAt: timestamp('balance_due_email_sent_at'),
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
  // Public Touchpix gallery URL for this event. When set, the branded gallery
  // page mirrors the booth clips live from Touchpix instead of Mux uploads.
  touchpixGalleryUrl: text('touchpix_gallery_url'),
  // Per-event clip curation: hidden = never shown publicly (consent/quality),
  // featured = hand-picked to lead the gallery. Keyed by clip video URL.
  clipCuration: jsonb('clip_curation').$type<{ hidden?: string[]; featured?: string[] }>(),
  // Attribution: the booking whose event gallery drove this new booking (a guest
  // at that event booked their own). Set from the ?ref=<galleryToken> link.
  referredByBookingId: text('referred_by_booking_id'),
  notes: text('notes'),
  eventName: text('event_name'),
  // Customer's "describe your vision" free text, passed to the overlay designer
  designNotes: text('design_notes'),
  eventPreferences: jsonb('event_preferences').$type<{
    backgroundColorTheme?: string
    designThemeTags?: string[]
    songPreference?: string
    videoType?: 'video' | 'slomo'
    videoDuration?: number
    slomoBoomerang?: boolean
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('bookings_event_date_idx').on(t.eventDate),
  index('bookings_customer_id_idx').on(t.customerId),
  index('bookings_stripe_pi_idx').on(t.stripePaymentIntentId),
  uniqueIndex('bookings_gallery_token_idx').on(t.galleryToken),
  uniqueIndex('bookings_pay_token_idx').on(t.payToken),
])

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
}, (t) => [
  index('gallery_items_booking_id_idx').on(t.bookingId),
  index('gallery_items_showcase_idx').on(t.isPublicShowcase, t.published),
])

export const availabilityBlocks = pgTable('availability_blocks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  blockedDate: date('blocked_date').notNull(),
  startTime: time('start_time'),
  endTime: time('end_time'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('availability_blocks_date_idx').on(t.blockedDate),
])

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Durable, cross-instance rate-limit buckets. The in-memory limiter is a per-
// instance fast fallback; this table makes a limit hold across every serverless
// instance and cold start, which is what the money/abuse endpoints need.
export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  resetAt: timestamp('reset_at').notNull(),
})

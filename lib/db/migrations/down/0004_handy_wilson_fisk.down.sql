-- Down for 0004_handy_wilson_fisk: drop the request-first columns.
-- NOTE: PostgreSQL cannot drop enum values, so the four added booking_status values
-- ('requested', 'approved', 'declined', 'expired') stay in the type. That part of the
-- down is a documented no-op; the values are harmless once no rows reference them.
ALTER TABLE "bookings" DROP COLUMN "approved_at";
ALTER TABLE "bookings" DROP COLUMN "deposit_expires_at";
ALTER TABLE "bookings" DROP COLUMN "deposit_paid_at";
ALTER TABLE "bookings" DROP COLUMN "auto_pay_opt_in";
ALTER TABLE "bookings" DROP COLUMN "pay_token";
ALTER TABLE "bookings" DROP COLUMN "stripe_deposit_session_id";
ALTER TABLE "bookings" DROP COLUMN "stripe_balance_session_id";
ALTER TABLE "bookings" DROP COLUMN "stripe_balance_payment_intent_id";
ALTER TABLE "bookings" DROP COLUMN "balance_due_email_sent_at";

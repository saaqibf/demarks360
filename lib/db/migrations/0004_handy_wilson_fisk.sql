ALTER TYPE "public"."booking_status" ADD VALUE 'requested';--> statement-breakpoint
ALTER TYPE "public"."booking_status" ADD VALUE 'approved';--> statement-breakpoint
ALTER TYPE "public"."booking_status" ADD VALUE 'declined';--> statement-breakpoint
ALTER TYPE "public"."booking_status" ADD VALUE 'expired';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "deposit_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "deposit_paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "auto_pay_opt_in" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "pay_token" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_deposit_session_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_balance_session_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_balance_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "balance_due_email_sent_at" timestamp;
ALTER TABLE "bookings" ADD COLUMN "event_name" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "event_preferences" jsonb;
-- rollback: ALTER TABLE "bookings" DROP COLUMN "event_name"; ALTER TABLE "bookings" DROP COLUMN "event_preferences";

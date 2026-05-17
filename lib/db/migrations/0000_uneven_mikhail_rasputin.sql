CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TABLE "add_ons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"coming_soon" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"blocked_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"event_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"duration_minutes" integer NOT NULL,
	"add_ons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"event_type" text NOT NULL,
	"location_address" text NOT NULL,
	"location_city" text NOT NULL,
	"travel_surcharge" numeric(10, 2) DEFAULT '0' NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_setup_intent_id" text,
	"stripe_customer_id" text,
	"deposit_amount" numeric(10, 2),
	"balance_amount" numeric(10, 2),
	"balance_charge_date" date,
	"balance_charged_at" timestamp,
	"charge_failed_at" timestamp,
	"charge_retry_at" timestamp,
	"charge_resolved_at" timestamp,
	"card_deleted_at" timestamp,
	"gallery_token" text,
	"gallery_published_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"mux_asset_id" text NOT NULL,
	"mux_playback_id" text NOT NULL,
	"thumbnail_url" text,
	"title" text,
	"published" boolean DEFAULT false NOT NULL,
	"is_public_showcase" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;
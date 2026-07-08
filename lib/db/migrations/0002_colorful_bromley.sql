CREATE INDEX "availability_blocks_date_idx" ON "availability_blocks" USING btree ("blocked_date");--> statement-breakpoint
CREATE INDEX "bookings_event_date_idx" ON "bookings" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "bookings_customer_id_idx" ON "bookings" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "bookings_stripe_pi_idx" ON "bookings" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_gallery_token_idx" ON "bookings" USING btree ("gallery_token");--> statement-breakpoint
CREATE INDEX "gallery_items_booking_id_idx" ON "gallery_items" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "gallery_items_showcase_idx" ON "gallery_items" USING btree ("is_public_showcase","published");
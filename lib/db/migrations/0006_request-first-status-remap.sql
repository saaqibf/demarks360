-- Legacy abandoned PaymentElement checkouts must not resurface as review-queue items
UPDATE bookings SET status = 'expired' WHERE status = 'pending';--> statement-breakpoint
-- Legacy confirmed customers consented to card-on-file auto-charge in the old checkout copy,
-- and their deposit PI was created with setup_future_usage, so enroll them; keep their 30% amounts untouched
UPDATE bookings SET auto_pay_opt_in = true, deposit_paid_at = created_at
  WHERE status = 'confirmed' AND stripe_payment_intent_id IS NOT NULL;--> statement-breakpoint
-- Balance is now due on event day, not event-minus-7
UPDATE bookings SET balance_charge_date = event_date WHERE balance_charged_at IS NULL;--> statement-breakpoint
UPDATE bookings SET pay_token = replace(gen_random_uuid()::text, '-', '') WHERE pay_token IS NULL;

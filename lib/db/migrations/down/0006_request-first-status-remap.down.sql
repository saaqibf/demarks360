-- Down for 0006_request-first-status-remap.
-- Restore abandoned old-flow checkouts: only rows that had a PaymentIntent were ever
-- old-flow 'pending'; new-flow rows expired by the cron have no stripe_payment_intent_id.
UPDATE bookings SET status = 'pending' WHERE status = 'expired' AND stripe_payment_intent_id IS NOT NULL;
-- Reverse the legacy auto-pay enrollment
UPDATE bookings SET auto_pay_opt_in = false, deposit_paid_at = NULL
  WHERE status = 'confirmed' AND stripe_payment_intent_id IS NOT NULL;
-- Restore the event-minus-7 balance charge date for unsettled balances
UPDATE bookings SET balance_charge_date = event_date - INTERVAL '7 days' WHERE balance_charged_at IS NULL;
-- pay_token backfill is left in place: tokens are random and unique, clearing them adds nothing.
-- NOTE: PostgreSQL cannot drop enum values, so no enum reversal exists here either (documented no-op).

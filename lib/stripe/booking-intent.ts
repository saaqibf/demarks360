import { stripe } from './index'

export interface BookingIntentParams {
  customerEmail: string
  customerName: string
  customerPhone: string
  depositCents: number
  eventDate: string
  startTime: string
  endTime: string
}

export interface BookingIntentResult {
  stripeCustomerId: string
  paymentIntentId: string
  clientSecret: string
}

export async function createBookingIntent(params: BookingIntentParams): Promise<BookingIntentResult> {
  const existing = await stripe.customers.list({ email: params.customerEmail, limit: 1 })
  const stripeCustomer = existing.data.length > 0
    ? existing.data[0]
    : await stripe.customers.create({
        name: params.customerName,
        email: params.customerEmail,
        phone: params.customerPhone,
      })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.depositCents,
    currency: 'cad',
    customer: stripeCustomer.id,
    setup_future_usage: 'off_session',
    statement_descriptor_suffix: 'D360',
    metadata: {
      eventDate: params.eventDate,
      startTime: params.startTime,
      endTime: params.endTime,
      customerEmail: params.customerEmail,
    },
  })

  return {
    stripeCustomerId: stripeCustomer.id,
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret!,
  }
}

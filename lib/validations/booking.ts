import { z } from 'zod'
import { SERVICE_CITIES } from './cities'

export const createBookingSchema = z.object({
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  addOnIds: z.array(z.string()),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10).max(20),
  locationAddress: z.string().min(5).max(200),
  locationCity: z.enum([...SERVICE_CITIES] as [string, ...string[]]),
  eventType: z.enum([
    'Birthday Party',
    'Wedding',
    'Graduation',
    'Corporate Event',
    'Engagement Party',
    'Baby Shower & Gender Reveal',
    'Holiday Party',
    'Other',
  ]),
  eventName: z.string().max(100).trim().optional(),
  agreedToTerms: z.literal(true),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

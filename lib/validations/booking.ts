import { z } from 'zod'
import { SERVICE_CITIES } from './cities'

export const createBookingSchema = z.object({
  // Set when checkout re-initializes: the server updates this pending booking instead of inserting a duplicate
  bookingId: z.string().min(1).max(64).optional(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  addOnIds: z.array(z.string()),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10).max(20),
  locationAddress: z.string().min(5).max(200),
  locationCity: z.enum([...SERVICE_CITIES] as [string, ...string[]]),
  // Free text: the UI offers canonical options plus a custom "Other" description.
  // Control characters are stripped before length checks so a junk value cannot sneak through.
  eventType: z.preprocess(
    (v) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim() : v),
    z.string().min(2, 'Event type is required').max(100),
  ),
  eventName: z.string().max(100).trim().optional(),
  eventPreferences: z.object({
    backgroundColorTheme: z.string().max(200).optional(),
    designThemeTags: z.array(z.string().max(100)).optional(),
    songPreference: z.string().max(200).optional(),
    videoType: z.enum(['video', 'slomo']).optional(),
    videoDuration: z.number().int().min(1).max(120).optional(),
    slomoBoomerang: z.boolean().optional(),
  }).optional(),
  agreedToTerms: z.literal(true),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { addOns, settings } from './schema'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seed() {
  await db.insert(addOns).values([
    { name: 'Firecrackers', price: '75.00', active: true, comingSoon: false },
    { name: 'SmileCam', price: '0.00', active: false, comingSoon: true },
  ]).onConflictDoNothing()

  const settingsData: Array<{ key: string; value: string }> = [
    { key: 'hourly_rate', value: '150.00' },
    { key: 'min_duration_minutes', value: '90' },
    { key: 'max_bookings_per_day', value: '2' },
    { key: 'travel_buffer_minutes', value: '90' },
    { key: 'travel_surcharge', value: '50.00' },
    { key: 'gst_enabled', value: 'false' },
    { key: 'gst_rate', value: '0.05' },
    { key: 'gst_number', value: '' },
    { key: 'deposit_percent', value: '0.30' },
    { key: 'balance_charge_days_before', value: '7' },
    { key: 'card_delete_days_after', value: '7' },
    { key: 'earliest_start_time', value: '10:00' },
    { key: 'latest_start_time', value: '23:00' },
  ]

  for (const s of settingsData) {
    await db.insert(settings).values(s).onConflictDoNothing()
  }

  console.log('Seed complete')
  process.exit(0)
}

seed().catch((e) => { console.error(e); process.exit(1) })

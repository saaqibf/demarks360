'use client'
import { useEffect } from 'react'

import { BOOKING_WIZARD_STORAGE_KEY } from '@/components/public/book/wizard-storage'

// The booking is paid: drop the persisted wizard so a return visit to /book
// starts fresh instead of restoring a consumed PaymentIntent.
export function ClearWizardStorage() {
  useEffect(() => {
    try {
      sessionStorage.removeItem(BOOKING_WIZARD_STORAGE_KEY)
    } catch {
      // Storage blocked: nothing to clear
    }
  }, [])
  return null
}

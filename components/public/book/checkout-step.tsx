'use client'
import type { BookingState } from '@/app/(public)/book/page'
interface CheckoutStepProps {
  state: BookingState
  onBack: () => void
}
export function CheckoutStep(_props: CheckoutStepProps) { return null }

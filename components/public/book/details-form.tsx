'use client'
import type { BookingState } from '@/app/(public)/book/page'
interface DetailsFormProps {
  state: BookingState
  onChange: (patch: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
}
export function DetailsForm(_props: DetailsFormProps) { return null }

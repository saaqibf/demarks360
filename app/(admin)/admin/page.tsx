import { redirect } from 'next/navigation'

// /admin has no screen of its own; sign-in returns here, so land on the overview.
export default function AdminIndex() {
  redirect('/admin/dashboard')
}

// The operator email(s) that (1) may sign into /admin and (2) receive booking
// alerts. Set ADMIN_EMAIL in Vercel to a single address, or several separated by
// commas — e.g. "mom@example.com, saaqib@example.com". Comparison is
// case-insensitive and whitespace-tolerant.
const RAW = process.env.ADMIN_EMAIL ?? 'saaqibf.ayodimeji@gmail.com'

export const ADMIN_EMAILS: string[] = RAW.split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}

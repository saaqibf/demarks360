import { CookieConsent } from '@/components/public/cookie-consent'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieConsent />
    </>
  )
}

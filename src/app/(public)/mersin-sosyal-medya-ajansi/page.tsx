import { LocalLanding, localPageMetadata } from "@/components/public/local/local-landing"

export const revalidate = 3600

export const metadata = localPageMetadata("mersin-sosyal-medya-ajansi")

export default function Page() {
  return <LocalLanding slug="mersin-sosyal-medya-ajansi" />
}

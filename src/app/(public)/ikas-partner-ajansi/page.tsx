import { LocalLanding, localPageMetadata } from "@/components/public/local/local-landing"

export const revalidate = 3600
export const metadata = localPageMetadata("ikas-partner-ajansi")

export default function Page() {
  return <LocalLanding slug="ikas-partner-ajansi" />
}

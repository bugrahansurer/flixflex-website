import { LocalLanding, localPageMetadata } from "@/components/public/local/local-landing"

export const revalidate = 3600
export const metadata = localPageMetadata("tarsus-reklam-ajansi")

export default function Page() {
  return <LocalLanding slug="tarsus-reklam-ajansi" />
}

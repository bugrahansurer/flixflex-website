import { LocalLanding, localPageMetadata } from "@/components/public/local/local-landing"

export const revalidate = 3600
export const metadata = localPageMetadata("tarsus-sosyal-medya-yonetimi")

export default function Page() {
  return <LocalLanding slug="tarsus-sosyal-medya-yonetimi" />
}

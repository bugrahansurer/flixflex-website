import { LocalLanding, localPageMetadata } from "@/components/public/local/local-landing"

export const revalidate = 3600

export const metadata = localPageMetadata("adana-web-tasarim")

export default function Page() {
  return <LocalLanding slug="adana-web-tasarim" />
}

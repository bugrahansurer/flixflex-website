import type { Metadata } from "next"

// Dahili tasarım sistemi sayfası: arama sonuçlarında çıkmasın
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

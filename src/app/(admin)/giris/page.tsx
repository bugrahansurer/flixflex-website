import { Suspense } from "react"
import type { Metadata } from "next"
import { LoginCard } from "@/components/admin/auth/login-card"

export const metadata: Metadata = {
  title: "Giriş",
  robots: { index: false, follow: false },
}

// LoginCard reads `?callbackUrl=` and `?error=` via useSearchParams,
// which Next.js 16 requires to be wrapped in <Suspense> to opt into
// dynamic rendering for the affected subtree.
export default function GirisPage() {
  return (
    <Suspense fallback={null}>
      <LoginCard />
    </Suspense>
  )
}

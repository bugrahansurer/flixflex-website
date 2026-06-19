import type { ReactNode } from "react"

export default function GirisLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "var(--background-alt)" }}
    >
      {children}
    </div>
  )
}

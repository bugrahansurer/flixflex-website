"use client"

// ═══════════════════════════════════════════════════════════
// IntentLink — niyet anında önceden indiren next/link
// Varsayılan next/link, ekranda görünen her linkin sayfasını hemen
// arka planda indirir (prefetch). Menü / footer gibi her sayfada duran
// linklerde bu, ziyaretçinin gitmeyeceği sayfaların da yüklenmesi demek.
// IntentLink görünümde ve davranışta normal Link ile aynıdır; tek fark
// sayfayı yalnızca kullanıcı niyet gösterince (fareyle üzerine gelme,
// dokunma, klavye odağı) önceden indirmesidir — tıklama yine hızlıdır.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type IntentLinkProps = React.ComponentProps<typeof Link>

export function IntentLink({ href, prefetch, onMouseEnter, onTouchStart, onFocus, ...rest }: IntentLinkProps) {
  const router = useRouter()
  const warmed = React.useRef(false)

  const warm = () => {
    if (warmed.current || typeof href !== "string" || !href.startsWith("/")) return
    warmed.current = true
    router.prefetch(href)
  }

  return (
    <Link
      href={href}
      prefetch={prefetch ?? false}
      onMouseEnter={(e) => {
        onMouseEnter?.(e)
        warm()
      }}
      onTouchStart={(e) => {
        onTouchStart?.(e)
        warm()
      }}
      onFocus={(e) => {
        onFocus?.(e)
        warm()
      }}
      {...rest}
    />
  )
}

"use client"

// ═══════════════════════════════════════════════════════════
// CtaLink — form CTA'ları için akıllı link
// Hedef iletişim formuysa (/iletisim, /iletisim?..., #randevu) sayfaya
// gitmek yerine aşamalı, tarih seçimli randevu formunu (AppointmentModal)
// açar; diğer hedeflerde normal next/link gibi davranır. Admin'den
// girilen buton linkleri de (ctaHref vb.) bu sayede otomatik yönlenir.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import Link from "next/link"
import { useUIStore } from "@/lib/ui-store"

/** Bu href randevu formunu mu hedefliyor? */
export function isAppointmentHref(href?: string | null): boolean {
  if (!href) return false
  const h = href.trim()
  return h === "#randevu" || /^\/iletisim\/?(?:[?#].*)?$/.test(h)
}

type CtaLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string }

export function CtaLink({ href, onClick, children, ...rest }: CtaLinkProps) {
  const setAppointmentModalOpen = useUIStore((s) => s.setAppointmentModalOpen)

  if (!isAppointmentHref(href)) {
    return (
      <Link href={href} onClick={onClick} {...rest}>
        {children}
      </Link>
    )
  }

  // Modal açılamazsa (JS yok / modal'ın olmadığı bir layout) href yine /iletisim'e gider.
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        setAppointmentModalOpen(true)
      }}
    >
      {children}
    </Link>
  )
}

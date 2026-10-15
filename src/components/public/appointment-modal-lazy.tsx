"use client"

// ═══════════════════════════════════════════════════════════
// AppointmentModalLazy — randevu formunu ihtiyaç anında yükler
// Modal (form doğrulama: zod + react-hook-form, takvim) her sayfanın ilk
// yükünde gerekmez. Bu sarmalayıcı modal kodunu yalnızca ilk açılışta
// render eder; kullanıcı sayfayla etkileşime geçtiği an (dokunma, tuş,
// fare) chunk'ı önceden indirir, böylece ilk açılış gecikmez.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import dynamic from "next/dynamic"
import { useUIStore } from "@/lib/ui-store"

const loadModal = () => import("./appointment-modal")

const AppointmentModal = dynamic(() => loadModal().then((m) => m.AppointmentModal), {
  ssr: false,
})

const PRELOAD_EVENTS = ["pointerdown", "pointerover", "keydown", "touchstart"] as const

export function AppointmentModalLazy() {
  const isOpen = useUIStore((s) => s.isAppointmentModalOpen)
  const setIsOpen = useUIStore((s) => s.setAppointmentModalOpen)
  const [hasOpened, setHasOpened] = React.useState(false)

  // İlk açılışta modal'ı kalıcı olarak mount et (kapanış animasyonu korunur)
  if (isOpen && !hasOpened) setHasOpened(true)

  // ?randevu=1 ile gelinirse formu aç (404 sayfası, paylaşılan linkler) ve parametreyi temizle
  React.useEffect(() => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has("randevu")) return
    setIsOpen(true)
    url.searchParams.delete("randevu")
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash)
  }, [setIsOpen])

  // İlk etkileşimde modal kodunu önceden indir
  React.useEffect(() => {
    if (hasOpened) return
    const preload = () => {
      PRELOAD_EVENTS.forEach((e) => window.removeEventListener(e, preload))
      void loadModal()
    }
    PRELOAD_EVENTS.forEach((e) => window.addEventListener(e, preload, { passive: true, once: true }))
    return () => PRELOAD_EVENTS.forEach((e) => window.removeEventListener(e, preload))
  }, [hasOpened])

  return hasOpened ? <AppointmentModal /> : null
}

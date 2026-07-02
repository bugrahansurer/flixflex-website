"use client"

// Efektler dış kaynakla senkron (localStorage + poll ile aktivite çekme);
// setState çağrıları bilinçli — kural bu dosyada devre dışı.
/* eslint-disable react-hooks/set-state-in-effect */

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bell, Briefcase, Layers, FileText, Newspaper, Users, Shield,
  Settings, Image, Calendar, Mail, Sparkles, BarChart3, Palette,
  type LucideIcon,
} from "@/lib/icons"
import { cn, formatRelativeTime } from "@/lib/utils"

interface ActivityItem {
  id: string
  action: string
  resource: string
  text: string
  userName: string
  initials: string
  href: string | null
  createdAt: string
}

const RESOURCE_ICON: Record<string, LucideIcon> = {
  portfolio: Briefcase,
  services: Layers,
  pages: FileText,
  blog: Newspaper,
  users: Users,
  roles: Shield,
  settings: Settings,
  media: Image,
  appointments: Calendar,
  messages: Mail,
  ai: Sparkles,
  analytics: BarChart3,
  colors: Palette,
}

const SEEN_KEY = "ff_admin_notif_seen"
const POLL_MS = 20000

export function AdminNotifications() {
  const [items, setItems] = React.useState<ActivityItem[]>([])
  const [open, setOpen] = React.useState(false)
  const [seenAt, setSeenAt] = React.useState<number | null>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  // İlk montajda "görüldü" zamanını yükle; hiç yoksa şimdi olarak işaretle
  // (ilk açılışta devasa rozet çıkmasın — yalnızca bundan sonraki işlemler sayılır).
  React.useEffect(() => {
    const stored = window.localStorage.getItem(SEEN_KEY)
    if (stored) {
      setSeenAt(Number(stored))
    } else {
      const now = Date.now()
      window.localStorage.setItem(SEEN_KEY, String(now))
      setSeenAt(now)
    }
  }, [])

  // Aktiviteleri çek — poll + sekmeye dönünce yenile
  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/activity?limit=20", { cache: "no-store" })
      const json = await res.json()
      if (json.ok) setItems(json.items as ActivityItem[])
    } catch {
      /* sessizce yut — bir sonraki poll tekrar dener */
    }
  }, [])

  React.useEffect(() => {
    load()
    const id = setInterval(load, POLL_MS)
    const onVisible = () => { if (document.visibilityState === "visible") load() }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", load)
    return () => {
      clearInterval(id)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", load)
    }
  }, [load])

  // Dışarı tıklama ile kapat
  React.useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  const markSeen = React.useCallback(() => {
    const now = Date.now()
    window.localStorage.setItem(SEEN_KEY, String(now))
    setSeenAt(now)
  }, [])

  const unread = React.useMemo(() => {
    if (seenAt == null) return 0
    return items.filter((i) => new Date(i.createdAt).getTime() > seenAt).length
  }, [items, seenAt])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) markSeen() // panel açılınca okundu say
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label="Bildirimler"
        onClick={toggle}
        className={cn(
          "ff-shape-button w-9 h-9 flex items-center justify-center",
          "border border-[#E0E0E0] text-[#666666]",
          "hover:border-[#ff4fd8] hover:text-[#ff4fd8]",
          "transition-colors duration-150",
          open && "border-[#ff4fd8] text-[#ff4fd8]"
        )}
      >
        <Bell size={15} />
      </button>

      {unread > 0 && (
        <span
          aria-label={`${unread} yeni bildirim`}
          className={cn(
            "absolute -top-1 -right-1 z-10 min-w-4 h-4 px-1 flex items-center justify-center rounded-full",
            "bg-[#ff4fd8] text-white text-[9px] font-bold shadow-[0_0_10px_rgba(255,79,216,0.4)]"
          )}
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "ff-shape-container absolute right-0 mt-2 w-[340px] max-w-[86vw] z-50",
              "bg-[#F7F7F5] border border-[#E0E0E0] shadow-2xl overflow-hidden"
            )}
          >
            <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#0D0D0D]">Bildirimler</h3>
              <button
                type="button"
                onClick={markSeen}
                className="text-[10px] text-[#ff4fd8] font-medium hover:underline"
              >
                Tümünü okundu işaretle
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-10 text-center text-[12px] text-[#888888]">
                  Henüz bir aktivite yok.
                </div>
              ) : (
                items.map((item) => {
                  const Icon = RESOURCE_ICON[item.resource] ?? Bell
                  const isNew = seenAt != null && new Date(item.createdAt).getTime() > seenAt
                  const body = (
                    <div className={cn(
                      "px-4 py-3 border-b border-[#E0E0E0] last:border-0 transition-colors flex gap-3",
                      isNew ? "bg-[#ff4fd8]/[0.04]" : "hover:bg-[#F0F0F0]"
                    )}>
                      <div className="w-8 h-8 rounded-full bg-[#ff4fd8]/10 border border-[#ff4fd8]/20 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-[#ff4fd8]" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-[12px] text-[#0D0D0D] leading-tight">
                          <span className="font-bold">{item.userName}</span>{" "}
                          <span className="text-[#555555]">{item.text}</span>
                        </p>
                        <p className="text-[10px] text-[#888888]">{formatRelativeTime(item.createdAt)}</p>
                      </div>
                      {isNew && <span className="ml-auto mt-1 w-1.5 h-1.5 rounded-full bg-[#ff4fd8] shrink-0" aria-hidden />}
                    </div>
                  )
                  return item.href ? (
                    <Link key={item.id} href={item.href} onClick={() => setOpen(false)} className="block">
                      {body}
                    </Link>
                  ) : (
                    <div key={item.id}>{body}</div>
                  )
                })
              )}
            </div>

            <div className="px-4 py-2 bg-[#F7F7F5] border-t border-[#E0E0E0] text-center">
              <Link
                href="/admin/bildirimler"
                onClick={() => setOpen(false)}
                className="text-[11px] font-bold text-[#666666] hover:text-[#FF4FD8] transition-colors"
              >
                Tüm Bildirimleri Gör
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

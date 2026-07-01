"use client"

import * as React from "react"
import { toast } from "sonner"
import { Mail, Trash2, Check, EyeOff, ChevronDown, Loader2 } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/utils"

export interface ContactMessage {
  id: string
  name: string
  email: string
  company: string | null
  service: string | null
  message: string
  isRead: boolean
  createdAt: string
}

type Filter = "all" | "unread"

export function MessagesClient({ initial }: { initial: ContactMessage[] }) {
  const [messages, setMessages] = React.useState<ContactMessage[]>(initial)
  const [filter, setFilter] = React.useState<Filter>("all")
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const unreadCount = messages.filter((m) => !m.isRead).length
  const shown = filter === "unread" ? messages.filter((m) => !m.isRead) : messages

  const setRead = React.useCallback(async (id: string, isRead: boolean) => {
    // optimistic
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead } : m)))
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: !isRead } : m)))
      toast.error("İşlem başarısız")
    }
  }, [])

  const toggleExpand = (m: ContactMessage) => {
    const next = expandedId === m.id ? null : m.id
    setExpandedId(next)
    if (next && !m.isRead) setRead(m.id, true)
  }

  const remove = async (id: string) => {
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return
    setBusyId(id)
    const prev = messages
    setMessages((p) => p.filter((m) => m.id !== id))
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Mesaj silindi")
    } catch {
      setMessages(prev)
      toast.error("Silinemedi")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 bg-[#f0f0ee] p-1 ff-shape-button w-fit">
        {([["all", "Tümü", messages.length], ["unread", "Okunmamış", unreadCount]] as const).map(
          ([key, label, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "px-3 py-1.5 text-[12px] font-semibold rounded-[6px] transition-colors inline-flex items-center gap-1.5",
                filter === key ? "bg-white text-[var(--ff-purple)] shadow-sm" : "text-[#666666] hover:text-[#333333]",
              )}
            >
              {label}
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums",
                key === "unread" && count > 0 ? "bg-[var(--ff-purple)] text-white" : "bg-[#dddddd] text-[#666666]",
              )}>
                {count}
              </span>
            </button>
          ),
        )}
      </div>

      {/* List */}
      {shown.length === 0 ? (
        <div className="ff-shape-container ff-card p-12 text-center">
          <Mail size={28} className="mx-auto text-[#cccccc] mb-3" />
          <p className="text-[13px] text-[#888888]">
            {filter === "unread" ? "Okunmamış mesaj yok." : "Henüz mesaj yok."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {shown.map((m) => {
            const expanded = expandedId === m.id
            return (
              <li
                key={m.id}
                className={cn(
                  "ff-shape-container ff-card p-0 overflow-hidden transition-colors",
                  !m.isRead && "border-l-2 border-l-[var(--ff-purple)]",
                )}
              >
                {/* Row header */}
                <button
                  onClick={() => toggleExpand(m)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f7f7f5] transition-colors"
                >
                  {/* unread dot */}
                  <span className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    m.isRead ? "bg-transparent" : "bg-[var(--ff-purple)]",
                  )} />
                  {/* avatar */}
                  <span className="ff-shape-button w-8 h-8 shrink-0 flex items-center justify-center bg-[var(--ff-purple)]/10 text-[var(--ff-purple)] text-[11px] font-bold">
                    {m.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  {/* name + preview */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[13px] truncate", m.isRead ? "font-medium text-[#555555]" : "font-bold text-[#111111]")}>
                        {m.name}
                      </span>
                      {m.service && (
                        <span className="hidden sm:inline shrink-0 px-1.5 py-0.5 rounded bg-[#f0f0ee] text-[9.5px] font-semibold uppercase tracking-wide text-[#888888]">
                          {m.service}
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-[#999999] truncate">{m.email}</p>
                  </div>
                  {/* time + chevron */}
                  <span className="text-[10.5px] text-[#aaaaaa] tabular-nums shrink-0 hidden sm:block">
                    {formatRelativeTime(m.createdAt)}
                  </span>
                  <ChevronDown size={15} className={cn("text-[#bbbbbb] shrink-0 transition-transform", expanded && "rotate-180")} />
                </button>

                {/* Expanded body */}
                {expanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#eeeeee]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-[12px]">
                      <div>
                        <p className="text-[10px] text-[#999999] uppercase tracking-wide font-semibold">E-posta</p>
                        <a href={`mailto:${m.email}`} className="text-[#333333] hover:text-[var(--ff-purple)] break-all">{m.email}</a>
                      </div>
                      {m.company && (
                        <div>
                          <p className="text-[10px] text-[#999999] uppercase tracking-wide font-semibold">Şirket</p>
                          <p className="text-[#333333]">{m.company}</p>
                        </div>
                      )}
                      {m.service && (
                        <div>
                          <p className="text-[10px] text-[#999999] uppercase tracking-wide font-semibold">Hizmet</p>
                          <p className="text-[#333333]">{m.service}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-[#999999] uppercase tracking-wide font-semibold">Tarih</p>
                        <p className="text-[#333333]">{new Date(m.createdAt).toLocaleString("tr-TR")}</p>
                      </div>
                    </div>

                    <div className="bg-[#f7f7f5] ff-shape-container p-3.5 mb-3">
                      <p className="text-[13px] text-[#333333] whitespace-pre-line leading-relaxed">{m.message}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent("FlixFlex — Mesajınıza yanıt")}`}
                        className="ff-shape-button bg-[var(--ff-purple)] text-white px-3 py-1.5 text-[12px] font-semibold inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                      >
                        <Mail size={13} /> Yanıtla
                      </a>
                      <button
                        onClick={() => setRead(m.id, !m.isRead)}
                        className="ff-shape-button bg-[#f0f0ee] text-[#555555] px-3 py-1.5 text-[12px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#e6e6e4] transition-colors"
                      >
                        {m.isRead ? <><EyeOff size={13} /> Okunmadı işaretle</> : <><Check size={13} /> Okundu işaretle</>}
                      </button>
                      <button
                        onClick={() => remove(m.id)}
                        disabled={busyId === m.id}
                        className="ff-shape-button bg-red-50 text-red-500 px-3 py-1.5 text-[12px] font-semibold inline-flex items-center gap-1.5 hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto"
                      >
                        {busyId === m.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Sil
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

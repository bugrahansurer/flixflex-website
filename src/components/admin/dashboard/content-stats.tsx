import Link from "next/link"
import {
  FileText, LayoutGrid, BriefcaseBusiness, Wrench, CalendarDays, Mail, Users,
} from "@/lib/icons"

export interface ContentCounts {
  posts: number
  pages: number
  portfolio: number
  services: number
  appointments: number
  messages: number
  users: number
}

const ITEMS = [
  { key: "posts", label: "Yayında Yazı", icon: FileText, href: "/admin/blog" },
  { key: "pages", label: "Yayında Sayfa", icon: LayoutGrid, href: "/admin/sayfalar" },
  { key: "portfolio", label: "Portfolyo", icon: BriefcaseBusiness, href: "/admin/portfolyo" },
  { key: "services", label: "Hizmet", icon: Wrench, href: "/admin/hizmetler" },
  { key: "appointments", label: "Randevu", icon: CalendarDays, href: "/admin/randevular" },
  { key: "messages", label: "Mesaj", icon: Mail, href: "/admin/mesajlar" },
  { key: "users", label: "Kullanıcı", icon: Users, href: "/admin/kullanicilar" },
] as const

export function ContentStats({ counts }: { counts: ContentCounts }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2.5">
      {ITEMS.map((it) => {
        const Icon = it.icon
        const value = counts[it.key as keyof ContentCounts]
        return (
          <Link
            key={it.key}
            href={it.href}
            className="group ff-shape-container ff-card p-3 flex items-center gap-2.5 transition-colors duration-200 hover:border-[var(--ff-purple)]/40"
          >
            <div className="ff-shape-button w-8 h-8 shrink-0 flex items-center justify-center bg-[#f0f0ee] group-hover:bg-[var(--ff-purple)]/10 transition-colors">
              <Icon size={15} className="text-[#666666] group-hover:text-[var(--ff-purple)] transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-bold text-[#0d0d0d] leading-none tabular-nums">
                {value.toLocaleString("tr-TR")}
              </p>
              <p className="text-[10px] text-[#888888] truncate mt-0.5">{it.label}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

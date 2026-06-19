"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Search, Bell, ChevronRight, User, Settings, LogOut } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { SessionUser } from "@/lib/auth/types"

// ── Breadcrumb helper ─────────────────────────────
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Yönetim Paneli",
  blog: "Blog & İçerik",
  sayfalar: "Sayfalar",
  ai: "AI Asistan",
  theme: "Tema Ayarları",
  roller: "Roller & Yetkiler",
  kullanicilar: "Kullanıcılar",
  ayarlar: "Ayarlar",
  profil: "Profil",
  yeni: "Yeni",
  hizmetler: "Hizmetler",
  portfolyo: "Portfolyo",
  edit: "Düzenle",
}

function formatLabel(seg: string): string {
  if (SEGMENT_LABELS[seg]) return SEGMENT_LABELS[seg]
  return seg
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function useBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return segments.map((seg, i) => ({
    label: formatLabel(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }))
}

// ── Props ─────────────────────────────────────────
interface AdminTopbarProps {
  user: SessionUser
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  const breadcrumbs = useBreadcrumbs()

  return (
    <header
      className={cn(
        "sticky top-0 z-30",
        "flex items-center justify-between gap-4",
        "h-[calc(8vh)] px-4 md:px-6",
        "bg-[#FfFfFf]/80 backdrop-blur-sm border-b border-[#E0E0E0]",
      )}
    >
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 overflow-x-auto whitespace-nowrap py-1">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && (
              <ChevronRight
                size={11}
                className="text-[#999999] shrink-0 mx-0.5"
                aria-hidden="true"
              />
            )}
            {crumb.isLast ? (
              <span className="px-2.5 py-1 border border-[#ff4fd8] bg-[#ff4fd8]/10 text-[#ff4fd8] text-[11px] font-bold ff-shape-button inline-flex items-center justify-center select-none">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="px-2.5 py-1 border border-[#E0E0E0] bg-[#f7f7f5]/60 hover:bg-[#ff4fd8]/5 hover:border-[#ff4fd8]/30 hover:text-[#ff4fd8] text-[#666666] text-[11px] font-bold transition-all duration-150 ff-shape-button inline-flex items-center justify-center cursor-pointer"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Search */}
        <button
          type="button"
          aria-label="Ara"
          className={cn(
            "ff-shape-button w-9 h-9 flex items-center justify-center",
            "border border-[#E0E0E0] text-[#666666]",
            "hover:border-[#ff4fd8] hover:text-[#ff4fd8]",
            "transition-colors duration-150"
          )}
        >
          <Search size={15} />
        </button>

        {/* Notification bell */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <div className="relative cursor-pointer group">
              <button
                type="button"
                aria-label="Bildirimler"
                className={cn(
                  "ff-shape-button w-9 h-9 flex items-center justify-center",
                  "border border-[#E0E0E0] text-[#666666]",
                  "hover:border-[#ff4fd8] hover:text-[#ff4fd8]",
                  "transition-colors duration-150"
                )}
              >
                <Bell size={15} />
              </button>
              {/* Badge — outside the clipped button */}
              <span
                aria-label="3 bildirim"
                className={cn(
                  "absolute -top-1 -right-1 z-10",
                  "w-4 h-4 flex items-center justify-center rounded-full",
                  "bg-[#ff4fd8] text-white text-[9px] font-bold",
                  "shadow-[0_0_10px_#ff4fd8]/40",
                )}
              >
                3
              </span>
            </div>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className={cn(
                "ff-shape-container z-50 min-w-[320px] max-w-[380px]",
                "bg-[#F7F7F5] border border-[#E0E0E0]",
                "shadow-2xl animate-ff-fadeIn overflow-hidden"
              )}
            >
              <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#0D0D0D]">Bildirimler</h3>
                <span className="text-[10px] text-[#ff4fd8] font-medium cursor-pointer hover:underline">
                  Tümünü okundu işaretle
                </span>
              </div>

              <div className="max-h-[350px] overflow-y-auto">
                {/* AI Assistant Suggestion */}
                <div className="p-4 border-b border-[#E0E0E0] hover:bg-[#F7F7F5] transition-colors cursor-pointer group">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(255, 79, 216,0.1)] flex items-center justify-center shrink-0 border border-[rgba(255, 79, 216,0.2)]">
                      <Search size={14} className="text-[#ff4fd8]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[12px] text-[#0D0D0D] leading-tight">
                        <span className="font-bold">AI Asistan:</span> Yeni bir blog konusu önerisi var: &quot;2024 Tasarım Trendleri&quot;
                      </p>
                      <p className="text-[10px] text-[#666666]">2 dakika önce</p>
                    </div>
                  </div>
                </div>

                {/* System Update */}
                <div className="p-4 border-b border-[#E0E0E0] hover:bg-[#F7F7F5] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <Settings size={14} className="text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[12px] text-[#0D0D0D] leading-tight">
                        <span className="font-bold">Sistem:</span> Yedekleme başarıyla tamamlandı.
                      </p>
                      <p className="text-[10px] text-[#666666]">1 saat önce</p>
                    </div>
                  </div>
                </div>

                {/* New User */}
                <div className="p-4 hover:bg-[#F7F7F5] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
                      <User size={14} className="text-green-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[12px] text-[#0D0D0D] leading-tight">
                        <span className="font-bold">Kullanıcı:</span> Yeni bir ekip üyesi kaydoldu: Selin Yılmaz
                      </p>
                      <p className="text-[10px] text-[#666666]">5 saat önce</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 bg-[#F7F7F5] border-t border-[#E0E0E0] text-center">
                <Link href="/admin/bildirimler" className="text-[11px] font-bold text-[#666666] hover:text-[#FF4FD8] transition-colors">
                  Tüm Bildirimleri Gör
                </Link>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* User menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label="Kullanıcı menüsü"
              className={cn(
                "ff-shape-button flex items-center justify-start min-w-20 w-fit gap-1 h-9 px-1",
                "border border-[#E0E0E0] text-[#666666]",
                "hover:border-[#FF4FD8] hover:text-[#FF4FD8]",
                "transition-colors duration-150"
              )}
            >
              <span
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full shrink-0",
                  "bg-[#FF4FD8] text-white text-[9px] font-bold font-display"
                )}
              >
                {user.initials}
              </span>
              <span className="hidden md:block text-[12px] font-medium text-[#666666] truncate w-fit max-w-[200px]">
                {user.name}
              </span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className={cn(
                "ff-shape-container z-50 min-w-[200px]",
                "bg-[#F7F7F5] border border-[#E0E0E0]",
                "py-1 shadow-xl",
                "animate-ff-fadeIn"
              )}
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <p className="text-[13px] font-semibold text-[#666666] truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-[#666666] truncate mt-0.5">
                  {user.email}
                </p>
                <span className="ff-shape-button inline-block mt-1.5 text-[9px] font-semibold px-2 py-0.5 bg-[#ff4fd8]/12 text-[#ff4fd8] border border-[#ff4fd8]/25">
                  {user.role}
                </span>
              </div>

              <DropdownMenu.Item asChild>
                <Link
                  href="/admin/profil"
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5",
                    "text-[13px] text-[#666666]",
                    "hover:bg-[#F7F7F5] hover:text-[#FF4FD8]",
                    "outline-none cursor-pointer transition-colors duration-100"
                  )}
                >
                  <User size={14} />
                  Profil
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item asChild>
                <Link
                  href="/admin/ayarlar"
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5",
                    "text-[13px] text-[#666666]",
                    "hover:bg-[#F7F7F5] hover:text-[#FF4FD8]",
                    "outline-none cursor-pointer transition-colors duration-100"
                  )}
                >
                  <Settings size={14} />
                  Ayarlar
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-[#E0E0E0] my-1" />

              <DropdownMenu.Item asChild>
                <button
                  type="button"
                  onClick={() => {
                    // NextAuth client-side sign-out: clears the
                    // session cookie and redirects to /giris.
                    void signOut({ callbackUrl: "/giris" })
                  }}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-4 py-2.5",
                    "text-[13px] text-red-400",
                    "hover:bg-red-500/10 hover:text-red-400",
                    "outline-none cursor-pointer transition-colors duration-100"
                  )}
                >
                  <LogOut size={14} />
                  Çıkış Yap
                </button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}

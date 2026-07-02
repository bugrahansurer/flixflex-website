"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { ChevronRight, User, Settings, LogOut, Menu } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { SessionUser } from "@/lib/auth/types"
import { AdminSearch } from "./admin-search"
import { AdminNotifications } from "./admin-notifications"

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
  /** Opens the mobile navigation drawer (only shown below `lg`). */
  onMenuClick?: () => void
}

export function AdminTopbar({ user, onMenuClick }: AdminTopbarProps) {
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
      {/* Left group: mobile menu trigger + breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger — opens the drawer on mobile only */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Menüyü aç"
          className={cn(
            "ff-shape-button lg:hidden shrink-0 w-9 h-9 flex items-center justify-center",
            "border border-[#E0E0E0] text-[#666666]",
            "hover:border-[#ff4fd8] hover:text-[#ff4fd8]",
            "transition-colors duration-150"
          )}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 overflow-x-auto whitespace-nowrap py-1">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              {i > 0 && (
                <ChevronRight
                  size={11}
                  className="hidden sm:block text-[#999999] shrink-0 mx-0.5"
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
                  className="px-2.5 py-1 border border-[#E0E0E0] bg-[#f7f7f5]/60 hover:bg-[#ff4fd8]/5 hover:border-[#ff4fd8]/30 hover:text-[#ff4fd8] text-[#666666] text-[11px] font-bold transition-all duration-150 ff-shape-button hidden sm:inline-flex items-center justify-center cursor-pointer"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Global admin search — animasyonlu genişleyen arama */}
        <AdminSearch />

        {/* Gerçek-zamanlı aktivite bildirimleri */}
        <AdminNotifications />

        {/* User menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label="Kullanıcı menüsü"
              className={cn(
                "ff-shape-button flex items-center justify-start md:min-w-20 w-fit gap-1 h-9 px-0 md:px-1",
                "border border-[#E0E0E0] text-[#666666]",
                "hover:border-[#FF4FD8] hover:text-[#FF4FD8]",
                "transition-colors duration-150"
              )}
            >
              <span
                className={cn(
                  "ff-shape-button w-9 h-9 md:w-6 md:h-6 flex items-center justify-center shrink-0",
                  "bg-[#FF4FD8]/10 border border-[#FF4FD8]/10 text-[#FF4FD8] text-[10px] font-bold font-display"
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

"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import * as Tooltip from "@radix-ui/react-tooltip"
import {
  LayoutDashboard,
  BriefcaseBusiness,
  SquarePen,
  Sparkles,
  Palette,
  ShieldCheck,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  CalendarDays,
  IconPhotoVideo,
  BarChart3,
} from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { SessionUser } from "@/lib/auth/types"
import { hasPermission } from "@/lib/rbac/permissions"
import { RESOURCES } from "@/lib/rbac/resources"
import { IconDeviceLaptop, IconServerSpark } from "@tabler/icons-react"

// ── Nav items ─────────────────────────────────────
// `resource` gates visibility — an item only shows if the user has
// READ permission on it. Items without a resource are always shown.
const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true, resource: undefined },
  { label: "Raporlar", href: "/admin/raporlar", icon: BarChart3, exact: false, resource: RESOURCES.ANALYTICS },
  { label: "Randevular", href: "/admin/randevular", icon: CalendarDays, exact: false, resource: RESOURCES.APPOINTMENTS },
  { label: "Sayfalar", href: "/admin/sayfalar", icon: IconDeviceLaptop, exact: false, resource: RESOURCES.PAGES },
  { label: "Portfolyo", href: "/admin/portfolyo", icon: BriefcaseBusiness, exact: false, resource: RESOURCES.PORTFOLIO },
  { label: "Hizmetler", href: "/admin/hizmetler", icon: IconServerSpark, exact: false, resource: RESOURCES.SERVICES },
  { label: "Blog & İçerik", href: "/admin/blog", icon: SquarePen, exact: false, resource: RESOURCES.BLOG },
  { label: "Dosyalar", href: "/admin/medya", icon: IconPhotoVideo, exact: false, resource: RESOURCES.MEDIA },
  { label: "AI Asistan", href: "/admin/ai", icon: Sparkles, exact: false, resource: RESOURCES.AI },
  { label: "Tema Ayarları", href: "/admin/theme", icon: Palette, exact: false, resource: RESOURCES.COLORS },
  { label: "Roller & Yetkiler", href: "/admin/roller", icon: ShieldCheck, exact: false, resource: RESOURCES.ROLES },
  { label: "Kullanıcılar", href: "/admin/kullanicilar", icon: Users, exact: false, resource: RESOURCES.USERS },
  { label: "Ayarlar", href: "/admin/ayarlar", icon: Settings, exact: false, resource: RESOURCES.SETTINGS },
] as const

type NavItem = (typeof NAV_ITEMS)[number]

interface AdminSidebarProps {
  user: SessionUser
  siteLogo?: string
  logoHeight?: number
  /** Whether the mobile overlay drawer is open (ignored on desktop). */
  mobileOpen?: boolean
  /** Called when the mobile drawer should close (backdrop tap / nav click). */
  onMobileClose?: () => void
}

export function AdminSidebar({
  user,
  siteLogo,
  logoHeight,
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isHovered, setIsHovered] = React.useState(false)

  // Super Admin sees everything; others only items they can READ.
  const isSuper = user.role === "Super Admin"
  const navItems = React.useMemo(
    () =>
      NAV_ITEMS.filter(
        (it) => !it.resource || isSuper || hasPermission(user.permissions ?? [], it.resource, "read")
      ),
    [user.permissions, isSuper]
  )

  // Desktop sidebar expands on hover.
  const collapsed = !isHovered

  // Lock body scroll while the mobile drawer is open.
  React.useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  function isActive(item: NavItem): boolean {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  // ── Shared inner content ──────────────────────────
  // Rendered both inside the desktop hover-sidebar (`expanded` follows hover)
  // and inside the mobile drawer (`expanded` always true). `onNavigate` lets
  // the mobile drawer close itself after a navigation.
  // NOTE: called as a plain function (not <renderBody/>) so the subtree is
  // inlined and reconciled normally — rendering it as a nested component would
  // remount everything on every hover toggle.
  const renderBody = (expanded: boolean, onNavigate?: () => void) => {
    const isCollapsed = !expanded
    return (
      <>
        {/* Logo Section */}
        <div
          className={cn(
            "flex items-center border-b border-[var(--ff-purple)]/10",
            "h-[8vh] min-h-14 px-6 shrink-0",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                {siteLogo ? (
                  <Image
                    src={siteLogo}
                    alt="Logo"
                    width={160}
                    height={logoHeight || 24}
                    unoptimized
                    className="w-auto object-contain"
                    style={{ height: logoHeight || 24 }}
                  />
                ) : (
                  <span className="font-display font-extrabold text-lg tracking-tight text-white whitespace-nowrap">
                    Flix<span className="text-[var(--ff-purple)]">Flex</span>
                  </span>
                )}
              </motion.div>
            )}
            {isCollapsed && siteLogo && (
              <motion.img
                src={siteLogo}
                alt="Logo"
                className="w-6 h-6 object-contain"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const active = isActive(item)
              const Icon = item.icon

              const linkContent = (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  target={"external" in item && item.external ? "_blank" : undefined}
                  className={cn(
                    "group flex items-center justify-start gap-3 w-full",
                    "h-10 pl-3.5 rounded-md",
                    "text-[13px] font-medium",
                    "transition-all duration-150 relative",
                    "border-l-2",
                    active
                      ? "border-l-[var(--ff-purple)] bg-[var(--ff-purple)]/10 text-[var(--ff-purple)]"
                      : "border-l-transparent text-white hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon
                    size={17}
                    className={cn(
                      "shrink-0 transition-colors duration-150",
                      active ? "text-[var(--ff-purple)]" : "text-white group-hover:text-[var(--foreground)]"
                    )}
                  />
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )

              if (isCollapsed) {
                return (
                  <li key={item.href}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>{linkContent}</Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="right"
                          sideOffset={8}
                          className={cn(
                            "z-50 px-3 py-1.5",
                            "bg-[#222222] border border-[var(--border)]",
                            "text-[12px] font-medium text-white",
                            "shadow-xl",
                            "animate-ff-fadeIn"
                          )}
                        >
                          {item.label}
                          <Tooltip.Arrow className="fill-[#222222]" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </li>
                )
              }

              return <li key={item.href}>{linkContent}</li>
            })}
          </ul>
        </div>

        {/* View Site Action */}
        <div className="px-2 py-3 border-t border-[#2A2A2A] shrink-0">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Link
                href="/"
                target="_blank"
                onClick={onNavigate}
                className={cn(
                  "flex items-center justify-center gap-3 w-full",
                  "h-10 px-2.5",
                  "bg-[var(--ff-purple)]/10 text-[var(--ff-purple)] hover:bg-[var(--ff-purple)] hover:text-white",
                  "transition-all duration-200 group overflow-hidden"
                )}
              >
                <ExternalLink
                  size={16}
                  className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      key="view-site-label"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.18 }}
                      className="text-[13px] font-medium whitespace-nowrap"
                    >
                      Siteyi Gör
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </Tooltip.Trigger>
            {isCollapsed && (
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={8}
                  className="z-50 px-3 py-1.5 bg-[var(--ff-purple)] text-white text-[11px] font-bold shadow-xl animate-ff-fadeIn"
                >
                  Siteyi Git
                  <Tooltip.Arrow className="fill-[var(--ff-purple)]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            )}
          </Tooltip.Root>
        </div>

        {/* User profile mini-card */}
        <div className="border-t border-[#2A2A2A] p-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onNavigate?.()
              router.push("/admin/profil")
            }}
            className={cn(
              "w-full flex items-center gap-3",
              "px-2.5 h-12",
              "hover:bg-ff-purple/10",
              "transition-colors duration-150 group"
            )}
            aria-label="Profil sayfasına git"
          >
            {/* Avatar */}
            <div
              className={cn(
                "ff-shape-button shrink-0 w-7 h-7 flex items-center justify-center",
                "bg-[var(--ff-purple)] text-white",
                "text-[10px] font-bold font-display"
              )}
            >
              {user.initials}
            </div>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 text-left overflow-hidden"
                >
                  <p className="text-[12px] font-semibold text-white truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-white truncate leading-tight mt-0.5">
                    {user.role}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!isCollapsed && (
              <LogOut
                size={13}
                className="shrink-0 text-white group-hover:text-[var(--ff-purple)] transition-colors duration-150"
              />
            )}
          </button>
        </div>
      </>
    )
  }

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      {/* ── Desktop sidebar (hover to expand) ── */}
      <motion.nav
        aria-label="Admin navigasyonu"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "sticky top-0 h-screen z-40 w-fit shrink-0",
          "hidden lg:flex flex-col",
          "bg-[#0d0d0d] border-r border-[#2A2A2A]",
          "overflow-hidden"
        )}
        animate={{ width: isHovered ? 240 : 64 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {renderBody(!collapsed)}
      </motion.nav>

      {/* ── Mobile backdrop ── */}
      <div
        aria-hidden="true"
        onClick={onMobileClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",
          "transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* ── Mobile drawer (slide-in) ── */}
      <nav
        aria-label="Admin navigasyonu"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] max-w-[82vw]",
          "flex flex-col lg:hidden",
          "bg-[#0d0d0d] border-r border-[#2A2A2A]",
          "overflow-hidden shadow-2xl",
          "transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderBody(true, onMobileClose)}
      </nav>
    </Tooltip.Provider>
  )
}

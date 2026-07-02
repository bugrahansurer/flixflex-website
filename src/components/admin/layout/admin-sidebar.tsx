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
  Mail,
  Layers,
  MessageSquare,
  ChevronDown,
} from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { SessionUser } from "@/lib/auth/types"
import type { LucideIcon } from "@/lib/icons"
import { hasPermission } from "@/lib/rbac/permissions"
import { RESOURCES } from "@/lib/rbac/resources"
import { IconDeviceLaptop, IconListDetails, IconPhotoAlt, IconPointerCollaboration2, IconServerSpark, IconSettings, IconSparkleHighlight } from "@tabler/icons-react"

// ── Nav yapısı ────────────────────────────────────
// `resource` görünürlüğü belirler — bir öğe yalnızca kullanıcı o kaynağı
// READ edebiliyorsa gösterilir. resource'u olmayan öğe her zaman görünür.
interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
  resource?: string
}
interface NavGroup {
  label: string
  icon: LucideIcon
  items: NavItem[]
}

// Dashboard: gruplanmayan, her zaman üstte duran ana giriş.
const DASHBOARD: NavItem = { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "İçerik",
    icon: IconListDetails,
    items: [
      { label: "Sayfalar", href: "/admin/sayfalar", icon: IconDeviceLaptop, resource: RESOURCES.PAGES },
      { label: "Portfolyo", href: "/admin/portfolyo", icon: BriefcaseBusiness, resource: RESOURCES.PORTFOLIO },
      { label: "Hizmetler", href: "/admin/hizmetler", icon: IconServerSpark, resource: RESOURCES.SERVICES },
      { label: "Blog & İçerik", href: "/admin/blog", icon: SquarePen, resource: RESOURCES.BLOG },
      { label: "Dosyalar", href: "/admin/medya", icon: IconPhotoVideo, resource: RESOURCES.MEDIA },
    ],
  },
  {
    label: "Etkileşim",
    icon: IconPointerCollaboration2,
    items: [
      { label: "Randevular", href: "/admin/randevular", icon: CalendarDays, resource: RESOURCES.APPOINTMENTS },
      { label: "Mesajlar", href: "/admin/mesajlar", icon: Mail, resource: RESOURCES.MESSAGES },
    ],
  },
  {
    label: "Araçlar",
    icon: IconSparkleHighlight,
    items: [
      { label: "Raporlar", href: "/admin/raporlar", icon: BarChart3, resource: RESOURCES.ANALYTICS },
      { label: "AI Asistan", href: "/admin/ai", icon: Sparkles, resource: RESOURCES.AI },
      { label: "Tema Ayarları", href: "/admin/theme", icon: Palette, resource: RESOURCES.COLORS },
    ],
  },
  {
    label: "Sistem",
    icon: IconSettings,
    items: [
      { label: "Roller & Yetkiler", href: "/admin/roller", icon: ShieldCheck, resource: RESOURCES.ROLES },
      { label: "Kullanıcılar", href: "/admin/kullanicilar", icon: Users, resource: RESOURCES.USERS },
      { label: "Ayarlar", href: "/admin/ayarlar", icon: Settings, resource: RESOURCES.SETTINGS },
    ],
  },
]

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

  const isSuper = user.role === "Super Admin"
  const canSee = React.useCallback(
    (it: NavItem) => !it.resource || isSuper || hasPermission(user.permissions ?? [], it.resource, "read"),
    [user.permissions, isSuper],
  )

  function isActive(item: NavItem): boolean {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  // İzne göre filtrelenmiş gruplar (boş gruplar düşer).
  const visibleGroups = React.useMemo(
    () => NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter(canSee) })).filter((g) => g.items.length > 0),
    [canSee],
  )

  // Aktif rotanın bulunduğu grup — accordion başlangıçta bu açık gelir.
  const activeGroup = React.useMemo(
    () => visibleGroups.find((g) => g.items.some((it) => isActive(it)))?.label ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, visibleGroups],
  )
  const [openGroup, setOpenGroup] = React.useState<string | null>(activeGroup)
  // Rota değişince aktif grubu aç (mevcut bölüm açık kalsın). Kasıtlı senkron:
  // yalnızca activeGroup (navigasyon) değiştiğinde tetiklenir, manuel toggle'ı ezmez.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (activeGroup) setOpenGroup(activeGroup)
  }, [activeGroup])

  // Lock body scroll while the mobile drawer is open.
  React.useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  // ── Shared inner content ──────────────────────────
  const renderBody = (expanded: boolean, onNavigate?: () => void) => {
    const isCollapsed = !expanded

    // Tek nav linki (ikon + etiket). Daraltılmışta yalnızca ikon.
    const navLink = (item: NavItem, sub = false) => {
      const active = isActive(item)
      const Icon = item.icon
      return (
        <Link
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "group/link flex items-center gap-3 w-full rounded-md relative border-l-2",
            "text-[13px] font-medium transition-all duration-150",
            isCollapsed ? "h-10 pl-3.5" : sub ? "h-9 pl-3" : "h-10 pl-3.5",
            active
              ? "border-l-[var(--ff-purple)] bg-[var(--ff-purple)]/10 text-[var(--ff-purple)]"
              : "border-l-transparent text-white/85 hover:bg-white/10 hover:text-white",
          )}
        >
          <Icon size={17} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
        </Link>
      )
    }

    return (
      <>
        {/* Logo Section */}
        <div
          className={cn(
            "flex items-center border-b border-[var(--ff-purple)]/10",
            "h-[8vh] min-h-14 w-full shrink-0",
            isCollapsed ? "justify-center" : "justify-start",
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
                  <span className="font-display font-extrabold text-lg pl-6 tracking-tight text-white whitespace-nowrap">
                    Flix<span className="text-[var(--ff-purple)]">Flex</span>
                  </span>
                )}
              </motion.div>
            )}
            {isCollapsed &&
              (siteLogo ? (
                <motion.img
                  key="logo-mini"
                  src={siteLogo}
                  alt="Logo"
                  className="w-7 h-7 object-contain"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                />
              ) : (
                // Logo yoksa: marka monogramı (public navbar'daki "FF" rozet)
                <motion.div
                  key="logo-mark"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="ff-shape-button flex items-center justify-center w-8 h-8 bg-[var(--ff-purple)] text-white font-display font-extrabold text-[13px] tracking-tight leading-none shadow-[0_2px_10px_rgba(255,79,216,0.4)]"
                >
                  FF
                </motion.div>
              ))}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          {isCollapsed ? (
            // Daraltılmış: sekme/kategori tarzı — Dashboard + grup ikonları (kompakt).
            // Hover'da sidebar genişler, accordion açılır. Aktif grup vurgulanır.
            <ul className="space-y-1 px-2">
              <li>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>{navLink(DASHBOARD)}</Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      sideOffset={8}
                      className="z-50 px-3 py-1.5 bg-[#222222] border border-[var(--border)] text-[12px] font-medium text-white shadow-xl animate-ff-fadeIn"
                    >
                      Dashboard
                      <Tooltip.Arrow className="fill-[#222222]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </li>
              {visibleGroups.map((g) => {
                const GroupIcon = g.icon
                const hasActive = g.items.some(isActive)
                return (
                  <li key={g.label}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div
                          className={cn(
                            "flex items-center justify-center h-10 rounded-md border-l-2 cursor-default transition-colors",
                            hasActive
                              ? "border-l-[var(--ff-purple)] bg-[var(--ff-purple)]/10 text-[var(--ff-purple)]"
                              : "border-l-transparent text-white hover:bg-[var(--surface)] hover:text-ff-purple",
                          )}
                        >
                          <GroupIcon size={18} className="shrink-0" />
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="right"
                          sideOffset={8}
                          className="z-50 px-3 py-1.5 bg-[#222222] border border-[var(--border)] text-[12px] font-medium text-white shadow-xl animate-ff-fadeIn"
                        >
                          {g.label}
                          <Tooltip.Arrow className="fill-[#222222]" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </li>
                )
              })}
            </ul>
          ) : (
            // Genişlemiş: Dashboard (tekil) + accordion gruplar (tek-açık)
            <div className="px-2 space-y-1">
              {navLink(DASHBOARD)}

              {visibleGroups.map((g) => {
                const open = openGroup === g.label
                const GroupIcon = g.icon
                const hasActive = g.items.some(isActive)
                return (
                  <div key={g.label} className="pt-1">
                    <button
                      type="button"
                      onClick={() => setOpenGroup((prev) => (prev === g.label ? null : g.label))}
                      aria-expanded={open}
                      className={cn(
                        "group flex items-center gap-3 w-full h-10 pl-3.5 pr-2.5 rounded-md",
                        "text-[13px] font-medium transition-colors",
                        hasActive && !open ? "text-[var(--ff-purple)]" : "bg-transparent hover:bg-white/10 text-white hover:text-ff-purple",
                      )}
                    >
                      <GroupIcon size={17} className="shrink-0" />
                      <span className="flex-1 text-left">{g.label}</span>
                      <ChevronDown
                        size={14}
                        className={cn("shrink-0 transition-transform duration-200", open && "rotate-180")}
                      />
                    </button>
                    {/* grid-rows animasyonu ile yumuşak aç/kapa */}
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-200 ease-out",
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="overflow-hidden">
                        <ul className="mt-0.5 space-y-0.5 pl-2">
                          {g.items.map((item) => (
                            <li key={item.href}>{navLink(item, true)}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
                  "transition-all duration-200 group overflow-hidden",
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
              "transition-colors duration-150 group",
            )}
            aria-label="Profil sayfasına git"
          >
            {/* Avatar */}
            <div
              className={cn(
                "ff-shape-button shrink-0 w-7 h-7 flex items-center justify-center",
                "bg-[var(--ff-purple)] text-white",
                "text-[10px] font-bold font-display",
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
          "overflow-hidden",
        )}
        animate={{ width: isHovered ? 240 : 64 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {renderBody(isHovered)}
      </motion.nav>

      {/* ── Mobile backdrop ── */}
      <div
        aria-hidden="true"
        onClick={onMobileClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",
          "transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
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
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {renderBody(true, onMobileClose)}
      </nav>
    </Tooltip.Provider>
  )
}

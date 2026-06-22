import type { Metadata } from "next"
import Link from "next/link"
import {
  Settings,
  Globe,
  Mail,
  Bell,
  Shield,
  Plug,
  Database,
  KeyRound,
  Wrench,
  FileText,
  ArrowUpRight,
} from "@/lib/icons"
import { hasEnv } from "@/lib/env"

export const metadata: Metadata = {
  title: "Ayarlar",
}

interface SettingsTile {
  slug: string
  title: string
  description: string
  icon: typeof Settings
  href?: string         // future page; undefined = soon
  status?: "ok" | "warn" | "missing"
}

const TILES: SettingsTile[] = [
  {
    slug: "site",
    title: "Site Ayarları",
    description: "Site adı, varsayılan dil, SEO temel meta verileri.",
    icon: Globe,
    href: "/admin/ayarlar/site",
  },
  {
    slug: "email",
    title: "E-posta",
    description: "Gönderim adresi, Resend entegrasyonu, şablonlar.",
    icon: Mail,
    href: "/admin/ayarlar/email",
    status: hasEnv("RESEND_API_KEY") ? "ok" : "missing",
  },
  {
    slug: "bildirimler",
    title: "Bildirimler",
    description: "Admin bildirim tercihleri ve özet e-postaları.",
    icon: Bell,
    href: "/admin/ayarlar/bildirimler",
  },
  {
    slug: "guvenlik",
    title: "Güvenlik & 2FA",
    description: "İki adımlı doğrulama (TOTP), yedek kodlar.",
    icon: Shield,
    href: "/admin/ayarlar/guvenlik",
  },
  {
    slug: "entegrasyonlar",
    title: "Entegrasyonlar",
    description: "Anthropic, OpenAI, Gemini ve diğer servisler.",
    icon: Plug,
    href: "/admin/ayarlar/entegrasyonlar",
  },
  {
    slug: "veritabani",
    title: "Veritabanı",
    description: "Bağlantı durumu, yedekler, manuel senkronizasyon.",
    icon: Database,
    href: "/admin/ayarlar/veritabani",
    status: hasEnv("DATABASE_URL") ? "ok" : "missing",
  },
  {
    slug: "api-anahtarlari",
    title: "API Anahtarları",
    description: "Dış API anahtarları, döndürme, kullanım sınırları.",
    icon: KeyRound,
    href: "/admin/ayarlar/api-anahtarlari",
  },
  {
    slug: "bakim",
    title: "Bakım Modu",
    description: "Siteyi geçici olarak ziyaretçilere kapat.",
    icon: Wrench,
    href: "/admin/ayarlar/bakim",
  },
  {
    slug: "politikalar",
    title: "Politikalar",
    description: "Gizlilik, KVKK, çerez ve kullanım şartları metinleri.",
    icon: FileText,
    href: "/admin/ayarlar/politikalar",
  },
]

function StatusBadge({ status }: { status?: SettingsTile["status"] }) {
  if (!status) return null
  const map = {
    ok: { label: "Aktif", bg: "rgba(22,163,74,0.12)", fg: "#16a34a" },
    warn: { label: "Dikkat", bg: "rgba(217,119,6,0.12)", fg: "#d97706" },
    missing: { label: "Eksik", bg: "rgba(220,38,38,0.12)", fg: "#dc2626" },
  } as const
  const s = map[status]
  return (
    <span
      className="ff-shape-button h-6 items-center justify-center inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold"
      style={{ backgroundColor: s.bg, color: s.fg, border: `1px solid ${s.fg}33` }}
    >
      <span className="w-1.5 h-1.5" style={{ backgroundColor: s.fg }} />
      {s.label}
    </span>
  )
}

export default function AyarlarPage() {
  return (
    <div className="px-6 md:px-10 py-8 md:py-12">
      {/* ── Header ────────────────────────────── */}
      <header className="mb-10 md:mb-14">
        <p className="text-[11px] font-semibold text-[#FF4FD8] mb-3">
          Ayarlar
        </p>
        <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-[#0D0D0D] mb-1">
          Sistem{" "}
          <span className="text-[#FF4FD8]">yapılandırması</span>
        </h1>
        <p className="text-[#0D0D0D] text-base md:text-xs max-w-2xl leading-relaxed">
          FlixFlex platformunun temel davranışlarını buradan yönet. Her modülün
          kendi alt ayar sayfası vardır.
        </p>
      </header>

      {/* ── Tiles grid ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        {TILES.map((tile) => {
          const Icon = tile.icon
          const className = `ff-shape-container ff-card group relative flex flex-col gap-4 p-3 <md:p-4></md:p-4> transition-colors duration-200 ${tile.href
            ? "hover:bg-[#F7F7F5] cursor-pointer"
            : "cursor-default opacity-90"
            }`

          const content = (
            <>
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <span className="ff-shape-button w-9 h-9 flex items-center justify-center bg-[#ff4fd8]/10 border border-[#ff4fd8]/30 text-[#ff4fd8] group-hover:bg-[var(--ff-purple)] group-hover:border-[var(--ff-purple)] group-hover:text-white transition-colors duration-200">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={tile.status} />
                  {!tile.href && (
                    <span className="ff-shape-button flex h-6 items-center justify-center text-[9px] font-semibold text-[#0D0D0D] border border-[#CCCCCC] px-2 py-0.5">
                      Yakında
                    </span>
                  )}
                </div>
              </div>

              {/* Title + desc */}
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-md font-bold text-[#0D0D0D] tracking-tight">
                  {tile.title}
                </h3>
                <p className="text-xs text-[#0D0D0D] leading-relaxed">
                  {tile.description}
                </p>
              </div>

              {/* Bottom action */}
              {tile.href && (
                <div className="mt-auto pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#0D0D0D] group-hover:text-[var(--ff-purple)] transition-colors duration-200">
                  <span>Düzenle</span>
                  <ArrowUpRight
                    size={12}
                    strokeWidth={2.5}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              )}
            </>
          )

          if (tile.href) {
            return (
              <Link key={tile.slug} href={tile.href} className={className}>
                {content}
              </Link>
            )
          }

          return (
            <div key={tile.slug} className={className}>
              {content}
            </div>
          )
        })}
      </div>

      {/* ── Helper note ───────────────────────── */}
      <div className="ff-shape-button ff-card items-center justify-content mt-4 p-2 px-3 flex items-start gap-3">
        <Settings size={14} className="text-[#FF4FD8] shrink-0 mt-0.5" />
        <div className="text-xs text-[#0D0D0D] leading-relaxed">
          <p>
            Ayar modülleri kademeli olarak ekleniyor.{" "}
            <span className="text-[#0D0D0D]">
              Veritabanı bağlandıktan sonra
            </span>{" "}
            her tile aktif hale gelecek ve değerleri kalıcı olarak DB&apos;de saklanacak.
          </p>
        </div>
      </div>
    </div>
  )
}

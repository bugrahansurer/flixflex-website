import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Database, CheckCircle2, AlertCircle, FileText, Image as ImageIcon, Users, CalendarDays, MessageSquare, LayoutGrid } from "@/lib/icons"
import prisma from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Veritabanı",
}

export const dynamic = "force-dynamic"

interface CountRow {
  label: string
  icon: React.ComponentType<{ size?: number }>
  count: number
}

async function loadStatus(): Promise<{ connected: boolean; host: string; counts: CountRow[] }> {
  // Mask the host from DATABASE_URL (never expose credentials).
  let host = "—"
  try {
    const url = process.env.DATABASE_URL
    if (url) host = new URL(url).host
  } catch {
    host = "—"
  }

  if (!prisma) return { connected: false, host, counts: [] }

  try {
    const [pages, blog, portfolio, services, media, users, appointments, contacts] = await Promise.all([
      prisma.page.count(),
      prisma.blogPost.count(),
      prisma.portfolioItem.count(),
      prisma.service.count(),
      prisma.media.count(),
      prisma.user.count(),
      prisma.appointment.count(),
      prisma.contactSubmission.count(),
    ])
    return {
      connected: true,
      host,
      counts: [
        { label: "Sayfalar", icon: LayoutGrid, count: pages },
        { label: "Blog Yazıları", icon: FileText, count: blog },
        { label: "Portfolyo", icon: ImageIcon, count: portfolio },
        { label: "Hizmetler", icon: LayoutGrid, count: services },
        { label: "Medya", icon: ImageIcon, count: media },
        { label: "Kullanıcılar", icon: Users, count: users },
        { label: "Randevular", icon: CalendarDays, count: appointments },
        { label: "İletişim Mesajları", icon: MessageSquare, count: contacts },
      ],
    }
  } catch (err) {
    console.error("[veritabani] status error:", err)
    return { connected: false, host, counts: [] }
  }
}

export default async function VeritabaniPage() {
  const { connected, host, counts } = await loadStatus()

  return (
    <div className="px-6 md:px-10 py-8 md:py-12">
      <header className="mb-10">
        <Link
          href="/admin/ayarlar"
          className="inline-flex items-center gap-1 text-[12px] text-[#666666] hover:text-[#ff4fd8] transition-colors mb-2"
        >
          <ChevronLeft size={13} />
          Ayarlar&apos;a Geri Dön
        </Link>
        <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-[#333333] mb-3">
          <span className="text-[#FF4FD8]">Veritabanı</span> Durumu
        </h1>
        <p className="text-[#666666] text-sm max-w-2xl leading-relaxed">
          PostgreSQL bağlantı durumu ve tablo başına kayıt sayıları.
        </p>
      </header>

      {/* Connection card */}
      <div className="ff-shape-container p-3 bg-[#F7F7F5] border border-[#CCCCCC] mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="ff-shape-button w-11 h-11 flex items-center justify-center bg-[#F0F0F0] text-[var(--ff-purple)] border border-[#CCCCCC] shrink-0">
            <Database size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-[#333333]">PostgreSQL</h3>
            <p className="text-[12px] text-[#666666] font-mono break-all">{host}</p>
          </div>
        </div>
        {connected ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#16a34a]">
            <CheckCircle2 size={16} /> Bağlı
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#dc2626]">
            <AlertCircle size={16} /> Bağlantı yok
          </span>
        )}
      </div>

      {/* Counts grid */}
      {connected && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {counts.map((row) => {
            const Icon = row.icon
            return (
              <div key={row.label} className="ff-shape-container p-4 bg-[#F7F7F5] border border-[#CCCCCC]">
                <div className="flex items-center gap-2 text-[#666666] mb-2">
                  <Icon size={14} />
                  <span className="text-[11px] font-semibold">{row.label}</span>
                </div>
                <p className="font-display text-2xl font-extrabold text-[#333333] tabular-nums">{row.count}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

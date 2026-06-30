// ═══════════════════════════════════════════════════════════
// /admin/ai — AI Asistan Dashboard
// Server Component — read-only stats + entry points
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, Wand2, FileText, Activity, KeyRound, ArrowUpRight } from "@/lib/icons"
import { hasEnv } from "@/lib/env"
import { listPosts } from "@/lib/ai/blog-store"
import { cn } from "@/lib/utils"
import { getCan } from "@/lib/rbac/server-can"

export const metadata: Metadata = {
  title: "AI Asistan",
}

export default async function AIDashboardPage() {
  const can = await getCan()
  const keyConfigured = hasEnv("ANTHROPIC_API_KEY")
  const aiPosts = await listPosts({ aiGenerated: true })
  const aiPostCount = aiPosts.length

  // Mock monthly token usage (replace with real Anthropic billing API)
  const monthlyTokens = aiPostCount * 8_500 + 32_400

  return (
    <div className="px-6 md:px-10 py-8 space-y-8">
      {/* Page header */}
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#0d0d0d] flex items-center gap-3">
            <Sparkles className="text-[#ff4fd8]" size={24} />
            AI Asistan
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            FlixFlex AI içerik motoru — başlıktan yayınlanmış yazıya tek akışta
          </p>
        </div>

        {can("ai", "create") && (
          <Link
            href="/admin/ai/studio"
            className={cn(
              "ff-shape-button inline-flex items-center gap-2 h-11 px-5 py-3",
              "bg-[#ff4fd8] text-white border border-[#ff4fd8]",
              "hover:bg-[#ff4fd8]/80 hover:shadow-[0_4px_14px_0_rgba(255,79,216,0.4)]",
              "text-[13px] font-semibold",
              "transition-all duration-200"
            )}
          >
            <Wand2 size={15} />
            Yeni Blog Üret
            <ArrowUpRight size={14} />
          </Link>
        )}
      </div>

      {/* Hero card — AI Blog Asistanı */}
      <section
        className={cn(
          "ff-shape-container relative overflow-hidden",
          "bg-gradient-to-br from-[#ff4fd8]/30 via-[#ff4fd8]/10 to-[#ff4fd8]/3",
          "border border-[#FF4FD8]/10",
          "p-4 md:p-6"
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative">
          <p className="text-[11px] font-mono text-[#ff4fd8] mb-3">
            {"// AI BLOG MOTORU"}
          </p>
          <h2 className="font-display text-lg md:text-xl font-extrabold text-[#0d0d0d] leading-tight tracking-tight">
            Konudan yayınlanmış yazıya — <span className="text-[#ff4fd8]">altı adım</span>.
          </h2>
          <p className="text-xs text-[#888888] mt-4 max-w-xl leading-relaxed">
            Başlık önerisi, araştırma, makale üretimi, görseller, şablon seçimi ve
            taslak olarak kaydetme. FlixFlex&apos;in ses tonuyla, Türkçe, dakikalar
            içinde.
          </p>

          {/* Key status pill */}
          <div className="ff-shape-button mt-6 inline-flex items-center gap-2 px-3 py-1.5 border border-[#cccccc] bg-[#f0f0f0] text-[12px]">
            <KeyRound size={13} className={keyConfigured ? "text-green-500" : "text-yellow-500"} />
            <span className="text-[12px] font-medium text-[#888888]">
              ANTHROPIC_API_KEY:
            </span>
            <span
              className={cn(
                "text-[12px] font-bold",
                keyConfigured ? "text-green-500" : "text-yellow-500"
              )}
            >
              {keyConfigured ? "Aktif" : "Tanımlı Değil"}
            </span>
          </div>
          {!keyConfigured && (
            <p className="text-[11px] text-yellow-500 mt-2 max-w-md">
              .env.local dosyasına <code className="font-mono">ANTHROPIC_API_KEY=sk-ant-...</code> ekleyin.
              Demo arayüz çalışmaya devam eder; üretim çağrıları 500 döner.
            </p>
          )}
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={FileText}
          label="AI Tarafından Üretildi"
          value={String(aiPostCount)}
          hint="toplam yazı"
        />
        <StatCard
          icon={Activity}
          label="Aylık Token Kullanımı"
          value={formatTokens(monthlyTokens)}
          hint="mock — gerçek değer için Anthropic billing"
        />
        <StatCard
          icon={Sparkles}
          label="Varsayılan Model"
          value="claude-opus-4-7"
          hint="src/lib/ai/index.ts içinde"
        />
      </section>

      {/* Quick actions */}
      <section>
        <h3 className="font-display text-[13px] font-bold text-[#0d0d0d] mb-4">
          Hızlı Aksiyonlar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {can("ai", "create") && (
            <QuickAction
              href="/admin/ai/studio"
              icon={Wand2}
              title="Yeni Blog Üret"
              desc="6 adımlı sihirbazla başlıktan yayına"
              primary
            />
          )}
          <QuickAction
            href="/admin/blog"
            icon={FileText}
            title="Blog Yönetimi"
            desc="Taslakları gözden geçir, yayınla"
          />
        </div>
      </section>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────
function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return String(n)
}

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
  hint: string
}
function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <div className="ff-shape-container ff-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-[#0d0d0d]">
          {label}
        </span>
        <div className="ff-shape-button w-8 h-8 flex items-center justify-center">
          <Icon size={15} className="text-[#ff4fd8]" />
        </div>
      </div>
      <p className="font-mono font-extrabold text-xl text-[#0d0d0d] leading-none">
        {value}
      </p>
      <p className="text-[11px] text-[#888888] mt-2">{hint}</p>
    </div>
  )
}

interface QuickActionProps {
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  desc: string
  primary?: boolean
}
function QuickAction({ href, icon: Icon, title, desc, primary }: QuickActionProps) {
  return (
    <Link
      href={href}
      className={cn(
        "ff-shape-container ff-card group block p-5 transition-all duration-200",
        primary
          ? " hover:bg-[#ff4fd8]/20 hover:border-[#ff4fd8]/50"
          : " hover:bg-[#ff4fd8]/20 hover:border-[#ff4fd8]/50"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon size={18} className={primary ? "text-[#ff4fd8]" : "text-[#ff4fd8]"} />
        <ArrowUpRight
          size={14}
          className="text-[#888888] group-hover:text-[#ff4fd8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
        />
      </div>
      <h4 className="font-display font-bold text-[#0d0d0d] mb-1">{title}</h4>
      <p className="text-[12px] text-[#888888]">{desc}</p>
    </Link>
  )
}

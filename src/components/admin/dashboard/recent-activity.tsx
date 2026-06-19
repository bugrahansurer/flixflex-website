"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/utils"
import { staggerContainer, fadeInUp } from "@/lib/animations"

// ── Mock activity data ────────────────────────────
const ACTIVITIES = [
  {
    id: "1",
    user: { name: "Burhan Cal", initials: "BC" },
    action: "Blog yazısı yayınladı",
    target: '"Next.js 16 ile Performans Optimizasyonu"',
    time: new Date(Date.now() - 1000 * 60 * 18),
  },
  {
    id: "2",
    user: { name: "Admin Panel", initials: "AP" },
    action: "Renk paleti değiştirildi",
    target: '"Dark Purple v2" aktifleştirildi',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    user: { name: "Burhan Cal", initials: "BC" },
    action: "Yeni sayfa oluşturuldu",
    target: '"/hizmetler/seo-optimizasyon"',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "4",
    user: { name: "AI Asistan", initials: "AI" },
    action: "Blog taslağı üretildi",
    target: '"Google Ads Stratejisi 2025"',
    time: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: "5",
    user: { name: "Burhan Cal", initials: "BC" },
    action: "Kullanıcı eklendi",
    target: '"editor@flixflex.com" (Editör rolü)',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "6",
    user: { name: "Admin Panel", initials: "AP" },
    action: "Ayarlar güncellendi",
    target: "SEO meta etiketi varsayılan değerleri",
    time: new Date(Date.now() - 1000 * 60 * 60 * 26),
  },
  {
    id: "7",
    user: { name: "AI Asistan", initials: "AI" },
    action: "Portfolio yazısı güncellendi",
    target: '"EkoMarka Rebrand Projesi"',
    time: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: "8",
    user: { name: "Burhan Cal", initials: "BC" },
    action: "Blog yazısı arşivlendi",
    target: '"Eski Sosyal Medya Taktikleri"',
    time: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
] as const

export function RecentActivity() {
  return (
    <div>
      <h2 className="font-display text-[13px] font-bold text-[#666666] mb-4">
        Son Aktiviteler
      </h2>

      <div className="ff-shape-container bg-[#f7f7f5] border border-[#cccccc]">
        {/* Table header */}
        <div className={cn(
          "hidden md:grid grid-cols-[2fr_3fr_1fr] gap-4",
          "px-3 py-2 bg-[#f2f2f2] border-b border-[#cccccc]",
          "text-[10px] font-bold text-[#0d0d0d]"
        )}>
          <span>Kullanıcı</span>
          <span>İşlem</span>
          <span className="text-right">Zaman</span>
        </div>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {ACTIVITIES.map((activity) => (
            <motion.li
              key={activity.id}
              variants={fadeInUp}
              className={cn(
                "grid grid-cols-1 md:grid-cols-[2fr_3fr_1fr] gap-2 md:gap-4 items-start md:items-center",
                "px-5 py-3.5",
                "border-b border-[#cccccc] last:border-b-0",
                "hover:bg-[#f7f7f5] transition-colors duration-150 group"
              )}
            >
              {/* User */}
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "ff-shape-button w-7 h-7 shrink-0 flex items-center justify-center",
                    "text-[10px] font-bold text-white",
                    activity.user.initials === "AI"
                      ? "bg-[var(--ff-purple)]/80"
                      : activity.user.initials === "AP"
                        ? "bg-[#323232]"
                        : "bg-[var(--ff-purple)]"
                  )}
                >
                  {activity.user.initials}
                </div>
                <span className="text-[12px] font-medium text-[#666666] truncate">
                  {activity.user.name}
                </span>
              </div>

              {/* Action */}
              <div className="pl-9 md:pl-0">
                <span className="text-[12px] text-[#666666]">
                  {activity.action}{" "}
                </span>
                <span className="text-[12px] text-[#333333] font-medium">
                  {activity.target}
                </span>
              </div>

              {/* Timestamp */}
              <div className="pl-9 md:pl-0 md:text-right">
                <span className="text-[11px] text-[#666666] tabular-nums">
                  {formatRelativeTime(activity.time)}
                </span>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  )
}

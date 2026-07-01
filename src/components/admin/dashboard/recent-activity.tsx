"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/utils"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { RESOURCE_LABELS } from "@/lib/rbac/resources"

export interface ActivityItem {
  id: string
  action: string
  resource: string
  userName: string
  initials: string
  createdAt: string
}

// AuditLog rows are a mix of already-human Turkish phrases (older writers)
// and machine keys like "role.update" / "ai.pipeline.write". Normalise both
// into a readable sentence.
const VERB: Record<string, string> = {
  create: "oluşturuldu",
  update: "güncellendi",
  delete: "silindi",
  read: "görüntülendi",
  publish: "yayınlandı",
  login: "giriş yapıldı",
}

function humanize(action: string, resource: string): string {
  // Already a human sentence (contains a space) → show verbatim.
  if (/\s/.test(action)) return action

  const parts = action.split(".")
  const last = parts[parts.length - 1]
  const resLabel = RESOURCE_LABELS[resource] || resource

  if (parts[0] === "ai") return "AI içerik üretildi"
  if (VERB[last]) return `${resLabel} ${VERB[last]}`
  return `${resLabel}: ${action}`
}

export function RecentActivity({ items = [] }: { items?: ActivityItem[] }) {
  return (
    <div>
      <h2 className="font-display text-[13px] font-bold text-[#666666] mb-4">
        Son Aktiviteler
      </h2>

      <div className="ff-shape-container ff-card p-0">
        {/* Table header */}
        <div className={cn(
          "hidden md:grid grid-cols-[2fr_3fr_1fr] gap-4",
          "px-3 py-2 bg-[#f5f5f5] border-b border-[#cccccc]",
          "text-[10px] font-bold text-[#0d0d0d]"
        )}>
          <span>Kullanıcı</span>
          <span>İşlem</span>
          <span className="text-right">Zaman</span>
        </div>

        {items.length === 0 ? (
          <div className="px-5 py-10 text-center text-[12px] text-[#888888]">
            Henüz kayıtlı aktivite yok.
          </div>
        ) : (
          <motion.ul variants={staggerContainer} initial="hidden" animate="visible">
            {items.map((activity) => (
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
                      "text-[10px] font-bold text-white bg-[var(--ff-purple)]"
                    )}
                  >
                    {activity.initials}
                  </div>
                  <span className="text-[12px] font-medium text-[#666666] truncate">
                    {activity.userName}
                  </span>
                </div>

                {/* Action */}
                <div className="pl-9 md:pl-0">
                  <span className="text-[12px] text-[#333333] font-medium">
                    {humanize(activity.action, activity.resource)}
                  </span>
                </div>

                {/* Timestamp */}
                <div className="pl-9 md:pl-0 md:text-right">
                  <span className="text-[11px] text-[#666666] tabular-nums">
                    {formatRelativeTime(activity.createdAt)}
                  </span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  )
}

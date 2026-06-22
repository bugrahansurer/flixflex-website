"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { SquarePen, FileText, Palette, Sparkles, ArrowUpRight } from "@/lib/icons"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { TiltCard } from "@/components/ui/tilt-card"

const ACTIONS = [
  {
    label: "Yeni Post",
    description: "Blog yazısı oluştur",
    href: "/admin/blog/yeni",
    icon: SquarePen,
  },
  {
    label: "Yeni Sayfa",
    description: "Sayfa oluştur",
    href: "/admin/sayfalar/yeni",
    icon: FileText,
  },
  {
    label: "Renk Değiştir",
    description: "Tema yönetimi",
    href: "/admin/theme",
    icon: Palette,
  },
  {
    label: "AI Önerileri",
    description: "İçerik üret",
    href: "/admin/ai",
    icon: Sparkles,
  },
] as const

export function QuickActions() {
  return (
    <div>
      <h2 className="font-display text-[13px] font-bold text-[#666666] mb-4">
        Hızlı İşlemler
      </h2>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <motion.div key={action.href} variants={fadeInUp}>
              <Link href={action.href}>
                <TiltCard
                  variant="glass"
                  className="flex flex-row items-start justify-between vertical-align: middle gap-3 p-3 overflow-hidden"
                >
                  {/* Left accent on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#ff4fd8] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  <div className="flex items-center gap-3">
                    <div className="ff-shape-button w-9 h-9 flex items-center justify-center bg-[#ff4fd8]/10 shrink-0">
                      <Icon
                        size={16}
                        className="text-[#ff4fd8] transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0d0d0d] leading-tight">
                        {action.label}
                      </p>
                      <p className="text-[11px] text-[#888888] mt-0.5">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={14}
                    className="shrink-0 text-[#888888] group-hover:text-[#ff4fd8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                  />
                </TiltCard>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

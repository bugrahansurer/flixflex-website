"use client"

import { motion } from "framer-motion"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { cn } from "@/lib/utils"
import type { PortfolioItem } from "@/components/public"
import { TiltCard } from "@/components/ui/tilt-card"

interface ProjectSummaryProps {
  project: PortfolioItem
}

const ROLE_MAP: Record<string, string> = {
  Branding: "Marka Kimliği",
  Performance: "Performans Pazarlaması",
  Web: "Web Geliştirme",
  Content: "İçerik Üretimi",
}

export function ProjectSummary({ project }: ProjectSummaryProps) {
  const { client, year, category } = project

  const cols = [
    { label: "Müşteri", value: client },
    { label: "Yıl", value: String(year) },
    { label: "Hizmet", value: ROLE_MAP[category] ?? category },
    { label: "Kategori", value: category },
  ]

  return (
    <section
      className={cn(
        "relative bg-[var(--background)] text-[var(--foreground)]",
        "py-0 mt-3"
      )}
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {cols.map((col) => (
            <motion.div key={col.label} variants={fadeInUp} className="h-full">
              <TiltCard
                variant="glass"
                tiltLimit={10}
                scale={1.02}
                spotlight={false}
                className="h-full flex flex-col gap-1 p-5"
              >
                <span className="text-[11px] font-semibold text-[var(--ff-purple)] relative z-20">
                  {col.label}
                </span>
                <span className="font-display text-base md:text-lg font-bold text-[var(--foreground)] leading-tight mt-1 relative z-20">
                  {col.value}
                </span>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, ArrowUpRight } from "@/lib/icons"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { cn } from "@/lib/utils"
import type { PortfolioItem } from "@/components/public"
import { StarField } from "@/components/ui/star-field"
import { TiltCard } from "@/components/ui"

interface ProjectHeroProps {
  project: PortfolioItem
}

const ROLE_MAP: Record<string, string> = {
  Branding: "Marka Kimliği",
  Performance: "Performans Pazarlaması",
  Web: "Web Geliştirme",
  Content: "İçerik Üretimi",
}

// Protokolsüz girilen bağlantıları (örn. "ornek.com") güvenli hale getir.
function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const { title, client, clientLogo, year, category, linkUrl, linkLabel } = project
  const href = linkUrl?.trim() ? normalizeUrl(linkUrl) : null

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
        "pt-20 pb-8 md:pt-28 md:pb-10 overflow-hidden"
      )}
    >
      {/* Grid texture */}
      {/* Deep-space starfield background (replaces the old grid) */}
      <StarField className="z-0" />

      {/* Purple aura */}
      <div
        aria-hidden
        className="absolute -top-40 right-0 w-[36rem] h-[36rem] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse, rgba(255, 79, 216,0.12) 0%, transparent 65%)`,
          filter: "blur(60px)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-0"
        >
          {/* Breadcrumb */}
          <motion.nav
            variants={fadeInUp}
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--foreground-faint)] mb-6"
          >
            <Link
              href="/portfolio"
              className="hover:text-[var(--ff-purple)] transition-colors duration-150"
            >
              Portfolyo
            </Link>
            <ChevronRight size={10} />
            <span className="text-[var(--foreground-muted)]">{title}</span>
          </motion.nav>

          {/* Client logo + category badge */}
          <motion.div variants={fadeInUp} className="mb-5 flex items-center gap-3">
            {clientLogo && (
              <Image
                src={clientLogo}
                alt={`${client} logo`}
                width={140}
                height={32}
                sizes="140px"
                className="h-8 w-auto max-w-[140px] object-contain"
              />
            )}
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeInUp}
            className={cn(
              "font-display font-extrabold leading-[0.9] tracking-tight",
              "text-[clamp(30px,3vw, 50px)]",
              "max-w-4xl"
            )}
          >
            {title}
          </motion.h1>

          {/* Visit link — proje sitesi / sosyal medya / ilgili bağlantı */}
          {href && (
            <motion.div variants={fadeInUp} className="mt-6 mb-2">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group ff-shape-button inline-flex items-center gap-2 h-10 px-5 py-2",
                  "bg-ff-purple/5 text-ff-purple border border-ff-purple text-[13px] font-semibold",
                  "border border-[var(--ff-purple)]",
                  "hover:bg-ff-purple hover:text-white transition-colors duration-150"
                )}
              >
                {linkLabel?.trim() || "Projeyi Ziyaret Et"}
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </motion.div>
          )}
        </motion.div>
        <div className="mt-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {cols?.map((col) => (
              <motion.div key={col.label} variants={fadeInUp} className="h-full">
                <TiltCard
                  variant="glass"
                  tiltLimit={10}
                  scale={1.02}
                  spotlight={false}
                  className="bg-transparent backdrop-blur-sm h-full flex flex-col gap-1 p-5"
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
      </div>
    </section>
  )
}

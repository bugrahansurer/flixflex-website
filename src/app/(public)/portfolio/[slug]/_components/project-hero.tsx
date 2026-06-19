"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight } from "@/lib/icons"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { cn } from "@/lib/utils"
import type { PortfolioItem } from "@/components/public"
import { StarField } from "@/components/ui/star-field"

interface ProjectHeroProps {
  project: PortfolioItem
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const { title, client, clientLogo } = project

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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clientLogo}
                alt={`${client} logo`}
                className="h-8 w-auto max-w-[140px] object-contain"
                loading="lazy"
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
        </motion.div>

      </div>
    </section>
  )
}

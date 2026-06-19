"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"
import { fadeInUp } from "@/lib/animations"

interface CaseStudyTeaserProps {
  serviceTitle: string
}

export function CaseStudyTeaser({ serviceTitle }: CaseStudyTeaserProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <Link
        href="/portfolio"
        className={cn(
          "ff-shape-container group relative flex flex-col md:flex-row gap-0",
          "border border-[var(--border)]",
          "overflow-hidden",
          "transition-[border-color,box-shadow] duration-300",
          "hover:border-[rgba(255, 79, 216,0.35)]",
          "hover:shadow-[0_4px_40px_rgba(255, 79, 216,0.12)]"
        )}
      >
        {/* Visual side */}
        <div
          className={cn(
            "md:w-72 lg:w-80 flex-shrink-0",
            "min-h-[180px] md:min-h-0",
            "bg-[var(--surface)] relative overflow-hidden"
          )}
        >
          {/* Purple gradient placeholder */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 79, 216,0.15) 0%, rgba(255, 79, 216,0.05) 50%, transparent 100%)",
            }}
          />
          {/* Grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="ff-shape-container bg-[var(--ff-purple)]/10 border border-[var(--ff-purple)]/30 px-3 py-2 text-[10px]">
              Portfolyo
            </span>
          </div>
        </div>

        {/* Text side */}
        <div className="flex flex-col justify-center gap-3 p-7 md:p-10 flex-1">
          <Eyebrow>Referans Proje</Eyebrow>
          <h3 className="font-display text-xl md:text-2xl font-bold text-[var(--foreground)] leading-tight tracking-tight">
            {serviceTitle} alanında gerçekleştirdiğimiz çalışmalara göz atın
          </h3>
          <p className="text-sm text-[var(--foreground-muted)] leading-relaxed max-w-md">
            FlixFlex portföyünde bu hizmete ait vakalar ve sonuçlar sizi bekliyor. Her proje bir veri noktasıdır.
          </p>
          <span
            className={cn(
              "mt-2 inline-flex items-center gap-2",
              "text-[11px] font-bold",
              "text-[var(--foreground-faint)]",
              "transition-colors duration-300 group-hover:text-[var(--ff-purple)]",
              "w-fit"
            )}
          >
            Portfolyoya Git
            <ArrowUpRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

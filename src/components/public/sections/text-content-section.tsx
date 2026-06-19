"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeInUp } from "@/lib/animations"
import { sanitizeHtml } from "@/lib/sanitize"

interface TextContentSectionProps {
  headline?: string
  body?: string
  alignment?: "left" | "center" | "right"
  maxWidthProse?: boolean
}

export function TextContentSection({
  headline,
  body,
  alignment = "left",
  maxWidthProse = true,
}: TextContentSectionProps) {
  return (
    <section className="relative bg-[var(--background)] py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className={cn(
            "w-full",
            alignment === "center" && "text-center mx-auto",
            alignment === "right" && "text-right ml-auto",
            maxWidthProse && "max-w-3xl"
          )}
        >
          {headline && (
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[var(--foreground)] mb-8 leading-tight tracking-tight">
              {headline}
            </h2>
          )}
          {body && (
            <div 
              className={cn(
                "text-lg md:text-xl text-[var(--foreground-muted)] leading-relaxed space-y-6",
                "prose prose-invert max-w-none"
              )}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(body) }}
            />
          )}
        </motion.div>
      </div>
    </section>
  )
}

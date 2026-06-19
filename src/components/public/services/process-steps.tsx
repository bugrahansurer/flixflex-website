"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import type { ProcessStep } from "@/components/public/sections/services-data"

interface ProcessStepsProps {
  steps: ProcessStep[]
}

export function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <motion.ol
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="flex flex-col"
    >
      {steps.map((step, i) => (
        <motion.li
          key={i}
          variants={fadeInUp}
          className={cn(
            "group relative flex gap-6 md:gap-10",
            "border-b border-[var(--border)] last:border-b-0",
            "py-8 md:py-10"
          )}
        >
          {/* Step number + connector line */}
          <div className="flex flex-col items-center flex-shrink-0">
            <span
              className={cn(
                "ff-shape-container w-10 h-10 flex items-center justify-center flex-shrink-0",
                "border border-[var(--border)] bg-[var(--surface)]",
                "font-mono text-[11px] font-bold tracking-[0.1em]",
                "text-[var(--foreground-faint)]",
                "transition-[background-color,border-color,color] duration-300",
                "group-hover:bg-[var(--ff-purple)] group-hover:border-[var(--ff-purple)] group-hover:text-white"
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {/* Vertical connector — hidden on last item */}
            {i < steps.length - 1 && (
              <div className="w-px flex-1 bg-[var(--border)] mt-3" />
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-2 pb-2">
            <h3 className="font-display text-lg md:text-xl font-bold text-[var(--foreground)] leading-tight tracking-tight">
              {step.title}
            </h3>
            <p className="text-sm md:text-base text-[var(--foreground-muted)] leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Purple left accent on hover */}
          <span
            aria-hidden
            className={cn(
              "absolute left-0 top-0 bottom-0 w-[2px]",
              "bg-[var(--ff-purple)] opacity-0",
              "transition-opacity duration-300 group-hover:opacity-100"
            )}
          />
        </motion.li>
      ))}
    </motion.ol>
  )
}

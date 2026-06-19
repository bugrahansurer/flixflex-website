"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeInUp } from "@/lib/animations"

interface DeliverablesGridProps {
  items: string[]
}

export function DeliverablesGrid({ items }: DeliverablesGridProps) {
  return (
    <motion.ul
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {items.map((item, i) => (
        <motion.li
          key={i}
          variants={fadeInUp}
          className={cn(
            "ff-shape-container group flex items-center justify-start h-16 gap-3",
            "bg-[var(--background)] border border-[var(--border)] px-4 ",
            "transition-colors duration-200",
            "hover:bg-[var(--ff-purple)]/10 hover:border-[var(--ff-purple)]/30 "
          )}
        >
          <CheckCircle2
            size={16}
            className="flex-shrink-0 mt-0.5 text-[var(--ff-purple)]"
            strokeWidth={2}
          />
          <span className="text-sm text-[var(--foreground-muted)] group-hover:text-[var(--ff-purple)] leading-snug transition-colors duration-200">
            {item}
          </span>
        </motion.li>
      ))}
    </motion.ul>
  )
}

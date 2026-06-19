"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ease } from "@/lib/animations"
import type { BlogCategory } from "./blog-data"
import { BLOG_CATEGORIES } from "./blog-data"

interface BlogCategoriesProps {
  active: BlogCategory
  onChange: (cat: BlogCategory) => void
  className?: string
}

export function BlogCategories({
  active,
  onChange,
  className,
}: BlogCategoriesProps) {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="group"
      aria-label="Blog kategorisi filtrele"
    >
      {BLOG_CATEGORIES.map(({ label, value }) => {
        const isActive = active === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              "ff-shape-button relative px-4 py-2 text-[11px] font-semibold",
              "transition-colors duration-200 border",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-purple)] focus-visible:ring-offset-1",
              isActive
                ? "bg-[var(--ff-purple)] border-[var(--ff-purple)] text-white"
                : [
                  "bg-transparent text-[var(--foreground-muted)]",
                  "border-[var(--border)]",
                  "hover:text-[var(--foreground)] hover:border-[var(--ff-purple)]",
                ]
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
            {isActive && (
              <motion.span
                layoutId="blog-category-pill"
                className="absolute inset-0 bg-[var(--ff-purple)] -z-[1]"
                transition={{ duration: 0.25, ease: ease.smooth }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

"use client"

import { cn } from "@/lib/utils"
import { ResultCounter } from "@/components/public/portfolio/result-counter"
import type { PortfolioItem } from "@/components/public"

interface ProjectResultsProps {
  project: PortfolioItem
}

export function ProjectResults({ project }: ProjectResultsProps) {
  // Only real, meaningful stats — no fabricated boilerplate.
  const stats = (project.resultStats ?? []).filter(
    (s) => s && s.label?.trim() && Number.isFinite(s.value)
  )

  // Hide the whole section when there are no stats, or every value is 0
  // (i.e. placeholder data the admin hasn't filled in yet).
  if (stats.length === 0 || stats.every((s) => s.value === 0)) return null

  return (
    <section
      className={cn(
        "relative bg-[var(--background)] text-[var(--foreground)]",
        "py-20 md:py-28 overflow-hidden"
      )}
    >
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <ResultCounter stats={stats} />
      </div>
    </section>
  )
}

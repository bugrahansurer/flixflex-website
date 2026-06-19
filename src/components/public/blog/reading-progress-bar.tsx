"use client"

import { useScrollProgress } from "@/hooks/use-scroll-progress"
import { cn } from "@/lib/utils"

interface ReadingProgressBarProps {
  className?: string
}

export function ReadingProgressBar({ className }: ReadingProgressBarProps) {
  const { progress } = useScrollProgress()

  return (
    <div
      aria-hidden
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-[3px]",
        "bg-[var(--border)]",
        className
      )}
    >
      <div
        className="h-full bg-[var(--ff-purple)] transition-[width] duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

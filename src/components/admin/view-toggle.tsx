"use client"

import { LayoutGrid, List } from "@/lib/icons"
import { cn } from "@/lib/utils"

export type ViewMode = "grid" | "list"

export function ViewToggle({
  mode,
  onChange,
}: {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}) {
  return (
    <div className="ff-shape-container flex items-center justify-center px-1 border border-[#CCCCCC] bg-[#f7f7f5] overflow-hidden h-9">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "ff-shape-button w-7 h-7 flex items-center justify-center transition-colors",
          mode === "grid"
            ? "bg-[var(--ff-purple)] text-white"
            : "text-[#666666] hover:text-[#ff4fd8]"
        )}
      >
        <LayoutGrid size={14} />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "ff-shape-button w-7 h-7 flex items-center justify-center transition-colors",
          mode === "list"
            ? "bg-[var(--ff-purple)] text-white"
            : "text-[#666666] hover:text-[#ff4fd8]"
        )}
      >
        <List size={14} />
      </button>
    </div>
  )
}

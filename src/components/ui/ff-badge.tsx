import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants: Record<string, string> = {
  purple: "ff-shape-container bg-ff-purple/10 backdrop-blur-sm border-2 border-ff-purple/30 text-ff-purple",
  charcoal: "ff-shape-container bg-[#323232] border-[#323232] text-white",
  white: "ff-shape-container bg-white/10 border-white/20 text-white",
  outline: "ff-shape-container bg-transparent border-[var(--border)] text-[var(--foreground-muted)]",
  success: "ff-shape-container bg-green-500/10 border-green-500/30 text-green-500",
  warning: "ff-shape-container bg-amber-500/10 border-amber-500/30 text-amber-500",
  error: "bg-red-500/10 border-red-500/30 text-red-500",
  ai: "bg-[rgba(255, 79, 216,0.15)] border-[rgba(255, 79, 216,0.4)] text-[#C266FF]",
}

export interface FFBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants
  dot?: boolean
}

const FFBadge = React.forwardRef<HTMLSpanElement, FFBadgeProps>(
  ({ variant = "purple", dot = false, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "ff-shape-button inline-flex items-center gap-1.5",
        "text-[10px] font-semibold",
        "px-2.5 py-1 border rounded-none",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current animate-pulse flex-shrink-0"
        />
      )}
      {children}
    </span>
  )
)
FFBadge.displayName = "FFBadge"

export { FFBadge }

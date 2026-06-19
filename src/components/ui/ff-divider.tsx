import * as React from "react"
import { cn } from "@/lib/utils"

interface FFDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  variant?: "default" | "purple" | "gradient"
  orientation?: "horizontal" | "vertical"
}

const FFDivider = React.forwardRef<HTMLDivElement, FFDividerProps>(
  ({ label, variant = "default", orientation = "horizontal", className, ...props }, ref) => {
    const lineClass = {
      default:  "bg-[var(--border)]",
      purple:   "bg-[rgba(255, 79, 216,0.4)]",
      gradient: "bg-gradient-to-r from-transparent via-[rgba(255, 79, 216,0.5)] to-transparent",
    }[variant]

    if (orientation === "vertical") {
      return (
        <div
          ref={ref}
          className={cn("w-px self-stretch", lineClass, className)}
          {...props}
        />
      )
    }

    if (label) {
      return (
        <div ref={ref} className={cn("flex items-center gap-4", className)} {...props}>
          <div className={cn("flex-1 h-px", lineClass)} />
          <span className="text-[11px] font-medium text-[var(--foreground-faint)] shrink-0">
            {label}
          </span>
          <div className={cn("flex-1 h-px", lineClass)} />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn("w-full h-px", lineClass, className)}
        {...props}
      />
    )
  }
)
FFDivider.displayName = "FFDivider"

export { FFDivider }

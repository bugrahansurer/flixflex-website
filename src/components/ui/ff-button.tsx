"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

// ── Variant & Size Maps ───────────────────────────
const variantClasses: Record<string, string> = {
  primary:
    "bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)] " +
    "hover:bg-[var(--ff-purple-hover)] hover:border-[var(--ff-purple-hover)] " +
    "hover:shadow-[0_4px_24px_rgb(var(--ff-purple)/0.45)]",
  secondary:
    "bg-[#323232] text-white border border-[#323232] " +
    "hover:bg-[#484848] hover:border-[#484848]",
  outline:
    "bg-transparent text-[var(--ff-charcoal)] border border-[var(--ff-charcoal)] " +
    "hover:bg-[rgb(var(--ff-charcoal)/0.1)] " +
    "hover:shadow-[0_0_20px_rgb(var(--ff-charcoal)/0.15)]",
  ghost:
    "bg-transparent text-[var(--foreground)] border border-transparent " +
    "hover:bg-[var(--surface)] hover:text-[var(--ff-purple)]",
  destructive:
    "bg-red-600 text-white border border-red-600 " +
    "hover:bg-red-700 hover:border-red-700",
  "outline-white":
    "bg-transparent text-white border border-white/40 " +
    "hover:border-white hover:bg-white/10",
}

const sizeClasses: Record<string, string> = {
  sm: "text-[11px] px-4 py-2 gap-1.5",
  md: "text-[13px] px-6 py-3 gap-2",
  lg: "text-[14px] px-8 py-4 gap-2.5",
  xl: "text-[15px] px-10 py-5 gap-3",
  icon: "w-10 h-10 p-0 justify-center",
}

export interface FFButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: keyof typeof variantClasses
  size?: keyof typeof sizeClasses
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
  asChild?: boolean
  fullWidth?: boolean
}

const FFButton = React.forwardRef<HTMLButtonElement, FFButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      fullWidth,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "relative inline-flex items-center justify-center h-9",
          "font-body font-semibold",
          "border-0 outline-none cursor-pointer",
          "transition-colors duration-150",
          "select-none whitespace-nowrap",
          // Theme-aware shape (sharp by default, rounded/hex/bevel from active theme)
          "ff-shape-button",
          // Disabled
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          // Variants & Sizes
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        // Framer Motion micro-interactions
        whileTap={isDisabled ? {} : { scale: 0.96 }}
        whileHover={isDisabled ? {} : { y: -1 }}
        transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span
              className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              style={{ animation: "spin 0.7s linear infinite" }}
            />
          </motion.span>
        )}

        {/* Content */}
        <span
          className={cn(
            "inline-flex items-center gap-2",
            loading && "opacity-0"
          )}
        >
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </span>

        {/* Purple glow overlay on hover (primary only) */}
        {variant === "primary" && (
          <span
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
        )}
      </motion.button>
    )
  }
)
FFButton.displayName = "FFButton"

export { FFButton }

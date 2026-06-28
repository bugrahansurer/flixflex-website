"use client"

import * as React from "react"
import { cn, buildDescribedBy } from "@/lib/utils"

// ── Input ─────────────────────────────────────────
export interface FFInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: "default" | "filled" | "ghost"
}

const FFInput = React.forwardRef<HTMLInputElement, FFInputProps>(
  ({ label, error, hint, leftIcon, rightIcon, variant = "default", className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId

    const variantClasses = {
      default: "bg-[var(--surface)] border-[var(--border)] focus:border-[var(--ff-purple)]",
      filled: "bg-[var(--background-alt)] border-transparent focus:border-[var(--ff-purple)]",
      ghost: "bg-transparent border-transparent border-b-[var(--border)] rounded-none focus:border-b-[var(--ff-purple)]",
    }

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--foreground-muted)]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[var(--foreground-faint)] flex items-center">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "ff-shape-button w-full text-sm text-[var(--foreground)]",
              "placeholder:text-[var(--foreground-faint)]",
              "h-10 border outline-none rounded-none",
              "transition-all duration-150",
              "focus:shadow-[0_0_0_3px_var(--ff-purple-muted)]",
              error && "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]",
              variantClasses[variant],
              leftIcon ? "pl-10" : "pl-4",
              rightIcon ? "pr-10" : "pr-4",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={buildDescribedBy(inputId, !!error, !!hint)}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 text-[var(--foreground-faint)] flex items-center">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-[11px] text-red-500 flex items-center gap-1">
            <span>✕</span> {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-[11px] text-[var(--foreground-faint)]">{hint}</p>
        )}
      </div>
    )
  }
)
FFInput.displayName = "FFInput"

// ── Textarea ──────────────────────────────────────
export interface FFTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

const FFTextarea = React.forwardRef<HTMLTextAreaElement, FFTextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--foreground-muted)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "ff-shape-button w-full text-sm text-[var(--foreground)]",
            "placeholder:text-[var(--foreground-faint)]",
            "bg-[var(--surface)] border border-[var(--border)]",
            "h-9 px-4 py-2 outline-none rounded-none resize-y min-h-[120px]",
            "transition-all duration-150",
            "focus:border-[var(--ff-purple)] focus:shadow-[0_0_0_3px_var(--ff-purple-muted)]",
            error && "border-red-500 focus:border-red-500",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={buildDescribedBy(inputId, !!error, !!hint)}
          {...props}
        />
        {error && <p id={`${inputId}-error`} className="text-[11px] text-red-500">{error}</p>}
        {hint && !error && <p id={`${inputId}-hint`} className="text-[11px] text-[var(--foreground-faint)]">{hint}</p>}
      </div>
    )
  }
)
FFTextarea.displayName = "FFTextarea"

export { FFInput, FFTextarea }

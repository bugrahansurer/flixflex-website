"use client"

import * as React from "react"
import * as RxSelect from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "@/lib/icons"
import { cn, buildDescribedBy } from "@/lib/utils"

// ═══════════════════════════════════════════════════════════
// FFSelect — Brand-styled Radix Select
//
// Native <select> popup is browser-rendered and cannot be styled.
// This wrapper gives us a sharp, on-brand dropdown that matches
// FFInput visually + supports keyboard nav, screen readers, and
// react-hook-form via Controller.
//
// Usage:
//   <FFSelect value={v} onValueChange={setV} placeholder="Seç...">
//     <FFSelectItem value="a">A</FFSelectItem>
//     <FFSelectItem value="b">B</FFSelectItem>
//   </FFSelect>
// ═══════════════════════════════════════════════════════════

// ── Sizes ─────────────────────────────────────────────
const triggerSizes = {
  sm: "h-10  px-3  py-1.5 text-[12px]",
  md: "h-10 px-4  py-3   text-sm",
  lg: "h-10 px-5  py-3   text-[15px]",
} as const

// ── Trigger ───────────────────────────────────────────
export interface FFSelectProps
  extends Omit<RxSelect.SelectProps, "value" | "onValueChange"> {
  /** Selected value (controlled) */
  value?: string
  /** Change handler */
  onValueChange?: (value: string) => void
  /** Placeholder text shown when no value is selected */
  placeholder?: string
  /** Visual size */
  size?: keyof typeof triggerSizes
  /** Show as error state — also accepts an error message string */
  error?: boolean | string
  /** Inline hint text shown below the trigger */
  hint?: string
  /** Full width trigger (default true) */
  fullWidth?: boolean
  /** Trigger className override */
  triggerClassName?: string
  /** Trigger id (for label association) */
  id?: string
  /** Name (for form data — Radix mirrors this onto a hidden input) */
  name?: string
  /** Aria-label fallback if no <label htmlFor=...> */
  ariaLabel?: string
  children: React.ReactNode
}

function FFSelect({
  value,
  onValueChange,
  placeholder = "Seçin...",
  size = "md",
  error = false,
  hint,
  fullWidth = true,
  triggerClassName,
  id,
  name,
  ariaLabel,
  disabled,
  defaultValue,
  required,
  children,
  ...rootProps
}: FFSelectProps) {
  const generatedId = React.useId()
  const triggerId = id ?? generatedId
  const hasError = !!error
  const errorMessage = typeof error === "string" ? error : undefined

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "inline-flex")}>
      <RxSelect.Root
        value={value}
        onValueChange={onValueChange}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        name={name}
        {...rootProps}
      >
        <RxSelect.Trigger
          id={triggerId}
          aria-label={ariaLabel}
          aria-invalid={hasError}
          aria-describedby={buildDescribedBy(triggerId, hasError, !!hint)}
          className={cn(
            "ff-shape-button h-10 group inline-flex items-center justify-between gap-2",
            "bg-[var(--surface)] text-[var(--foreground)]",
            "border border-[var(--border)]",
            "outline-none transition-[border-color,box-shadow,background-color] duration-150",
            "data-[placeholder]:text-[var(--foreground-faint)]",
            "hover:border-[var(--border-strong)]",
            "focus:border-[var(--ff-purple)] focus:shadow-[0_0_0_3px_var(--ff-purple-muted)]",
            "data-[state=open]:border-[var(--ff-purple)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "rounded-none",
            triggerSizes[size],
            fullWidth && "w-full",
            hasError &&
            "border-[#dc2626] focus:border-[#dc2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]",
            triggerClassName
          )}
        >
          <RxSelect.Value placeholder={placeholder} />
          <RxSelect.Icon asChild>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={cn(
                "shrink-0 text-[var(--foreground-muted)]",
                "transition-transform duration-200",
                "group-data-[state=open]:rotate-180 group-data-[state=open]:text-[var(--ff-purple)]"
              )}
            />
          </RxSelect.Icon>
        </RxSelect.Trigger>

        <RxSelect.Portal>
          <RxSelect.Content
            position="popper"
            sideOffset={6}
            className={cn(
              "ff-shape-button z-[100] min-w-[var(--radix-select-trigger-width)] max-h-[60vh]",
              "overflow-hidden",
              "bg-[var(--surface-elevated)] text-[var(--foreground)]",
              "border border-[var(--border)] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)]",
              "rounded-none",
              // Animation
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
              "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-1",
              "data-[side=top]:slide-in-from-bottom-1"
            )}
          >
            {/* Subtle purple top accent bar */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--ff-purple)] to-transparent opacity-60"
            />

            <RxSelect.ScrollUpButton className="flex items-center justify-center h-7 text-[var(--foreground-muted)] bg-[var(--surface-elevated)] cursor-default">
              <ChevronUp size={14} />
            </RxSelect.ScrollUpButton>

            <RxSelect.Viewport className="p-1.5">
              {children}
            </RxSelect.Viewport>

            <RxSelect.ScrollDownButton className="flex items-center justify-center h-7 text-[var(--foreground-muted)] bg-[var(--surface-elevated)] cursor-default">
              <ChevronDown size={14} />
            </RxSelect.ScrollDownButton>
          </RxSelect.Content>
        </RxSelect.Portal>
      </RxSelect.Root>

      {errorMessage && (
        <p id={`${triggerId}-error`} className="text-[11px] text-red-500 flex items-center gap-1">
          <span>✕</span> {errorMessage}
        </p>
      )}
      {hint && !hasError && (
        <p id={`${triggerId}-hint`} className="text-[11px] text-[var(--foreground-faint)]">{hint}</p>
      )}
    </div>
  )
}

// ── Item ──────────────────────────────────────────────
interface FFSelectItemProps extends RxSelect.SelectItemProps {
  /** Optional helper text shown muted below the label */
  hint?: string
  /** Optional left-side icon */
  icon?: React.ReactNode
}

const FFSelectItem = React.forwardRef<
  React.ElementRef<typeof RxSelect.Item>,
  FFSelectItemProps
>(({ className, children, hint, icon, disabled, ...props }, ref) => {
  return (
    <RxSelect.Item
      ref={ref}
      disabled={disabled}
      className={cn(
        "relative flex items-start gap-2 cursor-pointer select-none",
        "px-3 py-2 pr-9 text-sm",
        "outline-none rounded-none",
        "transition-colors duration-100",
        "data-[highlighted]:bg-[rgb(var(--ff-purple)/0.1)] data-[highlighted]:text-[var(--ff-purple)]",
        "data-[state=checked]:text-[var(--ff-purple)] data-[state=checked]:font-medium",
        "data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="shrink-0 mt-0.5 text-[var(--foreground-muted)] group-data-[highlighted]:text-[var(--ff-purple)]">
          {icon}
        </span>
      )}
      <span className="flex flex-col gap-0.5 flex-1 min-w-0">
        <RxSelect.ItemText>{children}</RxSelect.ItemText>
        {hint && (
          <span className="text-[10px] text-[var(--foreground-faint)]">
            {hint}
          </span>
        )}
      </span>
      <RxSelect.ItemIndicator className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ff-purple)]">
        <Check size={14} strokeWidth={2.5} />
      </RxSelect.ItemIndicator>
    </RxSelect.Item>
  )
})
FFSelectItem.displayName = "FFSelectItem"

// ── Group + Label ─────────────────────────────────────
const FFSelectGroup = RxSelect.Group

const FFSelectLabel = React.forwardRef<
  React.ElementRef<typeof RxSelect.Label>,
  React.ComponentPropsWithoutRef<typeof RxSelect.Label>
>(({ className, ...props }, ref) => (
  <RxSelect.Label
    ref={ref}
    className={cn(
      "px-3 py-2 text-[10px] font-semibold",
      "text-[var(--foreground-faint)]",
      className
    )}
    {...props}
  />
))
FFSelectLabel.displayName = "FFSelectLabel"

// ── Separator ─────────────────────────────────────────
const FFSelectSeparator = React.forwardRef<
  React.ElementRef<typeof RxSelect.Separator>,
  React.ComponentPropsWithoutRef<typeof RxSelect.Separator>
>(({ className, ...props }, ref) => (
  <RxSelect.Separator
    ref={ref}
    className={cn("my-1 h-px bg-[var(--border)]", className)}
    {...props}
  />
))
FFSelectSeparator.displayName = "FFSelectSeparator"

export {
  FFSelect,
  FFSelectItem,
  FFSelectGroup,
  FFSelectLabel,
  FFSelectSeparator,
}

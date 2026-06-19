"use client"

import * as React from "react"
import { useTheme } from "@/components/shared/theme-provider"
import { Moon, Sun } from "@/lib/icons"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  size?: "sm" | "md"
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration mismatch guard
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return <div className={size === "sm" ? "w-8 h-8" : "w-9 h-9"} />

  const isDark = theme === "dark"
  const iconSize = size === "sm" ? 14 : 16

  return (
    <button
      onClick={() => {
        const newTheme = isDark ? "light" : "dark"
        setTheme(newTheme)
        toast.success(newTheme === "dark" ? "Tema değişti: Koyu" : "Tema değişti: Açık")
      }}
      aria-label={isDark ? "Toggle theme (currently dark)" : "Toggle theme (currently light)"}
      className={cn(
        "ff-shape-button relative flex items-center justify-center",
        "bg-foreground/10 border border-foreground/30 backdrop-blur-sm text-[var(--foreground-muted)]",
        "hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)]",
        "transition-all duration-200",
        size === "sm" ? "w-9 h-9" : "w-9 h-9",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Moon size={iconSize} /> : <Sun size={iconSize} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

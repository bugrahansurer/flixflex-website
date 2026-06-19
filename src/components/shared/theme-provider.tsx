"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

type Theme = "dark" | "light"

interface ThemeProviderProps {
  children: React.ReactNode
  /** Theme resolved on the server from the request cookie — passed as a prop
   *  so the client initial state matches the SSR-rendered HTML class exactly,
   *  avoiding any hydration mismatch. */
  serverTheme?: Theme
  enableSystem?: boolean
  storageKey?: string
  disableTransitionOnChange?: boolean
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: Theme
  themes: Theme[]
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)
const STORAGE_KEY = "theme"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year in seconds

/** Write theme to document.cookie so the server can read it on the next request. */
function writeThemeCookie(theme: Theme) {
  document.cookie = `theme=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

function applyTheme(resolved: Theme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

export function ThemeProvider({
  children,
  serverTheme = "dark",
  storageKey = STORAGE_KEY,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  // Seed from serverTheme so the initial client state matches what the server
  // rendered on <html className="...">. This eliminates the hydration mismatch
  // that would occur if we seeded from localStorage (which is unavailable on
  // the server and may differ from the cookie).
  const [theme, setThemeState] = React.useState<Theme>(serverTheme)
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")
  const activeTheme = isAdmin ? "light" : theme

  // After mount, if localStorage has a more-recent preference than the cookie
  // (e.g. user changed theme offline before cookie synced), honour it.
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null
      if (stored && stored !== serverTheme && (stored === "light" || stored === "dark")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hydration
        setThemeState(stored)
        writeThemeCookie(stored)
      }
    } catch {
      // localStorage unavailable — cookie value stands
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once on mount only

  React.useEffect(() => {
    let cleanup: (() => void) | undefined

    if (disableTransitionOnChange) {
      const style = document.createElement("style")
      style.appendChild(
        document.createTextNode(
          "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;transition:none!important}"
        )
      )
      document.head.appendChild(style)
      cleanup = () => {
        window.getComputedStyle(document.body)
        setTimeout(() => document.head.removeChild(style), 1)
      }
    }

    applyTheme(activeTheme)
    return cleanup
  }, [activeTheme, disableTransitionOnChange])

  // Sync across tabs via storage event
  React.useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        const next = e.newValue as Theme
        if (next === "light" || next === "dark") {
          setThemeState(next)
          writeThemeCookie(next)
        }
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [storageKey])

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next)
      // Persist to both cookie (server reads on next request) and localStorage
      // (cross-tab sync via storage event + offline fallback).
      writeThemeCookie(next)
      try {
        localStorage.setItem(storageKey, next)
      } catch {}
    },
    [storageKey]
  )

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme: activeTheme,
      setTheme,
      resolvedTheme: activeTheme,
      themes: ["light", "dark"],
    }),
    [activeTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    // Graceful fallback outside provider (e.g. during SSR before hydration)
    return {
      theme: "dark",
      setTheme: () => {},
      resolvedTheme: "dark",
      themes: ["light", "dark"],
    }
  }
  return ctx
}

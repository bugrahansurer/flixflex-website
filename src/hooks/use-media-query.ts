"use client"

import * as React from "react"

/**
 * SSR-safe hook that returns true when the given CSS media query matches.
 * Defaults to `false` on the server / before hydration.
 *
 * @example
 *   const isMobile = useMediaQuery("(max-width: 767px)")
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [query])

  return matches
}

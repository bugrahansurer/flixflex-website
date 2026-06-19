"use client"

import { useEffect, useState } from "react"

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number | null = null

    const update = () => {
      rafId = null
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const total = scrollHeight - clientHeight
      setProgress(total > 0 ? (scrollTop / total) * 100 : 0)
    }

    const onScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(update)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return { progress }
}

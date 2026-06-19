"use client"

import { useEffect, useState } from "react"

export function useMousePosition(elementRef?: React.RefObject<HTMLElement | null>) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [normalized, setNormalized] = useState({ x: 0, y: 0 }) // -1 to 1

  useEffect(() => {
    const target = elementRef?.current ?? window

    const handler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })

      if (elementRef?.current) {
        const rect = elementRef.current.getBoundingClientRect()
        setNormalized({
          x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
          y: ((e.clientY - rect.top)  / rect.height - 0.5) * 2,
        })
      } else {
        setNormalized({
          x: (e.clientX / window.innerWidth  - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        })
      }
    }

    target.addEventListener("mousemove", handler as EventListener)
    return () => target.removeEventListener("mousemove", handler as EventListener)
  }, [elementRef])

  return { position, normalized }
}

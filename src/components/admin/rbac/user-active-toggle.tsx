"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

interface UserActiveToggleProps {
  userId: string
  isActive: boolean
}

export function UserActiveToggle({ userId, isActive }: UserActiveToggleProps) {
  const router  = useRouter()
  const [value, setValue]   = React.useState(isActive)
  const [loading, setLoading] = React.useState(false)

  const toggle = async () => {
    setLoading(true)
    const next = !value
    setValue(next)

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      })
      if (!res.ok) {
        setValue(!next) // rollback
      } else {
        router.refresh()
      }
    } catch {
      setValue(!next) // rollback
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-checked={value}
      role="switch"
      title={value ? "Aktif — devre dışı bırakmak için tıklayın" : "Pasif — aktifleştirmek için tıklayın"}
      className="relative inline-flex h-5 w-9 flex-shrink-0 items-center transition-colors duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: value ? "var(--ff-purple)" : "var(--border)" }}
    >
      <span
        className="inline-block h-3.5 w-3.5 bg-white transform transition-transform duration-200"
        style={{ transform: value ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  )
}

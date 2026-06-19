"use client"

import * as React from "react"
import type { SessionUser } from "@/lib/auth/types"
import { AdminSidebar } from "./admin-sidebar"
import { AdminTopbar } from "./admin-topbar"

interface AdminLayoutShellProps {
  user: SessionUser
  siteLogo?: string
  logoHeight?: number
  children: React.ReactNode
}

export function AdminLayoutShell({ user, siteLogo, logoHeight, children }: AdminLayoutShellProps) {
  return (
    <div className="flex min-h-screen bg-[#F7F7F5] text-[var(--foreground)]">
      {/* Fixed left sidebar */}
      <AdminSidebar
        user={user}
        siteLogo={siteLogo}
        logoHeight={logoHeight}
      />

      {/* Main column — offset by sidebar width.
          will-change: margin lets the browser promote this layer and batch
          the margin reflow with the sidebar transform, reducing paint cost. */}
      <div
        className="flex flex-col flex-1 min-w-0"
      >
        {/* Sticky topbar */}
        <AdminTopbar user={user} />

        {/* Page content */}
        <main
          id="admin-content"
          className="flex-1 bg-[#F7F7F5]"
        >
          {children}
        </main>
      </div>
    </div>
  )
}

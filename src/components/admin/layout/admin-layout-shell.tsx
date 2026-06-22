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
  // Mobile drawer state. On desktop the sidebar is always visible (hover-expand);
  // below `lg` it slides in as an overlay drawer controlled from the topbar's menu button.
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-[#F7F7F5] text-[var(--foreground)]">
      {/* Left sidebar — persistent on desktop, overlay drawer on mobile */}
      <AdminSidebar
        user={user}
        siteLogo={siteLogo}
        logoHeight={logoHeight}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main column — offset by sidebar width on desktop, full width on mobile. */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Sticky topbar */}
        <AdminTopbar user={user} onMenuClick={() => setMobileOpen(true)} />

        {/* Page content */}
        <main id="admin-content" className="flex-1 bg-[#F7F7F5]">
          {children}
        </main>
      </div>
    </div>
  )
}

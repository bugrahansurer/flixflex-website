import type { Metadata } from "next"
import { KpiCards } from "@/components/admin/dashboard/kpi-cards"
import { QuickActions } from "@/components/admin/dashboard/quick-actions"
import { RecentActivity } from "@/components/admin/dashboard/recent-activity"
import { AiStatusWidget } from "@/components/admin/dashboard/ai-status-widget"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default function AdminDashboardPage() {
  return (
    <div className="px-6 md:px-10 py-8 space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-[#333333]">
          Dashboard
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Hoş geldin — FlixFlex yönetim paneline genel bakış
        </p>
      </div>

      {/* KPI row */}
      <KpiCards />

      {/* Quick actions + AI status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="ff-shape-container bg-[#f7f7f5] border border-[#E0E0E0] p-4 xl:col-span-2">
          <QuickActions />
        </div>
        <div>
          <AiStatusWidget />
        </div>
      </div>

      {/* Recent activity */}
      <RecentActivity />
    </div>
  )
}

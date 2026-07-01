import type { Metadata } from "next"
import { KpiCards } from "@/components/admin/dashboard/kpi-cards"
import { QuickActions } from "@/components/admin/dashboard/quick-actions"
import { RecentActivity } from "@/components/admin/dashboard/recent-activity"
import { AiStatusWidget } from "@/components/admin/dashboard/ai-status-widget"
import { VisitsPanel } from "@/components/admin/dashboard/visits-panel"
import { ContentStats } from "@/components/admin/dashboard/content-stats"
import { getDashboardData } from "@/lib/analytics/queries"

export const metadata: Metadata = {
  title: "Dashboard",
}

// Always render fresh — analytics figures are live.
export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="px-6 md:px-10 py-6 space-y-5">
      {/* Page header */}
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-xl font-extrabold text-[#333333]">Dashboard</h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Sitenin canlı ziyaret verileri ve içerik özeti
          </p>
        </div>
        <p className="text-[11px] text-[#999999]">
          Bugün <span className="font-semibold text-[var(--ff-purple)]">{data.visits.today.toLocaleString("tr-TR")}</span> ziyaret ·{" "}
          <span className="font-semibold text-[var(--ff-purple)]">{data.visits.activeNow}</span> şu an aktif
        </p>
      </div>

      {/* Visit KPIs */}
      <KpiCards visits={data.visits} />

      {/* Trend chart + top pages */}
      <VisitsPanel trend={data.trend} topPages={data.topPages} activeNow={data.visits.activeNow} />

      {/* Content counts strip */}
      <ContentStats counts={data.content} />

      {/* Quick actions + AI status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="ff-shape-container bg-[#f7f7f5] border border-[#E0E0E0] p-4 xl:col-span-2">
          <QuickActions />
        </div>
        <div>
          <AiStatusWidget />
        </div>
      </div>

      {/* Recent activity (real audit log) */}
      <RecentActivity items={data.recent} />
    </div>
  )
}

import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCan } from "@/lib/rbac/server-can"
import { getReportData } from "@/lib/analytics/queries"
import { ReportsClient } from "@/components/admin/reports/reports-client"

export const metadata: Metadata = {
  title: "Raporlar",
}

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  // Gate: needs analytics:read (Super Admin bypasses inside getCan).
  const can = await getCan()
  if (!can("analytics", "read")) redirect("/admin")

  const to = new Date()
  const from = new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000)
  const initial = await getReportData(from, to)

  return (
    <div className="px-6 md:px-10 py-6 space-y-5">
      <div>
        <p className="text-[11px] font-semibold text-[var(--ff-purple)] mb-1">Analitik</p>
        <h1 className="font-display text-xl font-extrabold text-[#333333]">Raporlar</h1>
        <p className="text-xs text-[#666666] mt-0.5">
          Gerçek ziyaret verileri — sayfa başına, trafik kaynağı, cihaz ve daha fazlası
        </p>
      </div>

      <ReportsClient initial={initial} />
    </div>
  )
}

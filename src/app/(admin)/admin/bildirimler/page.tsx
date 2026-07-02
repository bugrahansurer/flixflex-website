import type { Metadata } from "next"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { cn, formatRelativeTime } from "@/lib/utils"
import { humanizeAudit, initialsOf, resourceHref } from "@/lib/admin/activity-format"

export const metadata: Metadata = { title: "Bildirimler" }
export const dynamic = "force-dynamic"

export default async function BildirimlerPage() {
  const rows = prisma
    ? await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { user: { select: { name: true, username: true } } },
      })
    : []

  const items = rows.map((l) => ({
    id: l.id,
    text: humanizeAudit(l.action, l.resource),
    userName: l.user?.name || l.user?.username || "Sistem",
    initials: initialsOf(l.user?.name || l.user?.username),
    href: resourceHref(l.resource),
    createdAt: l.createdAt.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-4 md:px-8 py-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#333333] tracking-tight">
            Bildirimler
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Admin panelinde yapılan tüm işlemlerin kaydı (son 100).
          </p>
        </div>

        <div className="ff-shape-container ff-card p-0 overflow-hidden">
          {items.length === 0 ? (
            <div className="px-5 py-16 text-center text-[13px] text-[#888888]">
              Henüz kayıtlı bir aktivite yok.
            </div>
          ) : (
            <ul>
              {items.map((item) => {
                const body = (
                  <div
                    className={cn(
                      "flex items-center gap-3 px-5 py-3.5",
                      "border-b border-[#E0E0E0] last:border-b-0",
                      "hover:bg-[#f7f7f5] transition-colors duration-150"
                    )}
                  >
                    <span
                      className={cn(
                        "ff-shape-button w-8 h-8 shrink-0 flex items-center justify-center",
                        "text-[10px] font-bold text-white bg-[var(--ff-purple)]"
                      )}
                    >
                      {item.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[#333333] leading-tight truncate">
                        <span className="font-semibold">{item.userName}</span>{" "}
                        <span className="text-[#555555]">{item.text}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-[#888888] tabular-nums shrink-0">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                )
                return (
                  <li key={item.id}>
                    {item.href ? (
                      <Link href={item.href} className="block">{body}</Link>
                    ) : (
                      body
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

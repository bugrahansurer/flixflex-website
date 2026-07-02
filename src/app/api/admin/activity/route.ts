import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { humanizeAudit, initialsOf, resourceHref } from "@/lib/admin/activity-format"

export const dynamic = "force-dynamic"

// Admin bildirim paneli / bildirimler sayfası için son aktiviteleri döndürür.
// Gerçek-zamanlı his için istemci bunu belirli aralıkla poll eder.
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Yetkisiz." }, { status: 401 })
  }
  if (!prisma) {
    return NextResponse.json({ ok: true, items: [], latest: null })
  }

  const limitParam = Number(new URL(req.url).searchParams.get("limit"))
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20

  try {
    const rows = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { name: true, username: true } } },
    })

    const items = rows.map((l) => ({
      id: l.id,
      action: l.action,
      resource: l.resource,
      text: humanizeAudit(l.action, l.resource),
      userName: l.user?.name || l.user?.username || "Sistem",
      initials: initialsOf(l.user?.name || l.user?.username),
      href: resourceHref(l.resource),
      createdAt: l.createdAt.toISOString(),
    }))

    return NextResponse.json({
      ok: true,
      items,
      latest: items[0]?.createdAt ?? null,
    })
  } catch (err) {
    console.error("[api/admin/activity] error:", err)
    return NextResponse.json({ ok: true, items: [], latest: null })
  }
}

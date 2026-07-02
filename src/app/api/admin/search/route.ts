import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/rbac/permissions"
import { searchAdmin } from "@/lib/admin/search"

// Aranabilir kaynaklar — kullanıcının okuma izni olanlar filtrelenir.
const SEARCHABLE = ["portfolio", "services", "pages", "blog", "users", "roles", "messages"] as const

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Yetkisiz." }, { status: 401 })
  }

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) {
    return NextResponse.json({ ok: true, groups: [] })
  }

  const roleName = session.user.roleName ?? session.user.role
  const isSuperAdmin = roleName === "Super Admin"
  const perms = session.user.permissions ?? []

  const allowed = new Set(
    SEARCHABLE.filter((r) => isSuperAdmin || hasPermission(perms, r, "read")),
  )

  const groups = await searchAdmin(q, allowed)
  return NextResponse.json({ ok: true, groups })
}

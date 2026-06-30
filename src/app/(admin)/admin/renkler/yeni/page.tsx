// ═══════════════════════════════════════════════════════════
// FlixFlex — /admin/renkler/yeni → /admin/theme/yeni (tekilleştirme)
// ═══════════════════════════════════════════════════════════

import { redirect } from "next/navigation"

export default function RenklerYeniRedirect() {
  redirect("/admin/theme/yeni")
}

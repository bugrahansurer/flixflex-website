// ═══════════════════════════════════════════════════════════
// FlixFlex — /admin/renkler → /admin/theme (tekilleştirme)
// Renk paletleri tek bir canonical ağaçta (/admin/theme) yönetilir.
// Bu Türkçe URL geriye dönük uyumluluk için canonical'a yönlendirir.
// ═══════════════════════════════════════════════════════════

import { redirect } from "next/navigation"

export default function RenklerRedirect() {
  redirect("/admin/theme")
}

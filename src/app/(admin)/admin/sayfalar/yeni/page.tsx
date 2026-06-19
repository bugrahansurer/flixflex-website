// ═══════════════════════════════════════════════════════════
// FlixFlex Admin — New Page  /admin/sayfalar/yeni
// Server Component — renders client form
// ═══════════════════════════════════════════════════════════

import { NewPageForm } from "./new-page-form"

export default function YeniSayfaPage() {
  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--foreground)]">
          Yeni Sayfa
        </h1>
        <p className="text-xs text-[var(--foreground-muted)] mt-1">
          Yeni bir sayfa oluşturun ve Page Builder ile düzenleyin.
        </p>
      </div>

      <NewPageForm />
    </div>
  )
}

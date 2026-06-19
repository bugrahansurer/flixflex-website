import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "@/lib/icons"
import prisma from "@/lib/prisma"
import { PoliciesManager, type PolicyEntry } from "./policies-manager"

export const metadata: Metadata = {
  title: "Politikalar | FlixFlex Admin",
}

// Footer "Yasal" sütunundaki linklerle aynı slug'lar. Yeni bir politika
// eklemek istersen buraya ekle + footer-data.ts'deki Yasal sütununa link koy.
const LEGAL_PAGES: { slug: string; title: string }[] = [
  { slug: "gizlilik-politikasi",    title: "Gizlilik Politikası" },
  { slug: "kullanim-sartlari",      title: "Kullanım Şartları" },
  { slug: "cerez-politikasi",       title: "Çerez Politikası" },
  { slug: "kvkk-aydinlatma-metni",  title: "KVKK Aydınlatma Metni" },
]

async function getPolicies(): Promise<PolicyEntry[]> {
  if (!prisma) {
    return LEGAL_PAGES.map((l) => ({ slug: l.slug, defaultTitle: l.title, page: null }))
  }

  const pages = await prisma.page.findMany({
    where: { slug: { in: LEGAL_PAGES.map((l) => l.slug) } },
    select: { id: true, slug: true, title: true, sections: true, isPublished: true },
  })

  return LEGAL_PAGES.map((l) => {
    const p = pages.find((pg) => pg.slug === l.slug)
    return {
      slug: l.slug,
      defaultTitle: l.title,
      page: p
        ? {
            id: p.id,
            title: p.title,
            isPublished: p.isPublished,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sections: (p.sections as any) ?? [],
          }
        : null,
    }
  })
}

export default async function PolitikalarPage() {
  const policies = await getPolicies()

  return (
    <div className="px-6 md:px-10 py-8 md:py-12">
      {/* ── Breadcrumbs ────────────────────────── */}
      <nav className="mb-8 flex items-center gap-2 text-[11px] font-semibold text-[#666666]">
        <Link href="/admin/ayarlar" className="hover:text-[#FF4FD8] transition-colors">
          Ayarlar
        </Link>
        <span>/</span>
        <span className="text-[#666666]">Politikalar</span>
      </nav>

      {/* ── Header ────────────────────────────── */}
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#333333] mb-2">
            Yasal <span className="text-[#ff4fd8]">Politikalar</span>
          </h1>
          <p className="text-[#666666] text-sm max-w-xl">
            Footer&apos;daki &quot;Yasal&quot; bölümünde görünen politika sayfalarının
            içeriklerini buradan düzenle. Değişiklikler kaydedildiğinde sitede anında yayınlanır.
          </p>
        </div>
        <Link href="/admin/ayarlar" className="ff-btn bg-[#FF4FD8] text-white hover:bg-[#e041c0] text-[12px] h-10 px-4">
          <ArrowLeft size={14} className="mr-2" />
          Geri Dön
        </Link>
      </header>

      <PoliciesManager policies={policies} />
    </div>
  )
}

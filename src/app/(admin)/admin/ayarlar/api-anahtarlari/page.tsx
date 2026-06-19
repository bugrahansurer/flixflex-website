import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "@/lib/icons"
import { ApiKeysForm } from "@/components/admin/settings/api-keys-form"
import prisma from "@/lib/prisma"

export const metadata: Metadata = {
  title: "API Anahtarları",
}

export const dynamic = "force-dynamic"

export default async function ApiAnahtarlariPage() {
  const rows = prisma
    ? await prisma.apiKey.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, prefix: true, scopes: true, isActive: true, lastUsedAt: true, createdAt: true },
      })
    : []

  const initialKeys = rows.map((k) => ({
    ...k,
    lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
    createdAt: k.createdAt.toISOString(),
  }))

  return (
    <div className="px-6 md:px-10 py-8 md:py-12">
      <header className="mb-10">
        <Link
          href="/admin/ayarlar"
          className="inline-flex items-center gap-1 text-[12px] text-[#666666] hover:text-[#ff4fd8] transition-colors mb-2"
        >
          <ChevronLeft size={13} />
          Ayarlar&apos;a Geri Dön
        </Link>
        <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-[#333333] mb-3">
          API <span className="text-[#FF4FD8]">Anahtarları</span>
        </h1>
        <p className="text-[#666666] text-sm max-w-2xl leading-relaxed">
          Dış entegrasyonların FlixFlex API&apos;sine erişmesi için anahtar oluşturun.
          Anahtarlar yalnızca oluşturulduğunda bir kez gösterilir.
        </p>
      </header>

      <ApiKeysForm initialKeys={initialKeys} />
    </div>
  )
}

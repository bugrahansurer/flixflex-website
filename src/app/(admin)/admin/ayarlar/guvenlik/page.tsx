import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "@/lib/icons"
import { SecurityForm } from "@/components/admin/settings/security-form"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Güvenlik & 2FA",
}

export const dynamic = "force-dynamic"

export default async function GuvenlikPage() {
  const session = await auth()
  let enabled = false
  if (session?.user?.id && prisma) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true },
    })
    enabled = user?.twoFactorEnabled ?? false
  }

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
          Güvenlik <span className="text-[#FF4FD8]">&amp; 2FA</span>
        </h1>
        <p className="text-[#666666] text-sm max-w-2xl leading-relaxed">
          Hesabınızı iki adımlı doğrulama (TOTP) ile koruyun. Etkinleştirdiğinizde
          girişte şifrenize ek olarak kimlik doğrulama uygulamanızdan bir kod istenir.
        </p>
      </header>

      <SecurityForm initiallyEnabled={enabled} />
    </div>
  )
}

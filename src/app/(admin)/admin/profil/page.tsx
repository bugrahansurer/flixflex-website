import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { User, Shield, Mail, Clock, KeyRound } from "@/lib/icons"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import { ProfileForm } from "@/components/admin/profile/profile-form"
import { PasswordForm } from "@/components/admin/profile/password-form"

export const metadata: Metadata = {
  title: "Profil",
}

function initials(name: string | null, email: string): string {
  const src = (name?.trim().length ? name : email).trim()
  const parts = src.split(/\s+/).filter(Boolean)
  if (!parts.length) return "??"
  if (parts.length === 1) {
    const w = parts[0]
    return (w[0] + (w[1] ?? "")).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default async function ProfilPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/giris?callbackUrl=/admin/profil")
  if (!prisma) redirect("/giris?callbackUrl=/admin/profil")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      role: { select: { name: true } },
    },
  })

  if (!user) redirect("/giris")

  return (
    <div className="px-6 md:px-10 py-8 md:py-12">
      {/* ── Header ────────────────────────────── */}
      <header className="mb-10">
        <p className="text-[11px] font-semibold text-[var(--ff-purple)] mb-3">
          Profil
        </p>
        <h1 className="font-display text-xl md:text-2xl font-extrabold leading-tight tracking-tight text-[#666666] mb-2">
          Hesabını <span className="text-[#ff4fd8]">yönet</span>
        </h1>
        <p className="text-xs text-[#666666] text-base leading-relaxed">
          Kişisel bilgilerini ve şifreni buradan güncelle.
        </p>
      </header>

      {/* ── Identity card ─────────────────────── */}
      <section className="ff-shape-container ff-card mb-10 grid md:grid-cols-[auto_1fr] gap-6 items-start">
        {/* Avatar */}
        <div className="ff-shape-button w-10 h-10 flex items-center justify-center bg-[#ff4fd8]/10 border border-[#ff4fd8]/30 text-[#ff4fd8] font-display font-extrabold text-md tracking-tight">
          {initials(user.name, user.email)}
        </div>

        {/* Info grid */}
        <div className="items-center grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div>
              <div className="flex items-start gap-1">
                <User size={14} className="text-[#ff4fd8]" />
                <p className="font-bold text-[11px] text-[#666666] mb-0.5">
                  Ad Soyad
                </p>
              </div>
              <p className="text-[#333333] font-medium mt-1">
                {user.name ?? "—"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div>
              <div className="flex items-start gap-1">
                <Mail size={14} className="text-[#ff4fd8]" />
                <p className="font-bold text-[10px] text-[#666666] mb-0.5">
                  E-posta
                </p>
              </div>
              <p className="text-[#333333] font-medium break-all mt-1">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div>
              <div className="flex items-start gap-1">
                <Shield size={14} className="text-[#ff4fd8]" />
                <p className="font-bold text-[10px] text-[#666666] mb-0.5">
                  Rol
                </p>
              </div>
              <p className="text-[#333333] font-medium mt-1">
                {user.role.name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div>
              <div className="flex items-start gap-1">
                <Clock size={14} className="text-[#ff4fd8]" />
                <p className="font-bold text-[10px] text-[#666666] mb-0.5">
                  Son giriş
                </p>
              </div>
              <p className="text-[#333333] font-medium mt-1">
                {user.lastLogin
                  ? formatRelativeTime(user.lastLogin)
                  : "Henüz hiç"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form: Personal info ───────────────── */}
      <section className="ff-shape-container ff-card mb-10">
        <div className="flex items-center gap-2 mb-6">
          <User size={16} className="text-[#ff4fd8]" />
          <h2 className="font-display text-xl font-bold text-[#333333]">
            Kişisel Bilgiler
          </h2>
        </div>
        <ProfileForm
          initial={{
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }}
        />
      </section>

      {/* ── Form: Password ────────────────────── */}
      <section className="ff-shape-container ff-card mb-10">
        <div className="flex items-center gap-2 mb-6">
          <KeyRound size={16} className="text-[#ff4fd8]" />
          <h2 className="font-display text-xl font-bold text-[#333333]">
            Şifre Değiştir
          </h2>
        </div>
        <PasswordForm />
      </section>

      {/* ── Footer note ───────────────────────── */}
      <p className="text-xs text-[#666666]">
        Hesap oluşturuldu: {formatDate(user.createdAt)}
      </p>
    </div>
  )
}

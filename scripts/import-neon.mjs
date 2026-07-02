// ═══════════════════════════════════════════════════════════
// Eski Prisma Postgres dump'ını (old-dump.json) Neon'a aktarır.
// - Neon'daki SEED içeriği temizlenir (roller/izinler KORUNUR)
// - Gerçek veri orijinal ID'lerle geri yüklenir (FK/hiyerarşi korunur)
// - Kullanıcılar rol ADINA göre Neon rollerine eşlenir
// Çalıştırma: node scripts/import-neon.mjs
// ═══════════════════════════════════════════════════════════
import { readFileSync } from "fs"

// .env yükle (Neon DATABASE_URL)
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  if (line.trim().startsWith("#")) continue
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
  if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "")
}
const host = (process.env.DATABASE_URL || "").match(/@([^/]+)/)?.[1] || "?"
if (!/neon\.tech/.test(host)) { console.error("HATA: DATABASE_URL Neon değil! host:", host); process.exit(1) }
console.log("Hedef Neon host:", host)

const dump = JSON.parse(readFileSync("old-dump.json", "utf8"))
const { PrismaClient } = await import("@prisma/client")
const prisma = new PrismaClient()

const d = (s) => (s ? new Date(/[Z]|[+]\d\d:?\d\d$/.test(s) ? s : s + "Z") : null)
const arr = (x) => (Array.isArray(x) ? x : [])

try {
  // 1) Rol eşleme: eski roleId -> ad -> Neon roleId
  const neonRoles = await prisma.role.findMany()
  const neonRoleByName = Object.fromEntries(neonRoles.map((r) => [r.name, r.id]))
  const oldRoleName = Object.fromEntries(arr(dump.roles).map((r) => [r.id, r.name]))
  const mapRole = (oldId) => neonRoleByName[oldRoleName[oldId]] || neonRoleByName["Admin"] || neonRoles[0]?.id

  // 2) Seed içeriğini temizle (roller/izinler/analytics KORUNUR)
  console.log("Seed içeriği temizleniyor...")
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "pages","services","portfolio_items","blog_posts","site_settings","color_palettes","media","media_folders","appointments","contact_submissions","page_versions","_PortfolioServices" CASCADE`
  )

  // 3) color_palettes
  await prisma.colorPalette.createMany({ data: arr(dump.color_palettes).map((c) => ({
    id: c.id, name: c.name, description: c.description ?? null, isActive: !!c.isActive, isSystem: !!c.isSystem,
    createdBy: c.createdBy ?? null, colors: c.colors, settings: c.settings ?? {},
    fontDisplay: c.fontDisplay ?? "Syne", fontBody: c.fontBody ?? "DM Sans", createdAt: d(c.createdAt) ?? new Date(),
  })) })
  console.log("✓ color_palettes:", dump.color_palettes?.length ?? 0)

  // 4) site_settings
  await prisma.siteSetting.createMany({ data: arr(dump.site_settings).map((s) => ({
    id: s.id, key: s.key, value: s.value ?? "", type: s.type ?? "string",
  })) })
  console.log("✓ site_settings:", dump.site_settings?.length ?? 0)

  // 5) media_folders — önce kök (parentId null), sonra alt
  const folders = arr(dump.media_folders)
  const rootF = folders.filter((f) => !f.parentId), childF = folders.filter((f) => f.parentId)
  for (const grp of [rootF, childF]) {
    await prisma.mediaFolder.createMany({ data: grp.map((f) => ({
      id: f.id, name: f.name, parentId: f.parentId ?? null, createdAt: d(f.createdAt) ?? new Date(),
    })) })
  }
  console.log("✓ media_folders:", folders.length)

  // 6) media
  await prisma.media.createMany({ data: arr(dump.media).map((m) => ({
    id: m.id, title: m.title ?? null, type: m.type, mimeType: m.mimeType ?? null, size: m.size ?? null,
    url: m.url ?? "", thumbnail: m.thumbnail ?? null, muxUploadId: m.muxUploadId ?? null, muxAssetId: m.muxAssetId ?? null,
    muxPlaybackId: m.muxPlaybackId ?? null, muxStatus: m.muxStatus ?? null, width: m.width ?? null, height: m.height ?? null,
    duration: m.duration ?? null, folderId: m.folderId ?? null, blurDataUrl: m.blurDataUrl ?? null, createdAt: d(m.createdAt) ?? new Date(),
  })) })
  console.log("✓ media:", dump.media?.length ?? 0)

  // 7) services — önce parentId'siz oluştur, sonra parentId güncelle (self-ref)
  const services = arr(dump.services)
  await prisma.service.createMany({ data: services.map((s) => ({
    id: s.id, slug: s.slug, title: s.title, description: s.description ?? "", body: s.body ?? "", icon: s.icon ?? "Globe",
    features: arr(s.features), processSteps: s.processSteps ?? [], deliverables: arr(s.deliverables),
    isPublished: !!s.isPublished, order: s.order ?? 0, metaTitle: s.metaTitle ?? null, metaDescription: s.metaDescription ?? null,
    coverImage: s.coverImage ?? null, accentColor: s.accentColor ?? null, gradient: s.gradient ?? null,
    motionDesign: s.motionDesign ?? null, parentId: null, createdAt: d(s.createdAt) ?? new Date(),
  })) })
  for (const s of services.filter((x) => x.parentId)) {
    await prisma.service.update({ where: { id: s.id }, data: { parentId: s.parentId } })
  }
  console.log("✓ services:", services.length)

  // 8) portfolio_items
  await prisma.portfolioItem.createMany({ data: arr(dump.portfolio_items).map((p) => ({
    id: p.id, title: p.title, slug: p.slug, client: p.client ?? null, clientLogo: p.clientLogo ?? null,
    category: p.category ?? "", description: p.description ?? null, content: p.content ?? null, coverImage: p.coverImage ?? "",
    images: arr(p.images), tags: arr(p.tags), results: p.results ?? null, gradient: p.gradient ?? undefined,
    accentColor: p.accentColor ?? undefined, tall: !!p.tall, narrativeParagraphs: p.narrativeParagraphs ?? null,
    sidebarItems: p.sidebarItems ?? null, resultStats: p.resultStats ?? null, year: p.year ?? null,
    isPublished: !!p.isPublished, order: p.order ?? 0, createdAt: d(p.createdAt) ?? new Date(),
  })) })
  console.log("✓ portfolio_items:", dump.portfolio_items?.length ?? 0)

  // 9) portfolio↔service join (A=portfolio, B=service)
  for (const j of arr(dump.portfolio_services)) {
    await prisma.$executeRawUnsafe(`INSERT INTO "_PortfolioServices" ("A","B") VALUES ($1,$2) ON CONFLICT DO NOTHING`, j.A, j.B)
  }
  console.log("✓ portfolio_services:", dump.portfolio_services?.length ?? 0)

  // 10) pages
  await prisma.page.createMany({ data: arr(dump.pages).map((p) => ({
    id: p.id, slug: p.slug, title: p.title, description: p.description ?? null, sections: p.sections ?? [],
    isPublished: !!p.isPublished, publishedAt: d(p.publishedAt), metaTitle: p.metaTitle ?? null,
    metaDescription: p.metaDescription ?? null, ogImage: p.ogImage ?? null, createdAt: d(p.createdAt) ?? new Date(),
  })) })
  console.log("✓ pages:", dump.pages?.length ?? 0)

  // 11) blog_posts
  await prisma.blogPost.createMany({ data: arr(dump.blog_posts).map((b) => ({
    id: b.id, title: b.title, slug: b.slug, excerpt: b.excerpt ?? null, content: b.content ?? "",
    coverImage: b.coverImage ?? null, coverGradient: b.coverGradient ?? null, template: b.template ?? "classic",
    category: b.category ?? null, tags: arr(b.tags), readTime: b.readTime ?? 5, author: b.author ?? null,
    aiGenerated: !!b.aiGenerated, aiOutline: b.aiOutline ?? null, status: b.status ?? "draft", publishedAt: d(b.publishedAt),
    metaTitle: b.metaTitle ?? null, metaDescription: b.metaDescription ?? null, ogImage: b.ogImage ?? null, createdAt: d(b.createdAt) ?? new Date(),
  })) })
  console.log("✓ blog_posts:", dump.blog_posts?.length ?? 0)

  // 12) appointments
  await prisma.appointment.createMany({ data: arr(dump.appointments).map((a) => ({
    id: a.id, name: a.name, email: a.email, phone: a.phone ?? null, subject: a.subject ?? null, date: d(a.date) ?? new Date(),
    notes: a.notes ?? null, meetLink: a.meetLink ?? null, status: a.status ?? "pending", isRead: !!a.isRead, createdAt: d(a.createdAt) ?? new Date(),
  })) })
  console.log("✓ appointments:", dump.appointments?.length ?? 0)

  // 13) contact_submissions (varsa)
  if (arr(dump.contact_submissions).length) {
    await prisma.contactSubmission.createMany({ data: dump.contact_submissions.map((c) => ({
      id: c.id, name: c.name, email: c.email, company: c.company ?? null, service: c.service ?? null,
      message: c.message ?? "", isRead: !!c.isRead, createdAt: d(c.createdAt) ?? new Date(),
    })) })
  }
  console.log("✓ contact_submissions:", dump.contact_submissions?.length ?? 0)

  // 14) users — email'e göre upsert, roleId ad ile eşlenir
  for (const u of arr(dump.users)) {
    const roleId = mapRole(u.roleId)
    const base = {
      username: u.username, name: u.name ?? null, password: u.password, image: u.image ?? null,
      isActive: u.isActive !== false, lastLogin: d(u.lastLogin), roleId,
      twoFactorEnabled: !!u.twoFactorEnabled, twoFactorSecret: u.twoFactorSecret ?? null,
      twoFactorBackupCodes: arr(u.twoFactorBackupCodes), twoFactorLastUsedStep: u.twoFactorLastUsedStep ?? null,
      twoFactorPendingSecret: u.twoFactorPendingSecret ?? null,
    }
    await prisma.user.upsert({
      where: { email: u.email },
      update: base,
      create: { id: u.id, email: u.email, ...base, createdAt: d(u.createdAt) ?? new Date() },
    })
  }
  console.log("✓ users:", dump.users?.length ?? 0)

  console.log("\n✅ İçe aktarma tamamlandı!")
} catch (e) {
  console.error("\n❌ HATA:", e.message || e)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}

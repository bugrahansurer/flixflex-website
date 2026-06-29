// Mevcut kullanıcılara isimlerinden username üretir. İdempotent — yalnızca
// username'i boş/null olanları doldurur. Çalıştır: npx tsx scripts/backfill-usernames.ts
import { PrismaClient } from "@prisma/client"
import { generateUsername, ensureUniqueUsername } from "../src/lib/username"

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: { OR: [{ username: null }, { username: "" }] },
    select: { id: true, name: true, email: true },
  })
  console.log(`${users.length} kullanıcıya username üretilecek`)

  for (const u of users) {
    const base = generateUsername(u.name, u.email)
    const username = await ensureUniqueUsername(base, async (candidate) => {
      const found = await prisma.user.findUnique({
        where: { username: candidate },
        select: { id: true },
      })
      return !!found
    })
    await prisma.user.update({ where: { id: u.id }, data: { username } })
    console.log(`  ${u.name ?? u.email} → ${username}`)
  }
  console.log("Tamamlandı.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

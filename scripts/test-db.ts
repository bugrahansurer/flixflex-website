import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"
import path from "path"

// Load env variables if not set
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Checking database connection...")
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Defined (masked)" : "NOT DEFINED")
    
    console.log("Querying appointments count...")
    const count = await prisma.appointment.count()
    console.log("Appointments count:", count)

    console.log("Querying blocked slots count...")
    const blockCount = await prisma.blockedSlot.count()
    console.log("Blocked slots count:", blockCount)

    console.log("All OK!")
  } catch (err) {
    console.error("Prisma error details:", err)
  } finally {
    await prisma.$disconnect()
  }
}

main()

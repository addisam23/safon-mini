const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  try {
    // Create default admin account
    const hashedPassword = await bcrypt.hash("Addis2379", 12)

    const admin = await prisma.user.upsert({
      where: { email: "addisaschale3@gmail.com" },
      update: {
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      },
      create: {
        id: "admin-default-001",
        email: "addisaschale3@gmail.com",
        name: "Default Admin",
        password: hashedPassword,
        role: "admin",
        referralCode: "ADMIN001",
        isVerified: true,
        status: "active",
      },
    })

    console.log("✅ Default admin created:", admin.email)

    // Create backup admin
    const backupAdmin = await prisma.user.upsert({
      where: { email: "admin@safon.com" },
      update: {},
      create: {
        id: "admin-backup-002",
        email: "admin@safon.com",
        name: "Backup Admin",
        password: await bcrypt.hash("admin123", 12),
        role: "admin",
        referralCode: "ADMIN002",
        isVerified: true,
        status: "active",
      },
    })

    console.log("✅ Backup admin created:", backupAdmin.email)

    // Create sample users for testing (optional)
    if (process.env.NODE_ENV === "development") {
      const sampleUsers = [
        {
          id: "user-001",
          email: "john@example.com",
          name: "John Doe",
          referralCode: "USER001",
          balance: 2500.0,
          totalEarnings: 3200.0,
          isVerified: true,
        },
        {
          id: "user-002",
          email: "sara@example.com",
          name: "Sara Smith",
          referralCode: "USER002",
          balance: 1800.0,
          totalEarnings: 2400.0,
          isVerified: true,
        },
      ]

      for (const userData of sampleUsers) {
        const user = await prisma.user.upsert({
          where: { email: userData.email },
          update: {},
          create: {
            ...userData,
            password: await bcrypt.hash("password123", 12),
            role: "user",
            status: "active",
          },
        })
        console.log("✅ Sample user created:", user.email)
      }
    }

    console.log("🎉 Database seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import type { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { generateReferralCode, validateEmail, sanitizeInput } from "./utils"

// Global Prisma client with proper error handling
let prisma: PrismaClient | null = null

async function getPrismaClient() {
  if (!prisma) {
    try {
      const { PrismaClient } = await import("@prisma/client")
      prisma = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
        errorFormat: "pretty",
      })

      await prisma.$connect()
      console.log("Database connected successfully")
    } catch (error) {
      console.error("Failed to initialize Prisma client:", error)
      throw new Error("Database connection failed")
    }
  }
  return prisma
}

// Enhanced error handling wrapper
async function safeDbOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  if (typeof window === "undefined" && !process.env.DATABASE_URL) {
    console.warn("Database operation skipped - no DATABASE_URL")
    return fallback
  }

  try {
    await getPrismaClient()
    return await operation()
  } catch (error) {
    console.error("Database operation failed:", error)

    if (error instanceof Error) {
      if (error.message.includes("P2002")) {
        throw new Error("A record with this information already exists")
      }
      if (error.message.includes("P2025")) {
        throw new Error("Record not found")
      }
      if (error.message.includes("P2003")) {
        throw new Error("Foreign key constraint failed")
      }
    }

    return fallback
  }
}

// User functions
export async function getUserByEmail(email: string) {
  if (!email || !validateEmail(email)) {
    throw new Error("Invalid email format")
  }

  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    return await client.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        referralCode: true,
        isVerified: true,
        status: true,
      },
    })
  }, null)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false
  }

  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Password verification failed:", error)
    return false
  }
}

export async function createDefaultAdmin() {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()

    try {
      const existingAdmin = await client.user.findUnique({
        where: { email: "addisaschale3@gmail.com" },
      })

      if (existingAdmin) {
        console.log("Default admin already exists")
        return existingAdmin
      }

      const hashedPassword = await bcrypt.hash("Addis2379", 12)

      const admin = await client.user.create({
        data: {
          id: `admin-default-${Date.now()}`,
          email: "addisaschale3@gmail.com",
          name: "Default Admin",
          password: hashedPassword,
          role: "admin",
          referralCode: "ADMIN001",
          isVerified: true,
        },
      })

      console.log("Default admin created successfully")
      return admin
    } catch (error) {
      console.error("Error creating default admin:", error)
      throw error
    }
  }, null)
}

export async function createUserWithPaymentProof(data: {
  name: string
  email: string
  phone: string
  telegramUsername?: string | null
  password: string
  imageUrl: string
}) {
  if (!data.name || !data.email || !data.phone || !data.password || !data.imageUrl) {
    throw new Error("All required fields must be provided")
  }

  if (!validateEmail(data.email)) {
    throw new Error("Invalid email format")
  }

  if (data.phone.length < 10) {
    throw new Error("Invalid phone number")
  }

  return await safeDbOperation(async () => {
    const client = await getPrismaClient()

    const existingUser = await client.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    let referralCode: string
    let attempts = 0
    do {
      referralCode = generateReferralCode()
      const existing = await client.user.findUnique({ where: { referralCode } })
      if (!existing) break
      attempts++
    } while (attempts < 5)

    if (attempts >= 5) {
      throw new Error("Failed to generate unique referral code")
    }

    const result = await client.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: sanitizeInput(data.name),
          email: data.email.toLowerCase(),
          password: data.password,
          role: "user",
          referralCode,
          telegramUsername: data.telegramUsername ? sanitizeInput(data.telegramUsername) : null,
          isVerified: false,
          status: "active",
        },
      })

      const paymentProof = await tx.paymentProof.create({
        data: {
          userId: user.id,
          imageUrl: data.imageUrl,
          status: "pending",
        },
      })

      return { userId: user.id, paymentProofId: paymentProof.id }
    })

    return result
  }, null)
}

export async function getUserByIdWithStats(userId: string) {
  if (!userId) {
    throw new Error("User ID is required")
  }

  return await safeDbOperation(async () => {
    const client = await getPrismaClient()

    const user = await client.user.findUnique({
      where: { id: userId },
      include: {
        referrals: {
          select: {
            id: true,
            status: true,
            reward: true,
            createdAt: true,
            referred: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        withdrawRequests: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) return null

    const successfulReferrals = user.referrals.filter((r) => r.status === "completed").length
    const pendingReferrals = user.referrals.filter((r) => r.status === "pending").length

    return {
      ...user,
      successfulReferrals,
      pendingReferrals,
    }
  }, null)
}

export async function getUserByReferralCode(referralCode: string) {
  if (!referralCode) {
    throw new Error("Referral code is required")
  }

  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    return await client.user.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        isVerified: true,
      },
    })
  }, null)
}

export async function createReferral(data: {
  referrerId: string
  referredId: string
  status: string
  reward: number
}) {
  if (!data.referrerId || !data.referredId) {
    throw new Error("Referrer and referred user IDs are required")
  }

  if (data.referrerId === data.referredId) {
    throw new Error("Users cannot refer themselves")
  }

  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    try {
      return await client.referral.create({ data })
    } catch (error: any) {
      if (error?.code === "P2002") {
        console.log("Referral relationship already exists")
        return null
      }
      throw error
    }
  }, null)
}

export async function createAdminUser(data: {
  name: string
  email: string
  password: string
}) {
  if (!data.name || !data.email || !data.password) {
    throw new Error("All fields are required")
  }

  if (!validateEmail(data.email)) {
    throw new Error("Invalid email format")
  }

  if (data.password.length < 6) {
    throw new Error("Password must be at least 6 characters long")
  }

  return await safeDbOperation(async () => {
    const client = await getPrismaClient()

    const existingUser = await client.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    const referralCode = `ADMIN${Date.now().toString().slice(-6)}`
    const hashedPassword = await bcrypt.hash(data.password, 12)

    return await client.user.create({
      data: {
        name: sanitizeInput(data.name),
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: "admin",
        referralCode,
        isVerified: true,
        status: "active",
      },
    })
  }, null)
}

export async function getAdminStats() {
  return await safeDbOperation(
    async () => {
      const client = await getPrismaClient()

      try {
        const [totalUsers, activeReferrals, totalPayouts, recentActivities] = await Promise.allSettled([
          client.user.count({ where: { role: "user" } }),
          client.referral.count({ where: { status: "completed" } }),
          client.withdrawRequest.aggregate({
            where: { status: "completed" },
            _sum: { amount: true },
          }),
          client.referral.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              referrer: { select: { name: true, email: true } },
              referred: { select: { name: true, email: true } },
            },
          }),
        ])

        return {
          totalUsers: totalUsers.status === "fulfilled" ? totalUsers.value : 0,
          activeReferrals: activeReferrals.status === "fulfilled" ? activeReferrals.value : 0,
          totalPayouts: totalPayouts.status === "fulfilled" ? totalPayouts.value._sum.amount || 0 : 0,
          recentActivities:
            recentActivities.status === "fulfilled"
              ? recentActivities.value.map((activity) => ({
                  user: activity.referrer?.name || activity.referrer?.email || "Unknown User",
                  activity: "Referral Signup",
                  date: activity.createdAt.toLocaleDateString(),
                  status: activity.status === "completed" ? "Completed" : "Pending",
                }))
              : [],
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error)
        return {
          totalUsers: 0,
          activeReferrals: 0,
          totalPayouts: 0,
          recentActivities: [],
        }
      }
    },
    {
      totalUsers: 0,
      activeReferrals: 0,
      totalPayouts: 0,
      recentActivities: [],
    },
  )
}

export async function getAllUsers() {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    try {
      const users = await client.user.findMany({
        where: { role: "user" },
        select: {
          id: true,
          name: true,
          email: true,
          telegramUsername: true,
          createdAt: true,
          status: true,
          isVerified: true,
          balance: true,
          totalEarnings: true,
          referralCode: true,
        },
        orderBy: { createdAt: "desc" },
      })

      return users.map((user) => ({
        id: user.id,
        name: user.name || "Unknown",
        email: user.email || "No email",
        telegram: user.telegramUsername || "Not provided",
        joinDate: user.createdAt ? user.createdAt.toLocaleDateString() : "Unknown",
        status: user.status || "Active",
        isVerified: user.isVerified || false,
        balance: user.balance || 0,
        totalEarnings: user.totalEarnings || 0,
        referralCode: user.referralCode,
      }))
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  }, [])
}

export async function getAllAdmins() {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    try {
      const admins = await client.user.findMany({
        where: { role: "admin" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          status: true,
          isVerified: true,
        },
        orderBy: { createdAt: "desc" },
      })

      return admins.map((admin) => ({
        id: admin.id,
        name: admin.name || "Unknown",
        email: admin.email,
        joinDate: admin.createdAt.toLocaleDateString(),
        status: admin.status || "Active",
        isVerified: admin.isVerified || false,
      }))
    } catch (error) {
      console.error("Error fetching admins:", error)
      return []
    }
  }, [])
}

export async function getAllReferrals() {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    try {
      const referrals = await client.user.findMany({
        where: { role: "user" },
        include: {
          referrals: true,
          _count: {
            select: {
              referrals: true,
            },
          },
        },
      })

      return referrals.map((user) => ({
        user: user.name || user.email,
        total: user._count.referrals,
        successful: user.referrals.filter((r) => r.status === "completed").length,
        pending: user.referrals.filter((r) => r.status === "pending").length,
        earned: user.totalEarnings || 0,
        status: user.status || "Active",
      }))
    } catch (error) {
      console.error("Error fetching referrals:", error)
      return []
    }
  }, [])
}

export async function createWithdrawRequest(data: {
  userId: string
  method: string
  amount: number
  accountInfo: string
  status: string
}) {
  if (!data.userId || !data.method || !data.amount || !data.accountInfo) {
    throw new Error("All fields are required")
  }

  if (data.amount <= 0) {
    throw new Error("Amount must be greater than 0")
  }

  if (data.amount < 10) {
    throw new Error("Minimum withdrawal amount is 10 ETB")
  }

  return await safeDbOperation(async () => {
    const client = await getPrismaClient()

    const user = await client.user.findUnique({
      where: { id: data.userId },
      select: { balance: true },
    })

    if (!user) {
      throw new Error("User not found")
    }

    if ((user.balance || 0) < data.amount) {
      throw new Error("Insufficient balance")
    }

    return await client.withdrawRequest.create({
      data: {
        ...data,
        accountInfo: sanitizeInput(data.accountInfo),
      },
    })
  }, null)
}

export async function getUserPaymentProof(userId: string) {
  if (!userId) {
    throw new Error("User ID is required")
  }

  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    return await client.paymentProof.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })
  }, null)
}

export async function createPaymentProof(data: {
  userId: string
  imageUrl: string
  status: string
}) {
  if (!data.userId || !data.imageUrl) {
    throw new Error("User ID and image URL are required")
  }

  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    return await client.paymentProof.create({ data })
  }, null)
}

export async function getAllPaymentProofs() {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    try {
      return await client.paymentProof.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } catch (error) {
      console.error("Error fetching payment proofs:", error)
      return []
    }
  }, [])
}

export async function updatePaymentProofStatus(data: {
  proofId: string
  status: string
  adminId: string
  adminNote?: string
}) {
  if (!data.proofId || !data.status || !data.adminId) {
    throw new Error("Proof ID, status, and admin ID are required")
  }

  if (!["approved", "rejected", "pending"].includes(data.status)) {
    throw new Error("Invalid status")
  }

  return await safeDbOperation(async () => {
    const client = await getPrismaClient()

    return await client.$transaction(async (tx) => {
      const updatedProof = await tx.paymentProof.update({
        where: { id: data.proofId },
        data: {
          status: data.status,
          adminId: data.adminId,
          adminNote: data.adminNote ? sanitizeInput(data.adminNote) : null,
          updatedAt: new Date(),
        },
        include: {
          user: true,
        },
      })

      if (data.status === "approved" && updatedProof.user) {
        await tx.user.update({
          where: { id: updatedProof.userId },
          data: {
            isVerified: true,
            balance: {
              increment: 50,
            },
            totalEarnings: {
              increment: 50,
            },
          },
        })
      }

      return updatedProof
    })
  }, null)
}

export async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}

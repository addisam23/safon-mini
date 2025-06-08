import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import {
  getAdminStats,
  getAllUsers,
  getAllReferrals,
  getAllPaymentProofs,
  getAllAdmins,
  createDefaultAdmin,
} from "@/lib/database"
import AdminDashboard from "@/components/admin-dashboard"
import { ErrorBoundary } from "@/components/error-boundary"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      redirect("/auth/admin-signin")
    }

    try {
      await createDefaultAdmin()
    } catch (error) {
      console.error("Failed to create default admin:", error)
    }

    const [stats, users, referrals, paymentProofs, admins] = await Promise.allSettled([
      getAdminStats(),
      getAllUsers(),
      getAllReferrals(),
      getAllPaymentProofs(),
      getAllAdmins(),
    ])

    const safeStats =
      stats.status === "fulfilled"
        ? stats.value
        : {
            totalUsers: 0,
            activeReferrals: 0,
            totalPayouts: 0,
            recentActivities: [],
          }

    const safeUsers = users.status === "fulfilled" ? users.value : []
    const safeReferrals = referrals.status === "fulfilled" ? referrals.value : []
    const safePaymentProofs = paymentProofs.status === "fulfilled" ? paymentProofs.value : []
    const safeAdmins = admins.status === "fulfilled" ? admins.value : []

    return (
      <ErrorBoundary>
        <AdminDashboard
          stats={safeStats}
          users={safeUsers}
          referrals={safeReferrals}
          paymentProofs={safePaymentProofs}
          admins={safeAdmins}
        />
      </ErrorBoundary>
    )
  } catch (error) {
    console.error("Admin page error:", error)
    redirect("/auth/admin-signin?error=system")
  }
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { getServerSession } = await import("next-auth")
    const { authOptions } = await import("@/lib/auth")
    const { updatePaymentProofStatus } = await import("@/lib/database")

    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const body = await request.json()
    const { proofId, status, adminNote } = body

    if (!proofId || typeof proofId !== "string" || proofId.trim().length === 0) {
      return NextResponse.json({ error: "Invalid proof ID" }, { status: 400 })
    }

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be 'approved' or 'rejected'" }, { status: 400 })
    }

    if (adminNote && (typeof adminNote !== "string" || adminNote.length > 500)) {
      return NextResponse.json({ error: "Admin note must be a string with maximum 500 characters" }, { status: 400 })
    }

    const updatedProof = await updatePaymentProofStatus({
      proofId: proofId.trim(),
      status,
      adminId: session.user.id,
      adminNote: adminNote?.trim() || null,
    })

    if (!updatedProof) {
      return NextResponse.json({ error: "Payment proof not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      proof: {
        id: updatedProof.id,
        status: updatedProof.status,
        adminNote: updatedProof.adminNote,
        userId: updatedProof.userId,
      },
      message: `Payment proof ${status} successfully`,
    })
  } catch (error) {
    console.error("Approval error:", error)

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: "Payment proof not found" }, { status: 404 })
      }
      if (error.message.includes("Invalid")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}

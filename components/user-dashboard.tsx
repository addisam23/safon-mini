"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Share2, Wallet, Users, Clock, CheckCircle, MessageCircle, Phone, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import WithdrawModal from "./withdraw-modal"
import { LoadingSpinner } from "./loading-spinner"

interface UserDashboardProps {
  user: any
}

export default function UserDashboard({ user }: UserDashboardProps) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [referralLink, setReferralLink] = useState("")

  useEffect(() => {
    if (user) {
      setReferralLink(`${window.location.origin}/join/${user.referralCode || "UNKNOWN"}`)
      setIsLoading(false)
    }
  }, [user])

  // Enhanced loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast({
        title: "Success",
        description: "Referral link copied to clipboard!",
      })
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = referralLink
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
        toast({
          title: "Success",
          description: "Referral link copied to clipboard!",
        })
      } catch (fallbackError) {
        toast({
          title: "Error",
          description: "Failed to copy link. Please copy manually.",
          variant: "destructive",
        })
      }
      document.body.removeChild(textArea)
    }
  }

  const shareToTelegram = () => {
    const text = encodeURIComponent(`🎉 Join Safon and start earning ETB! Use my referral link: ${referralLink}`)
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, "_blank")
  }

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`🎉 Join Safon and start earning ETB! Use my referral link: ${referralLink}`)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  const shareGeneric = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Safon",
          text: "Join Safon and start earning ETB!",
          url: referralLink,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyReferralLink()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Safon</h1>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="font-bold">{user.name?.[0]?.toUpperCase() || "U"}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">Welcome {user.name || "User"}! 👋</h2>
            <p className="text-muted-foreground mb-4">Your hub for managing referrals and earnings</p>
            {!user.isVerified && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 text-sm">
                  Account verification pending. Some features may be limited.
                </span>
              </div>
            )}
            <div className="w-16 h-1 bg-blue-600 rounded mt-4"></div>
          </CardContent>
        </Card>

        {/* Referral Link Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Share this link to invite others and earn 50 ETB per successful referral
            </p>

            <div className="relative bg-blue-50 dark:bg-blue-950/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium pr-20 break-all">{referralLink}</p>
              <Button size="sm" onClick={copyReferralLink} className="absolute right-3 top-1/2 -translate-y-1/2">
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" onClick={shareToTelegram} className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Telegram
              </Button>
              <Button variant="outline" onClick={shareToWhatsApp} className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button variant="outline" onClick={shareGeneric} className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Referral Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Track your referral progress and earnings</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 p-4 rounded-lg text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{user.successfulReferrals || 0}</div>
                <div className="text-sm text-muted-foreground">Successful Referrals</div>
                <div className="text-xs text-green-600 mt-1">
                  +{((user.successfulReferrals || 0) * 50).toFixed(0)} ETB earned
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 p-4 rounded-lg text-center">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{user.pendingReferrals || 0}</div>
                <div className="text-sm text-muted-foreground">Pending Referrals</div>
                <div className="text-xs text-yellow-600 mt-1">
                  +{((user.pendingReferrals || 0) * 50).toFixed(0)} ETB potential
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Your Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Manage your earnings and make withdrawals</p>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-8"></div>
              <div className="relative">
                <p className="text-green-100 mb-2">Available for withdrawal</p>
                <div className="text-4xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">ETB</span>
                  <span>{(user.balance || 0).toFixed(2)}</span>
                </div>
                <div className="text-sm text-green-100 mb-6">
                  Total Earnings: ETB {(user.totalEarnings || 0).toFixed(2)}
                </div>
                <Button
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full bg-white text-green-600 hover:bg-green-50"
                  disabled={!user.isVerified || (user.balance || 0) < 10}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {!user.isVerified
                    ? "Verification Required"
                    : (user.balance || 0) < 10
                      ? "Minimum 10 ETB Required"
                      : "Withdraw Funds"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channel Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Join Our Community
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">Connect with fellow Safon users, get tips, and stay updated</p>
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Safon Community</h3>
            <p className="text-muted-foreground mb-6">
              Get support, share experiences, and learn from other successful referrers.
            </p>
            <Button className="w-full" onClick={() => window.open("https://t.me/safon_community", "_blank")}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Join Telegram Channel
            </Button>
          </CardContent>
        </Card>
      </div>

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        balance={user.balance || 0}
        userId={user.id}
      />
    </div>
  )
}

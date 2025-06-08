"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Upload, Camera, X, Clock, XCircle, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "./loading-spinner"

export default function PaymentVerificationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    telegramUsername: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<{
    status: string
    message: string
    userId?: string
  } | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const error = urlParams.get("error")
      const status = urlParams.get("status")

      if (error === "rejected") {
        setSubmissionStatus({
          status: "rejected",
          message: "Your payment verification was rejected. Please submit a new payment proof.",
        })
      } else if (error === "system") {
        toast({
          title: "System Error",
          description: "A system error occurred. Please try again.",
          variant: "destructive",
        })
      } else if (status === "pending") {
        setSubmissionStatus({
          status: "pending",
          message: "Your payment verification is still being reviewed. Please wait for admin approval.",
        })
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim() || formData.name.length < 2) {
      toast({
        title: "Error",
        description: "Name must be at least 2 characters long",
        variant: "destructive",
      })
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    const phoneRegex = /^\+?[1-9]\d{8,14}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      return false
    }

    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please upload a payment screenshot",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleFileSelect = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please select a JPEG, PNG, or WebP image file",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsUploading(true)

    try {
      const submitFormData = new FormData()
      submitFormData.append("file", selectedFile!)
      submitFormData.append("name", formData.name.trim())
      submitFormData.append("email", formData.email.toLowerCase().trim())
      submitFormData.append("phone", formData.phone.trim())
      submitFormData.append("telegramUsername", formData.telegramUsername.trim())

      const response = await fetch("/api/submit-payment-verification", {
        method: "POST",
        body: submitFormData,
      })

      const data = await response.json()

      if (response.ok) {
        setSubmissionStatus({
          status: "success",
          message: "Payment verification submitted successfully! Please wait for admin approval.",
          userId: data.userId,
        })
        toast({
          title: "Success",
          description: "Payment verification submitted successfully!",
        })
      } else {
        throw new Error(data.error || "Submission failed")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit payment verification",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const checkStatus = async () => {
    if (!submissionStatus?.userId) return

    setIsCheckingStatus(true)

    try {
      const response = await fetch(`/api/check-verification-status?userId=${submissionStatus.userId}`)
      const data = await response.json()

      if (response.ok) {
        if (data.status === "approved") {
          toast({
            title: "Approved!",
            description: "Your payment has been verified. Redirecting to dashboard...",
          })
          setTimeout(() => {
            router.push(`/dashboard?userId=${submissionStatus.userId}`)
          }, 2000)
        } else if (data.status === "rejected") {
          setSubmissionStatus({
            status: "rejected",
            message:
              data.adminNote || "Payment verification was rejected. Please try again with a valid payment screenshot.",
          })
        } else {
          toast({
            title: "Status",
            description: "Your verification is still pending review.",
          })
        }
      } else {
        throw new Error(data.error || "Failed to check status")
      }
    } catch (error) {
      console.error("Error checking status:", error)
      toast({
        title: "Error",
        description: "Failed to check status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingStatus(false)
    }
  }

  if (submissionStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative">
              <h1 className="text-3xl font-bold tracking-wide">Safon</h1>
              <p className="text-slate-200 mt-2">Payment Verification Status</p>
            </div>
          </CardHeader>

          <CardContent className="p-6 text-center">
            <div className="mb-6">
              {submissionStatus.status === "success" && (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-green-600" />
                </div>
              )}
              {submissionStatus.status === "pending" && (
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-yellow-600" />
                </div>
              )}
              {submissionStatus.status === "rejected" && (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {submissionStatus.status === "success" && "Verification Submitted"}
              {submissionStatus.status === "pending" && "Verification Pending"}
              {submissionStatus.status === "rejected" && "Verification Rejected"}
            </h2>

            <p className="text-muted-foreground mb-6">{submissionStatus.message}</p>

            <div className="space-y-3">
              {(submissionStatus.status === "success" || submissionStatus.status === "pending") && (
                <Button onClick={checkStatus} className="w-full" disabled={isCheckingStatus}>
                  {isCheckingStatus ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Checking...
                    </>
                  ) : (
                    "Check Status"
                  )}
                </Button>
              )}
              {submissionStatus.status === "rejected" && (
                <Button onClick={() => window.location.reload()} className="w-full">
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold tracking-wide">Safon</h1>
            <p className="text-slate-200 mt-2">Join Ethiopia's Premier Referral Platform</p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5" />
                Your Information
              </h3>

              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+251911234567"
                  required
                />
              </div>

              <div>
                <Label htmlFor="telegramUsername">Telegram Username (Optional)</Label>
                <Input
                  id="telegramUsername"
                  name="telegramUsername"
                  type="text"
                  value={formData.telegramUsername}
                  onChange={handleInputChange}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Payment Screenshot *
              </h3>

              {!selectedFile ? (
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                    isDragOver
                      ? "border-blue-500 bg-blue-50 transform -translate-y-1 shadow-lg"
                      : "border-blue-300 bg-slate-50 hover:bg-blue-50 hover:border-blue-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Upload className="w-10 h-10 text-blue-600" />
                  </div>

                  <p className="text-slate-600 mb-5 font-medium">Upload your payment screenshot</p>
                  <p className="text-sm text-slate-500 mb-5">Drag and drop or click to select</p>

                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Choose File
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Payment proof preview"
                      className="max-w-full max-h-48 rounded-lg border shadow-md mx-auto"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={removeFile}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Verification"
              )}
            </Button>
          </form>
        </CardContent>

        <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-4 text-center text-sm text-slate-600 font-medium">
          Safon Payment Verification • Made for Ethiopia
        </div>
      </Card>
    </div>
  )
}

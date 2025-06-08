import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateReferralCode(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `USER${timestamp}${random}`
}

export function formatCurrency(amount: number): string {
  return `ETB ${amount.toFixed(2)}`
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{8,14}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

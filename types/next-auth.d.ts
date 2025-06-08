declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: string
      referralCode: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    role: string
    referralCode: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    referralCode: string
  }
}

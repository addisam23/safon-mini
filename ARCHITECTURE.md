# 🏗️ System Architecture

## Overview

The Safon Referral System is built with a modern, scalable architecture designed for Ethiopian users to earn ETB through referrals.

## 🎯 Architecture Patterns

### 1. Monolithic Architecture (Single App)
\`\`\`
┌─────────────────────────────────────┐
│           Next.js App               │
├─────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────────┐│
│  │   Admin     │ │      User       ││
│  │   Routes    │ │     Routes      ││
│  │ /admin/*    │ │ /dashboard/*    ││
│  └─────────────┘ └─────────────────┘│
├─────────────────────────────────────┤
│           Shared API Layer          │
├─────────────────────────────────────┤
│         Database (PostgreSQL)       │
└─────────────────────────────────────┘
\`\`\`

### 2. Microservices Architecture (Separate Apps)
\`\`\`
┌─────────────────┐    ┌─────────────────┐
│   Admin App     │    │    User App     │
│ admin.domain.com│    │   domain.com    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌─────────────────────────┐
         │     Shared Database     │
         │     (PostgreSQL)        │
         └─────────────────────────┘
\`\`\`

## 🔧 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Beautiful icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Type-safe database client
- **NextAuth.js** - Authentication solution
- **bcryptjs** - Password hashing

### Database
- **PostgreSQL** - Primary database
- **Prisma** - Database ORM and migrations

### Deployment
- **Vercel** - Hosting and deployment
- **GitHub Actions** - CI/CD pipeline

## 📊 Database Schema

### Core Entities

\`\`\`sql
User {
  id: String (Primary Key)
  email: String (Unique)
  name: String?
  password: String
  role: String (user|admin)
  referralCode: String (Unique)
  balance: Float
  totalEarnings: Float
  isVerified: Boolean
  status: String
  createdAt: DateTime
  updatedAt: DateTime
}

PaymentProof {
  id: String (Primary Key)
  userId: String (Foreign Key)
  imageUrl: String
  status: String (pending|approved|rejected)
  adminId: String? (Foreign Key)
  adminNote: String?
  createdAt: DateTime
  updatedAt: DateTime
}

Referral {
  id: String (Primary Key)
  referrerId: String (Foreign Key)
  referredId: String (Foreign Key)
  status: String (pending|completed|rejected)
  reward: Float
  createdAt: DateTime
  updatedAt: DateTime
}

WithdrawRequest {
  id: String (Primary Key)
  userId: String (Foreign Key)
  method: String (telebirr|cbe|boa|chapa)
  amount: Float
  accountInfo: String
  status: String (pending|processing|completed|rejected)
  createdAt: DateTime
  updatedAt: DateTime
}
\`\`\`

### Relationships
- User → PaymentProofs (1:many)
- User → Referrals as referrer (1:many)
- User → Referrals as referred (1:many)
- User → WithdrawRequests (1:many)
- User → PaymentProofs as admin (1:many)

## 🔌 API Architecture

### RESTful Endpoints

#### Public Endpoints
\`\`\`
POST /api/submit-payment-verification
GET  /api/check-verification-status
\`\`\`

#### User Endpoints
\`\`\`
POST /api/withdraw
GET  /api/user/stats
GET  /api/user/referrals
\`\`\`

#### Admin Endpoints
\`\`\`
POST /api/admin/approve-payment
GET  /api/admin/users
GET  /api/admin/stats
GET  /api/admin/payment-proofs
\`\`\`

#### Authentication Endpoints
\`\`\`
POST /api/auth/admin-signup
POST /api/auth/[...nextauth]
\`\`\`

### API Response Format
\`\`\`typescript
// Success Response
{
  success: true,
  data: any,
  message?: string
}

// Error Response
{
  success: false,
  error: string,
  code?: string
}
\`\`\`

## 🛡️ Security Architecture

### Authentication Flow
\`\`\`
1. Admin Login → NextAuth.js → JWT Token
2. Route Protection → Middleware → Role Check
3. API Protection → Session Validation
\`\`\`

### Security Layers
1. **Input Validation** - Zod schemas, sanitization
2. **Authentication** - NextAuth.js with JWT
3. **Authorization** - Role-based access control
4. **Data Protection** - Encrypted passwords, secure sessions
5. **File Security** - Type validation, size limits
6. **Network Security** - HTTPS, security headers

### Security Headers
\`\`\`typescript
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
\`\`\`

## 📁 File Structure

\`\`\`
safon-referral-system/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin routes group
│   │   ├── admin/
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   └── layout.tsx        # Admin layout
│   │   └── auth/
│   │       ├── admin-signin/     # Admin login
│   │       └── admin-signup/     # Admin registration
│   ├── (user)/                   # User routes group
│   │   ├── dashboard/            # User dashboard
│   │   ├── verify-payment/       # Payment verification
│   │   └── page.tsx              # Landing page
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication
│   │   ├── admin/                # Admin APIs
│   │   └── user/                 # User APIs
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── admin-*/                  # Admin components
│   ├── user-*/                   # User components
│   └── shared/                   # Shared components
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Auth configuration
│   ├── database.ts               # Database functions
│   └── utils.ts                  # Utility functions
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema
├── public/                       # Static assets
│   └── uploads/                  # File uploads
├── scripts/                      # Database scripts
├── types/                        # TypeScript types
└── middleware.ts                 # Route middleware
\`\`\`

## 🔄 Data Flow

### User Registration Flow
\`\`\`
1. User submits payment verification form
2. File uploaded to /public/uploads/
3. User record created with payment proof
4. Admin receives notification
5. Admin approves/rejects payment
6. User gets access to dashboard
\`\`\`

### Referral Flow
\`\`\`
1. User generates referral link
2. New user clicks referral link
3. New user completes verification
4. Referral relationship created
5. Referrer earns reward (50 ETB)
6. Balance updated in database
\`\`\`

### Withdrawal Flow
\`\`\`
1. User requests withdrawal
2. System validates balance
3. Withdrawal request created
4. Admin processes request
5. Payment sent via chosen method
6. Request marked as completed
\`\`\`

## 📈 Scalability Considerations

### Database Scaling
- **Read Replicas** - For read-heavy operations
- **Connection Pooling** - Efficient connection management
- **Indexing** - Optimized query performance
- **Partitioning** - Large table management

### Application Scaling
- **Serverless Functions** - Auto-scaling API routes
- **CDN** - Static asset delivery
- **Caching** - Redis for session/data caching
- **Load Balancing** - Multiple app instances

### File Storage Scaling
- **Vercel Blob** - Scalable file storage
- **AWS S3** - Enterprise file storage
- **Image Optimization** - Next.js image optimization

## 🔍 Monitoring & Observability

### Metrics to Track
- User registration rate
- Payment approval rate
- Referral conversion rate
- Withdrawal processing time
- System uptime
- API response times

### Logging Strategy
- **Application Logs** - User actions, errors
- **Security Logs** - Authentication attempts
- **Performance Logs** - Response times, queries
- **Business Logs** - Referrals, payments

### Error Handling
- **Error Boundaries** - React error catching
- **Global Error Handler** - API error handling
- **Graceful Degradation** - Fallback mechanisms
- **User Feedback** - Clear error messages

## 🚀 Performance Optimization

### Frontend Optimization
- **Code Splitting** - Lazy loading components
- **Image Optimization** - Next.js Image component
- **Bundle Analysis** - Webpack bundle analyzer
- **Caching** - Browser and CDN caching

### Backend Optimization
- **Database Queries** - Optimized Prisma queries
- **API Caching** - Response caching
- **Connection Pooling** - Database connections
- **Compression** - Response compression

### SEO Optimization
- **Server-Side Rendering** - Next.js SSR
- **Meta Tags** - Dynamic meta information
- **Sitemap** - Search engine indexing
- **Structured Data** - Rich snippets

---

This architecture provides a solid foundation for the Safon Referral System, ensuring scalability, security, and maintainability while delivering an excellent user experience.

# Safon Referral System

A modern, scalable referral system built with Next.js, designed for Ethiopian users to earn ETB through referrals. The system features separate admin and user interfaces with comprehensive payment verification.

## 🌟 Features

### User Features
- 💰 Payment verification system
- 🔗 Referral link generation and sharing
- 📊 Personal dashboard with earnings tracking
- 💸 Withdrawal requests (Telebirr, CBE, BOA, Chapa)
- 📱 Mobile-responsive design
- 🔔 Real-time status updates

### Admin Features
- 🛡️ Secure admin authentication
- ✅ Payment proof approval/rejection
- 👥 User management and statistics
- 📈 Analytics dashboard
- 💼 Withdrawal request management
- 🔍 Advanced filtering and search

## 🏗️ Architecture

### Deployment Options

#### Option 1: Single Application (Recommended for small scale)
- Deploy as one Next.js app with role-based routing
- Admin routes: `/admin/*`
- User routes: `/dashboard/*`, `/verify-payment`

#### Option 2: Separate Applications (Recommended for scale)
- **Admin App**: Deploy to `admin.yourdomain.com`
- **User App**: Deploy to `app.yourdomain.com` or main domain
- **Shared API**: Common database and API endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Vercel account (for deployment)

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/yourusername/safon-referral-system.git
cd safon-referral-system
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your values:
\`\`\`env
DATABASE_URL="postgresql://user:pass@host:5432/safon_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_SECRET_KEY="your-admin-secret"
\`\`\`

### 4. Database Setup
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database (creates default admin)
npm run db:seed
\`\`\`

### 5. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit:
- User App: http://localhost:3000
- Admin Panel: http://localhost:3000/admin

## 📦 Deployment

### Single App Deployment

#### Deploy to Vercel
1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Environment Variables**
   \`\`\`
   DATABASE_URL=your_postgres_url
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ADMIN_SECRET_KEY=your_admin_secret
   \`\`\`

### Separate Apps Deployment

#### Admin App (admin.yourdomain.com)
1. Create new Vercel project for admin
2. Set build command: `npm run build:admin`
3. Set environment variables with admin-specific URLs

#### User App (yourdomain.com)
1. Create new Vercel project for users
2. Set build command: `npm run build:user`
3. Set environment variables with user-specific URLs

## 🔧 Configuration

### Database Providers
- **Vercel Postgres** (Recommended for Vercel deployment)
- **Neon** (Serverless PostgreSQL)
- **Supabase** (Full-stack platform)
- **Railway** (Simple deployment)

### File Storage
- Local storage (development)
- Vercel Blob (production)
- AWS S3 (enterprise)

## 🛡️ Security Features

- ✅ Admin-only route protection
- ✅ File upload validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ Secure password hashing

## 📊 Database Schema

### Core Models
- **User**: User accounts and profiles
- **PaymentProof**: Payment verification submissions
- **Referral**: Referral relationships and rewards
- **WithdrawRequest**: Withdrawal requests

### Relationships
- User → PaymentProofs (1:many)
- User → Referrals (1:many as referrer)
- User → WithdrawRequests (1:many)

## 🔌 API Endpoints

### Public Endpoints
- `POST /api/submit-payment-verification` - Submit payment proof
- `GET /api/check-verification-status` - Check verification status

### User Endpoints
- `POST /api/withdraw` - Submit withdrawal request
- `GET /api/user/stats` - Get user statistics

### Admin Endpoints
- `POST /api/admin/approve-payment` - Approve/reject payments
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get admin statistics

## 🎨 UI Components

Built with:
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible components
- **Lucide Icons** - Beautiful icons
- **Custom Components** - Reusable UI elements

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interfaces
- Mobile-optimized file uploads
- Progressive Web App features

## 🔍 Monitoring & Analytics

- Error boundary implementation
- Performance monitoring
- User activity tracking
- Admin dashboard analytics

## 🧪 Testing

\`\`\`bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🆘 Support

- 📧 Email: support@safon.com
- 💬 Telegram: @safon_support
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/safon-referral-system/issues)

## 🙏 Acknowledgments

- Ethiopian payment systems integration
- Next.js and Vercel teams
- Open source community

---

**Made with ❤️ for Ethiopia**

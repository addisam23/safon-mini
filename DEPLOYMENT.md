# 🚀 Deployment Guide

## Overview

This guide covers deploying the Safon Referral System with two deployment strategies:

1. **Single Application** - One app with role-based routing
2. **Separate Applications** - Admin and User apps deployed separately

## 📋 Prerequisites

- GitHub account
- Vercel account
- PostgreSQL database (Vercel Postgres, Neon, or Supabase)
- Domain name (optional)

## 🔧 Environment Variables

### Required Variables
\`\`\`env
DATABASE_URL=postgresql://user:pass@host:5432/database
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
ADMIN_SECRET_KEY=your-admin-secret
\`\`\`

### Optional Variables
\`\`\`env
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
BCRYPT_ROUNDS=12
\`\`\`

## 🎯 Strategy 1: Single Application

### Step 1: Prepare Repository
\`\`\`bash
git clone https://github.com/yourusername/safon-referral-system.git
cd safon-referral-system
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables
5. Deploy

### Step 3: Set Up Database
Choose one of these options:

#### Option A: Vercel Postgres
1. In Vercel dashboard → Storage → Create Database
2. Copy connection string to \`DATABASE_URL\`

#### Option B: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string to \`DATABASE_URL\`

#### Option C: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database

### Step 4: Post-Deployment
1. Visit your deployed app
2. Go to \`/auth/admin-signup\` to create admin account
3. Test payment verification flow

## 🎯 Strategy 2: Separate Applications

### Admin App Deployment

#### Step 1: Create Admin Repository
\`\`\`bash
# Create new repository for admin
git clone https://github.com/yourusername/safon-referral-system.git safon-admin
cd safon-admin

# Remove user-specific files
rm -rf app/(dashboard|verify-payment)
rm -rf components/(user-*|payment-*|landing-*)

# Update package.json
# Change name to "safon-admin"
\`\`\`

#### Step 2: Deploy Admin App
1. Push to new GitHub repository
2. Deploy to Vercel as \`admin.yourdomain.com\`
3. Set environment variables:
   \`\`\`env
   NEXTAUTH_URL=https://admin.yourdomain.com
   NEXT_PUBLIC_APP_URL=https://admin.yourdomain.com
   NEXT_PUBLIC_USER_URL=https://yourdomain.com
   \`\`\`

### User App Deployment

#### Step 1: Create User Repository
\`\`\`bash
# Create new repository for users
git clone https://github.com/yourusername/safon-referral-system.git safon-user
cd safon-user

# Remove admin-specific files
rm -rf app/admin
rm -rf components/admin-*

# Update package.json
# Change name to "safon-user"
\`\`\`

#### Step 2: Deploy User App
1. Push to new GitHub repository
2. Deploy to Vercel as main domain
3. Set environment variables:
   \`\`\`env
   NEXTAUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   NEXT_PUBLIC_ADMIN_URL=https://admin.yourdomain.com
   \`\`\`

## 🔒 Security Configuration

### Vercel Security Headers
Already configured in \`vercel.json\`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### Database Security
1. Enable SSL connections
2. Use connection pooling
3. Set up read replicas (optional)
4. Regular backups

### File Upload Security
1. File type validation
2. File size limits
3. Virus scanning (optional)
4. CDN integration

## 📊 Monitoring & Analytics

### Vercel Analytics
1. Enable in Vercel dashboard
2. Add to your app:
   \`\`\`bash
   npm install @vercel/analytics
   \`\`\`

### Error Monitoring
1. Set up Sentry (optional)
2. Configure error boundaries
3. Log aggregation

## 🔄 CI/CD Pipeline

### GitHub Actions
Already configured:
- \`.github/workflows/ci.yml\` - Main CI pipeline
- \`.github/workflows/deploy-admin.yml\` - Admin deployment
- \`.github/workflows/deploy-user.yml\` - User deployment

### Secrets Required
Add these to GitHub repository secrets:
- \`VERCEL_TOKEN\` - Vercel API token
- \`DATABASE_URL\` - Database connection string

## 🌐 Custom Domain Setup

### Single Domain
1. Add domain in Vercel dashboard
2. Configure DNS records
3. SSL automatically provisioned

### Multiple Domains (Separate Apps)
1. \`yourdomain.com\` → User app
2. \`admin.yourdomain.com\` → Admin app
3. Configure DNS for both subdomains

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
- Check environment variables
- Verify database connectivity
- Review build logs

#### Database Connection
- Ensure database allows external connections
- Check connection string format
- Verify SSL requirements

#### File Upload Issues
- Check upload directory permissions
- Verify file size limits
- Review CORS settings

### Debug Commands
\`\`\`bash
# Check build locally
npm run build

# Test database connection
npm run db:push

# Verify environment variables
npm run dev
\`\`\`

## 📈 Performance Optimization

### Database
- Enable connection pooling
- Add database indexes
- Use read replicas

### Frontend
- Image optimization
- Code splitting
- Caching strategies

### API
- Rate limiting
- Response compression
- API caching

## 🔄 Updates & Maintenance

### Regular Tasks
1. Update dependencies monthly
2. Monitor error rates
3. Review security logs
4. Database maintenance

### Backup Strategy
1. Automated daily backups
2. Point-in-time recovery
3. Cross-region replication

---

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review GitHub Issues
3. Contact support: support@safon.com

**Happy Deploying! 🚀**

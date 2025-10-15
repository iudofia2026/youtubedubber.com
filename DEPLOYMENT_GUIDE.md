# YT Dubber Production Deployment Guide

## 🚀 Quick Deployment Checklist

### Phase 1: Infrastructure Setup
- [ ] Create Vercel account and connect GitHub repo
- [ ] Create Railway account for backend hosting
- [ ] Set up Supabase production project
- [ ] Purchase domain (youtubedubber.com)
- [ ] Set up Stripe account for payments (optional for MVP)

### Phase 2: Environment Configuration
- [ ] Configure Vercel environment variables
- [ ] Configure Railway environment variables
- [ ] Set up Supabase database and storage
- [ ] Configure DNS and SSL certificates
- [ ] Test Supabase authentication flow

### Phase 3: Testing & Launch
- [ ] Test complete user workflow
- [ ] Verify file upload and job creation
- [ ] Test job status tracking
- [ ] Set up monitoring and alerts
- [ ] Launch to production

## 📋 Environment Variables Needed

### Frontend (Vercel)
```
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_API_URL=https://api.youtubedubber.com
NEXT_PUBLIC_APP_URL=https://youtubedubber.com
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
```

### Backend (Railway)
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
DEEPGRAM_API_KEY=your_deepgram_key
OPENAI_API_KEY=your_openai_key
SECRET_KEY=your_production_secret
CORS_ORIGINS=https://youtubedubber.com
```

## 🛠 Deployment Commands

### Frontend (Vercel)
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

### Backend (Railway)
```bash
# Connect GitHub repo to Railway
# Set environment variables in Railway dashboard
# Deploy automatically via GitHub integration
```

## 💰 Cost Estimates
- **Vercel**: Free tier (sufficient for MVP)
- **Railway**: $5/month for backend
- **Supabase**: Free tier (up to 500MB database)
- **Domain**: ~$12/year
- **Total**: ~$6/month to start

## 🔧 Next Steps
1. Set up accounts and services
2. Configure environment variables
3. Deploy and test
4. Set up monitoring
5. Launch to users
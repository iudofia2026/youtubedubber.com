# YT Dubber - AI-Powered Video Dubbing Platform

A modern, full-stack application for AI-powered video dubbing with real-time processing, multi-language support (12 languages), and seamless user experience. Upload videos, select target languages, and receive professionally dubbed content with automated speech-to-text, translation, and text-to-speech processing.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Setup & Run (5 Minutes)

```bash
# 1. Clone repository
git clone https://github.com/iudofia2026/youtubedubber.com.git
cd youtubedubber.com

# 2. Setup Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# .env file already configured for local dev - no changes needed!
uvicorn app.main:app --reload --port 8000

# 3. In new terminal, setup Frontend
cd frontend
npm install
# .env.local file already configured for local dev!
npm run dev
```

### Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs


## 🎯 Current Status

**Local Development**: ✅ **READY TO RUN!** Environment fully configured with development mode enabled.

**Development Note**: The frontend currently uses mock data for payments and job processing to enable local development without requiring production API keys. The backend has full functionality implemented and ready for integration.

### What Works Now
- ✅ **Frontend**: Complete UI with authentication, job management, file upload, mobile optimization
  - All pages functional (home, upload, jobs, auth, billing, pricing, features, help, contact, legal)
  - Downloads accessible via creative link at bottom of jobs page (not in main navigation)
  - Mock API integration for testing UI flows
  - Responsive design for desktop, tablet, and mobile
  - Complete payment system with Stripe integration

- ✅ **Backend**: Core API with database, authentication, file upload, and payment system
  - FastAPI server with auto-generated docs
  - SQLAlchemy database models and migrations
  - Supabase Auth JWT validation middleware
  - File upload endpoint with signed URLs
  - Job status tracking and management
  - Complete payment system with Stripe integration
  - Credit management and transaction tracking
  - Dynamic pricing based on language complexity

- ✅ **Payment System**: Complete Stripe integration with credit-based pricing
  - 3 pricing tiers: Starter Pack (20 credits - FREE), Creator Pack (50 credits - $29), Professional Pack (250 credits - $99)
  - Dynamic pricing based on language complexity and duration
  - Real-time credit balance tracking and transaction history
  - Secure payment processing with Stripe (fully implemented)
  - Complete billing dashboard and transaction management

- ✅ **AI Processing Pipeline**: Core pipeline implemented and functional
  - ✅ Speech-to-Text (Deepgram) - integrated and functional
  - ✅ Translation (OpenAI GPT-4o-mini) - integrated and functional
  - ✅ Text-to-Speech (Deepgram Aura) - integrated and functional
  - ✅ File upload/download to Supabase Storage - fully implemented
  - ✅ Audio processing and artifact generation - fully implemented
  - ⚠️ Background track mixing - implemented but not yet integrated into worker pipeline

- ✅ **Development Tools**: Environment ready with bypass modes for quick testing

### What Needs Work
- ⚠️ **Frontend API Integration**: DEV_MODE needs to be disabled for production (currently enabled for local testing)
- ⚠️ **Payment System Integration**: Frontend currently uses mock data; needs real API integration with backend
- ⚠️ **Background Track Mixing**: Audio mixing functionality implemented but not yet integrated into worker pipeline
- ⚠️ **Production Deployment**: Environment variables configured locally, needs production setup
  - API credentials (Supabase, Deepgram, OpenAI, Stripe) - configured in local .env files
  - Database migrations need to be run on production database
  - Background worker process needs deployment configuration
  - Stripe webhook configuration for production

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS v4 + PostCSS
- **UI Components**: shadcn/ui (Radix UI) + Lucide React icons
- **Animations**: Framer Motion
- **Auth**: Supabase Auth with JWT
- **Deployment**: Vercel-ready

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15+ (SQLite for local dev)
- **ORM**: SQLAlchemy with Alembic migrations
- **Auth**: Supabase Auth + JWT verification
- **Storage**: Supabase Storage
- **Payments**: Stripe integration with credit management
- **AI Services**:
  - Deepgram (Speech-to-Text, Text-to-Speech)
  - OpenAI (Translation)
- **Audio**: FFmpeg, Librosa, NumPy, SciPy
- **Deployment**: Docker + Railway/Render

### Infrastructure
- **Database**: PostgreSQL via Supabase
- **Storage**: Supabase Storage (file uploads)
- **Authentication**: Supabase Auth
- **Monitoring**: Structured logging, optional Sentry
- **Rate Limiting**: SlowAPI with Redis support

## 📚 Core Features

### User Features
1. **Multi-Format Upload**: Audio (MP3, WAV, M4A) and Video (MP4 with auto audio extraction)
2. **Multi-Language Support**: 12 target languages with visual flags (EN, ES, FR, DE, JA, ZH, KO, PT, IT, RU, AR, HI)
3. **Job Management**: Create, track, and manage dubbing jobs with real-time progress
4. **Download System**: Download dubbed audio, full video, and captions
5. **Payment System**: Credit-based pricing with Stripe integration
   - 3 pricing tiers: Starter Pack (20 credits - FREE), Creator Pack (50 credits - $29), Professional Pack (250 credits - $99)
   - Dynamic pricing based on language complexity and duration
   - Real-time credit balance tracking and transaction history
   - Secure payment processing with Stripe
6. **Authentication**: Sign up, login, password reset, profile management
7. **Mobile Optimized**: Touch targets, swipe gestures, haptic feedback
8. **Progress Tracking**: Per-language status with visual indicators

### Technical Features
1. **Development Mode**: Bypass authentication for rapid testing
2. **Error Recovery**: Retry mechanisms and error boundaries
3. **Rate Limiting**: Per-user and per-endpoint protection
4. **Security**: JWT auth, CORS, security headers, input validation
5. **Background Processing**: Async job processor with concurrency control
6. **API Documentation**: Auto-generated Swagger/ReDoc docs

## 🔧 Project Structure

```
youtubedubber.com/
├── frontend/                   # Next.js frontend application
│   ├── app/                   # Next.js 15 App Router pages
│   ├── components/            # React components (UI, forms, layouts)
│   ├── lib/                   # Utilities, API client, auth context
│   ├── types/                 # TypeScript type definitions
│   ├── .env.local.example     # Environment template (copy to .env.local)
│   ├── package.json           # Dependencies
│   └── README.md             # Frontend documentation
│
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── api/              # API endpoints (jobs, upload)
│   │   ├── middleware/       # Rate limiting, security, logging
│   │   ├── services/         # Business logic (AI, storage, jobs)
│   │   ├── worker/           # Background job processor
│   │   ├── utils/            # Utilities and helpers
│   │   ├── models.py         # Database models
│   │   ├── schemas.py        # Pydantic validation schemas
│   │   ├── config.py         # Configuration management
│   │   ├── auth.py           # JWT authentication
│   │   ├── database.py       # Database connection
│   │   └── main.py           # FastAPI application
│   ├── migrations/            # Alembic database migrations
│   ├── tests/                # Unit and integration tests
│   ├── .env.example          # Environment template (copy to .env)
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # Container image
│   └── README.md            # Backend documentation
│
└── README.md                 # This file
```

## 🆕 Recent Updates

### ✅ Auto-Navigation Feature (Oct 26, 2025)
- **Smart Step Progression**: Files automatically advance to next step after successful upload/selection
- **Voice Track Upload**: Auto-advances to background track step after 1 second delay
- **Background Track Upload**: Auto-advances to language selection step after 1 second delay  
- **Language Selection**: Auto-advances to launch step after 500ms delay when at least one language is selected
- **Enhanced UX**: Maintains manual navigation controls for users who prefer manual control
- **Seamless Flow**: Reduces friction in the job creation process while preserving user choice

### ✅ Enhanced User Experience & Navigation (Dec 2024)
- **Downloads Page Relocation**: Moved downloads from main navigation to creative section at bottom of jobs page
- **Beautiful Downloads Section**: Gradient background with animated decorations and engaging call-to-action
- **Streamlined Navigation**: Cleaner main navigation focused on core functionality (Home, New Job, Jobs)
- **Interactive Downloads Link**: Hover effects, scale animations, and professional styling
- **Better Information Architecture**: Downloads now contextually placed where users need it most

### ✅ Minimalist Job Launch Interface (Dec 2024)
- **Ultra-Clean Design**: Completely redesigned Step 4 with minimalist rectangular button and sharp edges
- **Giant Submit Button**: 480x80px clean rectangular button with subtle animations and muted red colors
- **Sharp Geometric Design**: Clean rectangular design with sharp edges, no rounded corners
- **Muted Color Palette**: Updated from bright red (#ff0000) to muted red (#dc2626) for better visual comfort
- **Minimalist Timeline**: Removed duplicate timeline, keeping only the main progress bar at bottom
- **Clean Typography**: Large "LAUNCH" text with "START DUBBING" subtitle in clean, professional styling
- **Subtle Animations**: Light sweep effects, gentle pulsing, and smooth hover transitions
- **Professional Icons**: Clean Zap and ArrowRight icons with subtle scaling animations
- **Streamlined Layout**: Removed complex geometric shapes in favor of clean, minimalist design
- **Enhanced UX**: Nonchalant, sleek interface that makes job submission feel satisfying and professional
- **Mobile Optimized**: Touch-friendly design with proper haptic feedback and responsive sizing
- **Progress Integration**: Seamless integration with existing step progression system
- **Smooth Banner Animation**: Enhanced banner dismissal with smooth height collapse and content glide-up animation

### ✅ Banner Animation Enhancement (Dec 2024)
- **Smooth Dismissal**: Banner now smoothly collapses instead of snapping when X button is clicked
- **Content Glide**: Step content smoothly glides up by 20px when banner is dismissed
- **Synchronized Timing**: Both animations use 0.6s duration with easeInOut easing for natural motion
- **Layout Animation**: Uses Framer Motion's layout prop for automatic smooth transitions
- **No Snapping**: Eliminates jarring content jumps when banner is dismissed
- **Height Animation**: Banner smoothly transitions from full height to 0 using maxHeight property
- **Professional Polish**: Enhanced user experience with smooth, coordinated animations
- **Simple Restore Mechanism**: Replaced complex guide button system with clean "Show Guide" button in bottom-right corner
- **Layout Stability**: Fixed layout shift issues by positioning restore button as fixed overlay

### ✅ Guide Button System Redesign (Dec 2024)
- **Simplified Architecture**: Removed complex toggle system with multiple states and scroll detection
- **Fixed Positioning**: Restore button positioned as fixed overlay in bottom-right corner (bottom-6 right-6)
- **Clean Design**: Simple red button with "Show Guide" text and up arrow icon
- **No Layout Impact**: Button floats independently without affecting page layout or other elements
- **Smooth Animations**: Fade in/out with scale effects for professional appearance
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Mobile Optimized**: Touch-friendly design with appropriate sizing and spacing

### ✅ Payment System Implementation (Oct 26, 2024)
- Complete Stripe integration with credit-based pricing model
- 3 pricing tiers: Starter Pack (20 credits - FREE), Creator Pack (50 credits - $29), Professional Pack (250 credits - $99)
- Dynamic pricing based on language complexity and duration
- Real-time credit balance tracking and transaction history
- Complete billing dashboard with payment forms and transaction management
- Backend payment APIs with comprehensive error handling and security
- Frontend payment components with Stripe Elements integration

### ✅ AI Processing Pipeline Completion (Oct 25, 2024)
- Full implementation of speech-to-text, translation, and text-to-speech pipeline
- Deepgram STT/TTS integration with proper audio processing
- OpenAI GPT-4o-mini translation with language-specific optimization
- Supabase Storage integration for file upload/download
- Audio mixing and artifact generation with proper timing alignment
- Background worker with job processing and status tracking

### ✅ Development Environment Setup (Oct 25, 2024)
- Fixed missing frontend `.env.local` file for immediate local development
- Modified backend config validation to support dev mode without strict API key requirements
- Both services now start without errors in development mode
- Updated all documentation for clarity and consolidated to 3 main README files

### ✅ Mobile Navigation & UX Enhancements
- Enhanced mobile navigation with swipe gestures and touch optimization
- 44px minimum touch targets throughout app
- Left-swipe actions for job cards (View, Download, Delete)
- Contextual back navigation for mobile
- Haptic feedback for touch interactions
- Proper viewport meta tags to prevent zoom issues

### ✅ UI/UX Enhancements
- Replaced emojis with professional Lucide React icons
- Added grid/list view toggle for job management with URL persistence
- Enhanced progress meters with shimmer effects and completion dots
- Gradient backgrounds and animated status indicators
- Improved typography and visual hierarchy

### ✅ Authentication & Job Management
- Complete Supabase Auth integration (login, signup, password reset, profile)
- Individual job pages with dashboard-style layouts
- Enhanced progress visualization with animated rings and language-specific status
- Download system for completed jobs with progress tracking
- Mobile-optimized forms and touch interactions

## 🎯 Next Steps

### Immediate Priorities (Ship MVP)
1. **Frontend API Integration** (3-4 hours, Very High Impact)
   - Replace mock functions in `frontend/lib/api.ts` with real HTTP requests
   - Add error handling and loading states
   - Test all API endpoints end-to-end

2. **Production Configuration** (2-3 hours, High Impact)
   - Set up Supabase production project
   - Get Deepgram, OpenAI, and Stripe API keys
   - Configure environment variables
   - Deploy to Vercel (frontend) + Railway (backend)
   - Configure Stripe webhooks for production

3. **End-to-End Testing** (2-3 hours, High Impact)
   - Test complete dubbing workflow with real files
   - Verify payment processing with test cards
   - Test credit deduction and job cost calculation
   - Validate all API endpoints with real data

### Secondary Priorities
- Security audit and penetration testing
- Performance optimization (bundle size, API response times)
- Monitoring and alerting setup (Sentry, analytics)
- Comprehensive test suite
- User documentation and help center

## 🚢 Deployment Guide

### Deployment Overview

Three deployment options based on time and functionality needs:

**Option A: Demo Deploy (2 hours)**
- Frontend only with mock data
- Deploy to Vercel
- Beautiful UI showcase, no backend functionality

**Option B: Partial MVP (3 hours)**
- Both services deployed
- File upload works
- Jobs created but return placeholder results

**Option C: Working MVP (8-10 hours)** *(Recommended)*
- Full AI pipeline implemented
- Real dubbing functionality
- Production-ready

### Deployment Steps

**Frontend (Vercel):**
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

Set environment variables in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_DEV_MODE=false
```

**Backend (Railway):**
```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

Set environment variables in Railway dashboard:
```
DATABASE_URL=<provided by Railway>
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
DEEPGRAM_API_KEY=your_key
OPENAI_API_KEY=your_key
SECRET_KEY=<random string>
CORS_ORIGINS=https://your-domain.vercel.app
DEBUG=false
```

### Production Cost Estimate
- Vercel: Free (Hobby tier)
- Railway: $5/month (backend hosting)
- Supabase: Free tier (500MB DB + 1GB storage)
- Deepgram: Pay-as-you-go (~$0.0125/min)
- OpenAI: Pay-as-you-go (~$0.03/1K tokens)
- **Total**: ~$6/month + usage-based AI costs

## 🐛 Troubleshooting

### Frontend Won't Start
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Backend Errors
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Environment Variables Not Loading
- Check file names: `.env.local` (frontend), `.env` (backend)
- Restart dev servers after changes
- Verify no typos in variable names
- See `.env.local.example` and `.env.example` for templates

### Database Issues
```bash
cd backend
rm test.db  # Delete SQLite DB
# Restart server - DB will auto-recreate
```

## 📖 Documentation

- **[Frontend README](./frontend/README.md)** - Complete frontend guide (components, features, development)
- **[Backend README](./backend/README.md)** - Complete backend guide (API, architecture, deployment)

## 🤝 Contributing

This is a private development project. For questions or issues:
1. Check existing documentation in the three README files
2. Review `frontend/README.md` and `backend/README.md` for detailed technical docs
3. Test your environment by running both services locally

## 📄 License

Private project - All rights reserved

---

**Last Updated**: October 26, 2025
**Current Branch**: isle-2
**Status**: Local development ready, AI pipeline in progress
**Repository**: https://github.com/iudofia2026/youtubedubber.com

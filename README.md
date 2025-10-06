# YT Dubber - AI-Powered Multilingual Dubbing Platform

A comprehensive web application that enables YouTubers to create multilingual audio tracks for their videos using AI-powered voice synthesis. Upload voice and background audio tracks, select target languages, and receive professionally dubbed content ready for YouTube's multi-audio feature.

## 🎯 **Project Overview**

YT Dubber transforms single-language YouTube content into multilingual masterpieces using advanced AI technology. The platform handles the complete pipeline from speech-to-text transcription to AI voice generation, translation, and audio mixing.

## ✨ **Current Features**

### **Core Functionality**
- **Voice Track Upload**: Upload voice-only audio tracks with validation
- **Background Track Upload**: Add background music or ambient audio
- **Language Selection**: Choose from 12 supported languages (EN, ES, FR, DE, JA, ZH, KO, PT, IT, RU, AR, HI)
- **Real-time Processing**: Track job progress with live updates
- **File Validation**: Duration matching and format validation
- **Modern UI**: Sharp, geometric, minimalist design with smooth animations

### **User Experience**
- **Drag & Drop Upload**: Intuitive file upload interface
- **Progress Tracking**: Per-language progress monitoring
- **Download Management**: Multiple format downloads (voice-only, full-mix, captions)
- **Responsive Design**: Mobile-first approach with touch-friendly interactions
- **Dark/Light Mode**: Complete theme system with persistence

## 🏗️ **Architecture & Tech Stack**

### **Frontend (Next.js 15.5.4)**
- **Framework**: Next.js with App Router
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Animations**: Framer Motion 12.23.22
- **State Management**: React hooks (useState, useEffect)
- **Build Tool**: Turbopack

### **Backend (FastAPI)**
- **API Framework**: FastAPI with SQLAlchemy
- **Database**: Subabase (PostgreSQL) with Row Level Security
- **Storage**: Subabase Storage with signed URLs
- **Queue System**: Dramatiq with Redis broker
- **AI Services**: Deepgram (STT/TTS), OpenAI (Translation), ElevenLabs (Premium TTS)
- **Media Processing**: ffmpeg + librosa for audio alignment and mixing

### **Infrastructure**
- **Authentication**: Subabase Auth with JWT tokens
- **Payments**: Stripe integration for billing
- **Real-time**: WebSocket/SSE for live updates
- **Monitoring**: Prometheus/Grafana for observability
- **Deployment**: Docker containers in East-US region

## 📊 **Current Development Status**

### **✅ Frontend Status: COMPLETE FOUNDATION**
- **UI Components**: All core components implemented and styled
- **File Upload**: Complete with validation and progress tracking
- **Language Selection**: Multi-select interface with search and flags
- **Job Management**: Mock API system fully functional
- **Responsive Design**: Mobile-first design complete
- **Theme System**: Dark/light mode with persistence
- **Animations**: Smooth, scroll-triggered animations
- **Branding**: Custom YTdubber branding throughout

### **🚧 Backend Status: IN DEVELOPMENT**
- **Phase 0**: Discovery and compliance planning ✅
- **Phase 1**: FastAPI foundation and database models 🚧
- **Phase 2**: Upload flow and storage strategy 📋
- **Phase 3**: Job lifecycle APIs 📋
- **Phase 4**: Processing pipeline 📋
- **Phase 5**: Observability and operations 📋

## 🚀 **Development Roadmap**

### **Phase 1: Foundation (Weeks 1-2)**
- **Frontend**: Authentication system with Subabase Auth
- **Frontend**: Real API integration (replace mocks)
- **Backend**: Complete FastAPI setup and database models
- **Backend**: Subabase Auth integration and RLS policies

### **Phase 2: Core Features (Weeks 3-4)**
- **Frontend**: Payment integration with Stripe
- **Frontend**: Enhanced job management and history
- **Backend**: Upload flow with signed URLs
- **Backend**: Job processing pipeline implementation

### **Phase 3: Advanced Features (Weeks 5-6)**
- **Frontend**: Real-time updates with WebSocket/SSE
- **Frontend**: Download system with multiple formats
- **Backend**: AI processing pipeline (STT → Translation → TTS → Mixing)
- **Backend**: Progress tracking and error handling

### **Phase 4: Polish & Launch (Weeks 7-8)**
- **Frontend**: User dashboard and analytics
- **Frontend**: Mobile optimization and PWA features
- **Backend**: Monitoring, billing, and operations
- **Backend**: Performance optimization and scaling

## 🎨 **Design System**

### **Visual Identity**
- **Logo**: Custom YTdubber icon (replaces YouTube branding)
- **Typography**: DM Sans (primary), IBM Plex Mono (monospace), Roboto (YouTube-style)
- **Colors**: 
  - Light: `#ffffff` background, `#333333` text, `#ff0000` accent
  - Dark: `#0f0f0f` background, `#ffffff` text, `#ff0000` accent
- **Aesthetic**: Sharp, geometric, minimalist (no rounded corners)

### **Key Pages**
- **Homepage** (`/`): Hero section with features showcase
- **Upload** (`/new`): 4-step wizard starting with audio preparation guide, then file uploads and language selection
- **Job Status** (`/jobs/[id]`): Real-time progress tracking with per-language details
- **Jobs List** (`/jobs`): Job history and management (ready for backend integration)

## 🔧 **Setup & Development**

### **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:3000
```

### **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# Opens http://localhost:8000
```

### **Environment Variables**
```env
# Frontend
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
DEEPGRAM_API_KEY=your_deepgram_key
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
```

## 📋 **Planned Features**

### **Authentication & User Management**
- User registration and login with Subabase Auth
- JWT token management and protected routes
- User profile and account settings
- Password reset and email verification

### **Payment & Billing**
- Stripe integration for subscription/pay-per-use billing
- Pricing tiers and plan selection
- Usage tracking and billing dashboard
- Payment history and invoice management

### **Advanced Job Management**
- Job history with search and filtering
- Job details with audit trail and processing logs
- Job sharing and collaboration features
- Export job data for billing/records

### **Real-time Features**
- WebSocket/SSE integration for live updates
- Real-time progress tracking and notifications
- Queue status and estimated wait times
- Live error notifications and recovery options

### **File Management**
- Audio file preview with player
- Upload progress with pause/resume
- Batch upload capabilities
- File history and re-upload options

### **Download & Export**
- Multiple download formats (voice-only, full-mix, captions)
- Bulk download for multiple languages
- Download history and re-download links
- File expiration warnings (48-hour retention)

## 🛠️ **Development Tools**

### **MCP Integration**
This project uses a deliberate-thinking MCP server for:
- Complex problem-solving during development
- Architecture planning and component design
- Debugging and optimization
- User experience improvements

### **Quality Assurance**
- **Linting**: ESLint + TypeScript strict mode
- **Testing**: Testing Library with Vitest (planned)
- **Type Safety**: Full TypeScript coverage
- **Code Style**: 2-space indentation, PascalCase components

## 📈 **Project Metrics**

- **Frontend Components**: 15+ implemented, 50+ planned
- **Pages**: 4 current, 15+ planned
- **Supported Languages**: 12 languages
- **File Size Limit**: 100MB per upload
- **Retention Policy**: 48-hour file retention
- **Concurrency Target**: 10 simultaneous jobs

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

**Current Status**: Frontend foundation complete, backend in active development, full platform launch targeted for 8 weeks.ense
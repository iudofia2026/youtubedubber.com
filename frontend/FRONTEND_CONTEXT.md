# Frontend Context & Backend Integration Guide

## 🎯 Project Overview
**YT Dubber** is a Next.js web application that enables YouTubers to create multilingual audio tracks for their videos. Users upload voice-only and background audio tracks, select target languages, and receive AI-generated dubbed versions ready for YouTube's multi-audio feature.

## 🏗️ Current Frontend Architecture

### Tech Stack
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Animations**: Framer Motion 12.23.22
- **State Management**: React hooks (useState, useEffect)
- **Build Tool**: Turbopack

### Project Structure
```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with fonts & metadata
│   ├── page.tsx           # Homepage with hero & features
│   ├── new/page.tsx       # Upload wizard page
│   ├── jobs/
│   │   ├── page.tsx       # Jobs listing (empty state)
│   │   └── [id]/page.tsx  # Individual job status page
│   └── favicon.ico        # YTdubber logo favicon
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   ├── FileUpload.tsx    # Drag & drop file upload
│   ├── LanguageChecklist.tsx # Multi-select language picker
│   ├── JobCreationWizard.tsx # 3-step upload wizard
│   ├── IndividualLanguageProgress.tsx # Per-language progress cards
│   ├── Navigation.tsx    # Main navigation with YTdubber branding
│   ├── YTdubberIcon.tsx  # Custom logo component
│   └── ThemeToggle*.tsx  # Dark/light mode toggles
├── lib/
│   ├── api.ts           # Mock API functions (to be replaced)
│   ├── audio-utils.ts   # Audio processing utilities
│   └── utils.ts         # General utilities
├── types/
│   └── index.ts         # TypeScript type definitions
└── public/
    └── ytdubber-logo.png # Main logo asset
```

## 🎨 Design System

### Visual Identity
- **Logo**: Custom YTdubber icon (replaces YouTube branding)
- **Typography**: DM Sans (primary), IBM Plex Mono (monospace), Roboto (YouTube-style)
- **Colors**: 
  - Light: `#ffffff` background, `#333333` text, `#ff0000` accent
  - Dark: `#0f0f0f` background, `#ffffff` text, `#ff0000` accent
- **Aesthetic**: Sharp, geometric, minimalist (no rounded corners)

### Key Pages
1. **Homepage** (`/`): Hero section with "YouTube [YTdubber Icon] Dubber" branding, feature showcase, CTAs
2. **Upload** (`/new`): 3-step wizard for file uploads and language selection
3. **Job Status** (`/jobs/[id]`): Real-time progress tracking with per-language details
4. **Jobs List** (`/jobs`): Empty state (ready for job history)

## 🔧 Current Functionality

### File Upload System
- **Voice Track**: Required audio file (voice-only, no music/SFX)
- **Background Track**: Optional audio file (music, SFX, ambient)
- **Validation**: 
  - File size limit: 100MB
  - Audio format support: `audio/*`
  - Duration extraction and validation
  - Duration mismatch detection between tracks

### Language Selection
- **Supported Languages**: 12 languages (EN, ES, FR, DE, JA, ZH, KO, PT, IT, RU, AR, HI)
- **UI**: Multi-select checklist with search, flags, and validation
- **Validation**: Minimum 1 language required

### Job Processing (Mock)
- **Statuses**: uploading → processing → generating → finalizing → complete
- **Progress Tracking**: Overall progress + per-language progress
- **Real-time Updates**: Simulated with `setInterval` (2-second intervals)
- **Download Links**: Generated for completed languages

## 🔌 Backend Integration Expectations

### Current Mock API (`lib/api.ts`)
The frontend currently uses mock functions that simulate backend behavior:

```typescript
// Current mock functions
submitDubbingJob(data: DubbingJobData): Promise<SubmitJobResponse>
getJobStatus(jobId: string, targetLanguages: string[]): Promise<GetJobStatusResponse>
simulateJobProgress(jobId, languages, onProgress, onComplete): () => void
```

### Backend Processing Requirements

The backend must perform the following core workflow:

1. **File Validation & Alignment**
   - Confirm voice track and background track are the same length
   - Validate audio formats and quality
   - Reject jobs if tracks don't match in duration

2. **Audio Processing Pipeline**
   - Extract speech from voice track (speech-to-text)
   - Translate transcript to each target language
   - Generate AI voice in target language (voice cloning/TTS)
   - Align generated voice with original timing
   - Mix translated voice with background track
   - Export properly timed audio files

3. **Output Generation**
   - Per-language voice-only tracks (clean speech)
   - Per-language full mix tracks (voice + background)
   - Maintain exact timing alignment with original

### Expected Backend API Endpoints

#### 1. Job Submission
```http
POST /api/jobs
Content-Type: multipart/form-data

{
  "voice_file": File,        # Voice-only audio track
  "background_file": File,   # Background music/SFX track
  "languages": string[]      # Target language codes
}

Response:
{
  "job_id": "abc123def",
  "status": "validating",
  "message": "Validating audio files...",
  "estimated_duration": 300
}
```

#### 2. Job Status
```http
GET /api/jobs/{job_id}

Response:
{
  "id": "abc123def",
  "status": "processing",  # validating | processing | generating | finalizing | complete | error
  "progress": 45,
  "message": "Generating Spanish dub...",
  "languages": [
    {
      "language_code": "es",
      "language_name": "Spanish",
      "status": "generating",
      "progress": 60,
      "message": "Mixing voice with background...",
      "estimated_time_remaining": 120,
      "download_url": "/api/jobs/abc123def/download?lang=es&type=full"
    }
  ],
  "total_languages": 3,
  "completed_languages": 1,
  "started_at": "2024-01-01T12:00:00Z",
  "estimated_completion": "2024-01-01T12:05:00Z",
  "validation_error": null  # If tracks don't match length
}
```

#### 3. File Downloads
```http
GET /api/jobs/{job_id}/download?lang={lang_code}&type={file_type}

Where file_type is one of:
- "voice" (voice-only track in target language)
- "full" (full mix: translated voice + background track)
- "captions" (SRT/VTT file with translated subtitles)
```

#### 4. Validation Error Response
```http
POST /api/jobs
# If voice and background tracks don't match length

Response:
{
  "error": "duration_mismatch",
  "message": "Voice track (120s) and background track (115s) must be the same length",
  "voice_duration": 120.5,
  "background_duration": 115.2
}
```

### Environment Configuration
The frontend expects these environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Frontend URL for callbacks
```

## 🔄 Integration Steps

### 1. Replace Mock API
Update `lib/api.ts` to make real HTTP requests:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const submitDubbingJob = async (data: DubbingJobData): Promise<SubmitJobResponse> => {
  const formData = new FormData();
  formData.append('voice_file', data.voiceTrack);
  if (data.backgroundTrack) {
    formData.append('background_file', data.backgroundTrack);
  }
  formData.append('languages', JSON.stringify(data.targetLanguages));

  const response = await fetch(`${API_BASE}/api/jobs`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (error.error === 'duration_mismatch') {
      throw new Error(`Audio tracks must be the same length. Voice: ${error.voice_duration}s, Background: ${error.background_duration}s`);
    }
    throw new Error(error.message || 'Failed to submit job');
  }
  
  return response.json();
};
```

### 2. Update Job Status Polling
Replace the mock `simulateJobProgress` with real polling:
```typescript
export const pollJobStatus = (
  jobId: string,
  onProgress: (status: GetJobStatusResponse) => void,
  onComplete: () => void
) => {
  const poll = async () => {
    const status = await getJobStatus(jobId);
    onProgress(status);
    
    if (status.status === 'complete') {
      onComplete();
    } else {
      setTimeout(poll, 2000); // Poll every 2 seconds
    }
  };
  
  poll();
};
```

### 3. Handle File Downloads
Update download links to point to backend endpoints:
```typescript
const downloadUrl = `${API_BASE}/api/jobs/${jobId}/download?lang=${langCode}&type=${fileType}`;
```

## 🐛 Known Issues & Fixes Applied

### Hydration Errors
- **Fixed**: Added `suppressHydrationWarning={true}` to `<body>` tag for browser extension attributes
- **Fixed**: Added proper hydration protection to theme toggle components
- **Root Cause**: Browser extensions (Grammarly) adding DOM attributes + localStorage access during SSR

### File Upload Validation
- **Current**: Client-side duration extraction and validation
- **Backend Integration**: Move validation to backend, keep UI feedback

## 🚀 Development Workflow

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:3000
```

### Building for Production
```bash
npm run build
npm start
```

### Key Development Notes
- All components are client-side rendered (`'use client'`)
- Theme system supports light/dark mode with localStorage persistence
- Responsive design with mobile-first approach
- Accessibility features: keyboard navigation, screen reader support
- Error boundaries and loading states implemented

## 📋 Backend Integration Checklist

When the backend is ready:

- [ ] Update `NEXT_PUBLIC_API_URL` environment variable
- [ ] Replace mock functions in `lib/api.ts` with real HTTP calls
- [ ] Update job status polling to use real API
- [ ] Test file upload with actual backend
- [ ] Test job status updates and progress tracking
- [ ] Test file downloads for completed jobs
- [ ] Update error handling for network failures
- [ ] Add loading states for API calls
- [ ] Test with different file sizes and formats
- [ ] Verify CORS configuration for file uploads

## 🎯 Current State Summary

**Frontend Status**: ✅ **Complete & Ready for Backend Integration**
- All UI components implemented and styled
- Mock API system fully functional
- File upload validation working
- Real-time progress tracking simulated
- Responsive design complete
- Theme system working
- Hydration issues resolved
- Ready to connect to real backend API

**Next Steps**: Replace mock API calls with real backend integration once backend is deployed.

---

## 🚀 **FRONTEND EXPANSION REQUIREMENTS**

Based on the backend architecture and business requirements, the frontend needs significant expansion to support the complete YT Dubber platform.

### **🎯 Critical UI/UX Features Needed**

#### **1. Authentication System** 🔐
- **User Registration/Login** with Subabase Auth integration
- **JWT token management** for secure API calls
- **Protected routes** (jobs, dashboard, billing)
- **User profile management** and account settings
- **Password reset** and email verification flows

#### **2. Payment Integration** 💳
- **Stripe integration** for subscription/pay-per-use billing
- **Pricing tiers** and plan selection UI
- **Usage tracking** and billing dashboard
- **Payment history** and invoice management
- **Credit/payment method** management
- **Subscription management** (upgrade/downgrade/cancel)

#### **3. Enhanced Job Management** 📋
- **Job history page** (`/jobs`) - currently shows empty state
- **Job details with audit trail** and processing logs
- **Job deletion/cancellation** functionality
- **Job sharing** and collaboration features
- **Export job data** for billing/records
- **Job search and filtering** capabilities

#### **4. Real-time Features** ⚡
- **WebSocket/SSE integration** for live job updates
- **Real-time progress tracking** (replace current simulation)
- **Live notifications** for job completion
- **Queue status** and estimated wait times
- **Real-time error notifications** and recovery options

#### **5. Advanced File Management** 📁
- **File preview** with audio player before upload
- **Upload progress** with pause/resume functionality
- **File validation** with detailed error messages
- **Batch upload** capabilities for multiple files
- **File history** and re-upload options
- **Cloud storage** integration for file persistence

#### **6. Download & Export System** ⬇️
- **Multiple download formats**:
  - Voice-only tracks per language
  - Full-mix tracks (voice + background)
  - SRT/VTT caption files
  - Manifest JSON with metadata
- **Bulk download** for multiple languages
- **Download history** and re-download links
- **File expiration** warnings (48-hour retention)
- **Download progress** and resume capability

#### **7. User Dashboard** 📊
- **Usage analytics** and processing statistics
- **Cost tracking** per job/language
- **Processing history** with search/filter
- **Account settings** and preferences
- **API usage** and limits display
- **Performance metrics** and insights

#### **8. Error Handling & Recovery** 🚨
- **Upload failure recovery** with retry options
- **Processing error handling** with detailed messages
- **Network failure** graceful degradation
- **File corruption** detection and re-upload prompts
- **Rate limiting** user feedback and queuing
- **Error boundary** components for crash recovery

#### **9. Mobile Optimization** 📱
- **Mobile-first** responsive design improvements
- **Touch-friendly** file upload interface
- **Mobile-specific** UI patterns and gestures
- **Offline capability** for viewing completed jobs
- **Progressive Web App** features
- **Mobile payment** optimization

#### **10. Admin/Support Features** 🛠️
- **Support ticket** system integration
- **Help documentation** and tutorials
- **FAQ** section with search
- **Contact/support** forms
- **Status page** for service health
- **Live chat** or support widget

### **🎨 New Components Required**

#### **Authentication Components:**
- `AuthForm.tsx` - Login/register forms with validation
- `AuthProvider.tsx` - Context for authentication state
- `ProtectedRoute.tsx` - Route protection wrapper
- `UserProfile.tsx` - Account management interface

#### **Payment Components:**
- `PaymentForm.tsx` - Stripe payment integration
- `BillingDashboard.tsx` - Usage and billing display
- `PricingTiers.tsx` - Plan selection interface
- `PaymentHistory.tsx` - Transaction history
- `SubscriptionManager.tsx` - Plan management

#### **Job Management Components:**
- `JobHistory.tsx` - List of past jobs with filtering
- `JobDetails.tsx` - Detailed job view with audit trail
- `JobCard.tsx` - Individual job display component
- `JobFilters.tsx` - Search and filter interface
- `JobActions.tsx` - Delete/cancel/share actions

#### **File Management Components:**
- `FilePreview.tsx` - Audio file preview player
- `UploadProgress.tsx` - Enhanced upload progress
- `FileValidator.tsx` - Client-side validation
- `BatchUpload.tsx` - Multiple file upload
- `FileManager.tsx` - File history and management

#### **Download Components:**
- `DownloadManager.tsx` - File download interface
- `DownloadCard.tsx` - Individual download item
- `BulkDownload.tsx` - Multiple file download
- `DownloadHistory.tsx` - Download tracking
- `FileExpiration.tsx` - Retention warnings

#### **Real-time Components:**
- `NotificationSystem.tsx` - Real-time notifications
- `ProgressTracker.tsx` - Enhanced progress display
- `QueueStatus.tsx` - Processing queue information
- `LiveUpdates.tsx` - WebSocket/SSE integration
- `ErrorNotifications.tsx` - Error alert system

#### **Dashboard Components:**
- `UserDashboard.tsx` - Main dashboard interface
- `UsageAnalytics.tsx` - Statistics and metrics
- `CostTracker.tsx` - Billing and usage tracking
- `SettingsPanel.tsx` - User preferences
- `AccountSettings.tsx` - Account management

#### **Utility Components:**
- `ErrorBoundary.tsx` - Error handling wrapper
- `LoadingStates.tsx` - Various loading indicators
- `EmptyStates.tsx` - Empty state displays
- `ConfirmDialog.tsx` - Confirmation modals
- `ToastNotifications.tsx` - Toast message system

### **📄 New Pages Required**

#### **Authentication Pages:**
- `/auth/login` - User login page
- `/auth/register` - User registration page
- `/auth/forgot-password` - Password reset
- `/auth/verify-email` - Email verification

#### **User Pages:**
- `/dashboard` - Main user dashboard
- `/billing` - Payment and usage management
- `/settings` - User preferences and account
- `/profile` - User profile management

#### **Job Pages:**
- `/jobs` - Enhanced job history (currently empty)
- `/jobs/[id]/details` - Detailed job view
- `/jobs/[id]/downloads` - Download management
- `/jobs/create` - Enhanced job creation

#### **Support Pages:**
- `/help` - Help documentation and tutorials
- `/support` - Support ticket system
- `/faq` - Frequently asked questions
- `/status` - Service status page

### **🔧 Implementation Priority & Next Steps**

#### **Phase 1 - Critical Foundation (Week 1-2)**
1. **Authentication System**
   - Set up Subabase Auth integration
   - Create login/register forms
   - Implement JWT token management
   - Add protected route wrapper

2. **Real API Integration**
   - Replace all mock functions in `lib/api.ts`
   - Implement proper error handling
   - Add loading states for API calls
   - Test with backend endpoints

3. **Enhanced Job Management**
   - Build job history page (`/jobs`)
   - Add job details view
   - Implement job actions (delete/cancel)
   - Add search and filtering

#### **Phase 2 - Core Features (Week 3-4)**
1. **Payment Integration**
   - Integrate Stripe for billing
   - Create pricing tiers UI
   - Build billing dashboard
   - Add payment history

2. **Real-time Updates**
   - Implement WebSocket/SSE
   - Replace progress simulation
   - Add live notifications
   - Build queue status display

3. **Download System**
   - Create download manager
   - Add multiple format support
   - Implement bulk downloads
   - Add file expiration warnings

#### **Phase 3 - Advanced Features (Week 5-6)**
1. **User Dashboard**
   - Build analytics dashboard
   - Add usage tracking
   - Create settings panel
   - Implement account management

2. **Error Handling**
   - Add error boundaries
   - Implement retry mechanisms
   - Create error notifications
   - Add recovery flows

3. **Mobile Optimization**
   - Improve responsive design
   - Add touch interactions
   - Optimize for mobile
   - Test PWA features

#### **Phase 4 - Polish & Admin (Week 7-8)**
1. **Support Features**
   - Add help documentation
   - Create FAQ section
   - Implement support tickets
   - Add status page

2. **Admin Tools**
   - Build admin dashboard
   - Add user management
   - Create system monitoring
   - Implement analytics

### **🛠️ Technical Implementation Notes**

#### **Environment Variables Needed:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

#### **New Dependencies Required:**
```json
{
  "@supabase/supabase-js": "^2.38.0",
  "@stripe/stripe-js": "^2.1.0",
  "stripe": "^14.0.0",
  "socket.io-client": "^4.7.0",
  "react-hot-toast": "^2.4.0",
  "react-hook-form": "^7.47.0",
  "zod": "^3.22.0"
}
```

#### **File Structure Updates:**
```
app/
├── auth/                 # Authentication pages
├── dashboard/           # User dashboard
├── billing/            # Payment management
├── settings/           # User settings
├── help/              # Support pages
└── admin/             # Admin panel

components/
├── auth/              # Authentication components
├── payment/           # Payment components
├── jobs/              # Job management components
├── downloads/         # Download components
├── dashboard/         # Dashboard components
└── admin/             # Admin components

lib/
├── auth.ts            # Authentication utilities
├── stripe.ts          # Payment integration
├── websocket.ts       # Real-time communication
└── analytics.ts       # Usage tracking
```

### **🎯 Immediate Next Steps for Any Agent**

1. **Start with Authentication** - This is the foundation for everything else
2. **Replace Mock API** - Connect to real backend endpoints
3. **Build Job History** - Enhance the empty `/jobs` page
4. **Add Payment Integration** - Essential for monetization
5. **Implement Real-time Updates** - Replace current simulation

**Current Status**: Frontend foundation is complete, ready for major expansion to support full platform functionality.

---

## 🔄 Recent Updates & Changes

### Branding & Visual Updates
- **Logo Replacement**: Replaced YouTube branding with custom YTdubber logo throughout the app
- **Favicon**: Updated favicon.ico with YTdubber logo (32x32 PNG)
- **Navigation**: Updated to "YT Dubber" branding while maintaining YouTube-style typography
- **Page Title**: Browser tab now displays "YT Dubber"
- **Homepage Hero**: Updated to "YouTube [YTdubber Icon] Dubber" with larger icon (80px)

### Content & Copy Updates
- **Hero Description**: Changed "let our AI" to "let us" for more personal touch
- **Punctuation**: Removed period from main description for cleaner look
- **Scroll Indicator**: Simplified "or learn more" to "learn more"

### Features Section Enhancements
- **Layout**: Changed from 3-column to 2x2 grid layout for better visual balance
- **New Feature**: Added "Best Value Pricing" feature highlighting competitive pricing vs Rask/HeyGen
- **Icon**: Added DollarSign icon for pricing feature
- **Animation**: Slowed down feature card animations for more elegant, premium feel
  - Duration increased from 0.6-0.8s to 0.8-1.2s
  - Delay spacing increased from 0.2s to 0.3s between cards
  - Spring physics adjusted for smoother motion

### Technical Improvements
- **Scroll-Triggered Animations**: Added `useInView` hook for features section
  - Animations now trigger when section comes into view (not just on page load)
  - Animations replay when scrolling back up and down
  - Set margin: -100px for earlier trigger point
- **Hydration Fixes**: Resolved Next.js hydration errors
  - Added `suppressHydrationWarning={true}` to body tag for browser extension attributes
  - Added proper hydration protection to ThemeToggle component
  - Fixed server/client mismatch issues

### File Organization
- **Context Documentation**: Moved FRONTEND_CONTEXT.md to frontend/ directory
- **MCP Organization**: Moved all MCP-related files to dedicated mcp/ folder
- **Cleanup**: Removed temporary YTdubber files from desktop after successful integration

### Backend Integration Specifications
- **Updated Requirements**: Clarified exact backend processing workflow
  - File validation and length matching requirements
  - Speech-to-text → translation → AI voice generation → mixing pipeline
  - Proper error handling for duration mismatches
- **API Contract**: Detailed expected endpoints and response formats
- **Error Handling**: Added validation error responses for track length mismatches

### Current Status
- **Frontend**: ✅ Complete and ready for backend integration
- **Animations**: ✅ Smooth, scroll-triggered animations working
- **Branding**: ✅ Consistent YTdubber branding throughout
- **Responsive**: ✅ Works on all screen sizes
- **Performance**: ✅ Optimized with proper hydration handling
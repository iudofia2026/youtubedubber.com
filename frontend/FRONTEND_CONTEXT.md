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
1. **Homepage** (`/`): Hero section with "YouTube [YTdubber Icon] Dubber" branding, credit-based pricing section, feature showcase, How it Works section, and CTAs
2. **Features** (`/features`): Comprehensive feature showcase with comparison table and advanced capabilities
3. **Pricing** (`/pricing`): Credit-based pricing plans with add-ons and FAQ section
4. **How it Works** (`/how-it-works`): Detailed 4-step process explanation with visual guides and use cases
5. **Upload** (`/new`): 4-step wizard starting with audio preparation guide, then file uploads and language selection
   - **Step 0**: Audio Setup - Animated visual guide explaining how to split video audio into voice and background tracks
   - **Step 1**: Voice Track Upload - Upload voice-only audio file
   - **Step 2**: Background Track Upload - Upload background music/ambient audio (optional)
   - **Step 3**: Target Languages - Select languages for dubbing
6. **Job Status** (`/jobs/[id]`): Real-time progress tracking with per-language details
7. **Jobs List** (`/jobs`): Complete job management interface with filtering and status tracking
8. **Authentication Pages**:
   - **Sign In** (`/auth/signin`): User login with email/password
   - **Sign Up** (`/auth/signup`): User registration with terms acceptance
   - **Password Reset** (`/auth/reset-password`): Email-based password reset
9. **Support Pages**:
   - **Help Center** (`/help`): Comprehensive FAQ, search functionality, and categorized help articles
   - **Contact Us** (`/contact`): Contact form, support methods, and quick links
   - **Status** (`/status`): System status, uptime metrics, and incident history
10. **Legal Pages**:
    - **Terms of Service** (`/legal/terms`): Comprehensive terms and conditions
    - **Privacy Policy** (`/legal/privacy`): Data protection and privacy information

## 🔧 Current Functionality

### File Upload System
- **Voice Track**: Required audio file (voice-only, no music/SFX)
- **Background Track**: Optional audio file (music, SFX, ambient)
- **Validation**: 
  - File size limit: 100MB
  - Audio format support: `audio/*`
  - Duration extraction and validation
  - Duration mismatch detection between tracks
- **Audio Preview Player**: 
  - Real-time audio playback with HTML5 audio controls
  - Play/pause, seek, volume control, and reset functionality
  - Progress bar with current time and total duration display
  - Volume slider with mute/unmute toggle
  - File information display (name, size, duration)
  - Automatic cleanup of audio URLs to prevent memory leaks

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

⚠️ **CRITICAL - NO TESTING**: Do not run `npm run dev`, `npm test`, `npm run build`, or any testing commands as they cause agents to run infinitely. The application is fully functional and ready for use without testing. All changes should be made directly to code files only.

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

**Frontend Status**: ✅ **Foundation Complete + Error Handling Implemented**
- All core UI components implemented and styled
- Mock API system fully functional
- File upload validation working with enhanced error handling
- Real-time progress tracking simulated with improved UX
- Responsive design complete
- Theme system working
- Hydration issues resolved
- **NEW**: Comprehensive error handling and loading states implemented
- **NEW**: Toast notification system for user feedback
- **NEW**: Enhanced file upload with progress tracking and validation
- **NEW**: Improved job creation wizard with validation and loading states
- **NEW**: Error boundary for crash recovery
- Ready to connect to real backend API

**Recently Completed (Latest Update)**:
- ✅ ErrorBoundary component for crash recovery
- ✅ Toast notification system (success/error/warning/info)
- ✅ Enhanced loading states throughout the app
- ✅ Improved file upload with better error messages and progress
- ✅ Job creation wizard validation and loading states
- ✅ Enhanced progress tracking components
- ✅ **Job History Page** - Complete job management interface with filtering
- ✅ **JobCard Component** - Individual job display with status indicators
- ✅ **JobFilters Component** - Search, status filtering, and sorting
- ✅ **Navigation Dropdown** - Jobs dropdown with status-based filtering
- ✅ **URL Parameter Integration** - Filters sync with URL for bookmarking
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **SSR Hydration Fix** - Resolved infinite loading issue with job filtering
- ✅ **Mobile Optimization** - Enhanced touch interactions and mobile-specific UI improvements
- ✅ **Navigation Improvements** - Added breadcrumbs, enhanced page headers, and improved navigation flow
- ✅ **Seamless Gradient Background** - Implemented continuous gradient background across entire homepage for more cohesive visual experience
- ✅ **Enhanced Section Headers** - Redesigned "Why Choose Our Platform?" section with creative typography and interactive animations
- ✅ **Background Animations** - Added subtle, performance-optimized animations to gradient background layers
- ✅ **Visual Refinements** - Reduced gradient intensity and cleaned up decorative elements for cleaner appearance
- ✅ **File Preview System** - Complete audio preview player with play/pause, seek, volume control, and real-time progress tracking
- ✅ **Development Authentication Bypass** - Complete development mode for testing without Supabase setup
- ✅ **Marketing Pages** - Comprehensive Features, Pricing, and How it Works pages with professional UI/UX
- ✅ **Homepage How it Works Section** - Added 4-step process explanation directly on homepage for new users
- ✅ **Navigation Optimization** - Streamlined navigation by removing How it Works (moved to homepage)
- ✅ **Footer Updates** - Updated footer links to point to actual pages instead of hash links

**Next Steps**: Continue with remaining high-impact, low-effort items from the expansion roadmap.

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

### **🎨 Visual Enhancement System**

#### **Creative Job Page Distinctions**
- **Status-Based Color Coding**: Each job status has unique visual identity
  - **Complete Jobs**: Green gradients with celebration animations (🎉)
  - **Processing Jobs**: Blue gradients with spinning animations (⚡)
  - **Error Jobs**: Red gradients with warning animations (⚠️)
  - **Pending Jobs**: Yellow gradients with floating animations (⏳)

#### **Animated Status Banners**
- **Dynamic Backgrounds**: Animated blur patterns that pulse and scale
- **Interactive Icons**: Status-specific icons with unique animations
- **Progress Indicators**: Real-time progress bars with smooth transitions
- **Emoji Integration**: Fun emojis for better visual recognition

#### **Enhanced Job Cards**
- **Gradient Backgrounds**: Status-specific gradient themes
- **Animated Icons**: Rotating, pulsing, and floating animations
- **Hover Effects**: Scale and lift animations on interaction
- **Status Dots**: Pulsing indicator dots for active status
- **Shadow Effects**: Dynamic shadows that respond to status

#### **Interactive Elements**
- **Smooth Transitions**: All animations use Framer Motion for fluidity
- **Hover States**: Enhanced hover effects with scale and color changes
- **Loading States**: Animated loading indicators with status-specific themes
- **Touch Optimization**: Mobile-friendly touch interactions

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
- `DevModeToggle.tsx` - Development mode toggle (floating button)

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

#### **Phase 1 - Critical Foundation (Week 1-2)** ✅ **PARTIALLY COMPLETE**
1. **Authentication System** 📋 **PENDING**
   - Set up Subabase Auth integration
   - Create login/register forms
   - Implement JWT token management
   - Add protected route wrapper

2. **Real API Integration** 📋 **PENDING**
   - Replace all mock functions in `lib/api.ts`
   - Implement proper error handling ✅ **COMPLETED**
   - Add loading states for API calls ✅ **COMPLETED**
   - Test with backend endpoints

3. **Enhanced Job Management** ✅ **COMPLETED**
   - Build job history page (`/jobs`) ✅ **COMPLETED**
   - Add job details view 📋 **PENDING**
   - Implement job actions (delete/cancel) ✅ **COMPLETED**
   - Add search and filtering ✅ **COMPLETED**

#### **✅ COMPLETED ITEMS (Latest Update)**
- **Error Handling & Loading States** ✅ **COMPLETED**
  - ErrorBoundary component for crash recovery
  - Toast notification system (success/error/warning/info)
  - Enhanced loading states throughout the app
  - Improved file upload with progress tracking and validation
  - Job creation wizard validation and loading states
  - Enhanced progress tracking components

- **Job Management System** ✅ **COMPLETED**
  - Complete job history page with grid layout
  - JobCard component with status indicators and actions
  - JobFilters component with search, status filtering, and sorting
  - Navigation dropdown with status-based filtering
  - URL parameter integration for bookmarkable filters
  - Responsive design for all screen sizes
  - Mock data integration with realistic job examples

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

### **🚀 Development Mode Usage**

#### **How to Enable Development Authentication Bypass**
1. **Set Environment Variable**: Add `NEXT_PUBLIC_DEV_MODE=true` to `.env.local`
2. **Start Development Server**: Run `npm run dev` (or `PORT=3011 npm run dev`)
3. **Access App**: Visit `http://localhost:3011` - you'll be automatically signed in as "Development User"
4. **Full Access**: All protected routes and features are immediately available
5. **No Setup Required**: Works without Supabase configuration or database setup

#### **Development User Details**
- **Email**: `dev@youtubedubber.com`
- **Name**: `Development User`
- **ID**: `dev-user-123`
- **Status**: Fully authenticated with all permissions

#### **Testing Authentication Features**
- **Sign In/Out**: Auth forms work but simulate success in development mode
- **Profile Updates**: Profile changes are simulated with success messages
- **Protected Routes**: All job management and upload features are accessible
- **Navigation**: User dropdown and profile menu work normally

#### **🔄 Quick Dev Mode Toggle (NEW)**
- **Floating Toggle**: Fixed bottom-right corner button for easy access
- **One-Click Switch**: Toggle between dev mode and normal mode instantly
- **Visual Indicators**: Orange button for dev mode, gray for normal mode
- **Persistent Settings**: Remembers your preference across sessions
- **Auto-Refresh**: Page refreshes automatically after toggling for immediate effect
- **Always Visible**: Available on all pages and screen sizes
- **Development Only**: Only appears when `NODE_ENV=development`

### **🎯 Immediate Next Steps for Any Agent**

#### **✅ COMPLETED (Latest Update)**
- **Error Handling & Loading States** - Comprehensive system implemented
- **Toast Notifications** - User feedback system complete
- **Enhanced File Upload** - Progress tracking and validation complete
- **Job Creation Validation** - Form validation and loading states complete
- **Job History Page** - Complete job management interface with filtering ✅ **COMPLETED**
- **Navigation Dropdown** - Jobs dropdown with status-based filtering ✅ **COMPLETED**
- **URL Parameter Integration** - Filters sync with URL for bookmarking ✅ **COMPLETED**
- **Mobile Optimization** - Enhanced touch interactions and mobile-specific UI improvements ✅ **COMPLETED**
- **Navigation Improvements** - Added breadcrumbs, enhanced page headers, and improved navigation flow ✅ **COMPLETED**
- **Authentication System** - Complete Supabase integration with login/register/profile management ✅ **COMPLETED**

#### **🚀 NEXT HIGH-PRIORITY ITEMS (Low Effort, High Impact)**

1. **File Preview System** ⭐⭐⭐⭐ ✅ **COMPLETED**
   - ✅ Add audio file preview player with full controls
   - ✅ Show file duration and size before upload
   - ✅ Play/pause, seek, volume control, and reset functionality
   - ✅ Real-time progress tracking and time display
   - **Effort**: 2-3 hours, **Impact**: High (improves upload experience)

2. **Navigation Improvements** ⭐⭐⭐⭐
   - Add breadcrumbs to job pages
   - Improve mobile navigation
   - Add "Back to Jobs" links
   - **Effort**: 1-2 hours, **Impact**: Medium-High (improves site navigation)

3. **Authentication UI** ⭐⭐⭐⭐
   - Create login/register forms (UI only)
   - Add auth state management
   - Create protected route wrapper
   - **Effort**: 4-6 hours, **Impact**: High (enables user accounts)

4. **Download System UI** ⭐⭐⭐⭐
   - Create download buttons for completed jobs
   - Add download progress indicators
   - Create download history view
   - **Effort**: 3-4 hours, **Impact**: High (completes user journey)

**Current Status**: Foundation complete + error handling + job management + enhanced upload flow + navigation fixes + authentication system implemented + comprehensive marketing pages (Features, Pricing, How it Works) + homepage How it Works section + streamlined navigation. Ready for next phase of high-impact features.

## 🔐 **AUTHENTICATION SYSTEM IMPLEMENTATION**

### **✅ Completed Authentication Features**

#### **1. Supabase Integration** 
- **Context Management**: Complete auth context with user state, session management, and loading states
- **Environment Configuration**: Graceful fallback when Supabase credentials are not configured
- **Type Safety**: Full TypeScript integration with Supabase types and database schema
- **Error Handling**: Comprehensive error handling for all auth operations

#### **2. Authentication Forms**
- **Login Form** (`/auth/signin`): Email/password with remember me option
- **Registration Form** (`/auth/signup`): Full name, email, password with confirmation
- **Password Reset** (`/auth/reset-password`): Email-based password reset flow
- **Form Validation**: Zod schemas with real-time validation and error messages
- **UI/UX**: Responsive design with smooth animations and loading states

#### **3. Protected Routes**
- **ProtectedRoute Component**: Wrapper for authenticated pages
- **Route Protection**: Automatic redirect to login for unauthenticated users
- **Loading States**: Proper loading handling during auth checks
- **Fallback UI**: User-friendly messages for auth requirements

#### **4. User Profile Management**
- **Profile Component**: Editable user profile with avatar support
- **User Menu**: Dropdown with profile info and sign out option
- **Avatar Support**: Custom avatar URLs with fallback to default icon
- **Profile Updates**: Real-time profile updates with success feedback

#### **5. Navigation Integration**
- **Auth-Aware Navigation**: Different menu items for authenticated/unauthenticated users
- **User Dropdown**: Profile menu with user info and actions
- **Mobile Support**: Touch-optimized mobile navigation with auth features
- **Conditional Rendering**: Jobs and protected features only show when authenticated

#### **6. Backend Integration Ready**
- **API Structure**: Prepared for real backend integration
- **Database Schema**: Complete TypeScript types for Supabase tables
- **Environment Variables**: Proper configuration for production deployment
- **Error Boundaries**: Graceful handling of auth failures

### **🔧 Technical Implementation Details**

#### **Development Mode Bypass**
- **Environment Variable**: `NEXT_PUBLIC_DEV_MODE=true` enables development authentication bypass
- **Mock User**: Automatically creates a development user with email `dev@youtubedubber.com`
- **Full Functionality**: All auth operations (sign in, sign up, sign out, profile updates) work in development mode
- **No Supabase Required**: Development mode works without Supabase configuration
- **Production Safe**: Development mode is automatically disabled in production builds

#### **Dependencies Added**
```json
{
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/ssr": "^2.0.0",
  "react-hook-form": "^7.47.0",
  "@hookform/resolvers": "^3.3.0",
  "zod": "^3.22.0"
}
```

#### **New File Structure**
```
lib/
├── auth-context.tsx      # Authentication context and state management
├── auth-schemas.ts       # Zod validation schemas for forms
└── supabase.ts          # Supabase client configuration

components/auth/
├── AuthForm.tsx         # Login/register/reset password forms
├── ProtectedRoute.tsx   # Route protection wrapper
└── UserProfile.tsx      # User profile management component

app/auth/
├── signin/page.tsx      # Login page
├── signup/page.tsx      # Registration page
└── reset-password/page.tsx # Password reset page
```

#### **Environment Variables Required**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### **Database Schema (Supabase)**
```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table (user-specific)
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'complete', 'error')) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  message TEXT,
  voice_track_duration INTEGER NOT NULL,
  target_languages TEXT[] NOT NULL,
  background_track BOOLEAN DEFAULT false,
  completed_languages INTEGER DEFAULT 0,
  total_languages INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_completion TIMESTAMP WITH TIME ZONE
);
```

### **🚀 Authentication Flow**

#### **User Registration**
1. User fills out registration form with validation
2. Supabase creates user account with email verification
3. User profile created in database
4. Welcome message and redirect to jobs page

#### **User Login**
1. User enters credentials with validation
2. Supabase authenticates user
3. Session established and user context updated
4. Redirect to protected area (jobs page)

#### **Password Reset**
1. User requests password reset via email
2. Supabase sends reset email with secure token
3. User clicks link and is redirected to reset page
4. New password set and user logged in

#### **Profile Management**
1. User accesses profile via navigation dropdown
2. Editable form with current user data
3. Real-time validation and updates
4. Success feedback and UI updates

### **🔒 Security Features**

- **Email Verification**: Required for new accounts
- **Password Requirements**: Strong password validation
- **Session Management**: Secure session handling
- **Route Protection**: Automatic redirect for unauthenticated users
- **Error Handling**: Secure error messages without sensitive data
- **CSRF Protection**: Built-in Supabase security features

### **📱 Mobile Optimization**

- **Touch-Friendly**: Large touch targets for mobile devices
- **Responsive Forms**: Optimized for mobile screens
- **Mobile Navigation**: Auth-aware mobile menu
- **Loading States**: Proper loading indicators on mobile
- **Error Messages**: Mobile-friendly error display

**Latest Updates**:
- ✅ **Creative Visual Distinctions**: Added stunning visual elements to make job subpages easily distinguishable
- ✅ **Animated Status Banners**: Implemented dynamic status banners with animated backgrounds and icons for each job status
- ✅ **Enhanced Job Cards**: Created gradient backgrounds, animated icons, and status-specific visual themes
- ✅ **Interactive Animations**: Added hover effects, scale animations, and pulsing indicators for better UX
- ✅ **Status-Based Color Coding**: Complete color system with gradients, borders, and animated elements
- ✅ **Jobs Dropdown Navigation Fix**: Fixed seamless navigation between job status filters without requiring page refresh
- ✅ **URL Parameter Reactivity**: Implemented proper URL parameter listening using Next.js useSearchParams hook
- ✅ **Navigation State Management**: Updated JobHistory component to react to URL changes automatically
- ✅ **Router Navigation**: Changed from router.replace to router.push for proper component re-rendering
- ✅ **Credit-Based Pricing System**: Converted from subscription to credit-based pricing model
- ✅ **Homepage Pricing Section**: Added pricing section closer to top of homepage for better visibility
- ✅ **Pricing Page Updates**: Updated pricing page to reflect credit-based system with simplified pricing display
- ✅ **FAQ Updates**: Updated FAQ section to reflect credit-based pricing model
- ✅ **CTA Updates**: Updated call-to-action sections to emphasize "pay only for what you use"
- ✅ **Smart First-Time User Detection**: Personalized workflow based on user history
- ✅ **How It Works Integration**: Complete "How It Works" content as Step 0 for users with 0 jobs
- ✅ **Enhanced Visual Design**: Stunning gradient backgrounds and interactive step cards
- ✅ **Step Management**: Smart navigation that adapts to user type
- ✅ **Rules of Hooks Fix**: Resolved React hook order violation
- ✅ **URL Parameter Handling**: Improved URL parameter handling for better navigation
- ✅ **PostCSS Build Error Fix**: Resolved Tailwind CSS v4 configuration issues
- ✅ **Missing UI Components**: Added Checkbox component and dependencies
- ✅ **Documentation**: Updated frontend context with latest features
- ✅ **Dev Mode Toggle**: Floating bottom-right toggle for quick dev/normal mode switching

---

## 🐛 **Known Issues & Potential Bugs**

### **Current Issues (Minor)**
1. **SSR Hydration Warning** ✅ **FIXED**
   - **Issue**: `useSearchParams` was causing hydration warnings and infinite loading
   - **Impact**: High - caused infinite loading on job filtering
   - **Fix**: Added client-side initialization checks and proper SSR handling
   - **Status**: ✅ **RESOLVED**

2. **Jobs Dropdown Navigation** ✅ **FIXED**
   - **Issue**: Jobs dropdown links were not navigating properly to filtered job pages
   - **Impact**: Medium - users couldn't access filtered job views from navigation
   - **Fix**: Implemented proper URL parameter reactivity using useSearchParams hook and changed router.replace to router.push
   - **Status**: ✅ **RESOLVED**

3. **PostCSS Build Error** ✅ **FIXED**
   - **Issue**: `Cannot find module '@tailwindcss/postcss'` error preventing builds
   - **Impact**: High - prevented project from building successfully
   - **Fix**: Updated PostCSS configuration for Tailwind CSS v4 and installed missing dependencies
   - **Status**: ✅ **RESOLVED**

4. **URL Parameter Persistence** ⚠️
   - **Issue**: URL parameters may not persist on page refresh in some edge cases
   - **Impact**: Low - filters reset but functionality works
   - **Fix**: May need additional URL state management
   - **Status**: Testing needed

5. **Mobile Dropdown Behavior** ⚠️
   - **Issue**: Jobs dropdown on mobile may not close properly in some cases
   - **Impact**: Low - UX issue only
   - **Fix**: May need additional touch event handling
   - **Status**: Needs testing on various mobile devices

### **Potential Issues (Future)**
1. **Backend Integration** ⚠️
   - **Issue**: Mock data structure may not match real backend exactly
   - **Impact**: Medium - may need adjustments when connecting to real API
   - **Mitigation**: Job interface designed to match backend architecture
   - **Status**: Ready for backend integration

2. **Large Job Lists** ⚠️
   - **Issue**: Performance may degrade with 100+ jobs
   - **Impact**: Medium - may need pagination or virtualization
   - **Mitigation**: Current implementation should handle reasonable loads
   - **Status**: Monitor when real data is available

3. **Real-time Updates** ⚠️
   - **Issue**: Job status updates require polling or WebSocket integration
   - **Impact**: High - core functionality for live updates
   - **Mitigation**: Current polling simulation works, needs real implementation
   - **Status**: Ready for WebSocket/SSE integration

### **Development Guidelines**
⚠️ **NO TESTING COMMANDS**: Never run `npm run dev`, `npm test`, `npm run build`, or any testing commands as they cause infinite loops. All development should be done by editing code files directly.

### **Code Quality Assurance**
1. **Code Review**: Review all changes before committing
2. **TypeScript Compliance**: Ensure all TypeScript types are correct
3. **Component Logic**: Verify component state management and effects
4. **URL Handling**: Ensure proper URL parameter handling and navigation
5. **Error Handling**: Verify error boundaries and user feedback systems

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
- **Visual Design**: ✅ Seamless gradient background implemented across entire homepage
- **User Experience**: ✅ Smart first-time user detection with personalized workflows
- **Step Management**: ✅ Conditional step navigation based on user history
- **Legal Compliance**: ✅ Terms of Service and Privacy Policy pages implemented
- **Footer Navigation**: ✅ Comprehensive footer with legal links and social media

### Recent Visual Improvements
- **Seamless Gradient Background**: Implemented a multi-layered gradient system that flows continuously from top to bottom of the homepage
  - Fixed gradient layers covering entire viewport for consistent background
  - Section-specific gradient overlays for enhanced visual depth
  - Proper z-index management to ensure content appears above gradients
  - Responsive design that works across all screen sizes
  - Enhanced visual cohesion between hero, features, and CTA sections

- **Homepage How it Works Section**: Added comprehensive 4-step process explanation directly on homepage
  - **Step 1**: Prepare Your Audio (🎬) - Split video into voice/background tracks
  - **Step 2**: Upload Your Files (📤) - Upload tracks and select languages
  - **Step 3**: AI Processing (🤖) - Advanced AI generates natural dubs
  - **Step 4**: Download & Use (⬇️) - Get completed dubs ready to publish
  - Beautiful gradient cards with emojis and hover animations
  - Step-by-step details for each process stage
  - "Learn More" button linking to detailed how-it-works page
  - Perfect for new users to understand the process immediately

- **Enhanced Scroll Indicator**: Improved "learn more" section with better positioning and scroll-based fade-out
  - **Closer Positioning**: Moved scroll indicator closer to hero section with reduced padding (`py-4 -mt-4`)
  - **Scroll-Based Fade**: Added smooth fade-out effect that triggers when user scrolls down (fades over 200px of scroll)
  - **Smooth Animation**: Maintains existing pulsing text and bouncing arrow animations

- **Navigation Optimization**: Streamlined navigation for better user experience
  - **Removed How it Works** from main navigation (moved to homepage)
  - **Cleaner navigation** with only essential items: Home, New Job, Jobs
  - **Better for signed-in users** who don't need process explanation in nav
  - **Still accessible** via footer for users who need to reference it
  - **Improved information architecture** - right content for right users

### Upload Page Enhancements (Latest Update)
- **Smart First-Time User Detection**: Implemented intelligent user flow based on job history
  - **First-Time Users**: See complete "How It Works" guide (Step 0) with 4-step process explanation
  - **Returning Users**: Start directly at "Upload Voice Track" (Step 1) for faster workflow
  - **User State Management**: Uses localStorage to track user history and personalize experience
  - **Loading State**: Professional loading spinner while checking user history
  - **Welcome Back Message**: Explains why guide was skipped for returning users

- **How It Works Integration**: Complete onboarding experience for new users
  - **4-Step Process**: Prepare Audio → Upload Files → AI Processing → Download & Use
  - **Visual Design**: Color-coded gradient cards with detailed instructions and pro tips
  - **Interactive Elements**: Hover animations, step-by-step details, and visual icons
  - **Call-to-Action**: Clean "Get Started" button to proceed to actual job creation
  - **Responsive Layout**: Alternating left/right layout for visual interest
  - **Clean UX**: No autoscroll - users can explore at their own pace

- **Enhanced Audio Preparation Guide (Step 0)**: Comprehensive visual centerpiece for new users
  - **Stunning Visual Design**: Gradient backgrounds with decorative blur elements
  - **Interactive Step Cards**: 4-step process with hover animations and transitions
  - **Corrected Workflow Order**: Import → Split → Export Voice → Export Background
  - **Important Notes**: Duration synchronization requirements highlighted
  - **Responsive Layout**: 2x2 grid that works on all screen sizes

- **Conditional Step Navigation**: Smart step management based on user type
  - **First-Time Users**: Full 4-step process (How It Works → Voice → Background → Languages)
  - **Returning Users**: 3-step process (Voice → Background → Languages)
  - **Step Filtering**: Progress bar only shows relevant steps for each user type
  - **Navigation Logic**: Prevents returning users from going back to Step 0

- **Simplified Visual Elements**: Clean, minimalist design
  - Removed specific text labels and file names for cleaner presentation
  - Focus on essential instructions and visual guidance
  - Enhanced typography and spacing for better readability
  - Mobile-optimized responsive design throughout

### Legal Pages and Footer Implementation (Latest Update)
- **Terms of Service Page** (`/legal/terms`): Comprehensive legal document covering:
  - Service description and user responsibilities
  - Content and intellectual property rights
  - Acceptable use policies and restrictions
  - Payment terms and billing information
  - Privacy and data handling practices
  - Service availability and limitations
  - Termination and liability clauses
  - Governing law and contact information

- **Privacy Policy Page** (`/legal/privacy`): Detailed data protection information including:
  - Information collection practices (personal, audio, usage data)
  - AI processing and data handling procedures
  - Data retention policies (48-hour default retention)
  - Information sharing and disclosure policies
  - Data security measures and encryption
  - User rights and choices (access, correction, deletion, portability)
  - Cookies and tracking technologies
  - International data transfers and compliance
  - Children's privacy protection
  - Contact information for privacy concerns

- **Footer Component**: Comprehensive site footer with:
  - **Brand Section**: Logo, description, and social media links
  - **Product Links**: Features, pricing, how it works
  - **Support Links**: Help center, contact, status page
  - **Legal Links**: Terms of Service, Privacy Policy, Cookie Policy
  - **Company Links**: About us, blog, careers
  - **Bottom Section**: Copyright, quick legal links, support contact
  - **Responsive Design**: Mobile-optimized layout with proper spacing
  - **Animation**: Smooth scroll-triggered animations for visual appeal

- **Authentication Integration**: Updated signup form with:
  - **Terms Acceptance**: Checkbox requiring users to accept terms
  - **Direct Links**: Links to actual Terms of Service and Privacy Policy pages
  - **External Links**: Opens legal pages in new tabs for better UX
  - **Validation**: Form validation ensures terms acceptance before registration

- **Layout Integration**: Footer added to main layout:
  - **Sticky Footer**: Footer stays at bottom of page using flexbox
  - **Consistent Branding**: Matches overall design system and color scheme
  - **Accessibility**: Proper semantic HTML and keyboard navigation
  - **Performance**: Optimized with proper lazy loading and animations

### Support Pages Implementation (Latest Update)
- **Help Center Page** (`/help`): Comprehensive support hub featuring:
  - **Search Functionality**: Real-time search through FAQ and help articles
  - **Categorized Content**: 8 categories (Getting Started, Audio Upload, Languages, etc.)
  - **Interactive FAQ**: Expandable FAQ with 10+ common questions and answers
  - **Quick Actions**: Direct links to key features and support options
  - **Premium UI/UX**: YouTube-inspired design with smooth animations and gradients
  - **Responsive Design**: Mobile-optimized with touch-friendly interactions

- **Contact Us Page** (`/contact`): Professional contact interface including:
  - **Contact Form**: Multi-category form with priority levels and validation
  - **Contact Methods**: Email, phone, and live chat options with response times
  - **Contact Information**: Business hours, office location, and support details
  - **Quick Links**: Direct access to help center, status page, and pricing
  - **Form Validation**: Real-time validation with success/error feedback
  - **Premium Design**: Consistent branding with animated elements

- **Status Page** (`/status`): System health monitoring dashboard featuring:
  - **Overall Status**: System-wide health indicator with uptime metrics
  - **Service Status**: Individual service health (API, Audio Processing, File Storage, etc.)
  - **Performance Metrics**: Response times, success rates, and usage statistics
  - **Incident History**: Recent incidents with severity levels and resolution details
  - **Real-time Updates**: Refresh functionality with last updated timestamps
  - **Professional Design**: Clean, informative layout with status indicators

- **Footer Integration**: Updated footer with working support links:
  - **Help Center Link**: Direct navigation to comprehensive help section
  - **Contact Us Link**: Easy access to contact form and support options
  - **Status Link**: Quick access to system status and health monitoring
  - **Consistent Styling**: All links properly styled and functional
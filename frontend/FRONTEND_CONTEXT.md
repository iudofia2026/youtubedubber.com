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
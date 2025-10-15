# YT Dubber - AI-Powered Video Dubbing Platform

A modern, full-stack application for AI-powered video dubbing with real-time processing, multi-language support, and seamless user experience.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/iudofia2026/youtubedubber.com.git
   cd youtubedubber.com
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your API keys
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   npm run dev
   ```

4. **Access Applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 📚 Documentation

- **[Frontend Documentation](./frontend/README.md)** - Complete frontend guide with features, setup, and development
- **[Backend Documentation](./backend/README.md)** - Complete backend guide with API, deployment, and architecture

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase Auth
- **Backend**: FastAPI, SQLAlchemy, Supabase, Deepgram, OpenAI, FFmpeg, Librosa
- **Database**: PostgreSQL via Supabase
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth with JWT tokens
- **AI Services**: Deepgram (STT/TTS), OpenAI (Translation)
- **Audio Processing**: FFmpeg, Librosa, NumPy, SciPy

## 🎯 Current Status

- ✅ **Frontend**: Complete UI implementation with authentication, job management, file upload, and mobile optimization. All major features implemented with mock data integration.
- ⚠️ **Backend**: Core FastAPI endpoints and models complete, but job processing pipeline still uses placeholder logic. Supabase integration ready but needs real API key configuration.
- 🔄 **Integration**: Ready for end-to-end testing. Development mode works with `dev-token` bypass; production requires Supabase configuration.
- 🎯 **Next**: Replace mock API calls with real backend integration, implement actual job processing pipeline, and configure production Supabase credentials.
- ✅ **MP4 Support**: Full MP4 video format support implemented with automatic audio extraction using FFmpeg.
- ✅ **Authentication**: Complete Supabase Auth integration with login/register/profile management.
- ✅ **Mobile Optimization**: Comprehensive mobile experience with touch optimization, swipe gestures, and haptic feedback.

## 🆕 Recent Updates (isiah-frontend-oct15 branch)

### ✅ COMPLETED Mobile Navigation & UX Enhancements
- **Mobile Navigation**: Enhanced mobile navigation with swipe gestures, touch optimization, and haptic feedback
- **Touch Interactions**: Implemented 44px minimum touch targets and improved touch event handling throughout
- **Swipe Gestures**: Added left-swipe actions for job cards and list items (View, Download, Delete)
- **Mobile Back Button**: Added contextual back navigation for job pages and upload flow
- **Haptic Feedback**: Integrated vibration feedback for key mobile interactions
- **Mobile Viewport**: Added proper viewport meta tag configuration to prevent zoom issues

### ✅ COMPLETED UI/UX Enhancements
- **Emoji Removal**: Replaced all emojis with professional Lucide React icons for cleaner, more professional appearance
- **List View Option**: Added toggle between grid and list views for job management with URL persistence
- **Enhanced Progress Meters**: Creative inline progress indicators with shimmer effects and language completion dots
- **Visual Improvements**: Gradient backgrounds, animated status indicators, and improved typography throughout

### ✅ COMPLETED Job Management Improvements
- **Individual Job Pages**: Completely redesigned for conciseness and visual appeal with dashboard-style layout
- **Progress Visualization**: Enhanced progress tracking with animated rings, pulsing indicators, and language-specific completion status
- **Responsive Design**: Optimized layouts for both desktop and mobile viewing
- **Status Indicators**: Professional icon-based status system replacing emoji-based indicators
- **Mobile Job Cards**: Enhanced job cards with swipe actions and mobile-optimized touch interactions

### ✅ COMPLETED Mobile Upload Experience
- **Touch-Optimized File Upload**: Enhanced file upload with mobile-specific drag-and-drop and touch interactions
- **Mobile Audio Player**: Improved audio preview controls with larger touch targets and mobile-optimized layout
- **Mobile Form Validation**: Enhanced form validation with touch-friendly error messages and mobile keyboard optimization
- **Mobile Progress Indicators**: Optimized progress displays for mobile screens with better touch interaction

### ✅ COMPLETED Mobile Authentication
- **Mobile Form Optimization**: Enhanced authentication forms with mobile-specific input styling and touch targets
- **Mobile Keyboard Handling**: Optimized form inputs for mobile keyboard behavior and viewport management
- **Touch-Friendly Validation**: Improved error message display and form interaction for mobile devices

### ✅ COMPLETED Technical Improvements
- **Component Architecture**: New JobListItem component for horizontal list display
- **Animation System**: Enhanced Framer Motion animations with status-specific visual effects
- **URL State Management**: Improved URL parameter handling for view mode persistence
- **Performance**: Optimized rendering and animation performance
- **Mobile Utilities**: Added mobile-specific utility functions for device detection and haptic feedback

## 🚧 CURRENT SPRINT (October 15, 2025)

### ✅ COMPLETED (Latest)
1. **Mobile Navigation & UX** - Comprehensive mobile experience enhancement with touch optimization, swipe gestures, and haptic feedback
2. **Mobile Job Management** - Enhanced job cards and list items with mobile-optimized touch interactions
3. **Mobile Upload Experience** - Touch-optimized file upload and audio player controls
4. **Mobile Authentication** - Mobile-optimized forms with enhanced touch interactions

### ✅ COMPLETED (Latest)
1. **Download System UI** - Comprehensive download system for completed jobs with progress tracking
2. **Mobile Navigation & UX** - Enhanced mobile experience with touch optimization and swipe gestures
3. **Authentication System** - Complete Supabase integration with login/register/profile management
4. **Job Management** - Complete job history, filtering, and status tracking system

### Next High-Priority Items
1. **Real API Integration** - Replace mock functions with real HTTP requests (3-4 hours, Very High Impact)
2. **Backend Job Processing** - Implement actual AI processing pipeline (8-10 hours, Very High Impact)
3. **Production Configuration** - Set up Supabase credentials and test end-to-end flow (2-3 hours, High Impact)

**Note**: All completed changes are available in the `isiah-frontend-oct15` branch. Current sprint items are being worked on by assigned agents.

## 📁 Project Structure

```
youtubedubber.com/
├── backend/                 # FastAPI backend
├── frontend/               # Next.js frontend
└── README.md              # This file
```

## 🔧 Development

Both frontend and backend support hot reload during development. See individual documentation for detailed setup and configuration instructions.

---

**Last Updated**: Oct 15, 2025  
**Status**: In Progress

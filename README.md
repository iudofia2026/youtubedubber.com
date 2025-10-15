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

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, SQLAlchemy, Supabase, Deepgram, OpenAI
- **Database**: PostgreSQL via Supabase
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth

## 🎯 Current Status

- ⚠️ **Frontend**: UI flows (upload wizard, jobs dashboard, status view) are implemented but still use mocked data in several places. Real API polling and Supabase-backed auth need to be wired up before launch.
- ⚠️ **Backend**: Core FastAPI endpoints, models, and validation exist, yet audio ingestion, worker processing, and artifact delivery are still placeholder logic. Supabase storage paths are not persisted and vendor integrations are not exercised end-to-end.
- 🔄 **Integration**: End-to-end testing is in progress. Development mode relies on the `dev-token` bypass; full Supabase auth + signed upload flow remains to be verified with real credentials.
- 🎯 **Next**: Finish job lifecycle implementation, align API responses with frontend expectations, and replace mock data with live calls.

## 🆕 Recent Updates (isiah-frontend-oct15 branch)

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

### ✅ COMPLETED Technical Improvements
- **Component Architecture**: New JobListItem component for horizontal list display
- **Animation System**: Enhanced Framer Motion animations with status-specific visual effects
- **URL State Management**: Improved URL parameter handling for view mode persistence
- **Performance**: Optimized rendering and animation performance

## 🚧 CURRENT SPRINT (October 15, 2025)

### In Progress
1. **Download System UI** - Comprehensive download system for completed jobs with progress tracking
2. **Mobile Navigation Improvements** - Enhanced mobile experience with touch optimization

### Next High-Priority Items
1. **Real API Integration** - Replace mock functions with real HTTP requests (3-4 hours, Very High Impact)
2. **Job Details View Enhancement** - Add audit trail and processing logs (2-3 hours, High Impact)
3. **Error Recovery Flows** - Add retry mechanisms and graceful degradation (2-3 hours, High Impact)

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

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

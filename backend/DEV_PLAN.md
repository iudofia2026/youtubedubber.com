# Backend Development Plan

## Guiding Principles
- Ship a vertical slice quickly: accept uploads, process one job end-to-end, and return downloadable assets.
- Prefer a single FastAPI service with in-process background execution for the MVP; introduce external workers or queues only when throughput requires it.
- Consolidate on Supabase for auth, database, and storage. Defer third-party add-ons (premium TTS, billing, observability suites) until after the core dubbing loop is reliable.
- Document clear upgrade paths so future sprints can layer on Redis, Dramatiq, premium voices, Stripe billing, and monitoring without rework.

## Core Stack (MVP)
- API: FastAPI with SQLModel or SQLAlchemy plus Pydantic settings
- Storage/Auth/DB: Supabase (JWT validation middleware, Postgres tables, Storage signed URLs)
- Background execution: FastAPI BackgroundTasks helper or a dedicated async worker thread pulling pending jobs from Postgres
- Vendors: Deepgram (STT and default TTS) and OpenAI translation
- Media tooling: ffmpeg CLI and librosa helpers invoked from the worker
- Packaging: Dockerfile for API (worker runs in same container) with simple lint, type check, and unit test workflow

## Phase Breakdown

### Phase 0 – MVP Foundations
- Scaffold FastAPI project structure (api, services, repositories, schemas, background worker module).
- Implement configuration management with Pydantic settings and environment separation.
- Integrate Supabase Auth JWT validation middleware; apply RLS policies for per-user data isolation.
- Define SQLModel or SQLAlchemy models and Alembic migrations for tables such as users, dubbing_jobs, language_tasks, artifacts, job_events.
- Provide a minimal CI pipeline (lint, type checks, unit tests) and base Dockerfile.

### Phase 1 – Direct Upload Flow
- Add endpoint to mint short-lived signed upload URLs for voice and background tracks; persist metadata placeholders (hash, mime type, duration pending).
- Document client upload guidance (no service worker requirement). Store only metadata references; audio blobs remain in Supabase Storage.
- Build utility that retrieves blobs via signed URL, verifies checksum, streams to temp disk, and deletes temp data after use.
- Create simple management command or cron-ready script to purge generated artifacts older than 48 hours (manual execution acceptable during MVP).

### Phase 2 – Job Lifecycle and Processing Loop
- POST /jobs: validate payload, perform ffprobe duration check, create job and language tasks, enqueue processing via in-process worker.
- GET /jobs: list recent jobs for authenticated user with status summary.
- GET /jobs/{id}: expose per-language stage, progress percentage, and timestamps.
- Background worker stages:
  - STT with Deepgram stores transcript and timestamps.
  - Translation with OpenAI produces translated transcript per language.
  - TTS with Deepgram default voices yields audio buffers per language.
  - Alignment and mixing use librosa plus ffmpeg.
  - Captions and manifest generation upload outputs back to Supabase Storage and update metadata.
- Persist stage transitions and periodic heartbeats for progress tracking.
- Provide signed download URLs for artifacts via GET /jobs/{id}/download.

### Phase 3 – Hardening and Deferred Enhancements (Backlog)
Items documented for future sprints once the MVP is stable:
- Swap in Redis plus Dramatiq (or alternative) when concurrency exceeds in-process worker limits.
- Add premium voice tier, caching presets, and usage metering.
- Introduce Stripe-based billing, usage tracking, and automated invoicing.
- Provide real-time push via server-sent events or WebSockets once polling proves insufficient.
- Layer on observability (Prometheus, Grafana), retry and backoff, and a dead-letter queue.
- Automate scheduled retention sweeper and user-triggered delete endpoint.

## Deliverables Per Phase
- Architecture notes describing in-process worker flow and upgrade path to external queues.
- OpenAPI schema aligning with frontend contract.
- Tests covering signed upload issuance, job submission, mocked vendor pipeline, and artifact downloads.
- Deployment notes for running API and worker in a single container.

## Upgrade Path Reference
- Queue/Worker: Replace background module with Dramatiq and Redis by swapping enqueue abstraction and configuring new settings module.
- Premium Voices: Extend TTS service with additional voice options and quality tiers.
- Billing: Introduce Stripe webhooks and cost aggregation leveraging existing job_events table.
- Observability: Layer on structured logging exporters, metrics scraping, and alert routing without refactoring APIs.

## 🚀 **CLI-Based Development Process**

### **Development Environment Setup**

#### **1. Initial Project Structure**
```bash
# Create backend directory and setup
cd /Users/iudofia/Desktop/youtubedubber.com
mkdir -p backend/{app,services,models,tests,scripts}
cd backend

# Python environment setup
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install core dependencies
pip install fastapi uvicorn sqlalchemy alembic pydantic python-multipart
pip install supabase python-dotenv pytest httpx
pip install deepgram-sdk openai
pip install ffmpeg-python librosa soundfile
```

#### **2. Environment Configuration**
```bash
# Create environment files
touch .env .env.example .env.test
echo "SUPABASE_URL=your_supabase_url" >> .env.example
echo "SUPABASE_SERVICE_KEY=your_service_key" >> .env.example
echo "DEEPGRAM_API_KEY=your_deepgram_key" >> .env.example
echo "OPENAI_API_KEY=your_openai_key" >> .env.example
```

#### **3. Database Setup**
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Initialize Supabase project
supabase init
supabase start

# Create database migrations
alembic init migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### **Phase 0: Foundation Development (CLI)**

#### **Step 1: Project Scaffold**
```bash
# Create main application structure
touch app/__init__.py
touch app/main.py
touch app/config.py
touch app/database.py
touch app/auth.py
touch app/models.py
touch app/schemas.py
touch app/api/__init__.py
touch app/api/jobs.py
touch app/api/upload.py
touch app/services/__init__.py
touch app/services/ai_service.py
touch app/services/storage_service.py
touch app/worker/__init__.py
touch app/worker/processor.py
```

#### **Step 2: Core Configuration**
```bash
# Create configuration management
cat > app/config.py << 'EOF'
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    database_url: str
    supabase_url: str
    supabase_service_key: str
    
    # AI Services
    deepgram_api_key: str
    openai_api_key: str
    
    # Application
    app_name: str = "YT Dubber API"
    debug: bool = False
    secret_key: str
    
    class Config:
        env_file = ".env"

settings = Settings()
EOF
```

#### **Step 3: Database Models**
```bash
# Create SQLAlchemy models
cat > app/models.py << 'EOF'
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class DubbingJob(Base):
    __tablename__ = "dubbing_jobs"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    status = Column(String, default="pending")
    progress = Column(Integer, default=0)
    message = Column(Text)
    voice_track_url = Column(String)
    background_track_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class LanguageTask(Base):
    __tablename__ = "language_tasks"
    
    id = Column(String, primary_key=True)
    job_id = Column(String, index=True)
    language_code = Column(String)
    status = Column(String, default="pending")
    progress = Column(Integer, default=0)
    message = Column(Text)
    download_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
EOF
```

#### **Step 4: API Endpoints**
```bash
# Create main FastAPI application
cat > app/main.py << 'EOF'
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import jobs, upload

app = FastAPI(title=settings.app_name, debug=settings.debug)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(upload.router, prefix="/api/jobs", tags=["upload"])

@app.get("/")
async def root():
    return {"message": "YT Dubber API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
EOF
```

### **Phase 1: Upload Flow Development (CLI)**

#### **Step 1: Signed URL Endpoint**
```bash
# Create upload endpoints
cat > app/api/upload.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException
from app.schemas import UploadUrlsRequest, SignedUploadUrls
from app.services.storage_service import StorageService
from app.auth import get_current_user

router = APIRouter()

@router.post("/upload-urls", response_model=SignedUploadUrls)
async def request_upload_urls(
    request: UploadUrlsRequest,
    current_user = Depends(get_current_user),
    storage_service = Depends(StorageService)
):
    """Generate signed URLs for file uploads"""
    try:
        signed_urls = await storage_service.generate_upload_urls(
            user_id=current_user.id,
            languages=request.languages,
            voice_track_name=request.voice_track_name,
            background_track_name=request.background_track_name
        )
        return signed_urls
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
EOF
```

#### **Step 2: Job Creation Endpoint**
```bash
# Create job management endpoints
cat > app/api/jobs.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException
from app.schemas import JobCreationRequest, JobStatusResponse
from app.services.job_service import JobService
from app.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=JobStatusResponse)
async def create_job(
    request: JobCreationRequest,
    current_user = Depends(get_current_user),
    job_service = Depends(JobService)
):
    """Create a new dubbing job"""
    try:
        job = await job_service.create_job(
            user_id=current_user.id,
            job_data=request
        )
        return job
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    current_user = Depends(get_current_user),
    job_service = Depends(JobService)
):
    """Get job status and progress"""
    try:
        job = await job_service.get_job(job_id, current_user.id)
        return job
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
EOF
```

### **Phase 2: Background Processing (CLI)**

#### **Step 1: Worker Process**
```bash
# Create background worker
cat > app/worker/processor.py << 'EOF'
import asyncio
import logging
from app.services.ai_service import AIService
from app.services.job_service import JobService
from app.services.storage_service import StorageService

class JobProcessor:
    def __init__(self):
        self.ai_service = AIService()
        self.job_service = JobService()
        self.storage_service = StorageService()
        self.running = False
    
    async def start(self):
        """Start the background worker"""
        self.running = True
        logging.info("Job processor started")
        
        while self.running:
            try:
                await self.process_pending_jobs()
                await asyncio.sleep(5)  # Poll every 5 seconds
            except Exception as e:
                logging.error(f"Error in job processor: {e}")
                await asyncio.sleep(10)
    
    async def process_pending_jobs(self):
        """Process pending jobs"""
        jobs = await self.job_service.get_pending_jobs()
        
        for job in jobs:
            try:
                await self.process_job(job)
            except Exception as e:
                logging.error(f"Error processing job {job.id}: {e}")
                await self.job_service.update_job_status(
                    job.id, "error", f"Processing failed: {str(e)}"
                )
    
    async def process_job(self, job):
        """Process a single job"""
        # Update job status to processing
        await self.job_service.update_job_status(job.id, "processing")
        
        # Process each language
        for language_task in job.language_tasks:
            await self.process_language_task(job, language_task)
        
        # Mark job as complete
        await self.job_service.update_job_status(job.id, "complete")

if __name__ == "__main__":
    processor = JobProcessor()
    asyncio.run(processor.start())
EOF
```

### **Development Workflow (CLI)**

#### **Daily Development Process**
```bash
# 1. Start development environment
cd /Users/iudofia/Desktop/youtubedubber.com/backend
source venv/bin/activate

# 2. Start Supabase (if needed)
supabase start

# 3. Run database migrations
alembic upgrade head

# 4. Start API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 5. Start background worker (in separate terminal)
python -m app.worker.processor

# 6. Run tests
pytest tests/ -v

# 7. Check API documentation
curl http://localhost:8000/docs
```

#### **Testing Workflow**
```bash
# Run all tests
pytest tests/ -v --cov=app

# Run specific test file
pytest tests/test_api.py -v

# Run with coverage report
pytest tests/ --cov=app --cov-report=html

# Test API endpoints
curl -X POST "http://localhost:8000/api/jobs/upload-urls" \
  -H "Content-Type: application/json" \
  -d '{"languages": ["es"], "voice_track_name": "test.mp3"}'
```

#### **Database Management**
```bash
# Create new migration
alembic revision --autogenerate -m "Add new field"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Check migration status
alembic current
alembic history
```

### **Deployment Process (CLI)**

#### **Docker Setup**
```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# Build and run container
docker build -t ytdubber-api .
docker run -p 8000:8000 --env-file .env ytdubber-api
```

#### **Git Workflow**
```bash
# Development workflow
git checkout -b feature/phase-0-foundation
git add .
git commit -m "feat: implement Phase 0 foundation

- Add FastAPI application structure
- Implement database models
- Add authentication middleware
- Create basic API endpoints"

git push origin feature/phase-0-foundation

# Create pull request via GitHub CLI
gh pr create --title "Phase 0: Foundation" --body "Implements core FastAPI structure and database models"
```

### **Monitoring & Debugging (CLI)**

#### **Logging Setup**
```bash
# Create logging configuration
cat > app/logging.py << 'EOF'
import logging
import sys
from datetime import datetime

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(f'logs/app_{datetime.now().strftime("%Y%m%d")}.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )
EOF

# Monitor logs
tail -f logs/app_*.log
```

#### **Performance Monitoring**
```bash
# Install monitoring tools
pip install prometheus-client psutil

# Run performance tests
python -m pytest tests/performance/ -v

# Monitor API performance
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:8000/health"
```

### **Integration Testing (CLI)**

#### **End-to-End Testing**
```bash
# Create integration test script
cat > scripts/test_integration.py << 'EOF'
import asyncio
import httpx
import json

async def test_full_workflow():
    """Test complete job creation and processing workflow"""
    async with httpx.AsyncClient() as client:
        # Test health check
        response = await client.get("http://localhost:8000/health")
        assert response.status_code == 200
        
        # Test upload URL generation
        response = await client.post(
            "http://localhost:8000/api/jobs/upload-urls",
            json={"languages": ["es"], "voice_track_name": "test.mp3"}
        )
        assert response.status_code == 200
        
        print("✅ Integration tests passed")

if __name__ == "__main__":
    asyncio.run(test_full_workflow())
EOF

# Run integration tests
python scripts/test_integration.py
```

### **Quick Start Commands**

#### **Initial Setup (One-time)**
```bash
# Clone and setup
cd /Users/iudofia/Desktop/youtubedubber.com
git pull origin main

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
supabase start
alembic upgrade head
```

#### **Daily Development**
```bash
# Start services
cd backend
source venv/bin/activate
supabase start
uvicorn app.main:app --reload --port 8000

# In another terminal
cd backend
source venv/bin/activate
python -m app.worker.processor
```

#### **Testing & Validation**
```bash
# Run tests
pytest tests/ -v

# Test API
curl http://localhost:8000/health
curl http://localhost:8000/docs

# Check logs
tail -f logs/app_*.log
```

This comprehensive CLI-based development process ensures that all backend development can be completed entirely through terminal commands and text editors, with full integration testing and deployment capabilities.

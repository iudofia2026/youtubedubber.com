# CLI Development Guide - YT Dubber Backend

## 🚀 **Quick Start**

### **One-Time Setup**
```bash
# Navigate to project
cd /Users/iudofia/Desktop/youtubedubber.com/backend

# Create Python environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy alembic pydantic python-multipart
pip install supabase python-dotenv pytest httpx
pip install deepgram-sdk openai
pip install ffmpeg-python librosa soundfile

# Setup Supabase
npm install -g supabase
supabase init
supabase start

# Create environment file
cp .env.example .env
# Edit .env with your actual API keys
```

### **Daily Development**
```bash
# Terminal 1: Start API server
cd /Users/iudofia/Desktop/youtubedubber.com/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Start background worker
cd /Users/iudofia/Desktop/youtubedubber.com/backend
source venv/bin/activate
python -m app.worker.processor

# Terminal 3: Run tests
cd /Users/iudofia/Desktop/youtubedubber.com/backend
source venv/bin/activate
pytest tests/ -v
```

## 📁 **Project Structure**

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection
│   ├── auth.py              # Authentication middleware
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── api/
│   │   ├── __init__.py
│   │   ├── jobs.py          # Job management endpoints
│   │   └── upload.py        # Upload endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_service.py    # AI service integration
│   │   ├── storage_service.py # Supabase storage
│   │   └── job_service.py   # Job business logic
│   └── worker/
│       ├── __init__.py
│       └── processor.py     # Background job processor
├── tests/
│   ├── __init__.py
│   ├── test_api.py
│   ├── test_models.py
│   └── test_services.py
├── scripts/
│   └── test_integration.py
├── migrations/              # Alembic migrations
├── logs/                   # Application logs
├── .env                    # Environment variables
├── .env.example           # Environment template
├── requirements.txt       # Python dependencies
├── Dockerfile            # Container configuration
└── README.md
```

## 🔧 **Common Commands**

### **Development**
```bash
# Start API server
uvicorn app.main:app --reload --port 8000

# Start worker
python -m app.worker.processor

# Run tests
pytest tests/ -v

# Run specific test
pytest tests/test_api.py::test_create_job -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

### **Database**
```bash
# Create migration
alembic revision --autogenerate -m "Add new field"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Check status
alembic current
alembic history
```

### **Supabase**
```bash
# Start local Supabase
supabase start

# Stop Supabase
supabase stop

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --local > types/supabase.ts
```

### **Testing API**
```bash
# Health check
curl http://localhost:8000/health

# API documentation
curl http://localhost:8000/docs

# Test upload URLs
curl -X POST "http://localhost:8000/api/jobs/upload-urls" \
  -H "Content-Type: application/json" \
  -d '{"languages": ["es"], "voice_track_name": "test.mp3"}'

# Test job creation
curl -X POST "http://localhost:8000/api/jobs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"job_id": "test-123", "voice_track_uploaded": true, "languages": ["es"]}'
```

### **Docker**
```bash
# Build image
docker build -t ytdubber-api .

# Run container
docker run -p 8000:8000 --env-file .env ytdubber-api

# Run with volume mount
docker run -p 8000:8000 -v $(pwd):/app ytdubber-api
```

### **Git Workflow**
```bash
# Create feature branch
git checkout -b feature/phase-0-foundation

# Add changes
git add .

# Commit with message
git commit -m "feat: implement Phase 0 foundation

- Add FastAPI application structure
- Implement database models
- Add authentication middleware
- Create basic API endpoints"

# Push branch
git push origin feature/phase-0-foundation

# Create PR
gh pr create --title "Phase 0: Foundation" --body "Implements core FastAPI structure"
```

## 🐛 **Debugging**

### **Logs**
```bash
# Monitor application logs
tail -f logs/app_*.log

# Monitor Supabase logs
supabase logs

# Check worker logs
tail -f logs/worker_*.log
```

### **Database Debugging**
```bash
# Connect to local database
supabase db connect

# Check table structure
\dt

# Query specific table
SELECT * FROM dubbing_jobs LIMIT 10;

# Check migrations
alembic history
```

### **API Debugging**
```bash
# Test with verbose output
curl -v http://localhost:8000/health

# Test with headers
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/jobs

# Check API documentation
open http://localhost:8000/docs
```

## 📊 **Monitoring**

### **Performance Testing**
```bash
# Install performance tools
pip install locust

# Run load test
locust -f tests/load_test.py --host=http://localhost:8000

# Monitor system resources
htop
```

### **Health Checks**
```bash
# Application health
curl http://localhost:8000/health

# Database health
supabase status

# Worker health
ps aux | grep processor
```

## 🚀 **Deployment**

### **Local Production Test**
```bash
# Build production image
docker build -t ytdubber-api:prod .

# Run production container
docker run -d -p 8000:8000 --name ytdubber-api --env-file .env ytdubber-api

# Check container status
docker ps
docker logs ytdubber-api
```

### **Environment Variables**
```bash
# Required environment variables
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
DEEPGRAM_API_KEY=your_deepgram_key
OPENAI_API_KEY=your_openai_key
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

## 📝 **Development Tips**

### **Code Organization**
- Keep API endpoints thin, business logic in services
- Use dependency injection for testability
- Implement proper error handling and logging
- Write tests for all new functionality

### **Database Best Practices**
- Always create migrations for schema changes
- Use transactions for multi-table operations
- Index frequently queried columns
- Implement proper foreign key constraints

### **API Design**
- Follow RESTful conventions
- Use proper HTTP status codes
- Implement request/response validation
- Document all endpoints with OpenAPI

### **Testing Strategy**
- Unit tests for individual functions
- Integration tests for API endpoints
- End-to-end tests for complete workflows
- Mock external services in tests

This guide provides everything needed to develop the YT Dubber backend entirely through CLI tools and terminal commands.
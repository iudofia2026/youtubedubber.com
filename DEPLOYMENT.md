# Production Setup Guide - YouTube Multilingual Dubber

## Overview
This guide will help you set up the production-ready dubbing pipeline with:
- **STT**: Deepgram for speech-to-text transcription
- **Translation**: OpenAI GPT for text translation
- **TTS**: Deepgram for text-to-speech synthesis
- **Audio Mixing**: Background audio mixing with voice dubbing

## Architecture

### Complete Pipeline Flow
```
Upload Voice + Background Audio
         ↓
  1. STT (Deepgram)
         ↓
  2. Translation (OpenAI)
         ↓
  3. TTS (Deepgram)
         ↓
  4. Audio Mixing (FFmpeg)
         ↓
  5. Download Dubbed Audio
```

## Prerequisites

### Required Services
1. **Deepgram Account**: For STT and TTS
   - Sign up at https://deepgram.com
   - Get your API key from the dashboard

2. **OpenAI Account**: For translation
   - Sign up at https://platform.openai.com
   - Create an API key

3. **Supabase Project**: For database and storage (production)
   - Sign up at https://supabase.com
   - Create a new project
   - Note down your project URL and service key

### Required Tools
- Python 3.9+
- FFmpeg (for audio processing)
- Node.js 18+ (for frontend)

## Installation

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables** (`.env`):
   ```env
   # Database
   DATABASE_URL=postgresql://...  # Your PostgreSQL URL
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key

   # AI Services
   DEEPGRAM_API_KEY=your-deepgram-api-key
   OPENAI_API_KEY=your-openai-api-key

   # Application
   DEBUG=false
   SECRET_KEY=your-secret-key-here
   CORS_ORIGINS=https://yourdomain.com,http://localhost:3000

   # Storage
   STORAGE_BUCKET=yt-dubber-uploads
   MAX_FILE_SIZE=100MB

   # Worker Configuration
   WORKER_POLL_INTERVAL=5
   MAX_CONCURRENT_JOBS=3
   JOB_TIMEOUT=3600
   ```

4. **Run database migrations** (if using PostgreSQL):
   ```bash
   alembic upgrade head
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (`.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=https://your-api.com
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Running in Production

### Option 1: Separate Processes (Recommended)

#### Terminal 1: Start the API Server
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Terminal 2: Start the Background Worker
```bash
cd backend
python3 start_worker.py
```

#### Terminal 3: Start the Frontend
```bash
cd frontend
npm run build
npm start
```

### Option 2: Using Process Manager (PM2)

1. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Create ecosystem file** (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'ytdubber-api',
         script: 'uvicorn',
         args: 'app.main:app --host 0.0.0.0 --port 8000 --workers 4',
         cwd: './backend',
         interpreter: 'python3'
       },
       {
         name: 'ytdubber-worker',
         script: './backend/start_worker.py',
         interpreter: 'python3',
         instances: 1,
         autorestart: true
       },
       {
         name: 'ytdubber-frontend',
         script: 'npm',
         args: 'start',
         cwd: './frontend'
       }
     ]
   };
   ```

3. **Start all services**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup  # Enable startup on boot
   ```

### Option 3: Docker Deployment

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    command: python3 start_worker.py

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000
```

## Development Mode

For local development and testing:

### Backend (Development Mode)
```bash
cd backend
# Set DEBUG=true in .env
# You can use test credentials:
# SUPABASE_URL=https://test.supabase.co
uvicorn app.main:app --reload --port 8000
```

### Worker (Development Mode)
```bash
cd backend
python3 start_worker.py
```

### Frontend (Development Mode)
```bash
cd frontend
npm run dev
```

## Testing the Pipeline

### 1. Upload Audio Files
- Navigate to `/new` in the frontend
- Select voice audio file (your original audio)
- Select background audio file (optional - music/ambient sounds)
- Choose target languages (e.g., Spanish, French)
- Click "Start Dubbing"

### 2. Monitor Progress
- You'll be redirected to `/jobs/[id]`
- The page polls every ~10 seconds for status updates
- Watch the progress through phases:
  - **Processing** (0-30s): Transcribing audio with Deepgram
  - **Generating** (30-60s): Translating and generating speech
  - **Finalizing** (60-90s): Mixing audio tracks
  - **Complete** (90s+): Ready for download

### 3. Download Results
- Once complete, click "Download All" button
- Or download individual languages
- Files automatically save to your computer

## API Endpoints

### Create Job
```http
POST /api/jobs/
Content-Type: application/json
Authorization: Bearer {token}

{
  "job_id": "job_123",
  "voice_track_uploaded": true,
  "background_track_uploaded": true,
  "languages": ["es", "fr", "de"]
}
```

### Get Job Status
```http
GET /api/jobs/{job_id}
Authorization: Bearer {token}

Response:
{
  "id": "job_123",
  "status": "processing",  // uploading | processing | generating | finalizing | complete | error
  "progress": 45,
  "message": "Translating transcript...",
  "languages": [
    {
      "languageCode": "es",
      "languageName": "Spanish",
      "flag": "🇪🇸",
      "status": "generating",
      "progress": 60,
      "downloadUrl": null
    }
  ]
}
```

### Download File
```http
GET /api/jobs/{job_id}/download?lang=es&type=full
Authorization: Bearer {token}
```

## Worker Configuration

The background worker processes jobs continuously:

- **Poll Interval**: 5 seconds (configurable via `WORKER_POLL_INTERVAL`)
- **Max Concurrent Jobs**: 3 (configurable via `MAX_CONCURRENT_JOBS`)
- **Job Timeout**: 1 hour (configurable via `JOB_TIMEOUT`)

### Worker Logs
Monitor worker activity:
```bash
# View worker logs in real-time
tail -f backend/worker.log

# Or if using PM2:
pm2 logs ytdubber-worker
```

## Troubleshooting

### Worker Not Processing Jobs
1. Check worker is running: `ps aux | grep start_worker`
2. Check worker logs for errors
3. Verify database connection
4. Check API keys are valid

### Audio Download Not Working
1. Verify job reached "complete" status
2. Check `downloads/` directory exists
3. Check file permissions
4. Verify download URL in job status response

### Deepgram Errors
- Ensure API key is valid
- Check account has credits
- Verify audio file format is supported

### OpenAI Errors
- Ensure API key is valid
- Check account has credits
- Verify you're not hitting rate limits

## Performance Optimization

### For High Volume

1. **Increase Worker Instances**:
   ```env
   MAX_CONCURRENT_JOBS=10
   ```

2. **Use Multiple Workers**:
   ```bash
   # Start multiple worker processes
   python3 start_worker.py &
   python3 start_worker.py &
   python3 start_worker.py &
   ```

3. **Enable Caching**:
   - Cache translation results
   - Cache TTS responses for common phrases

4. **Use Redis for Job Queue** (Advanced):
   - Replace polling with Redis pub/sub
   - Implement job queue with Celery

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Rotate keys regularly
3. **HTTPS**: Always use HTTPS in production
4. **Authentication**: Implement proper user authentication
5. **Rate Limiting**: Configure rate limits for API endpoints
6. **File Validation**: Validate uploaded files (size, type, content)

## Monitoring

### Health Checks
```bash
# API Health
curl http://localhost:8000/health

# Worker Health (check process)
ps aux | grep start_worker
```

### Metrics to Monitor
- Job completion rate
- Average processing time
- API response times
- Error rates
- Queue depth

## Cost Optimization

### Deepgram
- Use appropriate models (nova-2 for STT)
- Cache common transcriptions
- Compress audio before sending

### OpenAI
- Use gpt-4o-mini for translations (cost-effective)
- Implement chunking for long texts
- Cache common translations

## Support

For issues or questions:
1. Check the logs first
2. Review API documentation
3. Check Deepgram/OpenAI status pages
4. Contact support if needed

---

**Version**: 1.0.0
**Last Updated**: 2025-10-30

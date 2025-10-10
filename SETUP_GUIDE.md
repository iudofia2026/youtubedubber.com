# YT Dubber - Complete Setup Guide

## 🚀 **Quick Start (Development)**

### Prerequisites
- Python 3.8+ 
- Node.js 18+
- Git

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd youtubedubber.com
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -c "from app.database import create_tables; create_tables()"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Applications
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🔑 **API Keys Setup**

### Development Mode (Current)
The project is configured to work in development mode with mock data. No API keys required for basic testing.

### Production Setup
To enable full functionality, you'll need these API keys:

#### 1. Supabase (Required)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and API keys
4. Update backend `.env`:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```
5. Update frontend `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### 2. Deepgram (Required)
1. Go to [deepgram.com](https://deepgram.com)
2. Sign up and get your API key
3. Update backend `.env`:
```env
DEEPGRAM_API_KEY=your_deepgram_api_key
```

#### 3. OpenAI (Required)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Update backend `.env`:
```env
OPENAI_API_KEY=your_openai_api_key
```

#### 4. Stripe (Optional)
1. Go to [stripe.com](https://stripe.com)
2. Get your API keys
3. Update backend `.env`:
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
```
4. Update frontend `.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 🧪 **Testing the Setup**

### 1. Backend Health Check
```bash
curl http://localhost:8000/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-10T20:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. Test Upload URLs (Development Mode)
```bash
curl -X POST "http://localhost:8000/api/jobs/upload-urls" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-token" \
  -d '{"languages": ["es"], "voice_track_name": "test.mp3"}'
```

### 3. Test Frontend
1. Open http://localhost:3000
2. You should see the homepage
3. Navigate to the upload page
4. Check browser console for any errors

## 🐳 **Docker Setup (Optional)**

### Backend Docker
```bash
cd backend
docker build -t yt-dubber-backend .
docker run -p 8000:8000 yt-dubber-backend
```

### Frontend Docker
```bash
cd frontend
docker build -t yt-dubber-frontend .
docker run -p 3000:3000 yt-dubber-frontend
```

## 🚀 **Production Deployment**

### Backend Deployment (Railway)
1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Frontend Deployment (Vercel)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production
```env
# Backend
DATABASE_URL=postgresql://user:pass@host:port/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
DEEPGRAM_API_KEY=your_deepgram_key
OPENAI_API_KEY=your_openai_key
SECRET_KEY=your_production_secret_key
CORS_ORIGINS=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🔧 **Troubleshooting**

### Common Issues

#### 1. Backend Won't Start
- Check Python version (3.8+)
- Ensure all dependencies are installed
- Check if port 8000 is available
- Verify `.env` file exists

#### 2. Frontend Won't Start
- Check Node.js version (18+)
- Run `npm install` to install dependencies
- Check if port 3000 is available
- Verify `.env.local` file exists

#### 3. Database Issues
- Run database migrations: `python -c "from app.database import create_tables; create_tables()"`
- Check database file permissions
- Verify database URL in `.env`

#### 4. API Connection Issues
- Check CORS configuration
- Verify API URLs in frontend `.env.local`
- Check if backend is running on correct port
- Test with curl commands

### Debug Commands

#### Check Backend Logs
```bash
cd backend
python -m uvicorn app.main:app --reload --log-level debug
```

#### Check Frontend Logs
```bash
cd frontend
npm run dev -- --verbose
```

#### Test Database Connection
```bash
curl http://localhost:8000/test-db
```

## 📚 **API Documentation**

### Authentication
- Development: Use `dev-token` as Bearer token
- Production: Use Supabase JWT tokens

### Endpoints
- `GET /health` - Health check
- `POST /api/jobs/upload-urls` - Get upload URLs
- `POST /api/jobs/` - Create job
- `GET /api/jobs/{id}` - Get job status
- `GET /api/jobs/` - List user jobs

### Request/Response Examples

#### Upload URLs Request
```json
{
  "languages": ["es", "fr"],
  "voice_track_name": "audio.mp3",
  "background_track_name": "music.mp3"
}
```

#### Job Creation Request
```json
{
  "job_id": "unique_job_id",
  "voice_track_uploaded": true,
  "background_track_uploaded": false,
  "languages": ["es"]
}
```

## 🎯 **Next Steps After Setup**

1. **Test Basic Functionality**
   - Upload a test audio file
   - Create a dubbing job
   - Check job status

2. **Configure Production APIs**
   - Add real Supabase project
   - Configure Deepgram and OpenAI
   - Test with real audio processing

3. **Deploy to Production**
   - Set up hosting platforms
   - Configure domain and SSL
   - Monitor performance

4. **Add Advanced Features**
   - Payment processing
   - Background job processing
   - Real-time updates
   - Advanced audio processing

---

**Need Help?** Check the logs, test endpoints, and ensure all environment variables are properly configured.
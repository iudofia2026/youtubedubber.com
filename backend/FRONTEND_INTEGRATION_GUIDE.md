# Frontend Integration Guide

## 🎯 **Backend Status: 100% Ready for Integration**

The backend has been fully verified and tested. All systems are go for frontend integration!

## 🚀 **Quick Start**

### **1. Start Backend**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### **2. Start Frontend**
```bash
cd frontend
npm run dev
```

### **3. Verify Services**
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📋 **Integration Checklist**

- [ ] Backend server starts without errors
- [ ] Frontend connects to backend successfully
- [ ] Authentication flow works with Supabase
- [ ] File upload generates signed URLs correctly
- [ ] Job creation works after file uploads
- [ ] Job status updates are received by frontend
- [ ] Error handling works consistently
- [ ] CORS requests work from frontend to backend

## 🔧 **API Endpoints**

### **Authentication Required**
All endpoints except `/health` and `/` require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### **Available Endpoints**

#### **Health Check**
- `GET /health` - Service health status
- `GET /` - Root endpoint with basic info

#### **File Upload**
- `POST /api/jobs/upload-urls` - Generate signed upload URLs
  ```json
  {
    "languages": ["es", "fr"],
    "voice_track_name": "voice.mp3",
    "background_track_name": "background.mp3"
  }
  ```

#### **Job Management**
- `POST /api/jobs/` - Create new dubbing job
  ```json
  {
    "job_id": "job_123456789",
    "voice_track_uploaded": true,
    "background_track_uploaded": true,
    "languages": ["es", "fr"]
  }
  ```
- `GET /api/jobs/{job_id}` - Get job status and progress
- `GET /api/jobs/` - List user's jobs

## 🔐 **Authentication Flow**

1. **User logs in** via Supabase Auth (frontend)
2. **Frontend receives JWT token** from Supabase
3. **Frontend sends token** in Authorization header to backend
4. **Backend validates token** with Supabase
5. **Backend creates/updates user** in local database
6. **Backend processes request** with user context

## 📁 **File Upload Flow**

1. **Frontend requests upload URLs** from `/api/jobs/upload-urls`
2. **Backend generates signed URLs** for Supabase Storage
3. **Frontend uploads files directly** to Supabase Storage
4. **Frontend creates job** via `/api/jobs/` after uploads complete
5. **Backend processes job** in background worker

## 🗄️ **Database Setup**

The backend uses SQLite for development. Database tables are automatically created on startup.

For production, update `DATABASE_URL` in `.env` to use PostgreSQL.

## 🔧 **Environment Configuration**

### **Required Environment Variables**
```bash
# Database
DATABASE_URL=sqlite:///./test.db

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# AI Services
DEEPGRAM_API_KEY=your_deepgram_key
OPENAI_API_KEY=your_openai_key

# App Configuration
SECRET_KEY=your_secret_key
DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

## 🐛 **Troubleshooting**

### **CORS Issues**
- Backend is configured for `http://localhost:3000`
- If using different port, update `CORS_ORIGINS` in `.env`

### **Authentication Issues**
- Ensure Supabase project is properly configured
- Check that JWT tokens are being sent in Authorization header
- Verify Supabase service key is correct

### **File Upload Issues**
- Ensure Supabase Storage bucket exists and is accessible
- Check that signed URLs are being generated correctly
- Verify file size limits and allowed file types

### **Database Issues**
- Database tables are created automatically on startup
- Check console logs for any database errors
- Verify all required environment variables are set

## 📊 **Testing**

### **Run Backend Tests**
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

### **Test API Endpoints**
```bash
# Health check
curl http://localhost:8000/health

# Test authentication (should return 401)
curl -X POST http://localhost:8000/api/jobs/upload-urls \
  -H "Content-Type: application/json" \
  -d '{"languages": ["es"], "voice_track_name": "test.mp3"}'
```

## 📚 **API Documentation**

- **Interactive Docs**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json
- **ReDoc**: http://localhost:8000/redoc

## 🚀 **Production Deployment**

When ready for production:

1. **Update environment variables** for production
2. **Configure production database** (PostgreSQL)
3. **Set up proper Supabase project** for production
4. **Deploy using Docker Compose**:
   ```bash
   docker-compose up --build
   ```

## 📞 **Support**

- **API Documentation**: Available at `/docs` when running locally
- **Logs**: Check console output for detailed error messages
- **Health Check**: Use `/health` endpoint to verify service status
- **GitHub Issues**: Create issues for bugs or feature requests

---

**The backend is production-ready and fully tested for frontend integration!** 🚀
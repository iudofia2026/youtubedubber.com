# Deployment Guide - YT Dubber Backend

## 🚀 **Quick Start Deployment**

### **Prerequisites**
- Docker and Docker Compose installed
- Supabase project set up
- API keys for Deepgram and OpenAI
- Domain name (for production)

### **1. Environment Setup**

```bash
# Clone repository
git clone https://github.com/iudofia2026/youtubedubber.com.git
cd youtubedubber.com/backend

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables**:
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# AI Services
DEEPGRAM_API_KEY=your_deepgram_key
OPENAI_API_KEY=your_openai_key

# Security
SECRET_KEY=your_strong_secret_key_here
CORS_ORIGINS=https://youtubedubber.com,https://www.youtubedubber.com

# Optional
DEBUG=false
LOG_LEVEL=INFO
RATE_LIMIT_ENABLED=true
```

### **2. Local Development**

```bash
# Start with Docker Compose
docker-compose up --build

# Or run locally
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### **3. Production Deployment**

#### **Option A: Docker Compose (Recommended)**
```bash
# Use production environment
cp .env.production .env
docker-compose -f docker-compose.yml up -d
```

#### **Option B: Manual Deployment**
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start application
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 🔧 **Configuration Details**

### **Database Setup**
1. **Supabase** (Recommended):
   - Create new project
   - Get URL and service key
   - Set up storage bucket: `yt-dubber-uploads`

2. **PostgreSQL** (Alternative):
   - Install PostgreSQL 15+
   - Create database: `yt_dubber`
   - Run migrations: `alembic upgrade head`

### **Storage Configuration**
1. **Supabase Storage**:
   - Create bucket: `yt-dubber-uploads`
   - Set up RLS policies
   - Configure CORS for file uploads

2. **File Permissions**:
   - Ensure proper file permissions
   - Set up cleanup policies

### **Security Configuration**
1. **SSL/TLS**:
   - Set up SSL certificates
   - Enable HTTPS only
   - Configure HSTS headers

2. **Firewall**:
   - Open port 8000 (or your chosen port)
   - Restrict access to necessary IPs
   - Set up rate limiting

## 📊 **Monitoring Setup**

### **Log Files**
- Application logs: `logs/app_*.log`
- Security logs: `logs/security.log`
- Audit logs: `logs/audit.log`
- Error logs: `logs/error_*.log`

### **Health Checks**
```bash
# Check application health
curl http://localhost:8000/health

# Check API documentation
curl http://localhost:8000/docs
```

### **Monitoring Commands**
```bash
# View logs
tail -f logs/app_*.log

# Check security events
grep "SECURITY" logs/security.log

# Monitor rate limiting
grep "rate_limit" logs/app_*.log
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Database Connection Failed**:
   ```bash
   # Check DATABASE_URL format
   echo $DATABASE_URL
   
   # Test connection
   python -c "from app.database import engine; print(engine.url)"
   ```

2. **Authentication Errors**:
   ```bash
   # Check Supabase configuration
   echo $SUPABASE_URL
   echo $SUPABASE_SERVICE_KEY
   
   # Test Supabase connection
   python -c "from app.auth import get_supabase_client; print(get_supabase_client())"
   ```

3. **Rate Limiting Issues**:
   ```bash
   # Check rate limit configuration
   grep -r "rate_limit" app/
   
   # Monitor rate limit logs
   tail -f logs/app_*.log | grep "rate_limit"
   ```

4. **File Upload Issues**:
   ```bash
   # Check storage configuration
   echo $STORAGE_BUCKET
   
   # Test Supabase storage
   python -c "from app.auth import get_storage_service; print(get_storage_service())"
   ```

### **Debug Mode**
```bash
# Enable debug mode
export DEBUG=true
export LOG_LEVEL=DEBUG

# Start with debug logging
uvicorn app.main:app --reload --log-level debug
```

## 🔒 **Security Checklist**

### **Pre-Deployment**
- [ ] Strong SECRET_KEY configured
- [ ] HTTPS enabled
- [ ] CORS origins restricted
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Input validation active
- [ ] Error sanitization enabled

### **Post-Deployment**
- [ ] Security headers present
- [ ] Rate limiting working
- [ ] Authentication required
- [ ] Error messages sanitized
- [ ] Logs being generated
- [ ] Monitoring active

## 📈 **Performance Optimization**

### **Database**
- [ ] Connection pooling configured
- [ ] Indexes created
- [ ] Query optimization done
- [ ] Regular maintenance scheduled

### **Application**
- [ ] Caching implemented
- [ ] File upload optimized
- [ ] Response compression enabled
- [ ] Static file serving configured

### **Infrastructure**
- [ ] Load balancing configured
- [ ] CDN set up
- [ ] Monitoring configured
- [ ] Backup strategy implemented

## 🎯 **Production Readiness**

### **Before Going Live**
1. **Security Audit**: Complete security review
2. **Load Testing**: Test under expected load
3. **Backup Strategy**: Implement data backup
4. **Monitoring**: Set up alerts and monitoring
5. **Documentation**: Update all documentation

### **Go-Live Checklist**
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Performance testing done
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team trained on operations

## 📞 **Support**

### **Getting Help**
1. Check logs for error details
2. Review security implementation summary
3. Test with debug mode enabled
4. Check API documentation at `/docs`

### **Emergency Procedures**
1. **Service Down**: Check logs, restart service
2. **Security Incident**: Review security logs, implement fixes
3. **Performance Issues**: Check monitoring, scale resources
4. **Data Issues**: Check database, restore from backup

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready
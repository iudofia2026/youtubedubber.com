# Rate Limiting Quick Start Guide

Get authentication rate limiting up and running in 5 minutes.

## Prerequisites

- Python 3.9+
- Redis (optional for development, required for production)

## 1. Install Dependencies

```bash
cd backend_hidden
pip install -r requirements.txt
```

This installs:
- `slowapi==0.1.9` - Rate limiting library
- `redis==5.0.1` - Redis client for distributed rate limiting

## 2. Setup Redis (Production)

### Option A: Docker (Recommended for Local)

```bash
docker run -d --name redis-rate-limit -p 6379:6379 redis:7-alpine
```

### Option B: Cloud Redis (Production)

**Railway**:
1. Go to [railway.app](https://railway.app)
2. Add Redis service to your project
3. Copy the `REDIS_URL` from service variables

**Render**:
1. Create Redis instance in Render dashboard
2. Copy internal connection URL

**Upstash** (Serverless):
1. Create database at [upstash.com](https://upstash.com)
2. Copy Redis URL from dashboard

## 3. Configure Environment

Add to your `.env` file:

```bash
# Redis connection (use one of these)
REDIS_URL=redis://localhost:6379           # Local
# REDIS_URL=redis://default:pass@host:port  # Production

# Optional: Customize rate limits
AUTH_RATE_LIMIT_PER_MINUTE=10
SIGNUP_RATE_LIMIT_PER_HOUR=5
BRUTE_FORCE_THRESHOLD=10
```

## 4. Verify Setup

### Start Backend

```bash
cd backend_hidden
python -m uvicorn app.main:app --reload
```

### Test Rate Limiting

```bash
# Quick test: Send 15 login requests rapidly
for i in {1..15}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}' \
    -w "\nStatus: %{http_code}\n"
done
```

Expected output:
- First 10 requests: `Status: 401` (invalid credentials)
- Remaining 5: `Status: 429` (rate limited)

### Run Test Suite

```bash
cd backend_hidden/tests
python test_rate_limiting.py
```

## 5. Authentication Endpoints

All endpoints are protected with rate limits:

| Endpoint | Method | Rate Limit | Purpose |
|----------|--------|------------|---------|
| `/api/auth/signup` | POST | 5/hour | Register new user |
| `/api/auth/login` | POST | 10/minute | Login user |
| `/api/auth/password-reset` | POST | 3/hour | Request password reset |
| `/api/auth/password-update` | POST | 5/hour | Update password |
| `/api/auth/refresh` | POST | 30/minute | Refresh token |
| `/api/auth/logout` | POST | 20/minute | Logout user |

## Example: Login Request

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

**Success Response (200)**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "expires_in": 3600
}
```

**Rate Limited (429)**:
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please slow down and try again later.",
  "retry_after": 60,
  "path": "/api/auth/login"
}
```

## Development vs Production

### Development (No Redis)

- Uses in-memory rate limiting
- Resets on server restart
- Not shared across workers
- Shows warning: `"Using in-memory rate limiting"`

### Production (With Redis)

- Persistent rate limiting
- Shared across all instances
- Survives server restarts
- Required for horizontal scaling

## Monitoring

### Check Logs

```bash
# Watch for rate limit events
tail -f logs/app.log | grep "rate limit"

# Watch for brute force attempts
tail -f logs/app.log | grep "blocked"
```

### Common Log Messages

```
INFO: Redis connection established for rate limiting
WARNING: Rate limit exceeded - IP: 192.168.1.1, Path: /api/auth/login
WARNING: IP 192.168.1.1 blocked - 12 failed attempts on login
```

## Troubleshooting

### "Redis connection failed"

**Development**: It's okay, will use in-memory storage

**Production**:
1. Check Redis is running: `redis-cli ping`
2. Verify `REDIS_URL` is correct
3. Check firewall allows connection to Redis port

### "Rate limiting not working"

1. Ensure `RATE_LIMIT_ENABLED=true` in `.env`
2. Check `slowapi` is installed: `pip show slowapi`
3. Verify endpoints have `@limiter.limit()` decorator
4. Restart server after config changes

### "Too many false positives"

Increase rate limits in `.env`:
```bash
AUTH_RATE_LIMIT_PER_MINUTE=20
SIGNUP_RATE_LIMIT_PER_HOUR=10
```

## Next Steps

1. **Customize rate limits** based on your traffic patterns
2. **Setup monitoring** to track rate limit events
3. **Add CAPTCHA** for additional protection after failed attempts
4. **Configure alerts** for unusual patterns

## Resources

- Full documentation: [RATE_LIMITING.md](./RATE_LIMITING.md)
- Test suite: [tests/test_rate_limiting.py](./tests/test_rate_limiting.py)
- slowapi docs: https://slowapi.readthedocs.io/

## Need Help?

Common issues and solutions are documented in the full [RATE_LIMITING.md](./RATE_LIMITING.md) guide.

# Rate Limiting & Brute Force Protection

This document describes the rate limiting and security features implemented to protect authentication endpoints from abuse and brute force attacks.

## Overview

The application implements a multi-layered approach to rate limiting:

1. **Endpoint-specific rate limits** - Different limits for different endpoint types
2. **Brute force detection** - Automatic blocking after repeated failed attempts
3. **Redis-backed storage** - Distributed rate limiting for production environments
4. **Graceful degradation** - Falls back to in-memory storage if Redis is unavailable

## Features

### 1. Authentication Endpoint Protection

All authentication endpoints have strict rate limits to prevent abuse:

| Endpoint | Rate Limit | Purpose |
|----------|------------|---------|
| `/api/auth/signup` | 5/hour | Prevent automated account creation |
| `/api/auth/login` | 10/minute | Prevent brute force password attacks |
| `/api/auth/password-reset` | 3/hour | Prevent email bombing/enumeration |
| `/api/auth/password-update` | 5/hour | Prevent password update abuse |
| `/api/auth/refresh` | 30/minute | Allow legitimate token refreshes |
| `/api/auth/logout` | 20/minute | Reasonable logout limit |

### 2. Brute Force Protection

The system automatically tracks failed login attempts and blocks IPs that exceed the threshold:

- **Threshold**: 10 failed attempts within 1 hour
- **Block duration**: 1 hour (automatic expiry)
- **Storage**: Redis (or in-memory for development)
- **Tracking**: Per IP address + endpoint combination

When an IP is blocked:
- Returns `429 Too Many Requests` status
- Logs the blocked attempt for security monitoring
- Provides clear error message to user

### 3. Rate Limit Response Headers

All responses include helpful rate limit headers:

```http
Retry-After: 60
X-RateLimit-Limit: 10/minute
X-RateLimit-Reset: 1705234567
```

These headers help clients:
- Understand when they can retry
- Implement proper backoff strategies
- Display user-friendly error messages

## Configuration

### Environment Variables

Configure rate limiting via environment variables in `.env`:

```bash
# Enable/disable rate limiting
RATE_LIMIT_ENABLED=true

# Redis connection (required for production)
RATE_LIMIT_STORAGE_URL=redis://localhost:6379
# Or use alias:
REDIS_URL=redis://localhost:6379

# Customize thresholds
AUTH_RATE_LIMIT_PER_MINUTE=10
AUTH_RATE_LIMIT_PER_HOUR=50
SIGNUP_RATE_LIMIT_PER_HOUR=5
PASSWORD_RESET_RATE_LIMIT_PER_HOUR=3
BRUTE_FORCE_THRESHOLD=10
```

### Redis Setup

#### Local Development (Docker)

```bash
# Start Redis with Docker
docker run -d -p 6379:6379 redis:7-alpine

# Test connection
redis-cli ping
```

#### Production (Cloud)

Use a managed Redis service:

**Railway**:
```bash
# Add Redis service in Railway dashboard
# Copy the Redis URL to your environment variables
REDIS_URL=redis://default:password@host:port
```

**Render**:
```bash
# Add Redis instance in Render dashboard
# Use internal connection URL
REDIS_URL=redis://red-xxxxx:6379
```

**Upstash** (serverless Redis):
```bash
# Create database at upstash.com
# Use REST API compatible endpoint
REDIS_URL=redis://default:token@host:port
```

### Development Mode

Without Redis, the system uses in-memory rate limiting:

```python
# Automatically falls back to in-memory storage
# Warning logged: "Using in-memory rate limiting (not recommended for production)"
```

**Limitations of in-memory mode**:
- Not shared across multiple workers/instances
- Resets on application restart
- Not suitable for production

## Testing

### Quick Test

```bash
# Make sure backend is running
cd backend_hidden
python -m uvicorn app.main:app --reload

# In another terminal, run tests
cd backend_hidden/tests
python test_rate_limiting.py
```

### Manual Testing

**Test login rate limit**:
```bash
# Send 15 requests rapidly
for i in {1..15}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
done
```

Expected: First ~10 requests return 401, remaining return 429

**Test brute force protection**:
```bash
# Send 12 failed login attempts
for i in {1..12}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"bruteforce@example.com","password":"wrong"}' \
    -w "\nAttempt $i - Status: %{http_code}\n"
  sleep 0.2
done
```

Expected: After 10 attempts, IP gets blocked with 429

### Automated Test Suite

The test suite covers:

- ✅ Login rate limiting (10/minute)
- ✅ Signup rate limiting (5/hour)
- ✅ Password reset rate limiting (3/hour)
- ✅ Brute force protection (blocks after 10 attempts)
- ✅ Concurrent request handling
- ✅ Rate limit headers presence

Run with: `python tests/test_rate_limiting.py`

## Monitoring

### Log Messages

Rate limiting events are logged for monitoring:

```python
# Rate limit exceeded
WARNING: Rate limit exceeded - IP: 192.168.1.1, Path: /api/auth/login

# Brute force detection
WARNING: IP 192.168.1.1 blocked - 12 failed attempts on login

# Failed login attempt
WARNING: Failed login attempt for: user@example.com from IP: 192.168.1.1
```

### Metrics to Monitor

**Key indicators of abuse**:
1. High rate of 429 responses
2. Many failed login attempts from single IP
3. Repeated password reset requests
4. Unusual signup patterns

**Recommended alerts**:
- 429 responses > 100/minute (possible DDoS)
- Failed login attempts > 50/hour from single IP
- Blocked IPs > 10/hour (ongoing attack)

## Security Best Practices

### 1. Production Checklist

- [ ] Redis configured and accessible
- [ ] Environment variables set correctly
- [ ] Rate limits tuned for your user base
- [ ] Monitoring and alerting configured
- [ ] Logs centralized and searchable

### 2. Tuning Rate Limits

Adjust based on your needs:

**Stricter limits** (high security):
```bash
AUTH_RATE_LIMIT_PER_MINUTE=5
SIGNUP_RATE_LIMIT_PER_HOUR=3
BRUTE_FORCE_THRESHOLD=5
```

**Looser limits** (better UX):
```bash
AUTH_RATE_LIMIT_PER_MINUTE=20
SIGNUP_RATE_LIMIT_PER_HOUR=10
BRUTE_FORCE_THRESHOLD=15
```

### 3. Additional Protection Layers

Consider adding:

1. **CAPTCHA** for signup/login after failed attempts
2. **Email verification** for new signups
3. **2FA/MFA** for sensitive accounts
4. **IP reputation checking** (block known bad actors)
5. **Device fingerprinting** for additional tracking

## Troubleshooting

### Rate limits not working

**Check 1**: Is Redis connected?
```bash
# Check logs for:
INFO: Redis connection established for rate limiting
# Or warning:
WARNING: Failed to connect to Redis: ... Using in-memory rate limiting
```

**Check 2**: Is slowapi installed?
```bash
pip show slowapi
# Should show version 0.1.9 or higher
```

**Check 3**: Are limits applied to routes?
```python
# Routes should have @limiter.limit() decorator
@router.post("/login")
@limiter.limit("10/minute")
async def login(...):
```

### Too many false positives

**Solution 1**: Increase rate limits
```bash
# Adjust in .env
AUTH_RATE_LIMIT_PER_MINUTE=20  # Doubled
```

**Solution 2**: Use user-based limiting instead of IP
```python
# In rate_limit.py, modify key_func
def get_user_key(request):
    # Prefer user ID over IP
    if hasattr(request.state, 'user_id'):
        return f"user:{request.state.user_id}"
    return get_remote_address(request)
```

### Redis connection issues

**Local development**:
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Check connection string
echo $REDIS_URL
# Should be: redis://localhost:6379
```

**Production**:
```bash
# Test connection with redis-cli
redis-cli -u $REDIS_URL ping

# Check firewall rules
# Ensure backend can reach Redis port
```

## API Integration

### Frontend Implementation

**Handle rate limit errors gracefully**:

```typescript
async function login(email: string, password: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.status === 429) {
      const data = await response.json();
      const retryAfter = data.retry_after || 60;

      // Show user-friendly message
      showError(`Too many attempts. Please wait ${retryAfter} seconds.`);

      // Optionally implement countdown timer
      startCountdown(retryAfter);

      return;
    }

    // Handle other responses...
  } catch (error) {
    console.error('Login error:', error);
  }
}
```

**Implement exponential backoff**:

```typescript
async function retryWithBackoff(fn: Function, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Performance Impact

**Overhead per request**:
- With Redis: ~1-3ms
- In-memory: <1ms

**Redis memory usage**:
- ~100 bytes per tracked IP
- Auto-expiry keeps memory usage low
- Typical usage: <10MB for 1000s of IPs

**Recommendations**:
- Use Redis in production for accuracy
- Monitor Redis performance metrics
- Consider Redis cluster for high traffic

## References

- [slowapi Documentation](https://slowapi.readthedocs.io/)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)
- [OWASP Rate Limiting Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)

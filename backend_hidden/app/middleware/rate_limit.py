"""
Rate limiting middleware for API endpoints with Redis support
Provides production-ready rate limiting with multiple strategies
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from app.config import settings
import logging
from typing import Optional
import redis
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Initialize Redis connection if configured
redis_client: Optional[redis.Redis] = None

def get_redis_client() -> Optional[redis.Redis]:
    """Get or create Redis client for rate limiting storage"""
    global redis_client

    if redis_client is None and settings.rate_limit_storage_url:
        try:
            redis_client = redis.from_url(
                settings.rate_limit_storage_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # Test connection
            redis_client.ping()
            logger.info("Redis connection established for rate limiting")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Using in-memory rate limiting.")
            redis_client = None

    return redis_client


# Create limiter instance with Redis storage if available
def create_limiter() -> Limiter:
    """Create limiter with appropriate storage backend"""
    redis = get_redis_client()

    if redis:
        # Use Redis for distributed rate limiting
        from slowapi.util import get_remote_address
        return Limiter(
            key_func=get_remote_address,
            default_limits=["1000/hour", "100/minute"],
            storage_uri=settings.rate_limit_storage_url
        )
    else:
        # Use in-memory storage (development mode)
        logger.info("Using in-memory rate limiting (not recommended for production)")
        return Limiter(
            key_func=get_remote_address,
            default_limits=["1000/hour", "100/minute"]
        )


limiter = create_limiter()

# Brute force detection
class BruteForceDetector:
    """
    Detect and block brute force attacks on authentication endpoints
    """

    def __init__(self):
        self.redis = get_redis_client()

    def record_failed_attempt(self, ip_address: str, endpoint: str):
        """Record a failed authentication attempt"""
        if not self.redis:
            return

        key = f"failed_auth:{ip_address}:{endpoint}"
        try:
            # Increment counter with 1 hour expiry
            self.redis.incr(key)
            self.redis.expire(key, 3600)  # 1 hour
        except Exception as e:
            logger.error(f"Failed to record failed attempt: {e}")

    def is_blocked(self, ip_address: str, endpoint: str, threshold: int = 10) -> bool:
        """Check if IP is blocked due to too many failed attempts"""
        if not self.redis:
            return False

        key = f"failed_auth:{ip_address}:{endpoint}"
        try:
            attempts = self.redis.get(key)
            if attempts and int(attempts) >= threshold:
                logger.warning(f"IP {ip_address} blocked - {attempts} failed attempts on {endpoint}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to check blocked status: {e}")
            return False

    def reset_attempts(self, ip_address: str, endpoint: str):
        """Reset failed attempt counter (called on successful auth)"""
        if not self.redis:
            return

        key = f"failed_auth:{ip_address}:{endpoint}"
        try:
            self.redis.delete(key)
        except Exception as e:
            logger.error(f"Failed to reset attempts: {e}")


brute_force_detector = BruteForceDetector()


# Custom rate limit exceeded handler
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """
    Custom handler for rate limit exceeded with detailed logging
    """
    ip = get_remote_address(request)
    path = request.url.path

    logger.warning(
        f"Rate limit exceeded - IP: {ip}, Path: {path}, "
        f"Detail: {exc.detail}"
    )

    # Calculate retry_after in seconds
    retry_after = getattr(exc, 'retry_after', 60)

    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please slow down and try again later.",
            "retry_after": retry_after,
            "path": path
        },
        headers={
            "Retry-After": str(retry_after),
            "X-RateLimit-Limit": str(getattr(exc, 'limit', 'unknown')),
            "X-RateLimit-Reset": str(int((datetime.now() + timedelta(seconds=retry_after)).timestamp()))
        }
    )

# Rate limiting decorators for different endpoint types
def auth_rate_limit():
    """Rate limit for authentication endpoints"""
    return limiter.limit("10/minute", key_func=get_remote_address)

def upload_rate_limit():
    """Rate limit for upload endpoints"""
    return limiter.limit("20/minute", key_func=get_remote_address)

def job_rate_limit():
    """Rate limit for job management endpoints"""
    return limiter.limit("50/minute", key_func=get_remote_address)

def health_rate_limit():
    """Rate limit for health check endpoints"""
    return limiter.limit("100/minute", key_func=get_remote_address)

def api_rate_limit():
    """General API rate limit"""
    return limiter.limit("200/hour", key_func=get_remote_address)

# IP-based rate limiting for suspicious activity
def strict_rate_limit():
    """Strict rate limit for suspicious IPs"""
    return limiter.limit("5/minute", key_func=get_remote_address)

# User-based rate limiting (requires authentication)
def user_rate_limit():
    """Rate limit per authenticated user"""
    def get_user_key(request):
        # Try to get user ID from request state, fall back to IP
        if hasattr(request.state, 'user_id') and request.state.user_id:
            return f"user:{request.state.user_id}"
        return get_remote_address(request)
    
    return limiter.limit("1000/hour", key_func=get_user_key)
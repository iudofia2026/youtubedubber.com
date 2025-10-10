"""
Rate limiting middleware for API endpoints
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Create limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000/hour", "100/minute"]  # Default limits
)

# Custom rate limit exceeded handler
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """
    Custom handler for rate limit exceeded
    """
    logger.warning(f"Rate limit exceeded for {get_remote_address(request)}: {exc.detail}")
    
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please try again later.",
            "retry_after": exc.retry_after
        },
        headers={"Retry-After": str(exc.retry_after)}
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
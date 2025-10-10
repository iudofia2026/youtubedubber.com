"""
Security middleware for CORS, headers, and other security measures
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all responses
    """
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Add HSTS header if HTTPS is enabled
        if settings.https_only:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        # Add CSP header
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://api.supabase.co https://api.openai.com https://api.deepgram.com; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        response.headers["Content-Security-Policy"] = csp_policy
        
        # Add cache control for sensitive endpoints
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log security-relevant requests
    """
    
    async def dispatch(self, request: Request, call_next):
        # Log suspicious patterns
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        path = request.url.path
        method = request.method
        
        # Check for suspicious patterns
        suspicious_patterns = [
            "admin", "login", "password", "sql", "script", "eval", "exec",
            "union", "select", "drop", "delete", "insert", "update",
            "javascript:", "vbscript:", "onload", "onerror", "alert"
        ]
        
        is_suspicious = any(pattern in path.lower() or pattern in user_agent.lower() 
                          for pattern in suspicious_patterns)
        
        if is_suspicious:
            logger.warning(
                f"Suspicious request detected - IP: {client_ip}, "
                f"Method: {method}, Path: {path}, User-Agent: {user_agent}"
            )
        
        # Log all API requests
        if path.startswith("/api/"):
            logger.info(
                f"API request - IP: {client_ip}, Method: {method}, "
                f"Path: {path}, User-Agent: {user_agent[:100]}"
            )
        
        response = await call_next(request)
        
        # Log error responses
        if response.status_code >= 400:
            logger.warning(
                f"Error response - IP: {client_ip}, Method: {method}, "
                f"Path: {path}, Status: {response.status_code}"
            )
        
        return response


def get_cors_middleware():
    """
    Get configured CORS middleware
    """
    return CORSMiddleware(
        app=None,  # Will be set when added to app
        allow_origins=settings.get_cors_origins(),
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=[
            "Accept",
            "Accept-Language",
            "Content-Language",
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "X-CSRFToken",
        ],
        expose_headers=["X-Total-Count", "X-Rate-Limit-Remaining"],
        max_age=3600,  # Cache preflight requests for 1 hour
    )


class RateLimitHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add rate limit headers to responses
    """
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add rate limit headers if available
        if hasattr(request.state, 'rate_limit_remaining'):
            response.headers["X-Rate-Limit-Remaining"] = str(request.state.rate_limit_remaining)
        
        if hasattr(request.state, 'rate_limit_reset'):
            response.headers["X-Rate-Limit-Reset"] = str(request.state.rate_limit_reset)
        
        return response
"""
Main FastAPI application
"""
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.api import jobs, upload
from app.schemas import HealthResponse, BackendErrorResponse
from app.database import create_tables
from app.middleware.rate_limit import limiter, rate_limit_handler, RateLimitExceeded, health_rate_limit
from app.middleware.security import SecurityHeadersMiddleware, RequestLoggingMiddleware, get_cors_middleware, RateLimitHeadersMiddleware
from app.utils.security import create_safe_error_response, sanitize_error_message
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="YouTube Multilingual Dubber API - Backend service for AI-powered video dubbing",
    version="1.0.0",
    debug=settings.debug,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)

# Add rate limiter to the app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# Add security middleware (order matters - first added is outermost)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitHeadersMiddleware)

# CORS middleware configuration
cors_middleware = get_cors_middleware()
cors_middleware.app = app
app.add_middleware(cors_middleware)

# Trusted host middleware for security
if settings.debug:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0"]
    )

# Include API routers
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(upload.router, prefix="/api/jobs", tags=["upload"])


@app.get("/", response_model=dict)
async def root():
    """
    Root endpoint
    """
    return {
        "message": "YT Dubber API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0"
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """
    Custom HTTP exception handler with sanitized error messages
    """
    # Sanitize the error detail
    safe_detail = sanitize_error_message(str(exc.detail))
    
    return JSONResponse(
        status_code=exc.status_code,
        content=create_safe_error_response(
            error_type="http_error",
            message=safe_detail,
            status_code=exc.status_code
        )
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """
    General exception handler with sanitized error messages
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=create_safe_error_response(
            error_type="internal_server_error",
            message="An internal server error occurred",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"error": str(exc)} if settings.debug else None,
            original_error=exc
        )
    )


@app.on_event("startup")
async def startup_event():
    """
    Application startup event
    """
    logger.info("Starting YT Dubber API...")
    
    # Create database tables
    try:
        create_tables()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        # Don't fail startup if tables already exist
    
    logger.info("YT Dubber API started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event
    """
    logger.info("Shutting down YT Dubber API...")


# Development endpoints (only in debug mode)
if settings.debug:
    @app.get("/debug/config")
    async def debug_config():
        """
        Debug endpoint to show configuration (development only)
        """
        return {
            "app_name": settings.app_name,
            "debug": settings.debug,
            "cors_origins": settings.get_cors_origins(),
            "storage_bucket": settings.storage_bucket,
            "max_file_size": settings.max_file_size,
            "worker_poll_interval": settings.worker_poll_interval,
            "max_concurrent_jobs": settings.max_concurrent_jobs
        }
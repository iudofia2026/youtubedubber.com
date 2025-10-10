"""
Main FastAPI application
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.api import jobs, upload
from app.schemas import HealthResponse, BackendErrorResponse
from app.database import create_tables
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

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

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
    Custom HTTP exception handler
    """
    return JSONResponse(
        status_code=exc.status_code,
        content=BackendErrorResponse(
            error="http_error",
            message=exc.detail,
            status_code=exc.status_code
        ).dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """
    General exception handler
    """
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=BackendErrorResponse(
            error="internal_server_error",
            message="An internal server error occurred",
            details={"error": str(exc)} if settings.debug else None
        ).dict()
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
"""
Main FastAPI application
"""
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, FileResponse
from app.config import settings
from app.api import jobs
from app.schemas import HealthResponse, BackendErrorResponse
# from app.database import create_tables  # Removed - using Supabase REST API
from app.middleware.rate_limit import limiter, rate_limit_handler, RateLimitExceeded, health_rate_limit
from app.middleware.security import SecurityHeadersMiddleware, RequestLoggingMiddleware, get_cors_middleware, RateLimitHeadersMiddleware
from app.middleware.api_logging import APILoggingMiddleware
from app.utils.security import create_safe_error_response, sanitize_error_message
import logging
from datetime import datetime
from pathlib import Path

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
app.add_middleware(APILoggingMiddleware)  # Add comprehensive API logging
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitHeadersMiddleware)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
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
    max_age=3600,
)

# Trusted host middleware for security
if settings.debug:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0", "testserver", "*"]
    )

# Include API routers
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])


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


@app.put("/mock-upload/{file_path:path}")
async def mock_upload(file_path: str, request: Request):
    """
    Mock upload endpoint for development - actually saves files to disk
    """
    try:
        # Read the uploaded file data
        body = await request.body()
        
        logger.info(f"Mock upload received: {file_path}, size: {len(body)} bytes")
        
        # Create uploads directory if it doesn't exist
        uploads_dir = Path("uploads")
        uploads_dir.mkdir(exist_ok=True)
        
        # Save file to disk
        file_path_full = uploads_dir / file_path
        file_path_full.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path_full, "wb") as f:
            f.write(body)
        
        logger.info(f"File saved to: {file_path_full}")
        
        # Log file upload details to dedicated log file
        upload_log_path = Path("uploads.log")
        with open(upload_log_path, "a") as log_file:
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_file.write(f"[{timestamp}] UPLOAD: {file_path} | Size: {len(body)} bytes | Saved to: {file_path_full}\n")
        
        # Return success response
        return {
            "message": "File uploaded successfully (mock)",
            "file_path": file_path,
            "size": len(body),
            "saved_to": str(file_path_full)
        }
    except Exception as e:
        logger.error(f"Mock upload error: {e}")
        raise HTTPException(status_code=500, detail="Mock upload failed")


@app.get("/download/{filename}")
async def download_file(filename: str):
    """
    Download generated audio files
    """
    try:
        # Security: Only allow specific file extensions
        allowed_extensions = ['.mp3', '.wav', '.m4a']
        file_ext = Path(filename).suffix.lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Construct file path
        file_path = Path("downloads") / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Return file with appropriate headers
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type='audio/mpeg' if file_ext == '.mp3' else 'audio/wav'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download error: {e}")
        raise HTTPException(status_code=500, detail="Download failed")


@app.get("/downloads")
async def list_downloads():
    """
    List available download files
    """
    try:
        downloads_dir = Path("downloads")
        if not downloads_dir.exists():
            return {"files": []}
        
        files = []
        for file_path in downloads_dir.glob("*"):
            if file_path.is_file():
                stat = file_path.stat()
                files.append({
                    "filename": file_path.name,
                    "size": stat.st_size,
                    "modified": stat.st_mtime,
                    "download_url": f"/download/{file_path.name}"
                })
        
        # Sort by modification time (newest first)
        files.sort(key=lambda x: x["modified"], reverse=True)
        
        return {"files": files}
        
    except Exception as e:
        logger.error(f"List downloads error: {e}")
        raise HTTPException(status_code=500, detail="Failed to list downloads")


@app.get("/test-supabase")
async def test_supabase():
    """
    Test Supabase connection
    """
    try:
        from app.services.supabase_db_service import SupabaseDBService
        
        db_service = SupabaseDBService()
        # Test by getting a specific user
        test_user = db_service.get_user("dev-user-123")
        
        return {
            "status": "success",
            "message": "Supabase connection successful",
            "test_user_exists": test_user is not None
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Supabase connection failed: {str(e)}"
        }


@app.get("/test-supabase-job")
async def test_supabase_job():
    """
    Test Supabase job creation
    """
    try:
        from app.services.supabase_job_service import SupabaseJobService
        from app.schemas import JobCreationRequest
        import uuid
        
        job_service = SupabaseJobService()
        
        # Create a test job using the service
        job_data = JobCreationRequest(
            job_id=f"test_supabase_job_{uuid.uuid4().hex[:8]}",
            voice_track_uploaded=True,
            background_track_uploaded=False,
            languages=["es"]
        )
        
        result = await job_service.create_job(
            user_id="dev-user-123",
            job_data=job_data
        )
        
        return {
            "status": "success",
            "message": "Supabase job creation test successful",
            "result": result
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Supabase job creation test failed: {str(e)}"
        }


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
    
    # Database tables are managed by Supabase - no need to create them here
    logger.info("Using Supabase REST API for database operations")
    
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
            "max_concurrent_jobs": settings.max_concurrent_jobs,
            "supabase_url": settings.supabase_url
        }
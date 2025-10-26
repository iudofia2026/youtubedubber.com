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


@app.get("/test-db")
async def test_database():
    """
    Test database connection
    """
    try:
        from app.database import get_db
        from app.models import User
        from sqlalchemy.orm import Session
        
        db = next(get_db())
        user_count = db.query(User).count()
        
        return {
            "status": "success",
            "message": "Database connection successful",
            "user_count": user_count
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Database connection failed: {str(e)}"
        }


@app.get("/test-job-creation")
async def test_job_creation():
    """
    Test job creation directly
    """
    try:
        from app.database import get_db
        from app.models import DubbingJob, LanguageTask, JobEvent
        from app.schemas import JobStatus, LanguageTaskStatus
        import uuid
        
        db = next(get_db())
        
        # Create a test job
        job_id = f"test_job_{uuid.uuid4().hex[:8]}"
        
        job = DubbingJob(
            id=job_id,
            user_id="dev-user-123",
            status=JobStatus.PROCESSING,
            progress=0,
            message="Test job created",
            target_languages=["es"]
        )
        
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Check if job was created
        created_job = db.query(DubbingJob).filter(DubbingJob.id == job_id).first()
        
        return {
            "status": "success",
            "message": "Job creation test successful",
            "job_id": job_id,
            "job_exists": created_job is not None,
            "job_status": created_job.status if created_job else None
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Job creation test failed: {str(e)}"
        }


@app.post("/test-job-service")
async def test_job_service():
    """
    Test job service directly
    """
    try:
        from app.database import get_db
        from app.services.job_service import JobService
        from app.schemas import JobCreationRequest
        
        db = next(get_db())
        job_service = JobService()
        
        # Create a test job using the service
        job_data = JobCreationRequest(
            job_id="test_service_job",
            voice_track_uploaded=True,
            background_track_uploaded=False,
            languages=["es"]
        )
        
        result = await job_service.create_job(
            user_id="dev-user-123",
            job_data=job_data,
            db=db
        )
        
        return {
            "status": "success",
            "message": "Job service test successful",
            "result": result
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Job service test failed: {str(e)}"
        }


@app.post("/test-simple-job")
async def test_simple_job():
    """
    Test simple job creation without service
    """
    try:
        from app.database import get_db
        from app.models import DubbingJob
        from app.schemas import JobStatus
        import uuid
        
        db = next(get_db())
        
        # Create a simple job
        job_id = f"simple_job_{uuid.uuid4().hex[:8]}"
        
        job = DubbingJob(
            id=job_id,
            user_id="dev-user-123",
            status=JobStatus.PROCESSING,
            progress=0,
            message="Simple test job",
            target_languages=["es"]
        )
        
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Check if job was created
        created_job = db.query(DubbingJob).filter(DubbingJob.id == job_id).first()
        
        return {
            "status": "success",
            "message": "Simple job creation successful",
            "job_id": job_id,
            "job_exists": created_job is not None,
            "job_status": created_job.status if created_job else None
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Simple job creation failed: {str(e)}"
        }


@app.post("/test-language-task")
async def test_language_task():
    """
    Test language task creation
    """
    try:
        from app.database import get_db
        from app.models import DubbingJob, LanguageTask
        from app.schemas import JobStatus, LanguageTaskStatus
        import uuid
        
        db = next(get_db())
        
        # Create a job first
        job_id = f"task_job_{uuid.uuid4().hex[:8]}"
        
        job = DubbingJob(
            id=job_id,
            user_id="dev-user-123",
            status=JobStatus.PROCESSING,
            progress=0,
            message="Test job for language task",
            target_languages=["es"]
        )
        
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Create a language task
        task_id = f"task_{uuid.uuid4().hex[:12]}"
        
        language_task = LanguageTask(
            id=task_id,
            job_id=job_id,
            language_code="es",
            status=LanguageTaskStatus.PENDING,
            progress=0,
            message="Test language task"
        )
        
        db.add(language_task)
        db.commit()
        db.refresh(language_task)
        
        # Check if task was created
        created_task = db.query(LanguageTask).filter(LanguageTask.id == task_id).first()
        
        return {
            "status": "success",
            "message": "Language task creation successful",
            "job_id": job_id,
            "task_id": task_id,
            "task_exists": created_task is not None,
            "task_status": created_task.status if created_task else None
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Language task creation failed: {str(e)}"
        }


@app.post("/test-job-event")
async def test_job_event():
    """
    Test job event creation
    """
    try:
        from app.database import get_db
        from app.models import DubbingJob, JobEvent
        from app.schemas import JobStatus
        import uuid
        
        db = next(get_db())
        
        # Create a job first
        job_id = f"event_job_{uuid.uuid4().hex[:8]}"
        
        job = DubbingJob(
            id=job_id,
            user_id="dev-user-123",
            status=JobStatus.PROCESSING,
            progress=0,
            message="Test job for job event",
            target_languages=["es"]
        )
        
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Create a job event
        event_id = f"event_{uuid.uuid4().hex[:12]}"
        
        job_event = JobEvent(
            id=event_id,
            job_id=job_id,
            event_type="created",
            message="Test job event",
            event_metadata={
                "languages": ["es"],
                "voice_track_uploaded": True,
                "background_track_uploaded": False
            }
        )
        
        db.add(job_event)
        db.commit()
        db.refresh(job_event)
        
        # Check if event was created
        created_event = db.query(JobEvent).filter(JobEvent.id == event_id).first()
        
        return {
            "status": "success",
            "message": "Job event creation successful",
            "job_id": job_id,
            "event_id": event_id,
            "event_exists": created_event is not None,
            "event_type": created_event.event_type if created_event else None
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Job event creation failed: {str(e)}"
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
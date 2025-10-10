"""
Job management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import (
    JobCreationRequest, JobStatusResponse, SubmitJobResponse, 
    BackendErrorResponse, JobStatus
)
from app.services.job_service import JobService
from app.auth import get_current_user, UserResponse
from app.database import get_db
from app.middleware.rate_limit import job_rate_limit, user_rate_limit
from app.utils.security import create_http_exception, sanitize_error_message
from app.utils.validation import validate_job_id, validate_language_codes, validate_pagination_params
from app.config import settings
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=SubmitJobResponse)
async def create_job(
    request: JobCreationRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new dubbing job
    This endpoint matches the frontend API contract exactly
    """
    try:
        # For development mode, skip validation
        if settings.supabase_url == "https://test.supabase.co":
            logger.info(f"Development mode: Creating job {request.job_id} for user {current_user.id}")
            
            job_service = JobService()
            
            # Create the job
            job_status = await job_service.create_job(
                user_id=current_user.id,
                job_data=request,
                db=db
            )
            
            logger.info(f"Created job {request.job_id} successfully")
            
            return SubmitJobResponse(jobId=request.job_id)
        
        # Production mode - validate input data
        validated_job_id = validate_job_id(request.job_id)
        validated_languages = validate_language_codes(request.languages)
        
        # Update request with validated data
        request.job_id = validated_job_id
        request.languages = validated_languages
        
        logger.info(f"Creating job {request.job_id} for user {current_user.id}")
        
        job_service = JobService()
        
        # Create the job
        job_status = await job_service.create_job(
            user_id=current_user.id,
            job_data=request,
            db=db
        )
        
        logger.info(f"Created job {request.job_id} successfully")
        
        return SubmitJobResponse(jobId=request.job_id)
        
    except Exception as e:
        logger.error(f"Error creating job: {e}", exc_info=True)
        raise create_http_exception(
            error_type="job_creation_failed",
            message="Failed to create job",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"job_id": request.job_id},
            original_error=e
        )


@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get job status and progress
    This endpoint matches the frontend API contract exactly
    """
    try:
        # Validate job ID
        validated_job_id = validate_job_id(job_id)
        
        logger.info(f"Getting status for job {validated_job_id} for user {current_user.id}")
        
        job_service = JobService()
        
        # Get job status
        job_status = await job_service.get_job_status(
            job_id=validated_job_id,
            user_id=current_user.id,
            db=db
        )
        
        return job_status
        
    except Exception as e:
        logger.error(f"Error getting job status: {e}", exc_info=True)
        
        # Check if it's a "not found" error
        if "not found" in str(e).lower():
            raise create_http_exception(
                error_type="job_not_found",
                message="Job not found",
                status_code=status.HTTP_404_NOT_FOUND,
                details={"job_id": job_id},
                original_error=e
            )
        
        raise create_http_exception(
            error_type="job_status_failed",
            message="Failed to get job status",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"job_id": job_id},
            original_error=e
        )


@router.get("/", response_model=list[JobStatusResponse])
async def list_user_jobs(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0
):
    """
    List jobs for the current user
    """
    try:
        # Validate pagination parameters
        validated_limit, validated_offset = validate_pagination_params(limit, offset)
        
        logger.info(f"Listing jobs for user {current_user.id}")
        
        job_service = JobService()
        
        # Get user's jobs
        jobs = db.query(job_service.DubbingJob).filter(
            job_service.DubbingJob.user_id == current_user.id
        ).offset(validated_offset).limit(validated_limit).all()
        
        # Convert to response format
        job_responses = []
        for job in jobs:
            job_status = await job_service.get_job_status(
                job_id=job.id,
                user_id=current_user.id,
                db=db
            )
            job_responses.append(job_status)
        
        return job_responses
        
    except Exception as e:
        logger.error(f"Error listing jobs: {e}", exc_info=True)
        raise create_http_exception(
            error_type="job_listing_failed",
            message="Failed to list jobs",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"user_id": current_user.id},
            original_error=e
        )
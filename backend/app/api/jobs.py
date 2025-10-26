"""
Job management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import (
    JobCreationRequest, JobStatusResponse, SubmitJobResponse, 
    BackendErrorResponse, JobStatus, UploadUrlsRequest, SignedUploadUrls
)
from app.services.supabase_job_service import SupabaseJobService
from app.services.storage_service import StorageService
from app.auth import get_current_user, UserResponse
from app.database import get_db
from app.models import DubbingJob
from app.middleware.rate_limit import job_rate_limit, user_rate_limit
from app.utils.security import create_http_exception, sanitize_error_message
from app.utils.validation import validate_job_id, validate_language_codes, validate_pagination_params
from app.config import settings
from sqlalchemy.orm import Session
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.options("/")
async def options_jobs():
    """Handle CORS preflight requests for job endpoints"""
    return {"message": "OK"}


@router.options("/{job_id}")
async def options_get_job():
    """Handle CORS preflight requests for job status"""
    return {"message": "OK"}


@router.options("/upload-urls")
async def options_upload_urls():
    """Handle CORS preflight requests for upload URLs endpoint"""
    return {"message": "OK"}


@router.post("/", response_model=SubmitJobResponse)
async def create_job(
    request: JobCreationRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Create a new dubbing job
    This endpoint matches the frontend API contract exactly
    """
    try:
        # For development mode, skip validation
        if settings.supabase_url == "https://test.supabase.co":
            logger.info(f"Development mode: Creating job {request.job_id} for user {current_user.id}")
            
            job_service = SupabaseJobService()
            
            # Create the job
            job_status = await job_service.create_job(
                user_id=current_user.id,
                job_data=request
            )
            
            logger.info(f"Created job {request.job_id} successfully")
            
            return SubmitJobResponse(job_id=request.job_id)
        
        # Production mode - validate input data
        validated_job_id = validate_job_id(request.job_id)
        validated_languages = validate_language_codes(request.languages)
        
        # Update request with validated data
        request.job_id = validated_job_id
        request.languages = validated_languages
        
        logger.info(f"Creating job {request.job_id} for user {current_user.id}")
        
        job_service = SupabaseJobService()
        
        # Create the job
        job_status = await job_service.create_job(
            user_id=current_user.id,
            job_data=request
        )
        
        logger.info(f"Created job {request.job_id} successfully")
        
        # Log job creation to dedicated log file
        job_log_path = Path("uploads.log")
        with open(job_log_path, "a") as log_file:
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_file.write(f"[{timestamp}] JOB_CREATED: {request.job_id} | User: {current_user.id} | Languages: {request.languages} | Voice uploaded: {request.voice_track_uploaded} | Background uploaded: {request.background_track_uploaded}\n")
        
        return SubmitJobResponse(job_id=request.job_id)
        
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
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get job status and progress
    This endpoint matches the frontend API contract exactly
    """
    try:
        # Validate job ID
        validated_job_id = validate_job_id(job_id)
        
        logger.info(f"Getting status for job {validated_job_id} for user {current_user.id}")
        
        job_service = SupabaseJobService()
        
        # Get job status
        job_status = await job_service.get_job_status(
            job_id=validated_job_id,
            user_id=current_user.id
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
        
        job_service = SupabaseJobService()
        
        # Get user's jobs from Supabase
        jobs = job_service.db_service.get_user_jobs(current_user.id, validated_limit)
        
        # Convert to response format
        job_responses = []
        for job in jobs:
            job_status = await job_service.get_job_status(
                job_id=job['id'],
                user_id=current_user.id
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


@router.post("/upload-urls", response_model=SignedUploadUrls)
async def request_upload_urls(
    request: UploadUrlsRequest,
    current_user: UserResponse = Depends(get_current_user),
    storage_service: StorageService = Depends(StorageService)
):
    """
    Generate signed URLs for file uploads
    This endpoint matches the frontend API contract exactly
    """
    try:
        # For development mode, skip validation
        if settings.supabase_url == "https://test.supabase.co":
            logger.info(f"Development mode: Generating upload URLs for user {current_user.id}, languages: {request.languages}")
            
            # Generate signed URLs directly
            signed_urls = await storage_service.generate_upload_urls(
                user_id=current_user.id,
                languages=request.languages,
                voice_track_name=request.voice_track_name,
                background_track_name=request.background_track_name
            )
            
            logger.info(f"Generated upload URLs for job {signed_urls.job_id}")
            return signed_urls
        
        # Skip validation in development mode for easier testing
        if not settings.debug:
            # Production mode - validate input data
            from app.utils.validation import validate_language_codes, validate_filename
            validated_languages = validate_language_codes(request.languages)
            validated_voice_track = validate_filename(request.voice_track_name, "voice_track_name")
            validated_background_track = validate_filename(request.background_track_name, "background_track_name") if request.background_track_name else None
            
            # Update request with validated data
            request.languages = validated_languages
            request.voice_track_name = validated_voice_track
            request.background_track_name = validated_background_track
        else:
            # Development mode - just log the filenames
            logger.info(f"Development mode: Skipping validation for filenames: {request.voice_track_name}, {request.background_track_name}")
        
        logger.info(f"Generating upload URLs for user {current_user.id}, languages: {request.languages}")
        
        # Generate signed URLs
        signed_urls = await storage_service.generate_upload_urls(
            user_id=current_user.id,
            languages=request.languages,
            voice_track_name=request.voice_track_name,
            background_track_name=request.background_track_name
        )
        
        logger.info(f"Generated upload URLs for job {signed_urls.job_id}")
        return signed_urls
        
    except Exception as e:
        logger.error(f"Error generating upload URLs: {e}", exc_info=True)
        raise create_http_exception(
            error_type="upload_url_generation_failed",
            message="Failed to generate upload URLs",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"user_id": current_user.id, "languages": request.languages},
            original_error=e
        )
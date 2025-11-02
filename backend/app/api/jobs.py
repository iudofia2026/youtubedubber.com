"""
Job management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
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
import aiofiles

logger = logging.getLogger(__name__)

router = APIRouter()


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
        # Validate input data
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

        # Get real job status from Supabase
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


def get_storage_service() -> StorageService:
    """Dependency to get StorageService instance"""
    return StorageService()


@router.post("/upload-urls", response_model=SignedUploadUrls)
async def request_upload_urls(
    request: UploadUrlsRequest,
    current_user: UserResponse = Depends(get_current_user),
    storage_service: StorageService = Depends(get_storage_service)
):
    """
    Generate signed URLs for file uploads
    This endpoint matches the frontend API contract exactly
    """
    try:
        logger.info(f"Generating upload URLs for user {current_user.id}, languages: {request.languages}")

        # Skip validation in development mode for easier testing
        if not settings.debug:
            # Production mode - validate input data
            from app.utils.validation import validate_filename
            validated_voice_filename = validate_filename(request.voice_track_name, "voice_track_name")
            validated_background_filename = validate_filename(request.background_track_name, "background_track_name") if request.background_track_name else None

            # Update request with validated data
            request.voice_track_name = validated_voice_filename
            request.background_track_name = validated_background_filename
        else:
            # Development mode - just log the filenames
            logger.info(f"Development mode: Skipping validation for filenames: {request.voice_track_name}, {request.background_track_name}")

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
            details={"user_id": current_user.id},
            original_error=e
        )


@router.get("/{job_id}/download")
async def download_job_file(
    job_id: str,
    lang: str,
    type: str = "full",
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download completed dubbed audio file for a specific language
    Supports both production (Supabase) and dev mode (local files)
    """
    try:
        validated_job_id = validate_job_id(job_id)
        logger.info(f"Download request for job {validated_job_id}, language {lang}, type {type}")

        # In development mode, serve from downloads directory
        if settings.supabase_url == "https://test.supabase.co" or settings.debug:
            from fastapi.responses import FileResponse
            import glob

            # Look for audio files in downloads directory
            downloads_dir = Path("downloads")
            if not downloads_dir.exists():
                downloads_dir.mkdir(parents=True, exist_ok=True)

            # Search for files matching the language
            pattern = f"ytdubber_{lang}_*.mp3"
            matching_files = list(downloads_dir.glob(pattern))

            if matching_files:
                # Return the most recent file
                latest_file = max(matching_files, key=lambda p: p.stat().st_mtime)
                logger.info(f"Serving file: {latest_file}")

                return FileResponse(
                    path=str(latest_file),
                    media_type="audio/mpeg",
                    filename=f"{validated_job_id}_{lang}_dubbed.mp3",
                    headers={
                        "Content-Disposition": f'attachment; filename="{validated_job_id}_{lang}_dubbed.mp3"'
                    }
                )

            # If no file found, return 404
            raise create_http_exception(
                error_type="file_not_found",
                message=f"No dubbed audio found for language {lang}",
                status_code=status.HTTP_404_NOT_FOUND,
                details={"job_id": validated_job_id, "language": lang}
            )

        # Production mode - get from database and serve from Supabase Storage
        from app.models import LanguageTask

        # Get the language task for this job and language
        language_task = db.query(LanguageTask).filter(
            LanguageTask.job_id == validated_job_id,
            LanguageTask.language_code == lang
        ).first()

        if not language_task:
            raise create_http_exception(
                error_type="task_not_found",
                message=f"No task found for language {lang}",
                status_code=status.HTTP_404_NOT_FOUND,
                details={"job_id": validated_job_id, "language": lang}
            )

        if not language_task.download_url:
            raise create_http_exception(
                error_type="file_not_ready",
                message=f"Audio file not ready for download yet",
                status_code=status.HTTP_404_NOT_FOUND,
                details={"job_id": validated_job_id, "language": lang, "status": language_task.status}
            )

        # Redirect to the Supabase storage URL
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=language_task.download_url)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading file: {e}", exc_info=True)
        raise create_http_exception(
            error_type="download_failed",
            message="Failed to download file",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"job_id": job_id, "language": lang},
            original_error=e
        )


@router.put("/mock-upload/{file_path:path}")
async def mock_file_upload(
    file_path: str,
    request: Request
):
    """
    Mock endpoint for file uploads in development mode.
    Saves files to the backend/uploads directory.
    """
    try:
        logger.info(f"Mock upload: Receiving file for path: {file_path}")

        # Read the file content from the request body
        file_content = await request.body()

        # Create the full path in the backend uploads directory
        # Remove leading "uploads/" from file_path if present to avoid duplication
        clean_path = file_path.replace("uploads/", "", 1) if file_path.startswith("uploads/") else file_path
        upload_dir = Path("backend/uploads") if Path("backend").exists() else Path("uploads")
        full_path = upload_dir / clean_path

        # Ensure the directory exists
        full_path.parent.mkdir(parents=True, exist_ok=True)

        # Write the file
        async with aiofiles.open(full_path, 'wb') as f:
            await f.write(file_content)

        logger.info(f"Mock upload: Successfully saved file to {full_path}")

        return {
            "message": "File uploaded successfully",
            "path": str(full_path),
            "size": len(file_content)
        }

    except Exception as e:
        logger.error(f"Mock upload error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )
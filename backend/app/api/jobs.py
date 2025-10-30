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
        # For development mode, skip validation and return mock response
        if settings.supabase_url == "https://test.supabase.co" or settings.debug:
            logger.info(f"Development mode: Creating job {request.job_id} for user {current_user.id}")
            
            # Log job creation to dedicated log file for development
            job_log_path = Path("uploads.log")
            with open(job_log_path, "a") as log_file:
                from datetime import datetime
                log_file.write(f"[{datetime.now().isoformat()}] DEV JOB CREATED: {request.job_id} for user {current_user.id} with languages {request.languages}\n")
            
            logger.info(f"Created job {request.job_id} successfully (dev mode)")
            
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
        
        # For development mode, return mock job status with simulated progression
        if settings.supabase_url == "https://test.supabase.co" or settings.debug:
            from app.schemas import JobStatusResponse, LanguageProgress, get_language_info
            from datetime import datetime, timedelta
            import re
            import ast

            # Read the languages and creation time from uploads.log
            job_languages = []
            job_created_at = None
            job_log_path = Path("uploads.log")
            if job_log_path.exists():
                with open(job_log_path, "r") as log_file:
                    for line in log_file:
                        if validated_job_id in line and ("JOB_CREATED" in line or "DEV JOB CREATED" in line):
                            # Extract timestamp from log line
                            # Format: [2025-01-29T12:34:56.789012] or [2025-01-29 12:34:56]
                            timestamp_match = re.search(r"\[([^\]]+)\]", line)
                            if timestamp_match:
                                timestamp_str = timestamp_match.group(1)
                                try:
                                    # Try ISO format first
                                    job_created_at = datetime.fromisoformat(timestamp_str)
                                except ValueError:
                                    try:
                                        # Try alternative format
                                        job_created_at = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
                                    except ValueError:
                                        pass

                            # Extract languages from log line
                            match = re.search(r"languages (\[.*?\])", line)
                            if match:
                                job_languages = ast.literal_eval(match.group(1))
                            break

            # If no languages found in log, default to Spanish
            if not job_languages:
                job_languages = ["es"]

            # If no creation time found, use current time (job just created)
            if not job_created_at:
                job_created_at = datetime.now()

            # Calculate elapsed time since job creation (use datetime.now() to match log timestamps)
            elapsed_seconds = (datetime.now() - job_created_at).total_seconds()

            # Simulate job progression based on elapsed time
            # Total simulation time: 120 seconds (2 minutes)
            simulation_duration = 120  # seconds

            if elapsed_seconds < 30:
                # Phase 1: Processing (0-30 seconds, 0-40% progress)
                overall_status = "processing"
                overall_progress = int((elapsed_seconds / 30) * 40)
                overall_message = "Processing audio files..."
                remaining_time = simulation_duration - elapsed_seconds

                # Languages: first one processing, rest pending
                lang_statuses = ["processing"] + ["pending"] * (len(job_languages) - 1)
                lang_progress = [overall_progress] + [0] * (len(job_languages) - 1)
                lang_messages = [f"Processing audio..." ] + ["Waiting to start..."] * (len(job_languages) - 1)
                completed_count = 0

            elif elapsed_seconds < 60:
                # Phase 2: Generating (30-60 seconds, 40-70% progress)
                overall_status = "generating"
                overall_progress = 40 + int(((elapsed_seconds - 30) / 30) * 30)
                overall_message = "Generating dubbed audio..."
                remaining_time = simulation_duration - elapsed_seconds

                # Languages: first one generating, second processing, rest pending
                lang_statuses = ["generating", "processing"] + ["pending"] * (len(job_languages) - 2) if len(job_languages) > 1 else ["generating"]
                lang_progress = [overall_progress, int(overall_progress * 0.5)] + [0] * (len(job_languages) - 2) if len(job_languages) > 1 else [overall_progress]
                lang_messages = ["Generating dubbed audio..."] + (["Processing..."] if len(job_languages) > 1 else []) + ["Waiting to start..."] * max(0, len(job_languages) - 2)
                completed_count = 0

            elif elapsed_seconds < 90:
                # Phase 3: Finalizing (60-90 seconds, 70-95% progress)
                overall_status = "finalizing"
                overall_progress = 70 + int(((elapsed_seconds - 60) / 30) * 25)
                overall_message = "Finalizing output files..."
                remaining_time = simulation_duration - elapsed_seconds

                # Languages: first one finalizing, second generating, third processing, rest pending
                if len(job_languages) == 1:
                    lang_statuses = ["finalizing"]
                    lang_progress = [overall_progress]
                    lang_messages = ["Finalizing output..."]
                elif len(job_languages) == 2:
                    lang_statuses = ["finalizing", "generating"]
                    lang_progress = [overall_progress, int(overall_progress * 0.7)]
                    lang_messages = ["Finalizing output...", "Generating dubbed audio..."]
                else:
                    lang_statuses = ["finalizing", "generating", "processing"] + ["pending"] * (len(job_languages) - 3)
                    lang_progress = [overall_progress, int(overall_progress * 0.7), int(overall_progress * 0.4)] + [0] * (len(job_languages) - 3)
                    lang_messages = ["Finalizing output...", "Generating dubbed audio...", "Processing..."] + ["Waiting to start..."] * (len(job_languages) - 3)

                completed_count = 0

            else:
                # Phase 4: Complete (90+ seconds)
                overall_status = "complete"
                overall_progress = 100
                overall_message = "Job completed successfully!"
                remaining_time = 0

                # All languages complete with mock download URLs
                lang_statuses = ["complete"] * len(job_languages)
                lang_progress = [100] * len(job_languages)
                lang_messages = ["Complete!"] * len(job_languages)
                completed_count = len(job_languages)

            # Create mock language progress for each language
            languages = []
            for idx, lang_code in enumerate(job_languages):
                lang_info = get_language_info(lang_code)

                # Generate mock download URL if complete
                download_url = None
                if idx < len(lang_statuses) and lang_statuses[idx] == "complete":
                    download_url = f"/api/jobs/{validated_job_id}/download?lang={lang_code}&type=full"

                languages.append(
                    LanguageProgress(
                        languageCode=lang_code,
                        languageName=lang_info["name"],
                        flag=lang_info["flag"],
                        status=lang_statuses[idx] if idx < len(lang_statuses) else "pending",
                        progress=lang_progress[idx] if idx < len(lang_progress) else 0,
                        message=lang_messages[idx] if idx < len(lang_messages) else "Waiting to start...",
                        estimatedTimeRemaining=int(remaining_time) if remaining_time > 0 else None,
                        downloadUrl=download_url
                    )
                )

            # Format the response
            estimated_completion = None
            if overall_status != "complete":
                estimated_completion = (job_created_at + timedelta(seconds=simulation_duration)).isoformat()

            return JobStatusResponse(
                id=validated_job_id,
                status=overall_status,
                progress=overall_progress,
                message=overall_message,
                languages=languages,
                totalLanguages=len(languages),
                completedLanguages=completed_count,
                startedAt=job_created_at.isoformat(),
                estimatedCompletion=estimated_completion
            )
        
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
        logger.info(f"Generating upload URLs for user {current_user.id}, job_id: {request.job_id}")

        # Skip validation in development mode for easier testing
        if not settings.debug:
            # Production mode - validate input data
            from app.utils.validation import validate_filename
            validated_voice_filename = validate_filename(request.voice_filename, "voice_filename")
            validated_background_filename = validate_filename(request.background_filename, "background_filename") if request.background_filename else None

            # Update request with validated data
            request.voice_filename = validated_voice_filename
            request.background_filename = validated_background_filename
        else:
            # Development mode - just log the filenames
            logger.info(f"Development mode: Skipping validation for filenames: {request.voice_filename}, {request.background_filename}")

        # Generate signed URLs
        # Note: We pass empty languages list since languages are provided later when creating the job
        signed_urls = await storage_service.generate_upload_urls(
            user_id=current_user.id,
            languages=[],  # Languages will be provided in the job creation request
            voice_track_name=request.voice_filename,
            background_track_name=request.background_filename
        )

        logger.info(f"Generated upload URLs for job {signed_urls.job_id}")
        return signed_urls

    except Exception as e:
        logger.error(f"Error generating upload URLs: {e}", exc_info=True)
        raise create_http_exception(
            error_type="upload_url_generation_failed",
            message="Failed to generate upload URLs",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"user_id": current_user.id, "job_id": request.job_id},
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
        upload_dir = Path("backend/uploads") if Path("backend").exists() else Path("uploads")
        full_path = upload_dir / file_path

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
"""
Job service for managing dubbing jobs
"""
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import DubbingJob, LanguageTask, JobEvent, User
from app.schemas import (
    JobCreationRequest, JobStatusResponse, LanguageProgress,
    DubbingJobCreate, LanguageTaskCreate, JobEventCreate,
    JobStatus, LanguageTaskStatus, get_language_info
)
from app.services.storage_service import StorageService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class JobService:
    """Service for managing dubbing jobs"""
    
    def __init__(self):
        self.storage_service = StorageService()
    
    async def create_job(
        self,
        user_id: str,
        job_data: JobCreationRequest,
        db: Session
    ) -> JobStatusResponse:
        """
        Create a new dubbing job
        """
        try:
            logger.info(f"Starting job creation for {job_data.job_id} for user {user_id}")
            
            # Check if job already exists
            existing_job = db.query(DubbingJob).filter(DubbingJob.id == job_data.job_id).first()
            if existing_job:
                logger.info(f"Job {job_data.job_id} already exists, returning simple status")
                from app.schemas import JobStatusResponse
                return JobStatusResponse(
                    id=job_data.job_id,
                    status=existing_job.status,
                    progress=existing_job.progress,
                    message=existing_job.message or "Job exists",
                    languages=[],
                    totalLanguages=len(job_data.languages),
                    completedLanguages=0,
                    startedAt=existing_job.started_at.isoformat() if existing_job.started_at else datetime.utcnow().isoformat(),
                    estimatedCompletion=None
                )
            
            logger.info(f"Creating main job record for {job_data.job_id}")

            # Create the main job record with upload metadata
            job = DubbingJob(
                id=job_data.job_id,
                user_id=user_id,
                status=JobStatus.PROCESSING,
                progress=0,
                message="Job created, starting processing...",
                target_languages=job_data.languages,
                voice_track_url=job_data.voice_track_url,
                background_track_url=job_data.background_track_url,
                voice_track_duration=job_data.voice_track_duration,
                background_track_duration=job_data.background_track_duration
            )
            
            db.add(job)
            logger.info(f"Added job to database: {job_data.job_id}")
            
            # Create language tasks
            for language_code in job_data.languages:
                task_id = f"task_{uuid.uuid4().hex[:12]}"
                logger.info(f"Creating language task {task_id} for language {language_code}")
                language_task = LanguageTask(
                    id=task_id,
                    job_id=job_data.job_id,
                    language_code=language_code,
                    status=LanguageTaskStatus.PENDING,
                    progress=0,
                    message="Waiting to start..."
                )
                db.add(language_task)
            
            # Create job event
            event_id = f"event_{uuid.uuid4().hex[:12]}"
            logger.info(f"Creating job event {event_id}")
            job_event = JobEvent(
                id=event_id,
                job_id=job_data.job_id,
                event_type="created",
                message="Job created successfully",
                event_metadata={
                    "languages": job_data.languages,
                    "voice_track_uploaded": job_data.voice_track_uploaded,
                    "background_track_uploaded": job_data.background_track_uploaded
                }
            )
            db.add(job_event)
            
            logger.info(f"Committing transaction for job {job_data.job_id}")
            try:
                db.commit()
                logger.info(f"Transaction committed successfully for job {job_data.job_id}")
            except Exception as commit_error:
                logger.error(f"Error committing transaction: {commit_error}")
                raise commit_error
            
            try:
                db.refresh(job)
                logger.info(f"Job refreshed successfully: {job_data.job_id}")
            except Exception as refresh_error:
                logger.error(f"Error refreshing job: {refresh_error}")
                raise refresh_error
            
            logger.info(f"Created job {job_data.job_id} for user {user_id} successfully")
            
            # Return simple success response instead of calling get_job_status
            from app.schemas import JobStatusResponse, LanguageProgress
            return JobStatusResponse(
                id=job_data.job_id,
                status=JobStatus.PROCESSING,
                progress=0,
                message="Job created successfully",
                languages=[],
                totalLanguages=len(job_data.languages),
                completedLanguages=0,
                startedAt=datetime.utcnow().isoformat(),
                estimatedCompletion=None
            )
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating job: {e}", exc_info=True)
            raise Exception(f"Failed to create job: {str(e)}")
    
    async def get_job_status(
        self,
        job_id: str,
        user_id: str,
        db: Session
    ) -> JobStatusResponse:
        """
        Get job status and progress
        """
        try:
            # Get job with language tasks
            job = db.query(DubbingJob).filter(
                DubbingJob.id == job_id,
                DubbingJob.user_id == user_id
            ).first()
            
            if not job:
                raise Exception("Job not found")
            
            # Get language tasks
            language_tasks = db.query(LanguageTask).filter(
                LanguageTask.job_id == job_id
            ).all()
            
            # Calculate overall progress
            total_tasks = len(language_tasks)
            completed_tasks = sum(1 for task in language_tasks if task.status == LanguageTaskStatus.COMPLETE)
            overall_progress = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
            
            # Update job progress
            if job.progress != overall_progress:
                job.progress = overall_progress
                db.commit()
            
            # Build language progress list
            languages = []
            for task in language_tasks:
                language_info = get_language_info(task.language_code)
                languages.append(LanguageProgress(
                    languageCode=task.language_code,
                    languageName=language_info["name"],
                    flag=language_info["flag"],
                    status=task.status,
                    progress=task.progress,
                    message=task.message or "Processing...",
                    estimatedTimeRemaining=task.estimated_time_remaining if hasattr(task, 'estimated_time_remaining') else None,
                    fileSize=task.file_size if hasattr(task, 'file_size') else None,
                    downloadUrl=task.audio_url if hasattr(task, 'audio_url') else None
                ))
            
            return JobStatusResponse(
                id=job.id,
                status=job.status,
                progress=overall_progress,
                message=job.message or "Processing...",
                languages=languages,
                totalLanguages=total_tasks,
                completedLanguages=completed_tasks,
                startedAt=job.started_at.isoformat() if job.started_at else datetime.utcnow().isoformat(),
                estimatedCompletion=job.completed_at.isoformat() if job.completed_at else None
            )
            
        except Exception as e:
            logger.error(f"Error getting job status: {e}")
            # Preserve the original error message for proper handling
            raise e
    
    async def update_job_status(
        self,
        job_id: str,
        status: JobStatus,
        message: str = None,
        db: Session = None
    ) -> bool:
        """
        Update job status
        """
        try:
            if db is None:
                # This would be called from a background task
                # For now, we'll just log it
                logger.info(f"Job {job_id} status updated to {status}: {message}")
                return True
            
            job = db.query(DubbingJob).filter(DubbingJob.id == job_id).first()
            if not job:
                return False
            
            job.status = status
            if message:
                job.message = message
            
            if status == JobStatus.PROCESSING and not job.started_at:
                job.started_at = datetime.utcnow()
            elif status in [JobStatus.COMPLETE, JobStatus.ERROR]:
                job.completed_at = datetime.utcnow()
            
            db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error updating job status: {e}")
            return False
    
    async def update_language_task_status(
        self,
        task_id: str,
        status: LanguageTaskStatus,
        progress: int = None,
        message: str = None,
        download_url: str = None,
        db: Session = None
    ) -> bool:
        """
        Update language task status
        """
        try:
            if db is None:
                logger.info(f"Task {task_id} status updated to {status}: {message}")
                return True
            
            task = db.query(LanguageTask).filter(LanguageTask.id == task_id).first()
            if not task:
                return False
            
            task.status = status
            if progress is not None:
                task.progress = progress
            if message:
                task.message = message
            if download_url:
                task.download_url = download_url
            
            if status == LanguageTaskStatus.PROCESSING and not task.started_at:
                task.started_at = datetime.utcnow()
            elif status in [LanguageTaskStatus.COMPLETE, LanguageTaskStatus.ERROR]:
                task.completed_at = datetime.utcnow()
            
            db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error updating language task status: {e}")
            return False
    
    async def get_pending_jobs(self, db: Session) -> List[DubbingJob]:
        """
        Get all pending jobs for processing
        """
        try:
            return db.query(DubbingJob).filter(
                DubbingJob.status == JobStatus.PROCESSING
            ).all()
        except Exception as e:
            logger.error(f"Error getting pending jobs: {e}")
            return []
    
    async def create_job_event(
        self,
        job_id: str,
        event_type: str,
        message: str,
        metadata: dict = None,
        db: Session = None
    ) -> bool:
        """
        Create a job event for tracking
        """
        try:
            if db is None:
                logger.info(f"Job event created for {job_id}: {event_type} - {message}")
                return True
            
            event = JobEvent(
                id=f"event_{uuid.uuid4().hex[:12]}",
                job_id=job_id,
                event_type=event_type,
                message=message,
                metadata=metadata or {}
            )
            
            db.add(event)
            db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error creating job event: {e}")
            return False
"""
Supabase-based job service for managing dubbing jobs
"""
import uuid
from typing import List, Optional
from app.schemas import (
    JobCreationRequest, JobStatusResponse, LanguageProgress,
    JobStatus, LanguageTaskStatus, get_language_info
)
from app.services.storage_service import StorageService
from app.services.supabase_db_service import SupabaseDBService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SupabaseJobService:
    """Service for managing dubbing jobs using Supabase"""
    
    def __init__(self):
        self.storage_service = StorageService()
        self.db_service = SupabaseDBService()
    
    async def create_job(
        self,
        user_id: str,
        job_data: JobCreationRequest
    ) -> JobStatusResponse:
        """
        Create a new dubbing job
        """
        try:
            logger.info(f"Starting job creation for {job_data.job_id} for user {user_id}")
            
            # Check if job already exists
            existing_job = self.db_service.get_job(job_data.job_id, user_id)
            if existing_job:
                logger.info(f"Job {job_data.job_id} already exists, returning simple status")
                return JobStatusResponse(
                    id=job_data.job_id,
                    status=existing_job['status'],
                    progress=existing_job['progress'],
                    message=existing_job.get('message', "Job exists"),
                    languages=[],
                    totalLanguages=len(job_data.languages),
                    completedLanguages=0,
                    startedAt=existing_job.get('started_at', datetime.utcnow().isoformat()),
                    estimatedCompletion=None
                )
            
            logger.info(f"Creating main job record for {job_data.job_id}")

            # Create the main job record (only include fields that exist in Supabase schema)
            job_data_dict = {
                'id': job_data.job_id,
                'user_id': user_id,
                'status': JobStatus.PROCESSING,
                'progress': 0,
                'message': "Job created, starting processing...",
                'target_languages': job_data.languages,
                'voice_track_url': job_data.voice_track_url,
                'background_track_url': job_data.background_track_url
            }
            
            job = self.db_service.create_job(job_data_dict)
            if not job:
                raise Exception("Failed to create job in database")
            
            logger.info(f"Created job in database: {job_data.job_id}")
            
            # Create language tasks
            for language_code in job_data.languages:
                task_id = f"task_{uuid.uuid4().hex[:12]}"
                logger.info(f"Creating language task {task_id} for language {language_code}")
                
                task_data = {
                    'id': task_id,
                    'job_id': job_data.job_id,
                    'language_code': language_code,
                    'status': LanguageTaskStatus.PENDING,
                    'progress': 0,
                    'message': "Waiting to start..."
                }
                
                language_task = self.db_service.create_language_task(task_data)
                if not language_task:
                    logger.error(f"Failed to create language task for {language_code}")
            
            # Create job event
            event_id = f"event_{uuid.uuid4().hex[:12]}"
            logger.info(f"Creating job event {event_id}")
            
            event_data = {
                'id': event_id,
                'job_id': job_data.job_id,
                'event_type': 'created',
                'message': 'Job created successfully',
                'event_metadata': {
                    "languages": job_data.languages,
                    "voice_track_uploaded": job_data.voice_track_uploaded,
                    "background_track_uploaded": job_data.background_track_uploaded
                }
            }
            
            self.db_service.create_job_event(event_data)
            
            logger.info(f"Created job {job_data.job_id} for user {user_id} successfully")
            
            # Return simple success response
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
            logger.error(f"Error creating job: {e}", exc_info=True)
            raise Exception(f"Failed to create job: {str(e)}")
    
    async def get_job_status(
        self,
        job_id: str,
        user_id: str
    ) -> JobStatusResponse:
        """
        Get job status and progress
        """
        try:
            # Get job
            job = self.db_service.get_job(job_id, user_id)
            if not job:
                raise Exception("Job not found")
            
            # Get language tasks
            language_tasks = self.db_service.get_language_tasks(job_id)
            
            # Calculate overall progress
            total_tasks = len(language_tasks)
            completed_tasks = sum(1 for task in language_tasks if task['status'] == LanguageTaskStatus.COMPLETE)
            overall_progress = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
            
            # Update job progress if needed
            if job['progress'] != overall_progress:
                updates = {'progress': overall_progress}
                self.db_service.update_job(job_id, updates)
            
            # Build language progress list
            languages = []
            for task in language_tasks:
                language_info = get_language_info(task['language_code'])
                languages.append(LanguageProgress(
                    languageCode=task['language_code'],
                    languageName=language_info["name"],
                    flag=language_info["flag"],
                    status=task['status'],
                    progress=task['progress'],
                    message=task.get('message', "Processing..."),
                    estimatedTimeRemaining=task.get('estimated_time_remaining'),
                    fileSize=task.get('file_size'),
                    downloadUrl=task.get('audio_url')
                ))
            
            return JobStatusResponse(
                id=job['id'],
                status=job['status'],
                progress=overall_progress,
                message=job.get('message', "Processing..."),
                languages=languages,
                totalLanguages=total_tasks,
                completedLanguages=completed_tasks,
                startedAt=job.get('started_at') or datetime.utcnow().isoformat(),
                estimatedCompletion=job.get('completed_at')
            )
            
        except Exception as e:
            logger.error(f"Error getting job status: {e}")
            # Preserve the original error message for proper handling
            raise e
    
    async def update_job_status(
        self,
        job_id: str,
        status: JobStatus,
        message: str = None
    ) -> bool:
        """
        Update job status
        """
        try:
            updates = {'status': status}
            if message:
                updates['message'] = message
            
            if status == JobStatus.PROCESSING:
                updates['started_at'] = datetime.utcnow().isoformat()
            elif status in [JobStatus.COMPLETE, JobStatus.ERROR]:
                updates['completed_at'] = datetime.utcnow().isoformat()
            
            result = self.db_service.update_job(job_id, updates)
            if result:
                logger.info(f"Job {job_id} status updated to {status}: {message}")
                return True
            else:
                logger.error(f"Failed to update job {job_id} status")
                return False
                
        except Exception as e:
            logger.error(f"Error updating job status: {e}")
            return False
    
    async def update_language_task_status(
        self,
        task_id: str,
        status: LanguageTaskStatus,
        progress: int = None,
        message: str = None,
        download_url: str = None
    ) -> bool:
        """
        Update language task status
        """
        try:
            updates = {'status': status}
            if progress is not None:
                updates['progress'] = progress
            if message:
                updates['message'] = message
            if download_url:
                updates['audio_url'] = download_url
            
            if status == LanguageTaskStatus.PROCESSING:
                updates['started_at'] = datetime.utcnow().isoformat()
            elif status in [LanguageTaskStatus.COMPLETE, LanguageTaskStatus.ERROR]:
                updates['completed_at'] = datetime.utcnow().isoformat()
            
            result = self.db_service.update_language_task(task_id, updates)
            if result:
                logger.info(f"Task {task_id} status updated to {status}: {message}")
                return True
            else:
                logger.error(f"Failed to update task {task_id} status")
                return False
                
        except Exception as e:
            logger.error(f"Error updating language task status: {e}")
            return False
    
    async def get_pending_jobs(self) -> List[dict]:
        """
        Get all pending jobs for processing
        """
        try:
            # This would need to be implemented in SupabaseDBService
            # For now, return empty list
            logger.info("Getting pending jobs (not implemented for Supabase yet)")
            return []
        except Exception as e:
            logger.error(f"Error getting pending jobs: {e}")
            return []
    
    async def create_job_event(
        self,
        job_id: str,
        event_type: str,
        message: str,
        metadata: dict = None
    ) -> bool:
        """
        Create a job event for tracking
        """
        try:
            event_data = {
                'id': f"event_{uuid.uuid4().hex[:12]}",
                'job_id': job_id,
                'event_type': event_type,
                'message': message,
                'event_metadata': metadata or {}
            }
            
            result = self.db_service.create_job_event(event_data)
            if result:
                logger.info(f"Job event created for {job_id}: {event_type} - {message}")
                return True
            else:
                logger.error(f"Failed to create job event for {job_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error creating job event: {e}")
            return False
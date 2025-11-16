"""
Local job service using SQLAlchemy database
"""
from typing import Dict, Any, List
import logging
from datetime import datetime
import uuid

from app.services.local_db_service import LocalDBService

logger = logging.getLogger(__name__)

class LocalJobService:
    """Job service using local database"""

    def __init__(self):
        self.db_service = LocalDBService()

    async def create_job(
        self,
        job_id: str,
        user_id: str,
        voice_track_url: str,
        background_track_url: str,
        target_languages: List[str],
        **kwargs
    ) -> Dict[str, Any]:
        """Create a new job"""
        try:
            logger.info(f"Creating job {job_id} for user {user_id}")

            # Ensure user exists
            user = self.db_service.get_user(user_id)
            if not user:
                user = self.db_service.create_user(user_id, f"{user_id}@example.com")
                if not user:
                    raise Exception("Failed to create user")

            # Create job data
            job_data = {
                "id": job_id,
                "user_id": user_id,
                "voice_track_url": voice_track_url,
                "background_track_url": background_track_url,
                "target_languages": target_languages
            }

            # Create job
            job = self.db_service.create_job(job_data)
            if not job:
                raise Exception("Failed to create job in database")

            logger.info(f"Successfully created job {job_id} with status {job['status']}")
            return job

        except Exception as e:
            logger.error(f"Error creating job: {e}")
            raise Exception(f"Failed to create job: {str(e)}")

    async def get_job(self, job_id: str, user_id: str) -> Dict[str, Any]:
        """Get job by ID"""
        try:
            job = self.db_service.get_job(job_id, user_id)
            if not job:
                raise Exception("Job not found")
            return job
        except Exception as e:
            logger.error(f"Error getting job {job_id}: {e}")
            raise Exception(f"Failed to get job: {str(e)}")

    async def update_job_status(
        self,
        job_id: str,
        user_id: str,
        status: str,
        progress: int = None,
        message: str = None
    ) -> Dict[str, Any]:
        """Update job status"""
        try:
            updates = {"status": status}
            if progress is not None:
                updates["progress"] = progress
            if message is not None:
                updates["message"] = message

            job = self.db_service.update_job(job_id, user_id, updates)
            if not job:
                raise Exception("Job not found")
            return job
        except Exception as e:
            logger.error(f"Error updating job status {job_id}: {e}")
            raise Exception(f"Failed to update job status: {str(e)}")

    async def get_user_jobs(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get all jobs for a user"""
        try:
            return self.db_service.get_user_jobs(user_id, limit, offset)
        except Exception as e:
            logger.error(f"Error getting jobs for user {user_id}: {e}")
            raise Exception(f"Failed to get jobs: {str(e)}")
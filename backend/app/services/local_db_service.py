"""
Local database service using SQLAlchemy
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, DubbingJob, LanguageTask, JobEvent
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

class LocalDBService:
    """Database service using local SQLAlchemy database"""

    def get_db(self) -> Session:
        """Get database session"""
        return SessionLocal()

    # User operations
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            with self.get_db() as db:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    return {
                        "id": user.id,
                        "email": user.email,
                        "created_at": user.created_at.isoformat() if user.created_at else None,
                        "updated_at": user.updated_at.isoformat() if user.updated_at else None
                    }
                return None
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None

    def create_user(self, user_id: str, email: str) -> Optional[Dict[str, Any]]:
        """Create a new user"""
        try:
            with self.get_db() as db:
                # Check if user exists
                existing_user = db.query(User).filter(User.id == user_id).first()
                if existing_user:
                    return self.get_user(user_id)

                user = User(id=user_id, email=email)
                db.add(user)
                db.commit()
                db.refresh(user)
                return self.get_user(user_id)
        except Exception as e:
            logger.error(f"Error creating user {user_id}: {e}")
            return None

    # Job operations
    def get_job(self, job_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get job by ID and user ID"""
        try:
            with self.get_db() as db:
                job = db.query(DubbingJob).filter(
                    DubbingJob.id == job_id,
                    DubbingJob.user_id == user_id
                ).first()
                if job:
                    return {
                        "id": job.id,
                        "user_id": job.user_id,
                        "status": job.status,
                        "progress": job.progress,
                        "message": job.message,
                        "voice_track_url": job.voice_track_url,
                        "background_track_url": job.background_track_url,
                        "target_languages": job.target_languages,
                        "created_at": job.created_at.isoformat() if job.created_at else None,
                        "updated_at": job.updated_at.isoformat() if job.updated_at else None
                    }
                return None
        except Exception as e:
            logger.error(f"Error getting job {job_id}: {e}")
            return None

    def create_job(self, job_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new job"""
        try:
            with self.get_db() as db:
                job = DubbingJob(
                    id=job_data["id"],
                    user_id=job_data["user_id"],
                    voice_track_url=job_data.get("voice_track_url"),
                    background_track_url=job_data.get("background_track_url"),
                    target_languages=job_data.get("target_languages", []),
                    status="pending",
                    progress=0
                )
                db.add(job)

                # Create language tasks for each target language
                target_languages = job_data.get("target_languages", [])
                for language_code in target_languages:
                    task = LanguageTask(
                        id=str(uuid.uuid4()),
                        job_id=job.id,
                        language_code=language_code,
                        status="pending",
                        progress=0,
                        message="Waiting to start..."
                    )
                    db.add(task)

                # Create job event
                event = JobEvent(
                    id=str(uuid.uuid4()),
                    job_id=job.id,
                    event_type="created",
                    message="Job created successfully"
                )
                db.add(event)

                db.commit()
                db.refresh(job)
                return self.get_job(job.id, job.user_id)
        except Exception as e:
            logger.error(f"Error creating job: {e}")
            return None

    def update_job(self, job_id: str, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update job"""
        try:
            with self.get_db() as db:
                job = db.query(DubbingJob).filter(
                    DubbingJob.id == job_id,
                    DubbingJob.user_id == user_id
                ).first()
                if job:
                    for key, value in updates.items():
                        if hasattr(job, key):
                            setattr(job, key, value)
                    job.updated_at = datetime.utcnow()
                    db.commit()
                    db.refresh(job)
                    return self.get_job(job_id, user_id)
                return None
        except Exception as e:
            logger.error(f"Error updating job {job_id}: {e}")
            return None

    def get_user_jobs(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get all jobs for a user"""
        try:
            with self.get_db() as db:
                jobs = db.query(DubbingJob).filter(
                    DubbingJob.user_id == user_id
                ).order_by(DubbingJob.created_at.desc()).offset(offset).limit(limit).all()

                return [{
                    "id": job.id,
                    "user_id": job.user_id,
                    "status": job.status,
                    "progress": job.progress,
                    "message": job.message,
                    "voice_track_url": job.voice_track_url,
                    "background_track_url": job.background_track_url,
                    "target_languages": job.target_languages,
                    "created_at": job.created_at.isoformat() if job.created_at else None,
                    "updated_at": job.updated_at.isoformat() if job.updated_at else None
                } for job in jobs]
        except Exception as e:
            logger.error(f"Error getting jobs for user {user_id}: {e}")
            return []
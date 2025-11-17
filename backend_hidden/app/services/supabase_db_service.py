"""
Supabase database service using REST API
"""
from typing import List, Optional, Dict, Any
from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class SupabaseDBService:
    """Database service using Supabase REST API"""
    
    def __init__(self):
        self.client: Client = create_client(settings.supabase_url, settings.supabase_service_key)
    
    # User operations
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            result = self.client.table('users').select('*').eq('id', user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None
    
    def create_user(self, user_id: str, email: str) -> Optional[Dict[str, Any]]:
        """Create a new user"""
        try:
            user_data = {
                'id': user_id,
                'email': email
            }
            result = self.client.table('users').insert(user_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating user {user_id}: {e}")
            return None
    
    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user"""
        try:
            result = self.client.table('users').update(updates).eq('id', user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            return None
    
    # Job operations
    def get_job(self, job_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get job by ID and user ID"""
        try:
            result = self.client.table('dubbing_jobs').select('*').eq('id', job_id).eq('user_id', user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting job {job_id}: {e}")
            return None
    
    def create_job(self, job_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new job"""
        try:
            result = self.client.table('dubbing_jobs').insert(job_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating job: {e}")
            return None
    
    def update_job(self, job_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update job"""
        try:
            result = self.client.table('dubbing_jobs').update(updates).eq('id', job_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating job {job_id}: {e}")
            return None
    
    def get_user_jobs(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get jobs for a user"""
        try:
            result = self.client.table('dubbing_jobs').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting jobs for user {user_id}: {e}")
            return []
    
    # Language task operations
    def get_language_tasks(self, job_id: str) -> List[Dict[str, Any]]:
        """Get language tasks for a job"""
        try:
            result = self.client.table('language_tasks').select('*').eq('job_id', job_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting language tasks for job {job_id}: {e}")
            return []
    
    def create_language_task(self, task_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a language task"""
        try:
            result = self.client.table('language_tasks').insert(task_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating language task: {e}")
            return None
    
    def update_language_task(self, task_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update language task"""
        try:
            result = self.client.table('language_tasks').update(updates).eq('id', task_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating language task {task_id}: {e}")
            return None
    
    # Job event operations
    def create_job_event(self, event_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a job event"""
        try:
            result = self.client.table('job_events').insert(event_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating job event: {e}")
            return None
    
    def get_job_events(self, job_id: str) -> List[Dict[str, Any]]:
        """Get events for a job"""
        try:
            result = self.client.table('job_events').select('*').eq('job_id', job_id).order('created_at', desc=True).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting events for job {job_id}: {e}")
            return []
    
    def get_jobs_by_status(self, status: str) -> List[Dict[str, Any]]:
        """Get jobs by status"""
        try:
            result = self.client.table('dubbing_jobs').select('*').eq('status', status).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting jobs by status {status}: {e}")
            return []
    
    def get_language_tasks_by_job_id(self, job_id: str) -> List[Dict[str, Any]]:
        """Get language tasks by job ID"""
        try:
            result = self.client.table('language_tasks').select('*').eq('job_id', job_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting language tasks for job {job_id}: {e}")
            return []
    
    def update_job(self, job_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update job"""
        try:
            result = self.client.table('dubbing_jobs').update(updates).eq('id', job_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating job {job_id}: {e}")
            return None
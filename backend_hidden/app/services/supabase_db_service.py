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

    # Audit log operations
    def create_audit_log(self, event_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create an audit log entry"""
        try:
            import uuid
            if 'id' not in event_data:
                event_data['id'] = str(uuid.uuid4())

            result = self.client.table('audit_logs').insert(event_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating audit log: {e}")
            return None

    def get_audit_logs(
        self,
        user_id: Optional[str] = None,
        event_type: Optional[str] = None,
        severity: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Query audit logs with filters"""
        try:
            query = self.client.table('audit_logs').select('*')

            if user_id:
                query = query.eq('user_id', user_id)
            if event_type:
                query = query.eq('event_type', event_type)
            if severity:
                query = query.eq('severity', severity)
            if start_date:
                query = query.gte('created_at', start_date)
            if end_date:
                query = query.lte('created_at', end_date)

            result = query.order('created_at', desc=True).limit(limit).offset(offset).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error querying audit logs: {e}")
            return []

    def get_audit_log_by_id(self, audit_log_id: str) -> Optional[Dict[str, Any]]:
        """Get audit log by ID"""
        try:
            result = self.client.table('audit_logs').select('*').eq('id', audit_log_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting audit log {audit_log_id}: {e}")
            return None

    def get_security_events(
        self,
        severity_levels: List[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get recent security events (warnings, errors, critical)"""
        try:
            if severity_levels is None:
                severity_levels = ['warning', 'error', 'critical']

            query = self.client.table('audit_logs').select('*')
            query = query.in_('severity', severity_levels)

            result = query.order('created_at', desc=True).limit(limit).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting security events: {e}")
            return []

    # Account deletion operations
    def create_deletion_token(self, token_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a deletion token"""
        try:
            result = self.client.table('account_deletion_tokens').insert(token_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating deletion token: {e}")
            return None

    def get_deletion_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Get deletion token by token string"""
        try:
            result = self.client.table('account_deletion_tokens').select('*').eq('token', token).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting deletion token {token}: {e}")
            return None

    def delete_deletion_token(self, token: str) -> bool:
        """Delete a deletion token"""
        try:
            self.client.table('account_deletion_tokens').delete().eq('token', token).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting deletion token {token}: {e}")
            return False

    def cleanup_expired_deletion_tokens(self) -> int:
        """Delete expired deletion tokens"""
        try:
            from datetime import datetime
            now = datetime.utcnow().isoformat()
            result = self.client.table('account_deletion_tokens').delete().lt('expires_at', now).execute()
            return len(result.data) if result.data else 0
        except Exception as e:
            logger.error(f"Error cleaning up expired tokens: {e}")
            return 0

    def count_user_data(self, user_id: str) -> Dict[str, int]:
        """Count all data associated with a user for deletion preview"""
        try:
            data_counts = {}

            # Count jobs
            jobs = self.client.table('dubbing_jobs').select('id', count='exact').eq('user_id', user_id).execute()
            data_counts['jobs'] = jobs.count if hasattr(jobs, 'count') else len(jobs.data) if jobs.data else 0

            # Count language tasks (via jobs)
            if data_counts['jobs'] > 0:
                job_ids = [job['id'] for job in self.get_user_jobs(user_id, limit=1000)]
                if job_ids:
                    tasks = self.client.table('language_tasks').select('id', count='exact').in_('job_id', job_ids).execute()
                    data_counts['languageTasks'] = tasks.count if hasattr(tasks, 'count') else len(tasks.data) if tasks.data else 0

                    # Count job events
                    events = self.client.table('job_events').select('id', count='exact').in_('job_id', job_ids).execute()
                    data_counts['jobEvents'] = events.count if hasattr(events, 'count') else len(events.data) if events.data else 0

                    # Count artifacts
                    artifacts = self.client.table('artifacts').select('id', count='exact').in_('job_id', job_ids).execute()
                    data_counts['artifacts'] = artifacts.count if hasattr(artifacts, 'count') else len(artifacts.data) if artifacts.data else 0
                else:
                    data_counts['languageTasks'] = 0
                    data_counts['jobEvents'] = 0
                    data_counts['artifacts'] = 0
            else:
                data_counts['languageTasks'] = 0
                data_counts['jobEvents'] = 0
                data_counts['artifacts'] = 0

            # Count credit transactions
            transactions = self.client.table('credit_transactions').select('id', count='exact').eq('user_id', user_id).execute()
            data_counts['creditTransactions'] = transactions.count if hasattr(transactions, 'count') else len(transactions.data) if transactions.data else 0

            # Count user credits
            user_credits = self.client.table('user_credits').select('user_id', count='exact').eq('user_id', user_id).execute()
            data_counts['userCredits'] = user_credits.count if hasattr(user_credits, 'count') else len(user_credits.data) if user_credits.data else 0

            return data_counts
        except Exception as e:
            logger.error(f"Error counting user data for {user_id}: {e}")
            return {}

    def delete_user_data(self, user_id: str) -> Dict[str, int]:
        """Delete all data associated with a user"""
        try:
            deleted_counts = {}

            # Get all user jobs first
            jobs = self.get_user_jobs(user_id, limit=1000)
            job_ids = [job['id'] for job in jobs] if jobs else []

            if job_ids:
                # Delete artifacts
                artifacts_result = self.client.table('artifacts').delete().in_('job_id', job_ids).execute()
                deleted_counts['artifacts'] = len(artifacts_result.data) if artifacts_result.data else 0

                # Delete job events
                events_result = self.client.table('job_events').delete().in_('job_id', job_ids).execute()
                deleted_counts['jobEvents'] = len(events_result.data) if events_result.data else 0

                # Delete language tasks
                tasks_result = self.client.table('language_tasks').delete().in_('job_id', job_ids).execute()
                deleted_counts['languageTasks'] = len(tasks_result.data) if tasks_result.data else 0

                # Delete jobs
                jobs_result = self.client.table('dubbing_jobs').delete().eq('user_id', user_id).execute()
                deleted_counts['jobs'] = len(jobs_result.data) if jobs_result.data else 0
            else:
                deleted_counts['artifacts'] = 0
                deleted_counts['jobEvents'] = 0
                deleted_counts['languageTasks'] = 0
                deleted_counts['jobs'] = 0

            # Delete credit transactions
            transactions_result = self.client.table('credit_transactions').delete().eq('user_id', user_id).execute()
            deleted_counts['creditTransactions'] = len(transactions_result.data) if transactions_result.data else 0

            # Delete user credits
            credits_result = self.client.table('user_credits').delete().eq('user_id', user_id).execute()
            deleted_counts['userCredits'] = len(credits_result.data) if credits_result.data else 0

            # Delete user
            user_result = self.client.table('users').delete().eq('id', user_id).execute()
            deleted_counts['user'] = len(user_result.data) if user_result.data else 0

            return deleted_counts
        except Exception as e:
            logger.error(f"Error deleting user data for {user_id}: {e}")
            raise Exception(f"Failed to delete user data: {str(e)}")

    def create_deletion_audit_log(self, audit_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create an audit log entry for account deletion"""
        try:
            result = self.client.table('account_deletion_audit_logs').insert(audit_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating deletion audit log: {e}")
            return None

    def get_deletion_audit_logs(self, user_id: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Get deletion audit logs (optionally filtered by user_id)"""
        try:
            query = self.client.table('account_deletion_audit_logs').select('*')
            if user_id:
                query = query.eq('user_id', user_id)
            result = query.order('created_at', desc=True).limit(limit).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting deletion audit logs: {e}")
            return []
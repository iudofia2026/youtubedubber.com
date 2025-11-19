"""
Account Deletion Service - Handles complete GDPR-compliant account deletion
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import uuid
import logging
from app.services.supabase_db_service import SupabaseDBService
from app.auth import SupabaseStorageService
from app.schemas import (
    AccountDeletionRequest,
    AccountDeletionConfirmationRequest,
    AccountDeletionInitiationResponse,
    AccountDeletionResponse
)

logger = logging.getLogger(__name__)


class AccountDeletionService:
    """Service for handling GDPR-compliant account deletion"""

    def __init__(self):
        self.db_service = SupabaseDBService()
        self.storage_service = SupabaseStorageService()

    async def initiate_deletion(
        self,
        user_id: str,
        user_email: str,
        deletion_request: AccountDeletionRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> AccountDeletionInitiationResponse:
        """
        Initiate account deletion - Step 1
        Creates a deletion token and returns data summary
        """
        try:
            # Validate confirmation text
            if deletion_request.confirmationText != "DELETE MY ACCOUNT":
                raise ValueError("Confirmation text must be 'DELETE MY ACCOUNT'")

            # Count all user data
            data_counts = self.db_service.count_user_data(user_id)

            # Estimate storage files (this is an approximation)
            storage_file_count = self._estimate_storage_files(user_id, data_counts)
            data_counts['storageFiles'] = storage_file_count

            # Generate deletion token
            deletion_token = f"del_{uuid.uuid4().hex}"
            expires_at = datetime.utcnow() + timedelta(minutes=10)

            # Store deletion token
            token_data = {
                'token': deletion_token,
                'user_id': user_id,
                'user_email': user_email,
                'reason': deletion_request.reason,
                'feedback': deletion_request.feedback,
                'ip_address': ip_address,
                'user_agent': user_agent,
                'expires_at': expires_at.isoformat()
            }

            self.db_service.create_deletion_token(token_data)

            # Clean up expired tokens
            self.db_service.cleanup_expired_deletion_tokens()

            return AccountDeletionInitiationResponse(
                deletionToken=deletion_token,
                message="Account deletion initiated. Please confirm within 10 minutes.",
                expiresAt=expires_at.isoformat(),
                dataToBeDeleted=data_counts
            )

        except Exception as e:
            logger.error(f"Error initiating account deletion for {user_id}: {e}")
            raise Exception(f"Failed to initiate account deletion: {str(e)}")

    async def confirm_deletion(
        self,
        user_id: str,
        confirmation_request: AccountDeletionConfirmationRequest
    ) -> AccountDeletionResponse:
        """
        Complete account deletion - Step 2
        Permanently deletes all user data and creates audit log
        """
        try:
            # Validate final confirmation
            if not confirmation_request.finalConfirmation:
                raise ValueError("Final confirmation must be true")

            # Retrieve and validate deletion token
            token_data = self.db_service.get_deletion_token(confirmation_request.deletionToken)

            if not token_data:
                raise ValueError("Invalid or expired deletion token")

            # Verify token belongs to user
            if token_data['user_id'] != user_id:
                raise ValueError("Deletion token does not match user")

            # Check if token is expired
            expires_at = datetime.fromisoformat(token_data['expires_at'].replace('Z', '+00:00'))
            if datetime.utcnow().replace(tzinfo=expires_at.tzinfo) > expires_at:
                raise ValueError("Deletion token has expired")

            # Record deletion start time
            deletion_initiated_at = datetime.fromisoformat(token_data['created_at'].replace('Z', '+00:00'))
            deletion_completed_at = datetime.utcnow()

            # Count data before deletion
            data_counts = self.db_service.count_user_data(user_id)

            # Delete all user files from storage
            storage_deleted_count = await self._delete_user_storage_files(user_id)
            data_counts['storageFiles'] = storage_deleted_count

            # Delete all database records
            deleted_data = self.db_service.delete_user_data(user_id)
            deleted_data['storageFiles'] = storage_deleted_count
            deleted_data['auditLogCreated'] = False

            # Create audit log (GDPR compliance - retain for legal purposes)
            audit_log_data = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'user_email': token_data['user_email'],
                'deletion_initiated_at': deletion_initiated_at.isoformat(),
                'deletion_completed_at': deletion_completed_at.isoformat(),
                'reason': token_data.get('reason'),
                'feedback': token_data.get('feedback'),
                'data_deleted_summary': data_counts,
                'initiated_by_user': True,
                'ip_address': token_data.get('ip_address'),
                'user_agent': token_data.get('user_agent')
            }

            audit_log = self.db_service.create_deletion_audit_log(audit_log_data)
            if audit_log:
                deleted_data['auditLogCreated'] = True

            # Delete the deletion token
            self.db_service.delete_deletion_token(confirmation_request.deletionToken)

            # Also try to delete user from Supabase Auth
            try:
                from app.auth import get_supabase_client
                supabase = get_supabase_client()
                supabase.auth.admin.delete_user(user_id)
                logger.info(f"Deleted user {user_id} from Supabase Auth")
            except Exception as auth_error:
                logger.warning(f"Could not delete user from Supabase Auth: {auth_error}")
                # Continue anyway - database deletion is more critical

            return AccountDeletionResponse(
                success=True,
                message="Account and all associated data have been permanently deleted.",
                deletedAt=deletion_completed_at.isoformat(),
                dataDeleted=deleted_data
            )

        except Exception as e:
            logger.error(f"Error completing account deletion for {user_id}: {e}")
            raise Exception(f"Failed to complete account deletion: {str(e)}")

    async def _delete_user_storage_files(self, user_id: str) -> int:
        """
        Delete all user files from Supabase Storage
        Returns count of deleted files
        """
        deleted_count = 0
        try:
            from app.config import settings

            # List all files in the user's directory
            bucket = settings.storage_bucket
            user_prefix = f"uploads/{user_id}/"

            # Note: Supabase storage client doesn't have a list method in Python SDK
            # We need to use the REST API directly or delete based on known paths

            # Get all user jobs to find file paths
            jobs = self.db_service.get_user_jobs(user_id, limit=1000)

            file_paths = []
            for job in jobs:
                # Collect file paths from job
                if job.get('voice_track_url'):
                    file_paths.append(self._extract_file_path(job['voice_track_url']))
                if job.get('background_track_url'):
                    file_paths.append(self._extract_file_path(job['background_track_url']))

                # Get language tasks for this job
                tasks = self.db_service.get_language_tasks_by_job_id(job['id'])
                for task in tasks:
                    if task.get('transcript_url'):
                        file_paths.append(self._extract_file_path(task['transcript_url']))
                    if task.get('translated_transcript_url'):
                        file_paths.append(self._extract_file_path(task['translated_transcript_url']))
                    if task.get('audio_url'):
                        file_paths.append(self._extract_file_path(task['audio_url']))
                    if task.get('captions_url'):
                        file_paths.append(self._extract_file_path(task['captions_url']))

            # Remove None values and duplicates
            file_paths = list(set([path for path in file_paths if path]))

            # Delete each file
            for file_path in file_paths:
                try:
                    success = await self.storage_service.delete_file(bucket, file_path)
                    if success:
                        deleted_count += 1
                        logger.info(f"Deleted file: {file_path}")
                except Exception as file_error:
                    logger.warning(f"Could not delete file {file_path}: {file_error}")
                    # Continue with other files

            logger.info(f"Deleted {deleted_count} storage files for user {user_id}")
            return deleted_count

        except Exception as e:
            logger.error(f"Error deleting storage files for user {user_id}: {e}")
            return deleted_count

    def _extract_file_path(self, url: str) -> Optional[str]:
        """Extract file path from storage URL"""
        if not url:
            return None

        try:
            # Handle both public URLs and file paths
            if url.startswith('http'):
                # Extract path from URL
                # Format: https://...supabase.co/storage/v1/object/public/bucket-name/path/to/file
                parts = url.split('/object/public/')
                if len(parts) > 1:
                    path_with_bucket = parts[1]
                    # Remove bucket name
                    path_parts = path_with_bucket.split('/', 1)
                    if len(path_parts) > 1:
                        return path_parts[1]
            else:
                # Already a file path
                return url

            return None
        except Exception as e:
            logger.warning(f"Could not extract file path from URL {url}: {e}")
            return None

    def _estimate_storage_files(self, user_id: str, data_counts: Dict[str, int]) -> int:
        """
        Estimate number of storage files based on data counts
        """
        # Rough estimation:
        # - Each job has 1-2 uploaded files (voice + optional background)
        # - Each language task has 4 generated files (transcript, translation, audio, captions)
        job_files = data_counts.get('jobs', 0) * 1.5  # Average of 1.5 files per job
        task_files = data_counts.get('languageTasks', 0) * 4  # 4 files per task
        return int(job_files + task_files)

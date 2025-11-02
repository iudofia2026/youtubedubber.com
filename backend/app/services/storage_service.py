"""
Storage service for handling file uploads and downloads
"""
import uuid
from typing import Dict, List
from app.auth import SupabaseStorageService
from app.schemas import SignedUploadUrls, UploadUrlsRequest
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class StorageService:
    """Service for managing file storage operations"""
    
    def __init__(self):
        self.supabase_storage = SupabaseStorageService()
        self.bucket = settings.storage_bucket
    
    async def generate_upload_urls(
        self,
        user_id: str,
        languages: List[str],
        voice_track_name: str,
        background_track_name: str = None
    ) -> SignedUploadUrls:
        """
        Generate signed URLs for file uploads
        """
        try:
            # Generate unique job ID
            job_id = f"job_{uuid.uuid4().hex[:12]}"

            # Create file paths
            voice_track_path = f"uploads/{user_id}/{job_id}/voice_track_{voice_track_name}"
            background_track_path = None

            if background_track_name:
                background_track_path = f"uploads/{user_id}/{job_id}/background_track_{background_track_name}"

            # Try Supabase Storage first, fallback to local uploads in development
            try:
                # Voice track URL
                voice_url = await self.supabase_storage.generate_signed_upload_url(
                    bucket=self.bucket,
                    file_path=voice_track_path,
                    expires_in=3600  # 1 hour
                )

                # Background track URL (if provided)
                background_url = None
                if background_track_path:
                    background_url = await self.supabase_storage.generate_signed_upload_url(
                        bucket=self.bucket,
                        file_path=background_track_path,
                        expires_in=3600
                    )

                logger.info(f"Generated Supabase Storage upload URLs for job {job_id}")

            except Exception as supabase_error:
                logger.warning(f"Supabase Storage not available ({supabase_error}), using local upload URLs")

                # Fallback to local uploads for development
                voice_url = f"http://localhost:8000/api/jobs/mock-upload/{voice_track_path}"
                background_url = None
                if background_track_path:
                    background_url = f"http://localhost:8000/api/jobs/mock-upload/{background_track_path}"

                logger.info(f"Generated local mock upload URLs for job {job_id}")

            from app.schemas import UploadUrlsNested

            return SignedUploadUrls(
                job_id=job_id,
                upload_urls=UploadUrlsNested(
                    voice_track=voice_url,
                    background_track=background_url
                ),
                voice_track_path=voice_track_path,
                background_track_path=background_track_path
            )

        except Exception as e:
            logger.error(f"Error generating upload URLs: {e}")
            raise Exception("Failed to generate upload URLs")
    
    async def generate_download_url(
        self,
        file_path: str,
        expires_in: int = 3600
    ) -> str:
        """
        Generate a signed URL for file download
        """
        try:
            return await self.supabase_storage.generate_signed_download_url(
                bucket=self.bucket,
                file_path=file_path,
                expires_in=expires_in
            )
        except Exception as e:
            logger.error(f"Error generating download URL: {e}")
            raise Exception("Failed to generate download URL")
    
    async def download_file(self, file_path: str) -> bytes:
        """
        Download a file from storage
        """
        try:
            return await self.supabase_storage.download_file(
                bucket=self.bucket,
                file_path=file_path
            )
        except Exception as e:
            logger.error(f"Error downloading file: {e}")
            raise Exception(f"Failed to download file: {str(e)}")

    async def upload_file(
        self,
        file_path: str,
        file_data: bytes,
        content_type: str = None
    ) -> str:
        """
        Upload a file to storage
        """
        try:
            return await self.supabase_storage.upload_file(
                bucket=self.bucket,
                file_path=file_path,
                file_data=file_data,
                content_type=content_type
            )
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            raise Exception(f"Failed to upload file: {str(e)}")

    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from storage
        """
        try:
            return await self.supabase_storage.delete_file(
                bucket=self.bucket,
                file_path=file_path
            )
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return False

    def get_file_path(self, user_id: str, job_id: str, file_type: str, filename: str) -> str:
        """
        Generate a standardized file path
        """
        return f"uploads/{user_id}/{job_id}/{file_type}_{filename}"

    def get_artifact_path(self, user_id: str, job_id: str, language_code: str, artifact_type: str, filename: str) -> str:
        """
        Generate a path for processed artifacts
        """
        return f"artifacts/{user_id}/{job_id}/{language_code}/{artifact_type}_{filename}"
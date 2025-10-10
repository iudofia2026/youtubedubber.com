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
            
            # Check if we're in development mode (test Supabase URL)
            if settings.supabase_url == "https://test.supabase.co":
                # Development mode - return mock URLs
                upload_urls = {
                    "voice_track": f"http://localhost:8000/mock-upload/{voice_track_path}",
                }
                
                if background_track_path:
                    upload_urls["background_track"] = f"http://localhost:8000/mock-upload/{background_track_path}"
                
                logger.info(f"Development mode: Generated mock upload URLs for job {job_id}")
                return SignedUploadUrls(
                    job_id=job_id,
                    upload_urls=upload_urls
                )
            
            # Production mode - use real Supabase
            upload_urls = {}
            
            # Voice track URL
            voice_url = await self.supabase_storage.generate_signed_upload_url(
                bucket=self.bucket,
                file_path=voice_track_path,
                expires_in=3600  # 1 hour
            )
            upload_urls["voice_track"] = voice_url
            
            # Background track URL (if provided)
            if background_track_path:
                background_url = await self.supabase_storage.generate_signed_upload_url(
                    bucket=self.bucket,
                    file_path=background_track_path,
                    expires_in=3600
                )
                upload_urls["background_track"] = background_url
            
            return SignedUploadUrls(
                job_id=job_id,
                upload_urls=upload_urls
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
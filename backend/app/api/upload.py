"""
Upload API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import UploadUrlsRequest, SignedUploadUrls, BackendErrorResponse
from app.services.storage_service import StorageService
from app.auth import get_current_user, UserResponse
from app.middleware.rate_limit import upload_rate_limit
from app.utils.security import create_http_exception
from app.utils.validation import validate_language_codes, validate_filename
from app.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


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
        # For development mode, skip validation
        if settings.supabase_url == "https://test.supabase.co":
            logger.info(f"Development mode: Generating upload URLs for user {current_user.id}, languages: {request.languages}")
            
            # Generate signed URLs directly
            signed_urls = await storage_service.generate_upload_urls(
                user_id=current_user.id,
                languages=request.languages,
                voice_track_name=request.voice_track_name,
                background_track_name=request.background_track_name
            )
            
            logger.info(f"Generated upload URLs for job {signed_urls.job_id}")
            return signed_urls
        
        # Production mode - validate input data
        validated_languages = validate_language_codes(request.languages)
        validated_voice_track = validate_filename(request.voice_track_name, "voice_track_name")
        validated_background_track = validate_filename(request.background_track_name, "background_track_name")
        
        # Update request with validated data
        request.languages = validated_languages
        request.voice_track_name = validated_voice_track
        request.background_track_name = validated_background_track
        
        logger.info(f"Generating upload URLs for user {current_user.id}, languages: {request.languages}")
        
        # Generate signed URLs
        signed_urls = await storage_service.generate_upload_urls(
            user_id=current_user.id,
            languages=request.languages,
            voice_track_name=request.voice_track_name,
            background_track_name=request.background_track_name
        )
        
        logger.info(f"Generated upload URLs for job {signed_urls.job_id}")
        return signed_urls
        
    except Exception as e:
        logger.error(f"Error generating upload URLs: {e}", exc_info=True)
        raise create_http_exception(
            error_type="upload_url_generation_failed",
            message="Failed to generate upload URLs",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"user_id": current_user.id, "languages": request.languages},
            original_error=e
        )
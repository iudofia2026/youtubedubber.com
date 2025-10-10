"""
Upload API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import UploadUrlsRequest, SignedUploadUrls, BackendErrorResponse
from app.services.storage_service import StorageService
from app.auth import get_current_user, UserResponse
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
        logger.error(f"Error generating upload URLs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=BackendErrorResponse(
                error="upload_url_generation_failed",
                message="Failed to generate upload URLs",
                details={"error": str(e)}
            ).dict()
        )
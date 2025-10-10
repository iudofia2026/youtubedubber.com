"""
Job management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import (
    JobCreationRequest, JobStatusResponse, SubmitJobResponse, 
    BackendErrorResponse, JobStatus
)
from app.services.job_service import JobService
from app.auth import get_current_user, UserResponse
from app.database import get_db
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=SubmitJobResponse)
async def create_job(
    request: JobCreationRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new dubbing job
    This endpoint matches the frontend API contract exactly
    """
    try:
        logger.info(f"Creating job {request.job_id} for user {current_user.id}")
        
        job_service = JobService()
        
        # Create the job
        job_status = await job_service.create_job(
            user_id=current_user.id,
            job_data=request,
            db=db
        )
        
        logger.info(f"Created job {request.job_id} successfully")
        
        return SubmitJobResponse(jobId=request.job_id)
        
    except Exception as e:
        logger.error(f"Error creating job: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=BackendErrorResponse(
                error="job_creation_failed",
                message="Failed to create job",
                details={"error": str(e)}
            ).dict()
        )


@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get job status and progress
    This endpoint matches the frontend API contract exactly
    """
    try:
        logger.info(f"Getting status for job {job_id} for user {current_user.id}")
        
        job_service = JobService()
        
        # Get job status
        job_status = await job_service.get_job_status(
            job_id=job_id,
            user_id=current_user.id,
            db=db
        )
        
        return job_status
        
    except Exception as e:
        logger.error(f"Error getting job status: {e}")
        
        # Check if it's a "not found" error
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=BackendErrorResponse(
                    error="job_not_found",
                    message="Job not found",
                    details={"job_id": job_id}
                ).dict()
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=BackendErrorResponse(
                error="job_status_failed",
                message="Failed to get job status",
                details={"error": str(e)}
            ).dict()
        )


@router.get("/", response_model=list[JobStatusResponse])
async def list_user_jobs(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0
):
    """
    List jobs for the current user
    """
    try:
        logger.info(f"Listing jobs for user {current_user.id}")
        
        job_service = JobService()
        
        # Get user's jobs
        jobs = db.query(job_service.DubbingJob).filter(
            job_service.DubbingJob.user_id == current_user.id
        ).offset(offset).limit(limit).all()
        
        # Convert to response format
        job_responses = []
        for job in jobs:
            job_status = await job_service.get_job_status(
                job_id=job.id,
                user_id=current_user.id,
                db=db
            )
            job_responses.append(job_status)
        
        return job_responses
        
    except Exception as e:
        logger.error(f"Error listing jobs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=BackendErrorResponse(
                error="job_listing_failed",
                message="Failed to list jobs",
                details={"error": str(e)}
            ).dict()
        )
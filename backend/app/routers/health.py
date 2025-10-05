"""
Health check router
"""

from fastapi import APIRouter
from datetime import datetime
import os

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }


@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with service status"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "services": {
            "api": "healthy",
            "file_system": "healthy" if os.path.exists("uploads") and os.path.exists("outputs") else "unhealthy",
            "external_apis": {
                "deepgram": "unknown",  # Would check actual API status
                "elevenlabs": "unknown",
                "openai": "unknown"
            }
        }
    }
"""
Pydantic schemas for request/response validation
These schemas match exactly what the frontend expects
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# Enums for status values
class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    GENERATING = "generating"
    FINALIZING = "finalizing"
    COMPLETE = "complete"
    ERROR = "error"
    UPLOADING = "uploading"


class LanguageTaskStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    GENERATING = "generating"
    FINALIZING = "finalizing"
    COMPLETE = "complete"
    ERROR = "error"


# Request schemas (matching frontend types)
class UploadUrlsRequest(BaseModel):
    """Request schema for generating signed upload URLs"""
    languages: List[str] = Field(..., description="List of target language codes")
    voice_track_name: str = Field(..., description="Name of the voice track file")
    background_track_name: Optional[str] = Field(None, description="Name of the background track file")


class JobCreationRequest(BaseModel):
    """Request schema for creating a new dubbing job"""
    job_id: str = Field(..., description="Unique job identifier")
    voice_track_uploaded: bool = Field(..., description="Whether voice track has been uploaded")
    background_track_uploaded: bool = Field(..., description="Whether background track has been uploaded")
    languages: List[str] = Field(..., description="List of target language codes")
    voice_track_url: Optional[str] = Field(None, description="Voice track file path in storage")
    background_track_url: Optional[str] = Field(None, description="Background track file path in storage")
    voice_track_duration: Optional[int] = Field(None, description="Voice track duration in seconds")
    background_track_duration: Optional[int] = Field(None, description="Background track duration in seconds")


# Response schemas (matching frontend types)
class SignedUploadUrls(BaseModel):
    """Response schema for signed upload URLs"""
    job_id: str = Field(..., description="Unique job identifier")
    upload_urls: Dict[str, str] = Field(..., description="Signed URLs for file uploads")
    
    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "job_123456789",
                "upload_urls": {
                    "voice_track": "https://storage.supabase.co/...",
                    "background_track": "https://storage.supabase.co/..."
                }
            }
        }


class SubmitJobResponse(BaseModel):
    """Response schema for job submission"""
    jobId: str = Field(..., description="Unique job identifier")


class LanguageProgress(BaseModel):
    """Language-specific progress information"""
    languageCode: str = Field(..., description="Language code (e.g., 'es', 'fr')")
    languageName: str = Field(..., description="Human-readable language name")
    flag: str = Field(..., description="Flag emoji for the language")
    status: LanguageTaskStatus = Field(..., description="Current status of the language task")
    progress: int = Field(0, ge=0, le=100, description="Progress percentage (0-100)")
    message: str = Field(..., description="Status message")
    estimatedTimeRemaining: Optional[int] = Field(None, description="Estimated time remaining in seconds")
    fileSize: Optional[int] = Field(None, description="File size in bytes")
    downloadUrl: Optional[str] = Field(None, description="Download URL for the completed file")


class JobStatusResponse(BaseModel):
    """Response schema for job status"""
    id: str = Field(..., description="Job identifier")
    status: JobStatus = Field(..., description="Overall job status")
    progress: int = Field(0, ge=0, le=100, description="Overall progress percentage (0-100)")
    message: str = Field(..., description="Status message")
    languages: List[LanguageProgress] = Field(..., description="Language-specific progress")
    totalLanguages: int = Field(..., description="Total number of languages")
    completedLanguages: int = Field(0, description="Number of completed languages")
    startedAt: str = Field(..., description="Job start time (ISO format)")
    estimatedCompletion: Optional[str] = Field(None, description="Estimated completion time (ISO format)")


# Internal schemas for database operations
class UserCreate(BaseModel):
    """Schema for creating a new user"""
    id: str = Field(..., description="User ID from Supabase")
    email: str = Field(..., description="User email address")


class UserResponse(BaseModel):
    """Schema for user information"""
    id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    created_at: datetime = Field(..., description="User creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="User last update timestamp")


class DubbingJobCreate(BaseModel):
    """Schema for creating a new dubbing job"""
    id: str = Field(..., description="Job ID")
    user_id: str = Field(..., description="User ID")
    voice_track_url: Optional[str] = Field(None, description="Voice track URL")
    background_track_url: Optional[str] = Field(None, description="Background track URL")
    target_languages: List[str] = Field(..., description="Target languages")
    voice_track_duration: Optional[int] = Field(None, description="Voice track duration in seconds")
    background_track_duration: Optional[int] = Field(None, description="Background track duration in seconds")


class LanguageTaskCreate(BaseModel):
    """Schema for creating a language task"""
    id: str = Field(..., description="Task ID")
    job_id: str = Field(..., description="Job ID")
    language_code: str = Field(..., description="Language code")


class LanguageTaskUpdate(BaseModel):
    """Schema for updating a language task"""
    status: Optional[LanguageTaskStatus] = Field(None, description="Task status")
    progress: Optional[int] = Field(None, ge=0, le=100, description="Progress percentage")
    message: Optional[str] = Field(None, description="Status message")
    transcript_url: Optional[str] = Field(None, description="Transcript file URL")
    translated_transcript_url: Optional[str] = Field(None, description="Translated transcript URL")
    audio_url: Optional[str] = Field(None, description="Generated audio URL")
    captions_url: Optional[str] = Field(None, description="Captions file URL")
    transcript_duration: Optional[int] = Field(None, description="Transcript duration")
    audio_duration: Optional[int] = Field(None, description="Audio duration")
    word_count: Optional[int] = Field(None, description="Word count")


class JobEventCreate(BaseModel):
    """Schema for creating a job event"""
    job_id: str = Field(..., description="Job ID")
    event_type: str = Field(..., description="Event type")
    message: str = Field(..., description="Event message")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional event data")


class ArtifactCreate(BaseModel):
    """Schema for creating an artifact"""
    id: str = Field(..., description="Artifact ID")
    job_id: str = Field(..., description="Job ID")
    language_task_id: Optional[str] = Field(None, description="Language task ID")
    artifact_type: str = Field(..., description="Type of artifact")
    file_url: str = Field(..., description="File URL")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    mime_type: Optional[str] = Field(None, description="MIME type")
    checksum: Optional[str] = Field(None, description="File checksum")


# Error response schemas
class BackendErrorResponse(BaseModel):
    """Error response schema matching frontend expectations"""
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    voice_duration: Optional[int] = Field(None, description="Voice track duration for validation errors")
    background_duration: Optional[int] = Field(None, description="Background track duration for validation errors")
    status_code: Optional[int] = Field(None, description="HTTP status code")


# Health check schema
class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")
    version: str = Field("1.0.0", description="API version")


# Language mapping for frontend compatibility
LANGUAGE_MAPPING = {
    "en": {"name": "English", "flag": "🇺🇸"},
    "es": {"name": "Spanish", "flag": "🇪🇸"},
    "fr": {"name": "French", "flag": "🇫🇷"},
    "de": {"name": "German", "flag": "🇩🇪"},
    "ja": {"name": "Japanese", "flag": "🇯🇵"},
    "zh": {"name": "Chinese", "flag": "🇨🇳"},
    "ko": {"name": "Korean", "flag": "🇰🇷"},
    "pt": {"name": "Portuguese", "flag": "🇵🇹"},
    "it": {"name": "Italian", "flag": "🇮🇹"},
    "ru": {"name": "Russian", "flag": "🇷🇺"},
    "ar": {"name": "Arabic", "flag": "🇸🇦"},
    "hi": {"name": "Hindi", "flag": "🇮🇳"},
}


def get_language_info(language_code: str) -> Dict[str, str]:
    """Get language information for frontend compatibility"""
    return LANGUAGE_MAPPING.get(language_code, {"name": language_code.upper(), "flag": "🌐"})
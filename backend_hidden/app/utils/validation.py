"""
Input validation utilities for API endpoints
"""
import re
import logging
from typing import Any, Dict, List, Optional, Union
from fastapi import HTTPException, status
from app.utils.security import create_http_exception, validate_input_safety

logger = logging.getLogger(__name__)

# Validation patterns
JOB_ID_PATTERN = re.compile(r'^[a-zA-Z0-9_-]{1,50}$')
LANGUAGE_CODE_PATTERN = re.compile(r'^[a-z]{2}(-[A-Z]{2})?$')
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
FILENAME_PATTERN = re.compile(r'^[a-zA-Z0-9._-]{1,100}\.(mp3|wav|m4a|mpeg)$')

# Allowed language codes
ALLOWED_LANGUAGES = {
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi',
    'en-US', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'fr-CA', 'de-DE', 'it-IT',
    'pt-BR', 'pt-PT', 'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW', 'ar-SA',
    'hi-IN'
}

# Maximum values
MAX_LANGUAGES_PER_JOB = 10
MAX_FILENAME_LENGTH = 100
MAX_JOB_ID_LENGTH = 50
MAX_EMAIL_LENGTH = 254


def validate_job_id(job_id: str) -> str:
    """
    Validate job ID format and safety
    
    Args:
        job_id: Job ID to validate
    
    Returns:
        Validated job ID
    
    Raises:
        HTTPException: If job ID is invalid
    """
    if not job_id:
        raise create_http_exception(
            error_type="validation_error",
            message="Job ID is required",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    if len(job_id) > MAX_JOB_ID_LENGTH:
        raise create_http_exception(
            error_type="validation_error",
            message=f"Job ID must be {MAX_JOB_ID_LENGTH} characters or less",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    if not JOB_ID_PATTERN.match(job_id):
        raise create_http_exception(
            error_type="validation_error",
            message="Job ID contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    if not validate_input_safety(job_id):
        raise create_http_exception(
            error_type="validation_error",
            message="Job ID contains potentially dangerous content",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    return job_id


def validate_language_codes(languages: List[str]) -> List[str]:
    """
    Validate language codes
    
    Args:
        languages: List of language codes to validate
    
    Returns:
        Validated list of language codes
    
    Raises:
        HTTPException: If language codes are invalid
    """
    if not languages:
        raise create_http_exception(
            error_type="validation_error",
            message="At least one language must be specified",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    if len(languages) > MAX_LANGUAGES_PER_JOB:
        raise create_http_exception(
            error_type="validation_error",
            message=f"Maximum {MAX_LANGUAGES_PER_JOB} languages allowed per job",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    validated_languages = []
    for lang in languages:
        if not isinstance(lang, str):
            raise create_http_exception(
                error_type="validation_error",
                message="Language codes must be strings",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        lang = lang.strip().lower()
        
        if not LANGUAGE_CODE_PATTERN.match(lang):
            raise create_http_exception(
                error_type="validation_error",
                message=f"Invalid language code format: {lang}. Use format like 'en' or 'en-US'",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        if lang not in ALLOWED_LANGUAGES:
            raise create_http_exception(
                error_type="validation_error",
                message=f"Language not supported: {lang}. Supported languages: {', '.join(sorted(ALLOWED_LANGUAGES))}",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        if not validate_input_safety(lang):
            raise create_http_exception(
                error_type="validation_error",
                message="Language code contains potentially dangerous content",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        validated_languages.append(lang)
    
    # Check for duplicates
    if len(validated_languages) != len(set(validated_languages)):
        raise create_http_exception(
            error_type="validation_error",
            message="Duplicate language codes are not allowed",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    return validated_languages


def validate_filename(filename: str, field_name: str = "filename") -> str:
    """
    Validate filename format and safety
    
    Args:
        filename: Filename to validate
        field_name: Name of the field for error messages
    
    Returns:
        Validated filename
    
    Raises:
        HTTPException: If filename is invalid
    """
    if not filename:
        raise create_http_exception(
            error_type="validation_error",
            message=f"{field_name} is required",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    if len(filename) > MAX_FILENAME_LENGTH:
        raise create_http_exception(
            error_type="validation_error",
            message=f"{field_name} must be {MAX_FILENAME_LENGTH} characters or less",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    if not FILENAME_PATTERN.match(filename):
        raise create_http_exception(
            error_type="validation_error",
            message=f"Invalid {field_name} format. Only letters, numbers, dots, hyphens, and underscores are allowed. Supported extensions: mp3, wav, m4a, mpeg",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    if not validate_input_safety(filename):
        raise create_http_exception(
            error_type="validation_error",
            message=f"{field_name} contains potentially dangerous content",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    return filename


def validate_pagination_params(limit: int, offset: int) -> tuple[int, int]:
    """
    Validate pagination parameters
    
    Args:
        limit: Number of items per page
        offset: Number of items to skip
    
    Returns:
        Validated limit and offset
    
    Raises:
        HTTPException: If parameters are invalid
    """
    if limit < 1 or limit > 100:
        raise create_http_exception(
            error_type="validation_error",
            message="Limit must be between 1 and 100",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    if offset < 0:
        raise create_http_exception(
            error_type="validation_error",
            message="Offset must be 0 or greater",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    return limit, offset


def validate_request_data(data: Dict[str, Any], required_fields: List[str]) -> Dict[str, Any]:
    """
    Validate request data contains required fields
    
    Args:
        data: Request data to validate
        required_fields: List of required field names
    
    Returns:
        Validated data
    
    Raises:
        HTTPException: If required fields are missing
    """
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None:
            missing_fields.append(field)
    
    if missing_fields:
        raise create_http_exception(
            error_type="validation_error",
            message=f"Missing required fields: {', '.join(missing_fields)}",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    return data


def sanitize_string_input(input_str: str, max_length: int = 1000) -> str:
    """
    Sanitize string input by removing dangerous characters and limiting length
    
    Args:
        input_str: String to sanitize
        max_length: Maximum allowed length
    
    Returns:
        Sanitized string
    """
    if not isinstance(input_str, str):
        return ""
    
    # Remove null bytes and control characters
    sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', input_str)
    
    # Limit length
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    # Remove leading/trailing whitespace
    sanitized = sanitized.strip()
    
    return sanitized


def validate_boolean_input(value: Any, field_name: str) -> bool:
    """
    Validate and convert boolean input
    
    Args:
        value: Value to validate
        field_name: Name of the field for error messages
    
    Returns:
        Boolean value
    
    Raises:
        HTTPException: If value is not a valid boolean
    """
    if isinstance(value, bool):
        return value
    
    if isinstance(value, str):
        if value.lower() in ('true', '1', 'yes', 'on'):
            return True
        elif value.lower() in ('false', '0', 'no', 'off'):
            return False
    
    raise create_http_exception(
        error_type="validation_error",
        message=f"{field_name} must be a boolean value (true/false)",
        status_code=status.HTTP_400_BAD_REQUEST
    )
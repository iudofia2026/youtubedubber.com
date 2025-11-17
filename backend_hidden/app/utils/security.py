"""
Security utilities for error handling and sanitization
"""
import re
import logging
from typing import Any, Dict, Optional
from fastapi import HTTPException, status
from app.config import settings

logger = logging.getLogger(__name__)

# Patterns to sanitize from error messages
SENSITIVE_PATTERNS = [
    r'password["\']?\s*[:=]\s*["\']?[^"\']+["\']?',
    r'api[_-]?key["\']?\s*[:=]\s*["\']?[^"\']+["\']?',
    r'token["\']?\s*[:=]\s*["\']?[^"\']+["\']?',
    r'secret["\']?\s*[:=]\s*["\']?[^"\']+["\']?',
    r'connection[_-]?string["\']?\s*[:=]\s*["\']?[^"\']+["\']?',
    r'database[_-]?url["\']?\s*[:=]\s*["\']?[^"\']+["\']?',
    r'postgresql://[^"\']+',
    r'mysql://[^"\']+',
    r'mongodb://[^"\']+',
    r'redis://[^"\']+',
    r'file://[^"\']+',
    r'/[a-zA-Z0-9/_-]+\.env',
    r'/[a-zA-Z0-9/_-]+\.key',
    r'/[a-zA-Z0-9/_-]+\.pem',
    r'/[a-zA-Z0-9/_-]+\.p12',
    r'/[a-zA-Z0-9/_-]+\.pfx',
]

# Stack trace patterns to remove
STACK_TRACE_PATTERNS = [
    r'File "[^"]+", line \d+, in [^\n]+',
    r'Traceback \(most recent call last\):',
    r'  File "[^"]+", line \d+',
    r'    [^\n]+',
    r'^[ ]+[^\n]+$',  # Indented lines
]

def sanitize_error_message(error_message: str, debug_mode: bool = None) -> str:
    """
    Sanitize error message to remove sensitive information
    
    Args:
        error_message: The original error message
        debug_mode: Override debug mode (uses settings.debug if None)
    
    Returns:
        Sanitized error message
    """
    if debug_mode is None:
        debug_mode = settings.debug
    
    # If in debug mode, only sanitize the most sensitive patterns
    if debug_mode:
        sanitized = error_message
        for pattern in SENSITIVE_PATTERNS[:5]:  # Only most critical patterns
            sanitized = re.sub(pattern, '[REDACTED]', sanitized, flags=re.IGNORECASE)
        return sanitized
    
    # Production mode - aggressive sanitization
    sanitized = error_message
    
    # Remove sensitive patterns
    for pattern in SENSITIVE_PATTERNS:
        sanitized = re.sub(pattern, '[REDACTED]', sanitized, flags=re.IGNORECASE)
    
    # Remove stack traces
    for pattern in STACK_TRACE_PATTERNS:
        sanitized = re.sub(pattern, '', sanitized, flags=re.MULTILINE)
    
    # Remove file paths
    sanitized = re.sub(r'/[a-zA-Z0-9/_-]+\.py', '[FILE]', sanitized)
    sanitized = re.sub(r'/[a-zA-Z0-9/_-]+/', '[PATH]/', sanitized)
    
    # Clean up multiple newlines and spaces
    sanitized = re.sub(r'\n\s*\n', '\n', sanitized)
    sanitized = re.sub(r' +', ' ', sanitized)
    
    # If message is too generic, provide a safe default
    if len(sanitized.strip()) < 10:
        sanitized = "An internal error occurred"
    
    return sanitized.strip()


def create_safe_error_response(
    error_type: str,
    message: str,
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    details: Optional[Dict[str, Any]] = None,
    original_error: Optional[Exception] = None
) -> Dict[str, Any]:
    """
    Create a safe error response that doesn't leak sensitive information
    
    Args:
        error_type: Type of error (e.g., 'validation_error', 'auth_error')
        message: Error message to sanitize
        status_code: HTTP status code
        details: Additional details to include (will be sanitized)
        original_error: Original exception for logging
    
    Returns:
        Safe error response dictionary
    """
    # Log the original error for debugging
    if original_error:
        logger.error(f"Error {error_type}: {original_error}", exc_info=True)
    
    # Sanitize the message
    safe_message = sanitize_error_message(message)
    
    # Sanitize details if provided
    safe_details = None
    if details:
        safe_details = {}
        for key, value in details.items():
            if isinstance(value, str):
                safe_details[key] = sanitize_error_message(value)
            else:
                safe_details[key] = value
    
    return {
        "error": error_type,
        "message": safe_message,
        "status_code": status_code,
        "details": safe_details
    }


def create_http_exception(
    error_type: str,
    message: str,
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    details: Optional[Dict[str, Any]] = None,
    original_error: Optional[Exception] = None
) -> HTTPException:
    """
    Create a safe HTTPException that doesn't leak sensitive information
    
    Args:
        error_type: Type of error
        message: Error message to sanitize
        status_code: HTTP status code
        details: Additional details to include
        original_error: Original exception for logging
    
    Returns:
        HTTPException with sanitized content
    """
    safe_response = create_safe_error_response(
        error_type, message, status_code, details, original_error
    )
    
    return HTTPException(
        status_code=status_code,
        detail=safe_response
    )


def validate_input_safety(input_data: Any) -> bool:
    """
    Validate that input data doesn't contain potentially dangerous content
    
    Args:
        input_data: Data to validate
    
    Returns:
        True if input is safe, False otherwise
    """
    if isinstance(input_data, str):
        # Check for SQL injection patterns
        sql_patterns = [
            r'union\s+select',
            r'drop\s+table',
            r'delete\s+from',
            r'insert\s+into',
            r'update\s+set',
            r'exec\s*\(',
            r'execute\s*\(',
            r'<script',
            r'javascript:',
            r'vbscript:',
            r'onload\s*=',
            r'onerror\s*=',
        ]
        
        for pattern in sql_patterns:
            if re.search(pattern, input_data, re.IGNORECASE):
                return False
    
    return True


def sanitize_log_message(message: str) -> str:
    """
    Sanitize log messages to prevent sensitive data leakage
    
    Args:
        message: Log message to sanitize
    
    Returns:
        Sanitized log message
    """
    return sanitize_error_message(message, debug_mode=False)
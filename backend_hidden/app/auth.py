"""
Supabase authentication and JWT validation middleware
"""
import jwt
from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from app.config import settings
from app.schemas import UserResponse
from app.database import get_db
from sqlalchemy.orm import Session
from app.models import User
from typing import Optional
import logging
import time
from app.utils.audit_logger import (
    get_audit_logger,
    AuditEventType,
    AuditSeverity
)

# Configure logging
logger = logging.getLogger(__name__)

# Supabase client will be initialized lazily
supabase: Client = None

def get_supabase_client() -> Client:
    """Get Supabase client, initializing if needed"""
    global supabase
    if supabase is None:
        supabase = create_client(settings.supabase_url, settings.supabase_service_key)
    return supabase

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)

# Simple in-memory JWKS cache
_jwks_cache = None
_jwks_cache_time = 0
_JWKS_CACHE_TTL = 3600  # 1 hour in seconds


class AuthError(HTTPException):
    """Custom authentication error"""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_jwks() -> dict:
    """Get JWKS from cache or fetch if expired"""
    global _jwks_cache, _jwks_cache_time

    current_time = time.time()

    # Return cached JWKS if still valid
    if _jwks_cache and (current_time - _jwks_cache_time) < _JWKS_CACHE_TTL:
        return _jwks_cache

    # Fetch fresh JWKS
    import httpx
    jwks_url = f"{settings.supabase_url}/auth/v1/jwks"

    with httpx.Client() as client:
        response = client.get(jwks_url)
        jwks = response.json()

    # Update cache
    _jwks_cache = jwks
    _jwks_cache_time = current_time

    logger.info("JWKS cache refreshed")
    return jwks


def verify_jwt_token(token: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> dict:
    """
    Verify JWT token and return payload
    """
    try:
        # Decode JWT token without verification first to get the header
        unverified_header = jwt.get_unverified_header(token)

        # Get the key ID from the header
        kid = unverified_header.get('kid')
        if not kid:
            raise AuthError("Invalid token: missing key ID")

        # Get cached JWKS
        jwks = get_jwks()

        # Find the correct key
        key = None
        for jwk in jwks['keys']:
            if jwk['kid'] == kid:
                key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
                break

        if not key:
            raise AuthError("Invalid token: key not found")

        # Verify and decode token
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience="authenticated",
            issuer=f"{settings.supabase_url}/auth/v1"
        )

        # Basic validation
        if not payload.get('sub'):
            raise AuthError("Invalid token: missing subject")

        # Log successful token verification
        from app.services.supabase_db_service import SupabaseDBService
        audit_logger = get_audit_logger(db_service=SupabaseDBService())
        audit_logger.log_event(
            event_type=AuditEventType.TOKEN_VERIFICATION_SUCCESS,
            user_id=payload.get('sub'),
            email=payload.get('email'),
            ip_address=ip_address,
            user_agent=user_agent,
            status="success",
            severity=AuditSeverity.INFO,
            message="JWT token verified successfully"
        )

        return payload

    except jwt.InvalidTokenError as e:
        logger.error(f"JWT validation error: {e}")

        # Log failed token verification
        from app.services.supabase_db_service import SupabaseDBService
        audit_logger = get_audit_logger(db_service=SupabaseDBService())
        audit_logger.log_event(
            event_type=AuditEventType.TOKEN_VERIFICATION_FAILURE,
            ip_address=ip_address,
            user_agent=user_agent,
            status="failure",
            severity=AuditSeverity.WARNING,
            message="JWT token verification failed",
            error=str(e)
        )

        raise AuthError("Invalid token")
    except Exception as e:
        logger.error(f"Authentication error: {e}")

        # Log failed authentication
        from app.services.supabase_db_service import SupabaseDBService
        audit_logger = get_audit_logger(db_service=SupabaseDBService())
        audit_logger.log_event(
            event_type=AuditEventType.TOKEN_VERIFICATION_FAILURE,
            ip_address=ip_address,
            user_agent=user_agent,
            status="failure",
            severity=AuditSeverity.ERROR,
            message="Authentication error occurred",
            error=str(e)
        )

        raise AuthError("Authentication failed")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None,
    require_verified_email: bool = True
) -> UserResponse:
    """
    Get current authenticated user from JWT token

    Args:
        credentials: HTTP Bearer token credentials
        request: FastAPI Request object for audit logging
        require_verified_email: If True, raises AuthError if email is not verified
    """
    # Extract request context for audit logging
    ip_address = None
    user_agent = None
    if request:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")

    try:
        # Check if credentials are provided
        if not credentials:
            # Log unauthorized access attempt
            from app.services.supabase_db_service import SupabaseDBService
            audit_logger = get_audit_logger(db_service=SupabaseDBService())
            audit_logger.log_unauthorized_access(
                ip_address=ip_address,
                user_agent=user_agent,
                reason="no_credentials"
            )
            raise AuthError("Not authenticated")

        # Verify the JWT token
        payload = verify_jwt_token(credentials.credentials, ip_address, user_agent)

        # Extract user information
        user_id = payload.get('sub')
        email = payload.get('email')
        email_confirmed_at = payload.get('email_confirmed_at')

        if not user_id or not email:
            raise AuthError("Invalid token: missing user information")

        # Check email verification if required
        is_email_verified = email_confirmed_at is not None
        if require_verified_email and not is_email_verified:
            # Log permission denied due to unverified email
            from app.services.supabase_db_service import SupabaseDBService
            audit_logger = get_audit_logger(db_service=SupabaseDBService())
            audit_logger.log_event(
                event_type=AuditEventType.PERMISSION_DENIED,
                user_id=user_id,
                email=email,
                ip_address=ip_address,
                user_agent=user_agent,
                status="blocked",
                severity=AuditSeverity.WARNING,
                message="Access denied: email verification required",
                metadata={"reason": "email_not_verified"}
            )

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email verification required. Please verify your email address to access this resource.",
                headers={"X-Email-Verified": "false"}
            )

        # Use Supabase to check/create user
        from app.services.supabase_db_service import SupabaseDBService
        db_service = SupabaseDBService()
        audit_logger = get_audit_logger(db_service=db_service)

        user = db_service.get_user(user_id)

        if not user:
            # Create new user
            user = db_service.create_user(user_id, email)
            logger.info(f"Created new user: {user_id}")

            # Log account creation
            audit_logger.log_account_created(
                user_id=user_id,
                email=email,
                ip_address=ip_address,
                user_agent=user_agent
            )
        else:
            # Update email if it has changed
            if user['email'] != email:
                db_service.update_user(user_id, {'email': email})
                logger.info(f"Updated user email: {user_id}")

                # Log email change
                audit_logger.log_event(
                    event_type=AuditEventType.EMAIL_CHANGED,
                    user_id=user_id,
                    email=email,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    status="success",
                    severity=AuditSeverity.INFO,
                    message="User email updated",
                    metadata={"old_email": user['email'], "new_email": email}
                )

            # Log successful login
            audit_logger.log_login_success(
                user_id=user_id,
                email=email,
                ip_address=ip_address,
                user_agent=user_agent,
                auth_method="jwt"
            )

        return UserResponse(
            id=user['id'],
            email=user['email'],
            created_at=user.get('created_at', '2025-01-01T00:00:00Z'),
            updated_at=user.get('updated_at', '2025-01-01T00:00:00Z'),
            email_verified=is_email_verified
        )

    except AuthError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {e}")

        # Log authentication failure
        from app.services.supabase_db_service import SupabaseDBService
        audit_logger = get_audit_logger(db_service=SupabaseDBService())
        audit_logger.log_login_failure(
            ip_address=ip_address,
            user_agent=user_agent,
            reason="authentication_error",
            error=str(e)
        )

        raise AuthError("Authentication failed")


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Optional[UserResponse]:
    """
    Get current user if authenticated, otherwise return None
    """
    try:
        return await get_current_user(credentials, require_verified_email=False)
    except AuthError:
        return None


def get_current_user_verified():
    """
    Dependency that requires an authenticated user with verified email
    """
    async def _get_current_user_verified(
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> UserResponse:
        return await get_current_user(credentials, require_verified_email=True)
    return _get_current_user_verified


def get_current_user_unverified():
    """
    Dependency that requires an authenticated user but does NOT require verified email
    """
    async def _get_current_user_unverified(
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> UserResponse:
        return await get_current_user(credentials, require_verified_email=False)
    return _get_current_user_unverified




# Storage service for Supabase Storage
class SupabaseStorageService:
    """Service for interacting with Supabase Storage"""
    
    def __init__(self):
        self.client = get_supabase_client()
    
    async def generate_signed_upload_url(
        self,
        bucket: str,
        file_path: str,
        expires_in: int = 3600
    ) -> str:
        """
        Generate a signed URL for file upload
        """
        try:
            response = self.client.storage.from_(bucket).create_signed_upload_url(
                file_path,
                expires_in
            )
            
            if response.get('error'):
                raise Exception(f"Failed to generate signed URL: {response['error']}")
            
            return response.get('signedURL')
            
        except Exception as e:
            logger.error(f"Error generating signed upload URL: {e}")
            raise Exception("Failed to generate upload URL")
    
    async def generate_signed_download_url(
        self,
        bucket: str,
        file_path: str,
        expires_in: int = 3600
    ) -> str:
        """
        Generate a signed URL for file download
        """
        try:
            response = self.client.storage.from_(bucket).create_signed_url(
                file_path,
                expires_in
            )
            
            if response.get('error'):
                raise Exception(f"Failed to generate signed URL: {response['error']}")
            
            return response.get('signedURL')
            
        except Exception as e:
            logger.error(f"Error generating signed download URL: {e}")
            raise Exception("Failed to generate download URL")
    
    async def download_file(self, bucket: str, file_path: str) -> bytes:
        """
        Download a file from storage
        """
        try:
            response = self.client.storage.from_(bucket).download(file_path)

            if not response:
                raise Exception(f"Failed to download file: {file_path}")

            return response

        except Exception as e:
            logger.error(f"Error downloading file: {e}")
            raise Exception(f"Failed to download file: {str(e)}")

    async def upload_file(
        self,
        bucket: str,
        file_path: str,
        file_data: bytes,
        content_type: str = None
    ) -> str:
        """
        Upload a file to storage
        """
        try:
            options = {}
            if content_type:
                options['content-type'] = content_type

            response = self.client.storage.from_(bucket).upload(
                file_path,
                file_data,
                options
            )

            if not response:
                raise Exception(f"Failed to upload file: {file_path}")

            # Get public URL
            public_url = self.client.storage.from_(bucket).get_public_url(file_path)

            return public_url

        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            raise Exception(f"Failed to upload file: {str(e)}")

    async def delete_file(self, bucket: str, file_path: str) -> bool:
        """
        Delete a file from storage
        """
        try:
            response = self.client.storage.from_(bucket).remove([file_path])

            if response.get('error'):
                logger.error(f"Failed to delete file: {response['error']}")
                return False

            return True

        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return False


# Dependency for storage service
def get_storage_service() -> SupabaseStorageService:
    """Get Supabase storage service instance"""
    return SupabaseStorageService()
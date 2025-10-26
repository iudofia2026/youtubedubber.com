"""
Supabase authentication and JWT validation middleware
"""
import jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from app.config import settings
from app.schemas import UserResponse
from app.database import get_db
from sqlalchemy.orm import Session
from app.models import User
from typing import Optional
import logging

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


class AuthError(HTTPException):
    """Custom authentication error"""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_jwt_token(token: str) -> dict:
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
        
        # Get the public key from Supabase
        # For now, we'll use a simple approach - in production, you'd want to cache the keys
        jwks_url = f"{settings.supabase_url}/auth/v1/jwks"
        
        # Implement proper JWT verification with Supabase JWKS
        try:
            # Get JWKS from Supabase
            import httpx
            jwks_url = f"{settings.supabase_url}/auth/v1/jwks"
            
            with httpx.Client() as client:
                response = client.get(jwks_url)
                jwks = response.json()
            
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
            
            return payload
            
        except jwt.InvalidTokenError as e:
            logger.error(f"JWT validation error: {e}")
            raise AuthError("Invalid token")
            
    except jwt.InvalidTokenError as e:
        logger.error(f"JWT parsing error: {e}")
        raise AuthError("Invalid token format")
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise AuthError("Authentication failed")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserResponse:
    """
    Get current authenticated user from JWT token
    """
    try:
        # Check if credentials are provided
        if not credentials:
            raise AuthError("Not authenticated")
        
        # Check for development mode token
        if credentials.credentials == "dev-token":
            # Development mode - create or get dev user
            user_id = "dev-user-123"
            email = "dev@youtubedubber.com"
            
            # Use Supabase to check/create dev user
            from app.services.supabase_db_service import SupabaseDBService
            db_service = SupabaseDBService()
            
            user = db_service.get_user(user_id)
            
            if not user:
                # Create new dev user
                user = db_service.create_user(user_id, email)
                logger.info(f"Created dev user: {user_id}")
            
            return UserResponse(
                id=user['id'],
                email=user['email'],
                created_at=user.get('created_at', '2025-01-01T00:00:00Z'),
                updated_at=user.get('updated_at', '2025-01-01T00:00:00Z')
            )
        
        # Verify the JWT token
        payload = verify_jwt_token(credentials.credentials)
        
        # Extract user information
        user_id = payload.get('sub')
        email = payload.get('email')
        
        if not user_id or not email:
            raise AuthError("Invalid token: missing user information")
        
        # Use Supabase to check/create user
        from app.services.supabase_db_service import SupabaseDBService
        db_service = SupabaseDBService()
        
        user = db_service.get_user(user_id)
        
        if not user:
            # Create new user
            user = db_service.create_user(user_id, email)
            logger.info(f"Created new user: {user_id}")
        else:
            # Update email if it has changed
            if user['email'] != email:
                db_service.update_user(user_id, {'email': email})
                logger.info(f"Updated user email: {user_id}")
        
        return UserResponse(
            id=user['id'],
            email=user['email'],
            created_at=user.get('created_at', '2025-01-01T00:00:00Z'),
            updated_at=user.get('updated_at', '2025-01-01T00:00:00Z')
        )
        
    except AuthError:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise AuthError("Authentication failed")


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Optional[UserResponse]:
    """
    Get current user if authenticated, otherwise return None
    """
    try:
        return await get_current_user(credentials)
    except AuthError:
        return None




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
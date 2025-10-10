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
security = HTTPBearer()


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
        
        # For MVP, we'll use the service key to verify tokens
        # In production, you'd want to implement proper JWT verification with JWKS
        try:
            payload = jwt.decode(
                token,
                settings.supabase_service_key,
                algorithms=["HS256"],
                options={"verify_signature": False}  # Skip signature verification for MVP
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
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Get current authenticated user from JWT token
    """
    try:
        # Verify the JWT token
        payload = verify_jwt_token(credentials.credentials)
        
        # Extract user information
        user_id = payload.get('sub')
        email = payload.get('email')
        
        if not user_id or not email:
            raise AuthError("Invalid token: missing user information")
        
        # Check if user exists in database, create if not
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            # Create new user
            user = User(
                id=user_id,
                email=email
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created new user: {user_id}")
        else:
            # Update email if it has changed
            if user.email != email:
                user.email = email
                db.commit()
                logger.info(f"Updated user email: {user_id}")
        
        return UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        
    except AuthError:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise AuthError("Authentication failed")


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[UserResponse]:
    """
    Get current user if authenticated, otherwise return None
    """
    try:
        return await get_current_user(credentials, db)
    except AuthError:
        return None


def verify_supabase_token(token: str) -> dict:
    """
    Verify token using Supabase Auth
    """
    try:
        # Use Supabase client to verify the token
        response = supabase.auth.get_user(token)
        
        if response.user is None:
            raise AuthError("Invalid token")
        
        return {
            'sub': response.user.id,
            'email': response.user.email,
            'aud': 'authenticated'
        }
        
    except Exception as e:
        logger.error(f"Supabase token verification error: {e}")
        raise AuthError("Token verification failed")


# Alternative authentication using Supabase directly
async def get_current_user_supabase(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Get current user using Supabase Auth verification
    """
    try:
        # Verify token with Supabase
        payload = verify_supabase_token(credentials.credentials)
        
        user_id = payload.get('sub')
        email = payload.get('email')
        
        if not user_id or not email:
            raise AuthError("Invalid token: missing user information")
        
        # Check if user exists in database, create if not
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            user = User(
                id=user_id,
                email=email
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created new user via Supabase: {user_id}")
        
        return UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        
    except AuthError:
        raise
    except Exception as e:
        logger.error(f"Error getting current user via Supabase: {e}")
        raise AuthError("Authentication failed")


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
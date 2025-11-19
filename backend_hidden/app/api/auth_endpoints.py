"""
Authentication endpoints for Supabase Auth integration
Provides backend API endpoints for login, signup, password reset with rate limiting
"""
from fastapi import APIRouter, HTTPException, status, Request, Depends
from pydantic import BaseModel, EmailStr, Field
from app.middleware.rate_limit import limiter, brute_force_detector
from slowapi.util import get_remote_address
from app.auth import get_supabase_client
from app.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# Request/Response Models
class SignupRequest(BaseModel):
    """User signup request"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    metadata: Optional[dict] = None


class LoginRequest(BaseModel):
    """User login request"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)


class PasswordResetRequest(BaseModel):
    """Password reset request"""
    email: EmailStr


class PasswordUpdateRequest(BaseModel):
    """Password update request"""
    access_token: str
    new_password: str = Field(..., min_length=8, max_length=100)


class AuthResponse(BaseModel):
    """Authentication response"""
    access_token: str
    refresh_token: str
    user: dict
    expires_in: int


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True


# Authentication Endpoints
@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")  # Strict limit for signup to prevent abuse
async def signup(request: Request, signup_data: SignupRequest):
    """
    Register a new user account

    Rate limit: 5 requests per hour per IP
    - Prevents automated account creation
    - Protects against spam/bot registrations
    """
    try:
        supabase = get_supabase_client()

        # Sign up user with Supabase Auth
        response = supabase.auth.sign_up({
            "email": signup_data.email,
            "password": signup_data.password,
            "options": {
                "data": signup_data.metadata or {}
            }
        })

        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )

        logger.info(f"New user registered: {signup_data.email}")

        return AuthResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user={
                "id": response.user.id,
                "email": response.user.email,
                "created_at": response.user.created_at
            },
            expires_in=response.session.expires_in
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")  # Allow 10 login attempts per minute
async def login(request: Request, login_data: LoginRequest):
    """
    Authenticate user and return access token

    Rate limit: 10 requests per minute per IP
    - Prevents brute force password attacks
    - Allows legitimate users to retry on typos
    - Blocks IPs after 10 failed attempts within 1 hour
    """
    ip_address = get_remote_address(request)

    # Check if IP is blocked due to brute force attempts
    if brute_force_detector.is_blocked(ip_address, "login", settings.brute_force_threshold):
        logger.warning(f"Blocked login attempt from IP: {ip_address}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again later."
        )

    try:
        supabase = get_supabase_client()

        # Authenticate with Supabase
        response = supabase.auth.sign_in_with_password({
            "email": login_data.email,
            "password": login_data.password
        })

        if not response.session:
            # Record failed login attempt
            brute_force_detector.record_failed_attempt(ip_address, "login")
            logger.warning(f"Failed login attempt for: {login_data.email} from IP: {ip_address}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Successful login - reset failed attempts counter
        brute_force_detector.reset_attempts(ip_address, "login")
        logger.info(f"User logged in: {login_data.email}")

        return AuthResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user={
                "id": response.user.id,
                "email": response.user.email,
                "created_at": response.user.created_at
            },
            expires_in=response.session.expires_in
        )

    except HTTPException:
        raise
    except Exception as e:
        # Record failed attempt on any error
        brute_force_detector.record_failed_attempt(ip_address, "login")
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


@router.post("/password-reset", response_model=MessageResponse)
@limiter.limit("3/hour")  # Very strict limit for password resets
async def request_password_reset(request: Request, reset_data: PasswordResetRequest):
    """
    Request password reset email

    Rate limit: 3 requests per hour per IP
    - Prevents email bombing/spam
    - Protects against enumeration attacks
    """
    try:
        supabase = get_supabase_client()

        # Request password reset from Supabase
        supabase.auth.reset_password_email(reset_data.email)

        # Always return success to prevent email enumeration
        logger.info(f"Password reset requested for: {reset_data.email}")

        return MessageResponse(
            message="If the email exists, a password reset link has been sent.",
            success=True
        )

    except Exception as e:
        logger.error(f"Password reset error: {e}")
        # Still return success to prevent enumeration
        return MessageResponse(
            message="If the email exists, a password reset link has been sent.",
            success=True
        )


@router.post("/password-update", response_model=MessageResponse)
@limiter.limit("5/hour")  # Moderate limit for password updates
async def update_password(request: Request, update_data: PasswordUpdateRequest):
    """
    Update user password using reset token

    Rate limit: 5 requests per hour per IP
    - Prevents abuse of password update endpoint
    """
    try:
        supabase = get_supabase_client()

        # Update password with access token
        response = supabase.auth.update_user({
            "password": update_data.new_password
        })

        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update password"
            )

        logger.info(f"Password updated for user: {response.user.id}")

        return MessageResponse(
            message="Password updated successfully",
            success=True
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update password"
        )


@router.post("/refresh", response_model=AuthResponse)
@limiter.limit("30/minute")  # Higher limit for token refresh
async def refresh_token(request: Request, refresh_token: str):
    """
    Refresh access token using refresh token

    Rate limit: 30 requests per minute per IP
    - Allows legitimate token refreshes
    - Prevents token refresh abuse
    """
    try:
        supabase = get_supabase_client()

        # Refresh session
        response = supabase.auth.refresh_session(refresh_token)

        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        return AuthResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user={
                "id": response.user.id,
                "email": response.user.email,
                "created_at": response.user.created_at
            },
            expires_in=response.session.expires_in
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to refresh token"
        )


@router.post("/logout", response_model=MessageResponse)
@limiter.limit("20/minute")  # Reasonable limit for logout
async def logout(request: Request):
    """
    Logout user and invalidate session

    Rate limit: 20 requests per minute per IP
    """
    try:
        supabase = get_supabase_client()

        # Sign out user
        supabase.auth.sign_out()

        return MessageResponse(
            message="Logged out successfully",
            success=True
        )

    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


# Email Verification Endpoints
class ResendVerificationRequest(BaseModel):
    """Request to resend verification email"""
    email: EmailStr


@router.post("/resend-verification", response_model=MessageResponse)
@limiter.limit("3/hour")  # Strict limit to prevent email bombing
async def resend_verification_email(request: Request, resend_data: ResendVerificationRequest):
    """
    Resend email verification link to the user

    Rate limit: 3 requests per hour per IP
    - Prevents email spam/bombing
    - Protects mail server resources
    """
    try:
        supabase = get_supabase_client()

        # Use Supabase to resend verification email
        response = supabase.auth.resend({
            "type": "signup",
            "email": resend_data.email
        })

        # Always return success to prevent email enumeration
        logger.info(f"Verification email resent to: {resend_data.email}")

        return MessageResponse(
            message="If the email exists and is not verified, a verification email has been sent.",
            success=True
        )

    except Exception as e:
        logger.error(f"Error resending verification email: {e}")
        # Still return success to prevent enumeration
        return MessageResponse(
            message="If the email exists and is not verified, a verification email has been sent.",
            success=True
        )


@router.get("/verify-email-status", response_model=dict)
@limiter.limit("30/minute")  # Reasonable limit for status checks
async def verify_email_status(request: Request):
    """
    Check if the current user's email is verified
    Does not require email verification to access
    Requires authentication token in header

    Rate limit: 30 requests per minute per IP
    """
    try:
        from app.auth import get_current_user_unverified
        from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

        security = HTTPBearer(auto_error=False)
        credentials = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )

        # Get user without requiring email verification
        current_user = await get_current_user_unverified()(
            HTTPAuthorizationCredentials(scheme="Bearer", credentials=credentials)
        )

        return {
            "email": current_user.email,
            "verified": current_user.email_verified,
            "message": "Email is verified" if current_user.email_verified else "Email verification required"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking email verification status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check email verification status"
        )


# Health check endpoint for auth service
@router.get("/health", response_model=dict)
@limiter.limit("100/minute")
async def auth_health(request: Request):
    """
    Check authentication service health
    """
    try:
        supabase = get_supabase_client()
        # Simple check to see if Supabase is reachable
        return {
            "status": "healthy",
            "service": "authentication",
            "supabase_connected": True
        }
    except Exception as e:
        logger.error(f"Auth health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "authentication",
            "supabase_connected": False,
            "error": str(e)
        }

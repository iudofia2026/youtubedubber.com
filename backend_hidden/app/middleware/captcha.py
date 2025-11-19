"""
CAPTCHA validation middleware for protecting authentication endpoints
"""
from fastapi import Request, HTTPException, status
from typing import Optional
import logging
from app.services.captcha_service import get_captcha_service

logger = logging.getLogger(__name__)


async def verify_captcha(
    request: Request,
    captcha_token: Optional[str] = None,
    required: bool = True
) -> bool:
    """
    Verify CAPTCHA token for bot protection

    Args:
        request: FastAPI request object (for IP address)
        captcha_token: CAPTCHA token from client
        required: Whether CAPTCHA is required (default: True)

    Returns:
        bool: True if verification passed or not required

    Raises:
        HTTPException: If CAPTCHA verification fails and is required
    """
    captcha_service = get_captcha_service()

    # If CAPTCHA is not enabled, skip verification
    if not captcha_service.is_enabled():
        logger.debug("CAPTCHA verification skipped (not configured)")
        return True

    # If CAPTCHA is not required and no token provided, allow
    if not required and not captcha_token:
        return True

    # If CAPTCHA is required but no token provided, reject
    if required and not captcha_token:
        logger.warning("CAPTCHA verification failed: missing token")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CAPTCHA verification required"
        )

    # Get client IP address
    client_ip = None
    if request.client:
        client_ip = request.client.host

    # Verify token
    result = await captcha_service.verify_token(captcha_token, client_ip)

    if not result['success']:
        error_codes = result.get('error_codes', [])
        logger.warning(f"CAPTCHA verification failed: {error_codes}")

        # Provide user-friendly error messages
        error_messages = {
            'missing-input-secret': 'Server configuration error',
            'invalid-input-secret': 'Server configuration error',
            'missing-input-response': 'CAPTCHA response missing',
            'invalid-input-response': 'Invalid CAPTCHA response',
            'bad-request': 'Invalid CAPTCHA request',
            'timeout-or-duplicate': 'CAPTCHA expired or already used',
            'timeout': 'CAPTCHA verification timeout',
        }

        detail = 'CAPTCHA verification failed'
        if error_codes:
            first_error = error_codes[0]
            detail = error_messages.get(first_error, detail)

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )

    logger.info("CAPTCHA verification successful")
    return True


class CaptchaProtection:
    """
    Dependency class for CAPTCHA protection

    Usage:
        @app.post("/auth/signup")
        async def signup(
            request: Request,
            data: SignupData,
            _: bool = Depends(CaptchaProtection(required=True))
        ):
            ...
    """

    def __init__(self, required: bool = True):
        self.required = required

    async def __call__(
        self,
        request: Request,
        captcha_token: Optional[str] = None
    ) -> bool:
        """Verify CAPTCHA token"""
        return await verify_captcha(request, captcha_token, self.required)

"""
hCaptcha verification service for bot protection
"""
import httpx
import logging
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


class CaptchaService:
    """Service for verifying hCaptcha tokens"""

    HCAPTCHA_VERIFY_URL = "https://hcaptcha.com/siteverify"

    def __init__(self):
        self.secret_key = settings.hcaptcha_secret_key
        self.enabled = bool(self.secret_key)

    async def verify_token(
        self,
        token: str,
        remote_ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Verify hCaptcha token with hCaptcha API

        Args:
            token: The hCaptcha response token from the client
            remote_ip: Optional IP address of the user

        Returns:
            Dict with verification result:
            {
                'success': bool,
                'score': float (0.0 to 1.0, only for enterprise),
                'error_codes': list of error codes if failed
            }
        """
        if not self.enabled:
            # If captcha is not enabled, always return success
            logger.info("CAPTCHA verification skipped (not configured)")
            return {
                'success': True,
                'score': 1.0,
                'error_codes': []
            }

        if not token:
            logger.warning("CAPTCHA verification failed: no token provided")
            return {
                'success': False,
                'score': 0.0,
                'error_codes': ['missing-input-response']
            }

        try:
            # Prepare verification request
            data = {
                'secret': self.secret_key,
                'response': token,
            }

            if remote_ip:
                data['remoteip'] = remote_ip

            # Make request to hCaptcha verification API
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    self.HCAPTCHA_VERIFY_URL,
                    data=data
                )

                if response.status_code != 200:
                    logger.error(f"CAPTCHA API error: HTTP {response.status_code}")
                    return {
                        'success': False,
                        'score': 0.0,
                        'error_codes': ['api-error']
                    }

                result = response.json()

                # Log verification result
                if result.get('success'):
                    logger.info("CAPTCHA verification successful")
                else:
                    error_codes = result.get('error-codes', [])
                    logger.warning(f"CAPTCHA verification failed: {error_codes}")

                return {
                    'success': result.get('success', False),
                    'score': result.get('score', 0.0 if not result.get('success') else 1.0),
                    'error_codes': result.get('error-codes', [])
                }

        except httpx.TimeoutException:
            logger.error("CAPTCHA verification timeout")
            return {
                'success': False,
                'score': 0.0,
                'error_codes': ['timeout']
            }
        except Exception as e:
            logger.error(f"CAPTCHA verification error: {e}")
            return {
                'success': False,
                'score': 0.0,
                'error_codes': ['verification-failed']
            }

    def is_enabled(self) -> bool:
        """Check if captcha verification is enabled"""
        return self.enabled


# Singleton instance
_captcha_service: Optional[CaptchaService] = None


def get_captcha_service() -> CaptchaService:
    """Get or create captcha service instance"""
    global _captcha_service
    if _captcha_service is None:
        _captcha_service = CaptchaService()
    return _captcha_service

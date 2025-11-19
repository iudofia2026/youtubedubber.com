"""
Audit logging utility for security and compliance
Provides structured logging for authentication, authorization, and sensitive operations
"""
import logging
import json
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
import re

logger = logging.getLogger(__name__)


class AuditEventType(str, Enum):
    """Types of audit events to track"""
    # Authentication events
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    LOGOUT = "logout"
    TOKEN_VERIFICATION_SUCCESS = "token_verification_success"
    TOKEN_VERIFICATION_FAILURE = "token_verification_failure"
    TOKEN_REFRESH = "token_refresh"

    # Account management events
    ACCOUNT_CREATED = "account_created"
    ACCOUNT_UPDATED = "account_updated"
    ACCOUNT_DELETED = "account_deleted"
    EMAIL_CHANGED = "email_changed"

    # Password/Security events (for future implementation)
    PASSWORD_RESET_REQUESTED = "password_reset_requested"
    PASSWORD_RESET_COMPLETED = "password_reset_completed"
    PASSWORD_CHANGED = "password_changed"
    PASSWORD_RESET_FAILED = "password_reset_failed"

    # Authorization events
    UNAUTHORIZED_ACCESS_ATTEMPT = "unauthorized_access_attempt"
    PERMISSION_DENIED = "permission_denied"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"

    # Payment events
    PAYMENT_INITIATED = "payment_initiated"
    PAYMENT_SUCCESS = "payment_success"
    PAYMENT_FAILURE = "payment_failure"
    CREDIT_ADDED = "credit_added"
    CREDIT_CONSUMED = "credit_consumed"
    CREDIT_REFUNDED = "credit_refunded"

    # Job events
    JOB_CREATED = "job_created"
    JOB_ACCESSED = "job_accessed"
    JOB_DELETED = "job_deleted"

    # Data access events
    USER_DATA_ACCESSED = "user_data_accessed"
    USER_DATA_EXPORTED = "user_data_exported"

    # Security events
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    ACCOUNT_LOCKED = "account_locked"
    ACCOUNT_UNLOCKED = "account_unlocked"


class AuditSeverity(str, Enum):
    """Severity levels for audit events"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class PIIMasker:
    """Utility to mask personally identifiable information in logs"""

    # Patterns to detect and mask PII
    EMAIL_PATTERN = re.compile(r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})')
    PHONE_PATTERN = re.compile(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b')
    SSN_PATTERN = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
    CREDIT_CARD_PATTERN = re.compile(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b')
    IP_PATTERN = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')

    # Sensitive field names to always mask
    SENSITIVE_FIELDS = {
        'password', 'secret', 'token', 'api_key', 'private_key',
        'access_token', 'refresh_token', 'session_id', 'cookie',
        'authorization', 'jwt', 'bearer', 'credentials'
    }

    @classmethod
    def mask_email(cls, email: str) -> str:
        """Mask email address keeping first character and domain"""
        if not email or '@' not in email:
            return email

        local, domain = email.split('@', 1)
        if len(local) <= 2:
            masked_local = local[0] + '*'
        else:
            masked_local = local[0] + '*' * (len(local) - 2) + local[-1]

        return f"{masked_local}@{domain}"

    @classmethod
    def hash_value(cls, value: str) -> str:
        """Create a consistent hash of a value for tracking without exposing PII"""
        if not value:
            return ""
        return hashlib.sha256(value.encode()).hexdigest()[:16]

    @classmethod
    def mask_ip(cls, ip: str) -> str:
        """Mask IP address keeping first two octets"""
        if not ip:
            return ip

        parts = ip.split('.')
        if len(parts) == 4:
            return f"{parts[0]}.{parts[1]}.xxx.xxx"
        return "xxx.xxx.xxx.xxx"

    @classmethod
    def mask_dict(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively mask sensitive data in dictionaries"""
        if not isinstance(data, dict):
            return data

        masked = {}
        for key, value in data.items():
            key_lower = key.lower()

            # Check if field name is sensitive
            if any(sensitive in key_lower for sensitive in cls.SENSITIVE_FIELDS):
                masked[key] = '***MASKED***'
            elif isinstance(value, dict):
                masked[key] = cls.mask_dict(value)
            elif isinstance(value, list):
                masked[key] = [cls.mask_dict(item) if isinstance(item, dict) else item for item in value]
            elif isinstance(value, str):
                # Check for email pattern
                if '@' in value and cls.EMAIL_PATTERN.match(value):
                    masked[key] = cls.mask_email(value)
                else:
                    masked[key] = value
            else:
                masked[key] = value

        return masked


class AuditLogger:
    """
    Centralized audit logging service for security events
    Provides structured, searchable logs with PII protection
    """

    def __init__(self, db_service=None):
        """
        Initialize audit logger

        Args:
            db_service: Database service for persistent audit logs (optional)
        """
        self.db_service = db_service
        self.logger = logging.getLogger("audit")

        # Ensure audit logger is configured
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - AUDIT - %(levelname)s - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)

    def log_event(
        self,
        event_type: AuditEventType,
        user_id: Optional[str] = None,
        email: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        status: str = "success",
        severity: AuditSeverity = AuditSeverity.INFO,
        message: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ) -> Optional[str]:
        """
        Log an audit event

        Args:
            event_type: Type of event (from AuditEventType enum)
            user_id: User identifier (hashed for privacy)
            email: User email (masked in logs)
            ip_address: Client IP address (masked)
            user_agent: Client user agent
            resource_type: Type of resource accessed (job, user, payment, etc.)
            resource_id: ID of the resource
            status: Event status (success, failure, etc.)
            severity: Event severity level
            message: Human-readable message
            metadata: Additional structured data
            error: Error message if applicable

        Returns:
            Audit log ID if persisted to database
        """
        try:
            # Create audit event structure
            audit_event = {
                "timestamp": datetime.utcnow().isoformat(),
                "event_type": event_type.value,
                "status": status,
                "severity": severity.value,
                "user_id_hash": PIIMasker.hash_value(user_id) if user_id else None,
                "email_masked": PIIMasker.mask_email(email) if email else None,
                "ip_address_masked": PIIMasker.mask_ip(ip_address) if ip_address else None,
                "user_agent": user_agent[:200] if user_agent else None,  # Limit length
                "resource_type": resource_type,
                "resource_id": resource_id,
                "message": message,
                "error": error
            }

            # Mask sensitive data in metadata
            if metadata:
                audit_event["metadata"] = PIIMasker.mask_dict(metadata)

            # Log to structured logger
            log_message = self._format_log_message(audit_event)

            if severity == AuditSeverity.CRITICAL:
                self.logger.critical(log_message)
            elif severity == AuditSeverity.ERROR:
                self.logger.error(log_message)
            elif severity == AuditSeverity.WARNING:
                self.logger.warning(log_message)
            else:
                self.logger.info(log_message)

            # Persist to database if available
            audit_log_id = None
            if self.db_service:
                try:
                    # Store full user_id and email in database (not hashed)
                    # Database should have proper access controls
                    db_event = {
                        "event_type": event_type.value,
                        "user_id": user_id,
                        "email": email,
                        "ip_address": ip_address,
                        "user_agent": user_agent[:500] if user_agent else None,
                        "resource_type": resource_type,
                        "resource_id": resource_id,
                        "status": status,
                        "severity": severity.value,
                        "message": message,
                        "metadata": metadata,
                        "error": error
                    }
                    result = self.db_service.create_audit_log(db_event)
                    if result:
                        audit_log_id = result.get("id")
                except Exception as e:
                    # Don't fail on database errors - logging must always work
                    logger.error(f"Failed to persist audit log to database: {e}")

            return audit_log_id

        except Exception as e:
            # Audit logging should never fail the main operation
            logger.error(f"Error in audit logging: {e}", exc_info=True)
            return None

    def _format_log_message(self, event: Dict[str, Any]) -> str:
        """Format audit event as structured JSON log message"""
        try:
            # Remove None values for cleaner logs
            clean_event = {k: v for k, v in event.items() if v is not None}
            return json.dumps(clean_event, default=str)
        except Exception:
            # Fallback to simple string
            return str(event)

    # Convenience methods for common events

    def log_login_success(
        self,
        user_id: str,
        email: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        auth_method: str = "jwt"
    ):
        """Log successful login"""
        self.log_event(
            event_type=AuditEventType.LOGIN_SUCCESS,
            user_id=user_id,
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            status="success",
            severity=AuditSeverity.INFO,
            message=f"User logged in successfully via {auth_method}",
            metadata={"auth_method": auth_method}
        )

    def log_login_failure(
        self,
        email: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        reason: str = "invalid_credentials",
        error: Optional[str] = None
    ):
        """Log failed login attempt"""
        self.log_event(
            event_type=AuditEventType.LOGIN_FAILURE,
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            status="failure",
            severity=AuditSeverity.WARNING,
            message=f"Login failed: {reason}",
            metadata={"failure_reason": reason},
            error=error
        )

    def log_account_created(
        self,
        user_id: str,
        email: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log account creation"""
        self.log_event(
            event_type=AuditEventType.ACCOUNT_CREATED,
            user_id=user_id,
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            status="success",
            severity=AuditSeverity.INFO,
            message="New user account created"
        )

    def log_account_deleted(
        self,
        user_id: str,
        email: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        deleted_by: Optional[str] = None
    ):
        """Log account deletion"""
        self.log_event(
            event_type=AuditEventType.ACCOUNT_DELETED,
            user_id=user_id,
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            status="success",
            severity=AuditSeverity.WARNING,
            message="User account deleted",
            metadata={"deleted_by": deleted_by}
        )

    def log_unauthorized_access(
        self,
        user_id: Optional[str] = None,
        email: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        reason: str = "unauthorized"
    ):
        """Log unauthorized access attempt"""
        self.log_event(
            event_type=AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
            user_id=user_id,
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            resource_type=resource_type,
            resource_id=resource_id,
            status="blocked",
            severity=AuditSeverity.WARNING,
            message=f"Unauthorized access attempt: {reason}",
            metadata={"reason": reason}
        )

    def log_payment_event(
        self,
        event_type: AuditEventType,
        user_id: str,
        amount: int,
        payment_intent_id: Optional[str] = None,
        status: str = "success",
        error: Optional[str] = None,
        ip_address: Optional[str] = None
    ):
        """Log payment-related event"""
        self.log_event(
            event_type=event_type,
            user_id=user_id,
            resource_type="payment",
            resource_id=payment_intent_id,
            status=status,
            severity=AuditSeverity.INFO if status == "success" else AuditSeverity.WARNING,
            message=f"Payment event: {event_type.value}",
            metadata={
                "amount": amount,
                "payment_intent_id": payment_intent_id
            },
            error=error,
            ip_address=ip_address
        )

    def log_suspicious_activity(
        self,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        activity_type: str = "unknown",
        details: Optional[Dict[str, Any]] = None
    ):
        """Log suspicious activity for security monitoring"""
        self.log_event(
            event_type=AuditEventType.SUSPICIOUS_ACTIVITY,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            status="detected",
            severity=AuditSeverity.CRITICAL,
            message=f"Suspicious activity detected: {activity_type}",
            metadata={"activity_type": activity_type, **(details or {})}
        )


# Global audit logger instance (will be initialized with db_service when available)
_audit_logger: Optional[AuditLogger] = None


def get_audit_logger(db_service=None) -> AuditLogger:
    """
    Get or create global audit logger instance

    Args:
        db_service: Optional database service for persistent audit logs

    Returns:
        AuditLogger instance
    """
    global _audit_logger

    if _audit_logger is None:
        _audit_logger = AuditLogger(db_service=db_service)
    elif db_service is not None and _audit_logger.db_service is None:
        # Update with db_service if it wasn't set initially
        _audit_logger.db_service = db_service

    return _audit_logger


def log_audit_event(
    event_type: AuditEventType,
    user_id: Optional[str] = None,
    email: Optional[str] = None,
    **kwargs
) -> Optional[str]:
    """
    Convenience function to log audit events

    Args:
        event_type: Type of audit event
        user_id: User identifier
        email: User email
        **kwargs: Additional event parameters

    Returns:
        Audit log ID if persisted
    """
    audit_logger = get_audit_logger()
    return audit_logger.log_event(
        event_type=event_type,
        user_id=user_id,
        email=email,
        **kwargs
    )

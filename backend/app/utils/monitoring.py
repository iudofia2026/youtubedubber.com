"""
Monitoring and logging utilities for security events
"""
import logging
import json
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import Request, Response
from app.config import settings
import hashlib

# Configure security logger
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)

# Create file handler for security logs
if not security_logger.handlers:
    security_handler = logging.FileHandler("logs/security.log")
    security_handler.setLevel(logging.INFO)
    security_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    security_handler.setFormatter(security_formatter)
    security_logger.addHandler(security_handler)

# Configure audit logger
audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)

if not audit_logger.handlers:
    audit_handler = logging.FileHandler("logs/audit.log")
    audit_handler.setLevel(logging.INFO)
    audit_formatter = logging.Formatter(
        '%(asctime)s - AUDIT - %(message)s'
    )
    audit_handler.setFormatter(audit_formatter)
    audit_logger.addHandler(audit_handler)


class SecurityEventLogger:
    """
    Logger for security-related events
    """
    
    @staticmethod
    def log_authentication_attempt(
        user_id: Optional[str],
        email: Optional[str],
        success: bool,
        ip_address: str,
        user_agent: str,
        error_message: Optional[str] = None
    ):
        """Log authentication attempts"""
        event = {
            "event_type": "authentication_attempt",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "email": email,
            "success": success,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "error_message": error_message
        }
        
        if success:
            security_logger.info(f"Authentication success: {json.dumps(event)}")
        else:
            security_logger.warning(f"Authentication failure: {json.dumps(event)}")
    
    @staticmethod
    def log_rate_limit_exceeded(
        ip_address: str,
        endpoint: str,
        limit: str,
        user_id: Optional[str] = None
    ):
        """Log rate limit violations"""
        event = {
            "event_type": "rate_limit_exceeded",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ip_address": ip_address,
            "endpoint": endpoint,
            "limit": limit,
            "user_id": user_id
        }
        
        security_logger.warning(f"Rate limit exceeded: {json.dumps(event)}")
    
    @staticmethod
    def log_suspicious_request(
        ip_address: str,
        endpoint: str,
        method: str,
        user_agent: str,
        suspicious_patterns: list,
        user_id: Optional[str] = None
    ):
        """Log suspicious requests"""
        event = {
            "event_type": "suspicious_request",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ip_address": ip_address,
            "endpoint": endpoint,
            "method": method,
            "user_agent": user_agent,
            "suspicious_patterns": suspicious_patterns,
            "user_id": user_id
        }
        
        security_logger.warning(f"Suspicious request: {json.dumps(event)}")
    
    @staticmethod
    def log_data_access(
        user_id: str,
        resource_type: str,
        resource_id: str,
        action: str,
        ip_address: str
    ):
        """Log data access events"""
        event = {
            "event_type": "data_access",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "action": action,
            "ip_address": ip_address
        }
        
        audit_logger.info(f"Data access: {json.dumps(event)}")
    
    @staticmethod
    def log_job_creation(
        user_id: str,
        job_id: str,
        languages: list,
        ip_address: str
    ):
        """Log job creation events"""
        event = {
            "event_type": "job_creation",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "job_id": job_id,
            "languages": languages,
            "ip_address": ip_address
        }
        
        audit_logger.info(f"Job created: {json.dumps(event)}")
    
    @staticmethod
    def log_file_upload(
        user_id: str,
        file_type: str,
        file_size: int,
        ip_address: str
    ):
        """Log file upload events"""
        event = {
            "event_type": "file_upload",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "file_type": file_type,
            "file_size": file_size,
            "ip_address": ip_address
        }
        
        audit_logger.info(f"File uploaded: {json.dumps(event)}")
    
    @staticmethod
    def log_error(
        error_type: str,
        error_message: str,
        endpoint: str,
        ip_address: str,
        user_id: Optional[str] = None,
        stack_trace: Optional[str] = None
    ):
        """Log error events"""
        event = {
            "event_type": "error",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error_type": error_type,
            "error_message": error_message,
            "endpoint": endpoint,
            "ip_address": ip_address,
            "user_id": user_id,
            "stack_trace": stack_trace
        }
        
        security_logger.error(f"Error occurred: {json.dumps(event)}")


class RequestMetrics:
    """
    Track request metrics for monitoring
    """
    
    def __init__(self):
        self.request_count = 0
        self.error_count = 0
        self.response_times = []
        self.start_time = time.time()
    
    def record_request(self, response_time: float, status_code: int):
        """Record a request"""
        self.request_count += 1
        self.response_times.append(response_time)
        
        if status_code >= 400:
            self.error_count += 1
        
        # Keep only last 1000 response times
        if len(self.response_times) > 1000:
            self.response_times = self.response_times[-1000:]
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics"""
        uptime = time.time() - self.start_time
        
        avg_response_time = (
            sum(self.response_times) / len(self.response_times)
            if self.response_times else 0
        )
        
        error_rate = (
            self.error_count / self.request_count
            if self.request_count > 0 else 0
        )
        
        return {
            "uptime_seconds": uptime,
            "total_requests": self.request_count,
            "error_count": self.error_count,
            "error_rate": error_rate,
            "average_response_time": avg_response_time,
            "requests_per_minute": self.request_count / (uptime / 60) if uptime > 0 else 0
        }


# Global metrics instance
metrics = RequestMetrics()


def get_client_ip(request: Request) -> str:
    """Extract client IP address from request"""
    # Check for forwarded headers first
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fall back to direct client IP
    if request.client:
        return request.client.host
    
    return "unknown"


def hash_sensitive_data(data: str) -> str:
    """Hash sensitive data for logging"""
    return hashlib.sha256(data.encode()).hexdigest()[:16]


def log_request_start(request: Request, user_id: Optional[str] = None):
    """Log request start"""
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "unknown")
    
    # Check for suspicious patterns
    suspicious_patterns = []
    path = request.url.path.lower()
    user_agent_lower = user_agent.lower()
    
    patterns_to_check = [
        "admin", "login", "password", "sql", "script", "eval", "exec",
        "union", "select", "drop", "delete", "insert", "update",
        "javascript:", "vbscript:", "onload", "onerror", "alert",
        "..", "//", "\\", "<script", "<?php", "<?="
    ]
    
    for pattern in patterns_to_check:
        if pattern in path or pattern in user_agent_lower:
            suspicious_patterns.append(pattern)
    
    if suspicious_patterns:
        SecurityEventLogger.log_suspicious_request(
            ip_address=client_ip,
            endpoint=request.url.path,
            method=request.method,
            user_agent=user_agent,
            suspicious_patterns=suspicious_patterns,
            user_id=user_id
        )


def log_request_end(
    request: Request,
    response: Response,
    response_time: float,
    user_id: Optional[str] = None
):
    """Log request end and update metrics"""
    client_ip = get_client_ip(request)
    
    # Update metrics
    metrics.record_request(response_time, response.status_code)
    
    # Log errors
    if response.status_code >= 400:
        SecurityEventLogger.log_error(
            error_type="http_error",
            error_message=f"HTTP {response.status_code}",
            endpoint=request.url.path,
            ip_address=client_ip,
            user_id=user_id
        )
    
    # Log API requests
    if request.url.path.startswith("/api/"):
        audit_logger.info(
            f"API request completed - IP: {client_ip}, "
            f"Method: {request.method}, Path: {request.url.path}, "
            f"Status: {response.status_code}, Response time: {response_time:.3f}s"
        )
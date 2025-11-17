"""
API Call Logging Middleware
Logs every API call with detailed information for debugging
"""
import time
import json
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response as StarletteResponse

logger = logging.getLogger(__name__)

class APILoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all API calls with detailed information
    """
    
    def __init__(self, app, log_file_path: str = None):
        super().__init__(app)
        self.log_file_path = log_file_path or "/tmp/api_calls.log"
        
        # Set up file logging
        file_handler = logging.FileHandler(self.log_file_path)
        file_handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        
        # Add file handler to logger
        api_logger = logging.getLogger('api_calls')
        api_logger.addHandler(file_handler)
        api_logger.setLevel(logging.INFO)
        
        self.api_logger = api_logger

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Start timing
        start_time = time.time()
        
        # Extract request information
        method = request.method
        url = str(request.url)
        path = request.url.path
        query_params = dict(request.query_params)
        headers = dict(request.headers)
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Read request body if it exists
        body = None
        if method in ["POST", "PUT", "PATCH"]:
            try:
                body_bytes = await request.body()
                if body_bytes:
                    # Try to parse as JSON
                    try:
                        body = json.loads(body_bytes.decode('utf-8'))
                    except (json.JSONDecodeError, UnicodeDecodeError):
                        # If not JSON, log as text (truncated)
                        body = body_bytes.decode('utf-8', errors='ignore')[:500]
            except Exception as e:
                body = f"Error reading body: {str(e)}"
        
        # Log incoming request
        request_log = {
            "type": "REQUEST",
            "timestamp": time.time(),
            "method": method,
            "url": url,
            "path": path,
            "query_params": query_params,
            "headers": {k: v for k, v in headers.items() if k.lower() not in ['authorization', 'cookie']},
            "client_ip": client_ip,
            "body": body
        }
        
        self.api_logger.info(f"INCOMING: {json.dumps(request_log, indent=2)}")
        logger.info(f"🌐 {method} {path} from {client_ip}")
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Extract response information
            status_code = response.status_code
            response_headers = dict(response.headers)
            
            # Check if response has body (simplified approach)
            response_body = None
            content_length = response_headers.get('content-length', '0')
            if content_length and int(content_length) > 0:
                response_body = f"Response body present ({content_length} bytes)"
            else:
                response_body = "No response body"
            
            # Log outgoing response
            response_log = {
                "type": "RESPONSE",
                "timestamp": time.time(),
                "method": method,
                "path": path,
                "status_code": status_code,
                "response_headers": response_headers,
                "response_body": response_body,
                "process_time_ms": round(process_time * 1000, 2),
                "client_ip": client_ip
            }
            
            self.api_logger.info(f"OUTGOING: {json.dumps(response_log, indent=2)}")
            
            # Log to console with color coding
            if status_code >= 500:
                logger.error(f"❌ {method} {path} -> {status_code} ({process_time:.3f}s)")
            elif status_code >= 400:
                logger.warning(f"⚠️  {method} {path} -> {status_code} ({process_time:.3f}s)")
            else:
                logger.info(f"✅ {method} {path} -> {status_code} ({process_time:.3f}s)")
            
            return response
            
        except Exception as e:
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log error
            error_log = {
                "type": "ERROR",
                "timestamp": time.time(),
                "method": method,
                "path": path,
                "error": str(e),
                "error_type": type(e).__name__,
                "process_time_ms": round(process_time * 1000, 2),
                "client_ip": client_ip
            }
            
            self.api_logger.error(f"ERROR: {json.dumps(error_log, indent=2)}")
            logger.error(f"💥 {method} {path} -> ERROR: {str(e)} ({process_time:.3f}s)")
            
            raise
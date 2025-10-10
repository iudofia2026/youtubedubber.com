"""
Configuration management for YT Dubber API
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Database Configuration
    database_url: str
    supabase_url: str
    supabase_service_key: str
    
    # AI Services
    deepgram_api_key: str
    openai_api_key: str
    
    # Application Configuration
    app_name: str = "YT Dubber API"
    debug: bool = False
    secret_key: str
    cors_origins: str = "http://localhost:3000"
    
    # Storage Configuration
    storage_bucket: str = "yt-dubber-uploads"
    max_file_size: str = "100MB"
    allowed_audio_types: str = "audio/mpeg,audio/wav,audio/mp3,audio/m4a"
    
    # Worker Configuration
    worker_poll_interval: int = 5
    max_concurrent_jobs: int = 3
    job_timeout: int = 3600
    
    # Security Configuration
    rate_limit_enabled: bool = True
    rate_limit_storage_url: Optional[str] = None
    log_level: str = "INFO"
    secure_cookies: bool = False
    https_only: bool = False
    
    # Monitoring Configuration
    sentry_dsn: Optional[str] = None
    health_check_interval: int = 30
    metrics_enabled: bool = False
    
    # Performance Configuration
    max_workers: int = 2
    worker_timeout: int = 300
    connection_pool_size: int = 10
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        
    def get_max_file_size_bytes(self) -> int:
        """Convert max_file_size string to bytes"""
        size_str = self.max_file_size.upper()
        if size_str.endswith('MB'):
            return int(size_str[:-2]) * 1024 * 1024
        elif size_str.endswith('GB'):
            return int(size_str[:-2]) * 1024 * 1024 * 1024
        else:
            return int(size_str)
    
    def get_cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(',')]
        return self.cors_origins
    
    def get_allowed_audio_types(self) -> List[str]:
        """Parse allowed audio types from comma-separated string"""
        if isinstance(self.allowed_audio_types, str):
            return [mime_type.strip() for mime_type in self.allowed_audio_types.split(',')]
        return self.allowed_audio_types


# Global settings instance
settings = Settings()

# Validate required settings
def validate_settings():
    """Validate that all required settings are present"""
    required_settings = [
        'database_url', 'supabase_url', 'supabase_service_key',
        'deepgram_api_key', 'openai_api_key', 'secret_key'
    ]
    
    missing_settings = []
    for setting in required_settings:
        if not getattr(settings, setting, None):
            missing_settings.append(setting)
    
    if missing_settings:
        raise ValueError(f"Missing required settings: {', '.join(missing_settings)}")
    
    return True

# Validate settings on import
validate_settings()
"""
SQLAlchemy models for YT Dubber API
"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    """User model for authentication and user management"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    dubbing_jobs = relationship("DubbingJob", back_populates="user")


class DubbingJob(Base):
    """Main dubbing job model"""
    __tablename__ = "dubbing_jobs"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String, default="pending", index=True)  # pending, processing, completed, failed
    progress = Column(Integer, default=0)  # 0-100
    message = Column(Text)
    
    # File URLs
    voice_track_url = Column(String)
    background_track_url = Column(String)
    
    # Job metadata
    voice_track_duration = Column(Integer)  # Duration in seconds
    background_track_duration = Column(Integer)  # Duration in seconds
    target_languages = Column(JSON)  # List of language codes
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="dubbing_jobs")
    language_tasks = relationship("LanguageTask", back_populates="job", cascade="all, delete-orphan")
    job_events = relationship("JobEvent", back_populates="job", cascade="all, delete-orphan")


class LanguageTask(Base):
    """Individual language processing task"""
    __tablename__ = "language_tasks"
    
    id = Column(String, primary_key=True, index=True)
    job_id = Column(String, ForeignKey("dubbing_jobs.id"), nullable=False, index=True)
    language_code = Column(String, nullable=False, index=True)
    status = Column(String, default="pending", index=True)  # pending, processing, completed, failed
    progress = Column(Integer, default=0)  # 0-100
    message = Column(Text)
    
    # Processing stages
    transcript_url = Column(String)  # Original transcript
    translated_transcript_url = Column(String)  # Translated transcript
    audio_url = Column(String)  # Generated dubbed audio
    captions_url = Column(String)  # Generated captions file
    
    # Processing metadata
    transcript_duration = Column(Integer)  # Duration in seconds
    audio_duration = Column(Integer)  # Duration in seconds
    word_count = Column(Integer)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    job = relationship("DubbingJob", back_populates="language_tasks")


class JobEvent(Base):
    """Job event log for tracking and debugging"""
    __tablename__ = "job_events"
    
    id = Column(String, primary_key=True, index=True)
    job_id = Column(String, ForeignKey("dubbing_jobs.id"), nullable=False, index=True)
    event_type = Column(String, nullable=False, index=True)  # created, started, progress, completed, failed
    message = Column(Text)
    event_metadata = Column(JSON)  # Additional event data
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    job = relationship("DubbingJob", back_populates="job_events")


class Artifact(Base):
    """Generated artifacts and files"""
    __tablename__ = "artifacts"
    
    id = Column(String, primary_key=True, index=True)
    job_id = Column(String, ForeignKey("dubbing_jobs.id"), nullable=False, index=True)
    language_task_id = Column(String, ForeignKey("language_tasks.id"), index=True)
    artifact_type = Column(String, nullable=False, index=True)  # transcript, audio, captions, etc.
    file_url = Column(String, nullable=False)
    file_size = Column(Integer)  # Size in bytes
    mime_type = Column(String)
    checksum = Column(String)  # File checksum for integrity
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    job = relationship("DubbingJob")
    language_task = relationship("LanguageTask")
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
    credit_cost = Column(Integer, default=0)  # Credits consumed for this job
    
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
    event_transaction_metadata = Column(JSON)  # Additional event data
    
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


class UserCredits(Base):
    """User credit balance tracking"""
    __tablename__ = "user_credits"
    
    user_id = Column(String, ForeignKey("users.id"), primary_key=True, index=True)
    balance = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")


class CreditTransaction(Base):
    """Credit transaction history"""
    __tablename__ = "credit_transactions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)  # Credits added/subtracted (positive/negative)
    transaction_type = Column(String, nullable=False, index=True)  # 'purchase', 'job_consumption', 'refund', 'bonus'
    stripe_payment_intent_id = Column(String, index=True)  # Stripe payment intent ID for purchases
    description = Column(Text)  # Human-readable description
    transaction_metadata = Column(JSON)  # Additional transaction data

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")


class AccountDeletionToken(Base):
    """Temporary tokens for account deletion confirmation"""
    __tablename__ = "account_deletion_tokens"

    token = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    user_email = Column(String, nullable=False)
    reason = Column(Text)
    feedback = Column(Text)
    ip_address = Column(String)
    user_agent = Column(Text)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AccountDeletionAuditLogModel(Base):
    """Audit log for account deletions (GDPR compliance)"""
    __tablename__ = "account_deletion_audit_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    user_email = Column(String, nullable=False)
    deletion_initiated_at = Column(DateTime(timezone=True), nullable=False)
    deletion_completed_at = Column(DateTime(timezone=True), nullable=False)
    reason = Column(Text)
    feedback = Column(Text)
    data_deleted_summary = Column(JSON, nullable=False)
    initiated_by_user = Column(Boolean, default=True, nullable=False)
    ip_address = Column(String)
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    """Comprehensive audit log for security and compliance tracking"""
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)

    # Event identification
    event_type = Column(String, nullable=False, index=True)  # login_success, login_failure, account_created, etc.
    status = Column(String, nullable=False, index=True)  # success, failure, blocked, etc.
    severity = Column(String, nullable=False, index=True)  # info, warning, error, critical

    # User context (nullable for failed auth attempts)
    user_id = Column(String, index=True)  # User who performed the action
    email = Column(String, index=True)  # User email

    # Request context
    ip_address = Column(String, index=True)  # Client IP address
    user_agent = Column(Text)  # Client user agent

    # Resource context
    resource_type = Column(String, index=True)  # Type of resource (user, job, payment, etc.)
    resource_id = Column(String, index=True)  # ID of the affected resource

    # Event details
    message = Column(Text)  # Human-readable message
    metadata = Column(JSON)  # Additional structured data
    error = Column(Text)  # Error message if applicable

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
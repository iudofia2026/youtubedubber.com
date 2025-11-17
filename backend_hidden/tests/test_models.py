"""
Database model tests
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User, DubbingJob, LanguageTask, JobEvent, Artifact
from datetime import datetime

# Create test database
test_engine = create_engine("sqlite:///./test_models.db", echo=False)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a test database session"""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=test_engine)

def test_user_creation(db_session):
    """Test user model creation"""
    user = User(
        id="test-user-123",
        email="test@example.com"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    assert user.id == "test-user-123"
    assert user.email == "test@example.com"
    assert user.created_at is not None

def test_dubbing_job_creation(db_session):
    """Test dubbing job model creation"""
    job = DubbingJob(
        id="job-123",
        user_id="test-user-123",
        status="pending",
        progress=0,
        target_languages=["es", "fr"]
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)
    
    assert job.id == "job-123"
    assert job.user_id == "test-user-123"
    assert job.status == "pending"
    assert job.progress == 0
    assert job.target_languages == ["es", "fr"]

def test_language_task_creation(db_session):
    """Test language task model creation"""
    task = LanguageTask(
        id="task-123",
        job_id="job-123",
        language_code="es",
        status="pending",
        progress=0
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    
    assert task.id == "task-123"
    assert task.job_id == "job-123"
    assert task.language_code == "es"
    assert task.status == "pending"

def test_job_event_creation(db_session):
    """Test job event model creation"""
    event = JobEvent(
        id="event-123",
        job_id="job-123",
        event_type="created",
        message="Job created successfully",
        metadata={"test": "data"}
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)
    
    assert event.id == "event-123"
    assert event.job_id == "job-123"
    assert event.event_type == "created"
    assert event.message == "Job created successfully"
    assert event.metadata == {"test": "data"}

def test_artifact_creation(db_session):
    """Test artifact model creation"""
    artifact = Artifact(
        id="artifact-123",
        job_id="job-123",
        language_task_id="task-123",
        artifact_type="audio",
        file_url="https://example.com/audio.mp3",
        file_size=1024,
        mime_type="audio/mpeg"
    )
    db_session.add(artifact)
    db_session.commit()
    db_session.refresh(artifact)
    
    assert artifact.id == "artifact-123"
    assert artifact.job_id == "job-123"
    assert artifact.language_task_id == "task-123"
    assert artifact.artifact_type == "audio"
    assert artifact.file_url == "https://example.com/audio.mp3"
    assert artifact.file_size == 1024
    assert artifact.mime_type == "audio/mpeg"